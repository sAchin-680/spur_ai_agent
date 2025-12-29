import { useState, useEffect, useRef } from 'react';
import { chatApi, Message } from '../api/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      loadHistory(savedSessionId);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async (sid: string) => {
    try {
      const history = await chatApi.getHistory(sid);
      setMessages(history.messages);
      setSessionId(sid);
    } catch (err) {
      console.error('Failed to load history:', err);
      // If history fails, start fresh
      localStorage.removeItem('chatSessionId');
      setSessionId(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message
    setMessages((prev) => [...prev, userMessage]);
    setError(null);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(
        text.trim(),
        sessionId || undefined
      );

      // Update with actual message data and add AI response
      const aiMessage: Message = {
        id: response.messageId,
        sender: 'ai',
        text: response.reply,
        timestamp: response.timestamp,
      };

      setMessages((prev) => {
        // Remove temp user message and add both real messages
        const filtered = prev.filter((m) => m.id !== userMessage.id);
        return [...filtered, userMessage, aiMessage];
      });

      // Save session ID
      if (!sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem('chatSessionId', response.sessionId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    localStorage.removeItem('chatSessionId');
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    messagesEndRef,
  };
}
