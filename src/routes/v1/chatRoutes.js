const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const validate = require('../../middleware/validation');
const { chatValidator } = require('../../utils/validators');
const { apiLimiter } = require('../../middleware/rateLimiter');
const { sendMessage, getSuggestions } = require('../../controllers/chatController');

router.post('/', protect, apiLimiter, chatValidator, validate, sendMessage);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
