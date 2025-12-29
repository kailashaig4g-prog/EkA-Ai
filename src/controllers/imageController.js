const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');

/**
 * @desc    Generate image using DALL-E 3
 * @route   POST /api/v1/images/generate
 * @access  Private
 */
exports.generateImage = async (req, res) => {
  try {
    const { prompt, size, quality, style, n } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    const options = {
      size: size || '1024x1024', // 1024x1024, 1024x1792, 1792x1024
      quality: quality || 'standard', // standard or hd
      style: style || 'vivid', // vivid or natural
      n: n || 1,
      model: 'dall-e-3',
    };

    const result = await openaiService.generateImage(prompt, options);

    res.status(200).json({
      success: true,
      data: {
        images: result.images.map(img => ({
          url: img.url,
          revisedPrompt: img.revised_prompt
        })),
        cost: result.cost,
        prompt: prompt,
        options: {
          size: options.size,
          quality: options.quality,
          style: options.style,
        }
      }
    });
  } catch (error) {
    logger.error(`Image generation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Image generation failed',
      error: error.message
    });
  }
};

/**
 * @desc    Generate automotive-specific image
 * @route   POST /api/v1/images/generate-automotive
 * @access  Private
 */
exports.generateAutomotiveImage = async (req, res) => {
  try {
    const { description, vehicleType, style } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Enhance prompt for automotive context
    const enhancedPrompt = `Create a professional automotive image: ${description}${vehicleType ? ` featuring a ${vehicleType}` : ''}. High quality, photorealistic, professional automotive photography style.`;

    const options = {
      size: req.body.size || '1024x1024',
      quality: req.body.quality || 'hd',
      style: style || 'natural',
      n: 1,
      model: 'dall-e-3',
    };

    const result = await openaiService.generateImage(enhancedPrompt, options);

    res.status(200).json({
      success: true,
      data: {
        images: result.images.map(img => ({
          url: img.url,
          revisedPrompt: img.revised_prompt
        })),
        cost: result.cost,
        originalDescription: description,
        vehicleType: vehicleType || 'General automotive',
      }
    });
  } catch (error) {
    logger.error(`Automotive image generation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Automotive image generation failed',
      error: error.message
    });
  }
};

/**
 * @desc    Get image generation cost estimate
 * @route   POST /api/v1/images/estimate-cost
 * @access  Public
 */
exports.estimateCost = async (req, res) => {
  try {
    const { quality, n } = req.body;

    const costPerImage = quality === 'hd' ? 0.08 : 0.04;
    const totalCost = costPerImage * (n || 1);

    res.status(200).json({
      success: true,
      data: {
        costPerImage,
        quantity: n || 1,
        totalCost,
        quality: quality || 'standard',
        currency: 'USD'
      }
    });
  } catch (error) {
    logger.error(`Cost estimation error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Cost estimation failed',
      error: error.message
    });
  }
};
