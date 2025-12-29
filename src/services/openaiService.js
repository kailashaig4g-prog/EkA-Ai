const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');
const { OPENAI } = require('../utils/constants');

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

      return response.choices[0].message.content;
    } catch (error) {
      logger.error(`OpenAI chat error: ${error.message}`);
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
        model: options.model || config.openai.visionModel,
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

      return response.choices[0].message.content;
    } catch (error) {
      logger.error(`OpenAI vision error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Audio transcription with Whisper
   */
  async transcribeAudio(audioFile) {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.audio.transcriptions.create({
        file: audioFile,
        model: config.openai.whisperModel,
      });

      return response.text;
    } catch (error) {
      logger.error(`OpenAI transcription error: ${error.message}`);
      throw error;
    }
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
