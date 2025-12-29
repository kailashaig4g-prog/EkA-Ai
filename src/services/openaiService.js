const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const { OPENAI } = require('../utils/constants');
const fs = require('fs');

class OpenAIService {
  constructor() {
    if (!config.openai.apiKey) {
      logger.warn('OpenAI API key not configured');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
      });
    }
    
    // Cost tracking
    this.costs = {
      total: 0,
      gpt4: 0,
      vision: 0,
      whisper: 0,
      dalle: 0,
      tts: 0,
      embeddings: 0
    };
    
    // Token pricing (per 1k tokens)
    this.pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4-vision': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'whisper': 0.006, // per minute
      'dalle-3': { standard: 0.04, hd: 0.08 }, // per image (1024x1024)
      'tts': 0.015, // per 1k characters
      'embeddings': 0.0001 // per 1k tokens
    };
  }

  /**
   * Chat completion with GPT model
   */
  async chat(messages, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || config.openai.model,
        messages,
        temperature: options.temperature || OPENAI.TEMPERATURE,
        max_tokens: options.maxTokens || OPENAI.MAX_TOKENS,
        top_p: options.topP || OPENAI.TOP_P,
        frequency_penalty: options.frequencyPenalty || OPENAI.FREQUENCY_PENALTY,
        presence_penalty: options.presencePenalty || OPENAI.PRESENCE_PENALTY,
      });

      // Track costs
      this.trackCost('gpt4', response.usage);

      return response.choices[0].message.content;
    } catch (error) {
      logger.error(`OpenAI chat error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Chat completion with streaming
   */
  async chatStream(messages, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: options.model || config.openai.model,
        messages,
        temperature: options.temperature || OPENAI.TEMPERATURE,
        max_tokens: options.maxTokens || OPENAI.MAX_TOKENS,
        top_p: options.topP || OPENAI.TOP_P,
        frequency_penalty: options.frequencyPenalty || OPENAI.FREQUENCY_PENALTY,
        presence_penalty: options.presencePenalty || OPENAI.PRESENCE_PENALTY,
        stream: true,
      });

      return stream;
    } catch (error) {
      logger.error(`OpenAI chat stream error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vision analysis with GPT-4 Vision
   */
  async analyzeImage(imageUrl, prompt = 'Analyze this automotive image', options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || config.openai.visionModel || 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: options.detail || 'high',
                },
              },
            ],
          },
        ],
        max_tokens: options.maxTokens || 1000,
      });

      // Track costs
      this.trackCost('vision', response.usage);

      return {
        analysis: response.choices[0].message.content,
        usage: response.usage,
        cost: this.calculateCost('gpt-4-vision', response.usage)
      };
    } catch (error) {
      logger.error(`OpenAI vision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Audio transcription with Whisper
   */
  async transcribeAudio(audioFile, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: config.openai.whisperModel || 'whisper-1',
        language: options.language || undefined,
        prompt: options.prompt || undefined,
        response_format: options.responseFormat || 'json',
        temperature: options.temperature || 0,
      });

      // Track costs (approximate based on file size)
      this.costs.whisper += 0.006 * (audioFile.size / (1024 * 1024 * 60)); // ~$0.006/minute

      return {
        text: response.text,
        language: response.language || options.language,
      };
    } catch (error) {
      logger.error(`OpenAI transcription error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Text-to-speech with OpenAI TTS
   */
  async textToSpeech(text, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.audio.speech.create({
        model: options.model || 'tts-1',
        voice: options.voice || 'alloy', // alloy, echo, fable, onyx, nova, shimmer
        input: text,
        speed: options.speed || 1.0,
      });

      // Track costs
      const charCount = text.length;
      this.costs.tts += (charCount / 1000) * 0.015;

      return response;
    } catch (error) {
      logger.error(`OpenAI TTS error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate image with DALL-E 3
   */
  async generateImage(prompt, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.images.generate({
        model: options.model || 'dall-e-3',
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard', // standard or hd
        style: options.style || 'vivid', // vivid or natural
      });

      // Track costs
      const costPerImage = options.quality === 'hd' ? 0.08 : 0.04;
      this.costs.dalle += costPerImage * (options.n || 1);

      return {
        images: response.data,
        cost: costPerImage * (options.n || 1),
      };
    } catch (error) {
      logger.error(`OpenAI DALL-E error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create embeddings for RAG
   */
  async createEmbeddings(text, options = {}) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.embeddings.create({
        model: options.model || 'text-embedding-ada-002',
        input: text,
      });

      // Track costs
      this.trackCost('embeddings', response.usage);

      return {
        embeddings: response.data,
        usage: response.usage,
        cost: this.calculateCost('embeddings', response.usage)
      };
    } catch (error) {
      logger.error(`OpenAI embeddings error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate token count (approximation)
   */
  countTokens(text) {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost based on usage
   */
  calculateCost(model, usage) {
    if (!usage) return 0;

    const pricing = this.pricing[model] || this.pricing['gpt-4'];
    
    if (model === 'embeddings') {
      return (usage.total_tokens / 1000) * this.pricing.embeddings;
    }
    
    const inputCost = (usage.prompt_tokens / 1000) * pricing.input;
    const outputCost = (usage.completion_tokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Track costs
   */
  trackCost(type, usage) {
    if (!usage) return;

    const cost = this.calculateCost(
      type === 'vision' ? 'gpt-4-vision' : 
      type === 'embeddings' ? 'embeddings' : 'gpt-4',
      usage
    );

    this.costs[type] += cost;
    this.costs.total += cost;
  }

  /**
   * Get cost summary
   */
  getCosts() {
    return { ...this.costs };
  }

  /**
   * Reset cost tracking
   */
  resetCosts() {
    Object.keys(this.costs).forEach(key => {
      this.costs[key] = 0;
    });
  }

  /**
   * Generate automotive-specific response
   */
  async automotiveChat(userMessage, context = {}) {
    const systemPrompt = `You are an expert automotive AI assistant. 
You help users with car maintenance, diagnostics, and advice.
Provide clear, accurate, and helpful responses.
${context.vehicle ? `User's vehicle: ${context.vehicle.make} ${context.vehicle.model} ${context.vehicle.year}` : ''}
${context.mileage ? `Current mileage: ${context.mileage} miles` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    if (context.history && context.history.length > 0) {
      messages.splice(1, 0, ...context.history);
    }

    return await this.chat(messages);
  }
}

module.exports = new OpenAIService();
