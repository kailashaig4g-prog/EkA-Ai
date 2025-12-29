import { useState, useCallback } from 'react';
import config from '../config';

/**
 * Custom hook for handling image uploads for Vision API
 */
export const useImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Supported image types
  const SUPPORTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  /**
   * Validate image file
   */
  const validateImage = useCallback((file) => {
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (!SUPPORTED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Unsupported file type. Please use JPEG, PNG, GIF, or WebP.' };
    }

    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File too large. Maximum size is 20MB.' };
    }

    return { valid: true, error: null };
  }, []);

  /**
   * Select and preview an image
   */
  const selectImage = useCallback((file) => {
    setError(null);

    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    return true;
  }, [validateImage]);

  /**
   * Clear selected image
   */
  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setError(null);
  }, []);

  /**
   * Convert image to base64
   */
  const getBase64 = useCallback(() => {
    return imagePreview;
  }, [imagePreview]);

  /**
   * Upload image to server
   */
  const uploadImage = useCallback(async (endpoint = '/images/upload') => {
    if (!selectedImage) {
      setError('No image selected');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage]);

  /**
   * Analyze image for damage using Vision API
   */
  const analyzeForDamage = useCallback(async () => {
    if (!selectedImage) {
      setError('No image selected');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/vision/analyze-damage`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  /**
   * Analyze image for part identification
   */
  const analyzeForPart = useCallback(async () => {
    if (!selectedImage) {
      setError('No image selected');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/vision/analyze-part`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  /**
   * Generic image analysis
   */
  const analyzeImage = useCallback(async (prompt = 'Analyze this automotive image') => {
    if (!selectedImage) {
      setError('No image selected');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', prompt);

      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiUrl}/vision/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImage]);

  return {
    selectedImage,
    imagePreview,
    isUploading,
    isAnalyzing,
    error,
    selectImage,
    clearImage,
    getBase64,
    uploadImage,
    analyzeForDamage,
    analyzeForPart,
    analyzeImage,
    validateImage,
  };
};

export default useImageUpload;
