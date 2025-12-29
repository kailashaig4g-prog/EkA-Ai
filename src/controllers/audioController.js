const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * @desc    Transcribe audio using Whisper API
 * @route   POST /api/v1/audio/transcribe
 * @access  Private
 */
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an audio file'
      });
    }

    const audioFile = fs.createReadStream(req.file.path);
    audioFile.size = req.file.size;

    const options = {
      language: req.body.language,
      prompt: req.body.prompt,
      responseFormat: req.body.responseFormat || 'json',
      temperature: req.body.temperature ? parseFloat(req.body.temperature) : 0,
    };

    const result = await openaiService.transcribeAudio(audioFile, options);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: {
        transcription: result.text,
        language: result.language,
        file: {
          name: req.file.originalname,
          size: req.file.size,
        }
      }
    });
  } catch (error) {
    logger.error(`Audio transcription error: ${error.message}`);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Audio transcription failed',
      error: error.message
    });
  }
};

/**
 * @desc    Convert text to speech
 * @route   POST /api/v1/audio/text-to-speech
 * @access  Private
 */
exports.textToSpeech = async (req, res) => {
  try {
    const { text, voice, speed, model } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const options = {
      voice: voice || 'alloy',
      speed: speed || 1.0,
      model: model || 'tts-1',
    };

    const audioStream = await openaiService.textToSpeech(text, options);

    // Set headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');

    // Pipe the audio stream to response
    const buffer = Buffer.from(await audioStream.arrayBuffer());
    res.send(buffer);
  } catch (error) {
    logger.error(`Text-to-speech error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Text-to-speech conversion failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get available TTS voices
 * @route   GET /api/v1/audio/voices
 * @access  Public
 */
exports.getVoices = async (req, res) => {
  try {
    const voices = [
      { id: 'alloy', description: 'Balanced and neutral' },
      { id: 'echo', description: 'Clear and articulate' },
      { id: 'fable', description: 'Warm and friendly' },
      { id: 'onyx', description: 'Deep and authoritative' },
      { id: 'nova', description: 'Energetic and engaging' },
      { id: 'shimmer', description: 'Smooth and professional' }
    ];

    res.status(200).json({
      success: true,
      data: { voices }
    });
  } catch (error) {
    logger.error(`Get voices error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Failed to get voices',
      error: error.message
    });
  }
};
