const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { chatValidator } = require('../../utils/validators');
const { apiLimiter } = require('../../middleware/rateLimiter');
const { sendMessage, sendMessageStream, getSuggestions } = require('../../controllers/chatController');

router.post('/', protect, apiLimiter, chatValidator, validate, sendMessage);
router.post('/stream', protect, apiLimiter, chatValidator, validate, sendMessageStream);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
