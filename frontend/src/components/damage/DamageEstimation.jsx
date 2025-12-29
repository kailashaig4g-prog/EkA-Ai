import { useState, useCallback, memo } from 'react';
import { useImageUpload } from '../../hooks/useImageUpload';

/**
 * DamageEstimation - Vision analysis modal for vehicle damage
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onCreateJobCard - Callback to create job card with analysis
 */
export const DamageEstimation = memo(({ isOpen, onClose, onCreateJobCard }) => {
  const {
    selectedImage,
    imagePreview,
    isAnalyzing,
    error: uploadError,
    selectImage,
    clearImage,
    analyzeForDamage,
  } = useImageUpload();

  const [analysis, setAnalysis] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        selectImage(file);
        setAnalysis(null);
      }
    },
    [selectImage]
  );

  // Handle file select
  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        selectImage(file);
        setAnalysis(null);
      }
    },
    [selectImage]
  );

  // Handle analyze
  const handleAnalyze = useCallback(async () => {
    const result = await analyzeForDamage();
    if (result) {
      setAnalysis(result);
    }
  }, [analyzeForDamage]);

  // Handle create job card
  const handleCreateJobCard = useCallback(() => {
    if (analysis && onCreateJobCard) {
      onCreateJobCard(analysis);
      onClose();
    }
  }, [analysis, onCreateJobCard, onClose]);

  // Clear and close
  const handleClose = useCallback(() => {
    clearImage();
    setAnalysis(null);
    onClose();
  }, [clearImage, onClose]);

  // Get severity badge color
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return { bg: 'rgba(65, 126, 70, 0.1)', color: 'var(--brand-secondary)' };
      case 'moderate':
        return { bg: 'rgba(223, 140, 77, 0.1)', color: 'var(--brand-accent)' };
      case 'severe':
        return { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' };
      default:
        return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="damage-estimation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl rounded-2xl p-6 animate-slide-up"
          style={{
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Damage Analysis
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Upload a photo to analyze vehicle damage
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
            >
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error */}
          {uploadError && (
            <div
              className="mb-4 p-4 rounded-xl text-sm"
              style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
            >
              {uploadError}
            </div>
          )}

          {/* Upload Area */}
          {!imagePreview ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${isDragging ? 'bg-[var(--bg-hover)]' : ''}`}
              style={{ borderColor: isDragging ? 'var(--brand-primary)' : 'var(--border)' }}
              onClick={() => document.getElementById('damage-image-input')?.click()}
            >
              <input
                id="damage-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <svg className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Drop your image here or click to browse
              </p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Supports JPEG, PNG, WebP (max 20MB)
              </p>
            </div>
          ) : (
            <div>
              {/* Image Preview */}
              <div className="relative mb-4">
                <img
                  src={imagePreview}
                  alt="Damage preview"
                  className="w-full max-h-[300px] object-contain rounded-xl"
                  style={{ border: '1px solid var(--border)' }}
                />
                <button
                  onClick={() => {
                    clearImage();
                    setAnalysis(null);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Analyze Button */}
              {!analysis && (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                  style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
                  data-testid="analyze-btn"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing with AI...
                    </span>
                  ) : (
                    'Analyze Damage'
                  )}
                </button>
              )}

              {/* Analysis Results */}
              {analysis && (
                <div className="space-y-4 animate-slide-up" data-testid="analysis-results">
                  {/* Severity & Confidence */}
                  <div className="flex items-center gap-3">
                    <span
                      className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={getSeverityStyle(analysis.severity)}
                    >
                      {analysis.severity || 'Unknown'} Damage
                    </span>
                    {analysis.confidence && (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {Math.round(analysis.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>

                  {/* Damage Areas */}
                  {analysis.damageAreas?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Damage Areas
                      </h4>
                      <div className="space-y-2">
                        {analysis.damageAreas.map((area, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                              {area.location}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {area.type} • {area.repairMethod}
                            </p>
                            {area.estimatedCost && (
                              <p className="text-sm mt-1" style={{ color: 'var(--brand-primary)' }}>
                                ₹{area.estimatedCost.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total Estimate */}
                  {(analysis.totalCostMin || analysis.totalCostMax) && (
                    <div
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: 'rgba(87, 6, 131, 0.05)', border: '1px solid rgba(87, 6, 131, 0.1)' }}
                    >
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Estimated Total Cost
                      </p>
                      <p className="text-xl font-semibold" style={{ color: 'var(--brand-primary)' }}>
                        ₹{analysis.totalCostMin?.toLocaleString()} - ₹{analysis.totalCostMax?.toLocaleString()}
                      </p>
                      {analysis.laborHours && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                          Estimated labor: {analysis.laborHours} hours
                        </p>
                      )}
                    </div>
                  )}

                  {/* Create Job Card Button */}
                  {onCreateJobCard && (
                    <button
                      onClick={handleCreateJobCard}
                      className="w-full py-3 rounded-xl font-medium transition-all"
                      style={{
                        backgroundColor: 'var(--brand-secondary)',
                        color: 'white',
                      }}
                      data-testid="create-jobcard-btn"
                    >
                      Create Job Card
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

DamageEstimation.displayName = 'DamageEstimation';

export default DamageEstimation;
