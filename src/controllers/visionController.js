const openaiService = require('../services/openaiService');
const logger = require('../utils/logger');
const fs = require('fs');

/**
 * @desc    Analyze vehicle damage using GPT-4 Vision
 * @route   POST /api/v1/vision/analyze-damage
 * @access  Private
 */
exports.analyzeDamage = async (req, res) => {
  try {
    const { imageUrl, imageBase64, vehicleInfo } = req.body;

    if (!imageUrl && !imageBase64 && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL, base64 image, or upload a file'
      });
    }

    let imageInput = imageUrl;
    
    // Handle base64 image
    if (imageBase64) {
      imageInput = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    }
    
    // Handle uploaded file
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      imageInput = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Clean up file
      fs.unlinkSync(req.file.path);
    }

    const prompt = `You are an expert automotive damage assessor. Analyze this vehicle image and provide:
1. **Damage Type**: Identify all visible damage (scratches, dents, cracks, etc.)
2. **Severity**: Rate as Minor, Moderate, or Severe
3. **Affected Parts**: List all damaged components
4. **Estimated Repair Cost**: Provide a range in USD
5. **Repair Recommendations**: What needs to be done
${vehicleInfo ? `\nVehicle Info: ${vehicleInfo}` : ''}

Provide your analysis in a structured format.`;

    const options = {
      detail: req.body.detail || 'high',
      maxTokens: 1500,
    };

    const result = await openaiService.analyzeImage(imageInput, prompt, options);

    res.status(200).json({
      success: true,
      data: {
        analysis: result.analysis,
        usage: result.usage,
        estimatedCost: result.cost,
        vehicleInfo: vehicleInfo || null,
      }
    });
  } catch (error) {
    logger.error(`Vision analysis error: ${error.message}`);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Image analysis failed',
      error: error.message
    });
  }
};

/**
 * @desc    Analyze vehicle part
 * @route   POST /api/v1/vision/analyze-part
 * @access  Private
 */
exports.analyzePart = async (req, res) => {
  try {
    const { imageUrl, imageBase64, partType } = req.body;

    if (!imageUrl && !imageBase64 && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL, base64 image, or upload a file'
      });
    }

    let imageInput = imageUrl;
    
    if (imageBase64) {
      imageInput = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    }
    
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      imageInput = `data:${req.file.mimetype};base64,${base64Image}`;
      fs.unlinkSync(req.file.path);
    }

    const prompt = `You are an automotive parts expert. Analyze this ${partType || 'automotive part'} and provide:
1. **Part Identification**: What is this part?
2. **Condition**: Assess the condition (New, Good, Fair, Poor, Damaged)
3. **Wear Indicators**: What signs of wear are visible?
4. **Compatibility**: Any visible markings or part numbers?
5. **Recommendations**: Should it be replaced or serviced?

Provide detailed technical analysis.`;

    const options = {
      detail: req.body.detail || 'high',
      maxTokens: 1000,
    };

    const result = await openaiService.analyzeImage(imageInput, prompt, options);

    res.status(200).json({
      success: true,
      data: {
        analysis: result.analysis,
        usage: result.usage,
        estimatedCost: result.cost,
        partType: partType || 'Unknown',
      }
    });
  } catch (error) {
    logger.error(`Part analysis error: ${error.message}`);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Part analysis failed',
      error: error.message
    });
  }
};

/**
 * @desc    General automotive image analysis
 * @route   POST /api/v1/vision/analyze
 * @access  Private
 */
exports.analyzeImage = async (req, res) => {
  try {
    const { imageUrl, imageBase64, prompt } = req.body;

    if (!imageUrl && !imageBase64 && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image URL, base64 image, or upload a file'
      });
    }

    let imageInput = imageUrl;
    
    if (imageBase64) {
      imageInput = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    }
    
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      imageInput = `data:${req.file.mimetype};base64,${base64Image}`;
      fs.unlinkSync(req.file.path);
    }

    const analysisPrompt = prompt || 'Analyze this automotive image and provide detailed insights.';

    const options = {
      detail: req.body.detail || 'auto',
      maxTokens: req.body.maxTokens || 500,
    };

    const result = await openaiService.analyzeImage(imageInput, analysisPrompt, options);

    res.status(200).json({
      success: true,
      data: {
        analysis: result.analysis,
        usage: result.usage,
        estimatedCost: result.cost,
      }
    });
  } catch (error) {
    logger.error(`Image analysis error: ${error.message}`);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Image analysis failed',
      error: error.message
    });
  }
};
