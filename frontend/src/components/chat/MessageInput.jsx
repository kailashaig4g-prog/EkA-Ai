import { useState, useRef, useCallback, useEffect, memo } from 'react';

/**
 * MessageInput - Chat input with auto-expand, attachments, and voice
 * @param {Object} props
 * @param {Function} props.onSend - Callback when message is sent
 * @param {Function} props.onImageSelect - Callback when image is selected
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.isStreaming - Whether AI is currently streaming
 * @param {Function} props.onStopStreaming - Callback to stop streaming
 */
export const MessageInput = memo(({
  onSend,
  onImageSelect,
  disabled = false,
  isStreaming = false,
  onStopStreaming,
}) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '24px';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [text]);

  // Handle text change
  const handleChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  // Handle send
  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if ((trimmedText || imageFile) && !disabled && !isStreaming) {
      onSend(trimmedText, imageFile);
      setText('');
      setImagePreview(null);
      setImageFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  }, [text, imageFile, disabled, isStreaming, onSend]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // Handle image selection
  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        alert('Image must be less than 20MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  }, [onImageSelect]);

  // Remove image
  const removeImage = useCallback(() => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Open file picker
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const canSend = (text.trim() || imageFile) && !disabled && !isStreaming;

  return (
    <div
      className="border-t px-4 py-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      data-testid="message-input-container"
    >
      <div className="max-w-3xl mx-auto">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block animate-slide-up">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 rounded-xl object-cover"
              style={{ border: '1px solid var(--border)' }}
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              data-testid="remove-image-btn"
            >
              <svg className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Row */}
        <div
          className="flex items-end gap-2 rounded-2xl px-4 py-3 transition-shadow focus-within:shadow-md"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Attachment Button */}
          <button
            onClick={openFilePicker}
            disabled={disabled || isStreaming}
            className="p-2 rounded-xl transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
            title="Attach image"
            data-testid="attach-image-btn"
          >
            <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            data-testid="file-input"
          />

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Kailash AI anything..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[15px] leading-relaxed placeholder:text-[var(--text-tertiary)] disabled:opacity-50"
            style={{ color: 'var(--text-primary)', minHeight: '24px', maxHeight: '200px' }}
            data-testid="message-input"
          />

          {/* Send / Stop Button */}
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              className="p-2 rounded-xl transition-all hover:scale-105"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
              title="Stop generating"
              data-testid="stop-btn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="p-2 rounded-xl transition-all disabled:opacity-30"
              style={{
                backgroundColor: canSend ? 'var(--brand-primary)' : 'var(--bg-hover)',
                color: canSend ? 'white' : 'var(--text-tertiary)',
              }}
              title="Send message"
              data-testid="send-btn"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
        </div>

        {/* Helper Text */}
        <p className="mt-2 text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
          Press <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
