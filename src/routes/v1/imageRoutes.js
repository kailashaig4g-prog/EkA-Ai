const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const imageController = require('../../controllers/imageController');

// Routes
router.post('/generate', protect, imageController.generateImage);
router.post('/generate-automotive', protect, imageController.generateAutomotiveImage);
router.post('/estimate-cost', imageController.estimateCost);

module.exports = router;
