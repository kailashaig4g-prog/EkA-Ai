import { useState, useCallback, useEffect, memo } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

/**
 * VoiceInput - Voice recording button with visual feedback
 * @param {Object} props
 * @param {Function} props.onTranscription - Callback with transcribed text
 * @param {boolean} props.disabled - Whether input is disabled
 */
export const VoiceInput = memo(({ onTranscription, disabled = false }) => {
  const {
    isRecording,
    isProcessing,
    error,
    audioLevel,
    startRecording,
    finishRecording,
    cancelRecording,
  } = useVoiceInput();

  const [showTooltip, setShowTooltip] = useState(false);

  // Handle recording toggle
  const handleClick = useCallback(async () => {
    if (disabled) return;

    if (isRecording) {
      const transcription = await finishRecording();
      if (transcription && onTranscription) {
        onTranscription(transcription);
      }
    } else {
      await startRecording();
    }
  }, [isRecording, disabled, startRecording, finishRecording, onTranscription]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    cancelRecording();
  }, [cancelRecording]);

  // Calculate pulse scale based on audio level
  const pulseScale = 1 + audioLevel * 0.5;

  return (
    <div className="relative" data-testid="voice-input-container">
      {/* Main Button */}
      <button
        onClick={handleClick}
        disabled={disabled || isProcessing}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative p-2 rounded-xl transition-all duration-200 ${
          isRecording
            ? 'bg-red-500 text-white'
            : 'hover:bg-[var(--bg-hover)]'
        } disabled:opacity-50`}
        style={{
          transform: isRecording ? `scale(${pulseScale})` : 'scale(1)',
        }}
        data-testid="voice-btn"
      >
        {isProcessing ? (
          // Processing spinner
          <svg
            className="w-5 h-5 animate-spin"
            style={{ color: 'var(--brand-primary)' }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : isRecording ? (
          // Stop icon
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          // Microphone icon
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--text-secondary)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}

        {/* Pulsing ring when recording */}
        {isRecording && (
          <span
            className="absolute inset-0 rounded-xl animate-ping"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)' }}
          />
        )}
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap animate-fade-in"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
          }}
        >
          Recording...
          <button
            onClick={handleCancel}
            className="ml-2 underline hover:no-underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !isRecording && !isProcessing && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs whitespace-nowrap"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          Voice input (Whisper)
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg text-xs max-w-[200px] text-center"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            color: '#dc2626',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
});

VoiceInput.displayName = 'VoiceInput';

export default VoiceInput;
