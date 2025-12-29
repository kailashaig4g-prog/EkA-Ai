/**
 * Mock OpenAI API responses for testing
 */

const mockChatCompletion = (content = 'This is a test response from OpenAI') => ({
  choices: [
    {
      message: {
        role: 'assistant',
        content,
      },
      finish_reason: 'stop',
      index: 0,
    },
  ],
  id: 'chatcmpl-test123',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-4',
  usage: {
    prompt_tokens: 10,
    completion_tokens: 20,
    total_tokens: 30,
  },
});

const mockWhisperTranscription = (text = 'This is a test transcription') => ({
  text,
});

const mockImageAnalysis = (description = 'This is a test image analysis') => ({
  choices: [
    {
      message: {
        role: 'assistant',
        content: description,
      },
    },
  ],
});

const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue(mockChatCompletion()),
    },
  },
  audio: {
    transcriptions: {
      create: jest.fn().mockResolvedValue(mockWhisperTranscription()),
    },
  },
};

module.exports = {
  mockChatCompletion,
  mockWhisperTranscription,
  mockImageAnalysis,
  mockOpenAI,
};
