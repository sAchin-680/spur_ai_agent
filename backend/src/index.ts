import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat';
import { errorHandler, notFoundHandler } from './middleware/validation';
import { runMigrations } from './database/migrate';
import { LLMService } from './services/llmService';

// Load environment variables
dotenv.config();

// Validate configuration
try {
  LLMService.validateConfig();
} catch (error: any) {
  console.error('Configuration Error:', error.message);
  console.error(
    'Please set environment variables: LLM_PROVIDER and OPENAI_API_KEY (or use LLM_PROVIDER=mock)'
  );
  process.exit(1);
}

// Run database migrations
runMigrations();

// Create Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`
  );
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

export default app;
