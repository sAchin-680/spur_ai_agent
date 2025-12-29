import OpenAI from 'openai';
import { STORE_KNOWLEDGE } from './knowledge';
import { Message } from '../database/models';

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for QuickShop, an e-commerce store. 

Your responsibilities:
- Answer customer questions clearly, concisely, and professionally
- Use the store information provided below to answer questions accurately
- Be empathetic and understanding
- If you don't know something, admit it and offer to connect them with a human agent
- Keep responses brief but informative (2-4 sentences typically)
- Use a warm, conversational tone

Store Information:
${STORE_KNOWLEDGE}

Guidelines:
- Always greet new customers warmly
- Provide specific details from the store information when relevant
- Offer additional help after answering questions
- If a question is outside your knowledge, say: "I don't have that specific information, but I can connect you with our support team at support@quickshop.com or call 1-800-QUICKSHOP."
`;

export interface LLMError extends Error {
  type: 'rate_limit' | 'invalid_key' | 'timeout' | 'network' | 'unknown';
  userMessage: string;
}

export class LLMService {
  private maxTokens: number = 500;
  private temperature: number = 0.7;
  private model: string = 'gpt-3.5-turbo';
  private llmProvider: 'openai' | 'mock' = 'openai';

  constructor() {
    // Determine which LLM provider to use based on environment variables
    if (process.env.LLM_PROVIDER === 'mock') {
      this.llmProvider = 'mock';
    } else if (process.env.OPENAI_API_KEY) {
      this.llmProvider = 'openai';
    } else {
      // Default to mock mode for testing without API keys
      this.llmProvider = 'mock';
    }
  }

  /**
   * Generate a reply from the AI agent based on conversation history
   */
  async generateReply(
    conversationHistory: Message[],
    userMessage: string
  ): Promise<string> {
    if (this.llmProvider === 'mock') {
      return this.generateReplyMock(userMessage);
    } else {
      return this.generateReplyOpenAI(conversationHistory, userMessage);
    }
  }

  /**
   * Generate mock reply for testing without API
   */
  private async generateReplyMock(userMessage: string): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lowerMessage = userMessage.toLowerCase();

    // Pattern matching for common queries
    if (lowerMessage.includes('shipping') || lowerMessage.includes('deliver')) {
      return 'We offer free standard shipping on orders over $50! Standard shipping typically takes 3-5 business days, while express shipping (2-3 days) is available for $9.99. You can track your order anytime using your order number.';
    }

    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "We have a hassle-free 30-day return policy! If you're not completely satisfied, you can return items in their original condition for a full refund. Just contact us at support@quickshop.com to initiate the return process.";
    }

    if (lowerMessage.includes('track') || lowerMessage.includes('order')) {
      return "You can track your order by logging into your account and viewing your order history. You'll also receive tracking updates via email. If you need help finding your order, please share your order number and I'll look it up for you!";
    }

    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secured with industry-standard encryption to protect your information.';
    }

    if (
      lowerMessage.includes('warranty') ||
      lowerMessage.includes('guarantee')
    ) {
      return "All our products come with a manufacturer's warranty. Electronics typically have a 1-year warranty, while other items vary. We also offer extended warranty options at checkout. Need specific warranty details for a product? Let me know!";
    }

    if (
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hey')
    ) {
      return "Hello! Welcome to QuickShop Support! 👋 I'm here to help you with any questions about orders, shipping, returns, or our products. How can I assist you today?";
    }

    if (lowerMessage.includes('thank')) {
      return "You're very welcome! If you have any other questions, feel free to ask. I'm here to help! Have a great day! 😊";
    }

    // Default response for other queries
    return `Thank you for your question about "${userMessage}". I'd be happy to help! For specific information about your inquiry, please contact our support team at support@quickshop.com or call 1-800-QUICKSHOP. Is there anything else I can assist you with regarding shipping, returns, or order tracking?`;
  }

  /**
   * Generate reply using OpenAI
   */
  private async generateReplyOpenAI(
    conversationHistory: Message[],
    userMessage: string
  ): Promise<string> {
    try {
      // Build conversation context from history
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
      ];

      // Add recent conversation history (last 10 messages for context)
      const recentHistory = conversationHistory.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      // Call OpenAI API
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create(
        {
          model: this.model,
          messages: messages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
        },
        {
          timeout: 30000, // 30 second timeout
        }
      );

      const reply = completion.choices[0]?.message?.content;

      if (!reply) {
        throw new Error('No response from LLM');
      }

      return reply.trim();
    } catch (error: any) {
      throw this.handleLLMError(error);
    }
  }

  /**
   * Handle and classify LLM errors
   */
  private handleLLMError(error: any): LLMError {
    console.error('LLM Error:', error);

    const llmError = new Error() as LLMError;
    llmError.name = 'LLMError';

    // Rate limit error
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      llmError.type = 'rate_limit';
      llmError.userMessage =
        'Our AI agent is experiencing high demand right now. Please try again in a moment.';
      llmError.message = 'Rate limit exceeded';
      return llmError;
    }

    // Invalid API key
    if (error.status === 401 || error.code === 'invalid_api_key') {
      llmError.type = 'invalid_key';
      llmError.userMessage =
        'There seems to be a configuration issue. Please contact support at support@quickshop.com.';
      llmError.message = 'Invalid API key';
      return llmError;
    }

    // Timeout error
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      llmError.type = 'timeout';
      llmError.userMessage =
        'The request took too long to process. Please try sending your message again.';
      llmError.message = 'Request timeout';
      return llmError;
    }

    // Network error
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      llmError.type = 'network';
      llmError.userMessage =
        'Unable to connect to our AI service. Please check your internet connection and try again.';
      llmError.message = 'Network error';
      return llmError;
    }

    // Generic error
    llmError.type = 'unknown';
    llmError.userMessage =
      'I encountered an unexpected error. Please try again or contact our support team at support@quickshop.com.';
    llmError.message = error.message || 'Unknown error';
    return llmError;
  }

  /**
   * Validate API key is configured
   */
  static validateConfig(): void {
    const useMock = process.env.LLM_PROVIDER === 'mock';

    if (useMock) {
      console.log('✓ Using LLM Provider: MOCK (Perfect for testing!)');
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not configured. Please set it in your .env file or use LLM_PROVIDER=mock for testing.'
      );
    }

    console.log('✓ Using LLM Provider: OPENAI');
  }
}

export default new LLMService();
