import { Request, Response, NextFunction } from 'express';

const MAX_MESSAGE_LENGTH = 2000;

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Middleware to validate chat message requests
 */
export function validateChatMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors: ValidationError[] = [];
  const { message, sessionId } = req.body;

  // Validate message field
  if (!message) {
    errors.push({
      field: 'message',
      message: 'Message is required',
    });
  } else if (typeof message !== 'string') {
    errors.push({
      field: 'message',
      message: 'Message must be a string',
    });
  } else if (message.trim().length === 0) {
    errors.push({
      field: 'message',
      message: 'Message cannot be empty',
    });
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  // Validate sessionId if provided
  if (sessionId !== undefined && sessionId !== null) {
    if (typeof sessionId !== 'string') {
      errors.push({
        field: 'sessionId',
        message: 'SessionId must be a string',
      });
    } else if (sessionId.trim().length === 0) {
      errors.push({
        field: 'sessionId',
        message: 'SessionId cannot be empty',
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      errors,
    });
  }

  // Sanitize the message (trim whitespace)
  req.body.message = message.trim();
  if (sessionId) {
    req.body.sessionId = sessionId.trim();
  }

  next();
}

/**
 * Global error handler
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  // Don't crash the server on errors
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred. Please try again later.',
  });
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.path}`,
  });
}
