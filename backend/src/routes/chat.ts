import { Router, Request, Response } from 'express';
import { conversationModel, messageModel } from '../database/models';
import llmService from '../services/llmService';
import { validateChatMessage } from '../middleware/validation';

const router = Router();

/**
 * POST /api/chat/message
 * Send a message and get AI response
 */
router.post(
  '/message',
  validateChatMessage,
  async (req: Request, res: Response) => {
    try {
      const { message, sessionId } = req.body;

      // Get or create conversation
      let conversationId = sessionId;
      let conversation = conversationId
        ? conversationModel.findById(conversationId)
        : null;

      if (!conversation) {
        // Create new conversation if sessionId is invalid or not provided
        conversation = conversationModel.create();
        conversationId = conversation.id;
      }

      // Save user message
      const userMessage = messageModel.create(conversationId, 'user', message);

      // Get conversation history
      const conversationHistory = messageModel.getRecentMessages(
        conversationId,
        10
      );

      // Generate AI response
      let aiReply: string;
      try {
        aiReply = await llmService.generateReply(
          conversationHistory.filter((msg) => msg.id !== userMessage.id), // Exclude the message we just added
          message
        );
      } catch (error: any) {
        // Handle LLM-specific errors gracefully
        if (error.userMessage) {
          aiReply = error.userMessage;
        } else {
          throw error; // Let the global error handler catch it
        }
      }

      // Save AI response
      const aiMessage = messageModel.create(conversationId, 'ai', aiReply);

      // Return response
      res.json({
        reply: aiReply,
        sessionId: conversationId,
        messageId: aiMessage.id,
        timestamp: aiMessage.timestamp,
      });
    } catch (error) {
      console.error('Error in /chat/message:', error);
      res.status(500).json({
        error: 'Failed to process message',
        message:
          'An error occurred while processing your message. Please try again.',
      });
    }
  }
);

/**
 * GET /api/chat/history/:sessionId
 * Get conversation history
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const conversation = conversationModel.findById(sessionId);
    if (!conversation) {
      return res.status(404).json({
        error: 'Conversation not found',
        message: 'The requested conversation does not exist.',
      });
    }

    // Get all messages for this conversation
    const messages = messageModel.findByConversationId(sessionId);

    res.json({
      sessionId,
      messages: messages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
      })),
      conversationInfo: {
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in /chat/history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: 'An error occurred while fetching conversation history.',
    });
  }
});

/**
 * GET /api/chat/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

export default router;
