const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../../middleware/auth');
const audioController = require('../../controllers/audioController');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/audio');
  },
  filename: (req, file, cb) => {
    cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|flac|webm|mp4|mpeg|mpga|oga|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only audio files are allowed'));
  }
});

// Routes
router.post('/transcribe', protect, upload.single('audio'), audioController.transcribeAudio);
router.post('/text-to-speech', protect, audioController.textToSpeech);
router.get('/voices', audioController.getVoices);

module.exports = router;
