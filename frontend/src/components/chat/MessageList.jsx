import { useEffect, useRef, memo } from 'react';

/**
 * Format timestamp to readable time
 */
const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Bot Avatar Component
 */
const BotAvatar = memo(() => (
  <div
    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
    style={{ backgroundColor: 'var(--brand-primary)' }}
  >
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  </div>
));

BotAvatar.displayName = 'BotAvatar';

/**
 * Loading Dots Animation
 */
const LoadingDots = memo(() => (
  <div className="flex items-center gap-1 py-1">
    <span
      className="w-2 h-2 rounded-full animate-bounce"
      style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '0ms' }}
    />
    <span
      className="w-2 h-2 rounded-full animate-bounce"
      style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '150ms' }}
    />
    <span
      className="w-2 h-2 rounded-full animate-bounce"
      style={{ backgroundColor: 'var(--text-tertiary)', animationDelay: '300ms' }}
    />
  </div>
));

LoadingDots.displayName = 'LoadingDots';

/**
 * Single Message Component
 */
const Message = memo(({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4" data-testid="message-system">
        <div
          className="px-4 py-2 rounded-full text-xs"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 my-4 animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}
      data-testid={`message-${message.role}`}
    >
      {/* Bot Avatar */}
      {!isUser && <BotAvatar />}

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        {/* Image Attachment */}
        {message.imageUrl && (
          <div className="mb-2">
            <img
              src={message.imageUrl}
              alt="Attached"
              className="rounded-xl max-w-full max-h-60 object-cover"
              style={{ border: '1px solid var(--border)' }}
            />
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${isUser ? 'rounded-br-md' : ''}`}
          style={{
            backgroundColor: isUser ? 'var(--bg-secondary)' : 'transparent',
            color: message.error ? '#dc2626' : 'var(--text-primary)',
          }}
        >
          {message.isStreaming && !message.content ? (
            <LoadingDots />
          ) : (
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {/* Stopped indicator */}
          {message.stopped && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
              — Response stopped
            </p>
          )}
        </div>

        {/* Timestamp */}
        <div className={`mt-1 text-xs ${isUser ? 'text-right' : 'text-left'}`} style={{ color: 'var(--text-tertiary)' }}>
          {formatTime(message.timestamp)}
          {message.isStreaming && (
            <span className="ml-2 animate-pulse">• Generating...</span>
          )}
        </div>
      </div>
    </div>
  );
});

Message.displayName = 'Message';

/**
 * MessageList - Displays chat messages with auto-scroll
 * @param {Object} props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isStreaming - Whether AI is currently streaming
 */
export const MessageList = memo(({ messages, isStreaming }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide"
      style={{ backgroundColor: 'var(--bg-primary)' }}
      data-testid="message-list"
    >
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
