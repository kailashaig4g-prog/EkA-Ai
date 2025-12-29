import { useState, memo } from 'react';
import { exportChat } from '../../utils/chatExport';

/**
 * ExportModal - Chat export options modal
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Array} props.messages - Chat messages to export
 * @param {Object} props.metadata - Export metadata (vehicle, etc.)
 */
export const ExportModal = memo(({ isOpen, onClose, messages, metadata = {} }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);

  const EXPORT_FORMATS = [
    {
      id: 'pdf',
      label: 'PDF / Print',
      description: 'Best for printing or saving as PDF',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'markdown',
      label: 'Markdown',
      description: 'Plain text format, easy to read',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'json',
      label: 'JSON',
      description: 'Machine-readable format for developers',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
  ];

  const handleExport = async () => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }

    setIsExporting(true);
    try {
      exportChat(messages, selectedFormat, metadata);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="export-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl p-6 animate-slide-up"
          style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-xl)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Export Chat
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-hover)]">
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Info */}
          <div
            className="mb-6 p-3 rounded-xl text-sm"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
          >
            {messages.length} messages in this conversation
          </div>

          {/* Format Options */}
          <div className="space-y-3 mb-6">
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                  selectedFormat === format.id ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedFormat === format.id ? 'rgba(87, 6, 131, 0.05)' : 'var(--bg-secondary)',
                  border: `1px solid ${selectedFormat === format.id ? 'var(--brand-primary)' : 'var(--border)'}`,
                  ringColor: 'var(--brand-primary)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: selectedFormat === format.id ? 'var(--brand-primary)' : 'var(--bg-hover)',
                    color: selectedFormat === format.id ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {format.icon}
                </div>
                <div>
                  <p
                    className="font-medium"
                    style={{ color: selectedFormat === format.id ? 'var(--brand-primary)' : 'var(--text-primary)' }}
                  >
                    {format.label}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {format.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-medium"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || messages.length === 0}
              className="flex-1 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}
              data-testid="export-btn"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ExportModal.displayName = 'ExportModal';

export default ExportModal;
