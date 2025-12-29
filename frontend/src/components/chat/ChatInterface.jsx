import { useState, useCallback, useMemo } from 'react';
import { useStreamingChat } from '../../hooks/useStreamingChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickPrompts } from './QuickPrompts';

/**
 * ChatInterface - Main chat container with sidebar support
 * @param {Object} props
 * @param {Object} props.vehicleContext - Active vehicle context for AI
 * @param {Function} props.onNewChat - Callback for new chat
 */
export const ChatInterface = ({ vehicleContext, onNewChat }) => {
  const {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
  } = useStreamingChat();

  const [imageFile, setImageFile] = useState(null);

  // Handle sending message
  const handleSend = useCallback(
    async (text, image) => {
      let imageUrl = null;

      // If there's an image, convert to base64
      if (image) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      // Build context string from vehicle
      let contextString = null;
      if (vehicleContext) {
        contextString = `Vehicle: ${vehicleContext.make} ${vehicleContext.model} (${vehicleContext.year}), Fuel: ${vehicleContext.fuelType || 'Unknown'}, Registration: ${vehicleContext.registrationNumber || 'Unknown'}`;
      }

      await sendMessage(text, {
        vehicleContext: contextString,
        imageUrl,
      });

      setImageFile(null);
    },
    [sendMessage, vehicleContext]
  );

  // Handle quick prompt selection
  const handleQuickPrompt = useCallback(
    (prompt) => {
      handleSend(prompt, null);
    },
    [handleSend]
  );

  // Handle new chat
  const handleNewChat = useCallback(() => {
    clearMessages();
    if (onNewChat) {
      onNewChat();
    }
  }, [clearMessages, onNewChat]);

  // Show empty state or messages
  const showEmptyState = messages.length === 0;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      data-testid="chat-interface"
    >
      {/* Chat Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-primary)' }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              Kailash AI
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {vehicleContext ? `${vehicleContext.make} ${vehicleContext.model}` : 'No vehicle selected'}
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        {messages.length > 0 && (
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-secondary)' }}
            data-testid="new-chat-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className="px-4 py-3 text-sm flex items-center gap-2"
          style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Messages or Empty State */}
      {showEmptyState ? (
        <QuickPrompts onSelectPrompt={handleQuickPrompt} />
      ) : (
        <MessageList messages={messages} isStreaming={isStreaming} />
      )}

      {/* Message Input */}
      <MessageInput
        onSend={handleSend}
        onImageSelect={setImageFile}
        disabled={false}
        isStreaming={isStreaming}
        onStopStreaming={stopStreaming}
      />
    </div>
  );
};

export default ChatInterface;
