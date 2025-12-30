const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  messageId: string;
  timestamp: string;
}

export interface HistoryResponse {
  sessionId: string;
  messages: Message[];
  conversationInfo: {
    created_at: string;
    updated_at: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

class ChatApi {
  /**
   * Send a message to the AI agent
   */
  async sendMessage(
    message: string,
    sessionId?: string
  ): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Get conversation history
   */
  async getHistory(sessionId: string): Promise<HistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Failed to fetch history');
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/chat/health`);
    return response.json();
  }
}

export const chatApi = new ChatApi();
