import { useState, useCallback, useRef } from 'react';
import config from '../config';

/**
 * Custom hook for SSE streaming chat with the backend
 * @returns {Object} Chat state and methods
 */
export const useStreamingChat = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const currentResponseRef = useRef('');

  /**
   * Send a message and stream the response
   * @param {string} message - User message
   * @param {Object} options - Additional options (vehicleContext, imageUrl)
   */
  const sendMessage = useCallback(async (message, options = {}) => {
    const { vehicleContext, imageUrl } = options;
    
    // Create user message
    const userMessage = {
      id: `user-${Date.now()}`,
      content: message,
      role: 'user',
      timestamp: new Date().toISOString(),
      imageUrl: imageUrl || null,
    };

    // Add user message to state
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setError(null);
    currentResponseRef.current = '';

    // Create placeholder for AI response
    const aiMessageId = `ai-${Date.now()}`;
    const aiMessage = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, aiMessage]);

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      
      // Build request body
      const requestBody = {
        message,
        ...(vehicleContext && { vehicleContext }),
        ...(imageUrl && { imageUrl }),
      };

      const response = await fetch(`${config.apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              // Stream complete
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                currentResponseRef.current += parsed.content;
                
                // Update AI message content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: currentResponseRef.current }
                      : msg
                  )
                );
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (parseError) {
              // Handle non-JSON data (raw text)
              if (!data.startsWith('{')) {
                currentResponseRef.current += data;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: currentResponseRef.current }
                      : msg
                  )
                );
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // User cancelled - update message to show it was stopped
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, isStreaming: false, stopped: true }
              : msg
          )
        );
      } else {
        setError(err.message);
        // Update AI message with error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  content: 'Sorry, I encountered an error. Please try again.',
                  isStreaming: false,
                  error: true,
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Stop the current streaming response
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  /**
   * Add a system message
   */
  const addSystemMessage = useCallback((content) => {
    setMessages(prev => [
      ...prev,
      {
        id: `system-${Date.now()}`,
        content,
        role: 'system',
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearMessages,
    addSystemMessage,
    setMessages,
  };
};

export default useStreamingChat;
