# Spur AI Live Chat Agent

A full-stack AI-powered customer support chat application built with TypeScript, React, and OpenAI. This application provides intelligent, context-aware responses for an e-commerce store using GPT-3.5-turbo.

## ✨ Features

- 💬 **Real-time AI Chat**: Instant responses from OpenAI-powered support agent
- 🔄 **Conversation Persistence**: Messages stored in SQLite with session management
- 📱 **Responsive UI**: Clean, modern interface with professional light theme
- 🛡️ **Robust Error Handling**: Graceful handling of API failures, timeouts, and invalid inputs
- 📚 **Domain Knowledge**: Pre-configured with e-commerce store knowledge base
- ⚡ **Input Validation**: Client and server-side validation with sensible limits
- 🎨 **Great UX**: Auto-scroll, typing indicators, message timestamps with local time
- 🧪 **Mock Mode**: Test without API keys using pattern-matched responses

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3)
- **LLM**: OpenAI GPT-3.5-turbo
- **Dev Tools**: tsx (hot reload)

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS3 (custom, no frameworks)

## 📁 Project Structure

```
spur-ai-agent/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.ts      # SQLite connection & initialization
│   │   │   ├── migrate.ts         # Database schema migrations
│   │   │   └── models.ts          # Data models & database queries
│   │   ├── middleware/
│   │   │   └── validation.ts      # Request validation & error handling
│   │   ├── routes/
│   │   │   └── chat.ts            # Chat API endpoints
│   │   ├── services/
│   │   │   ├── knowledge.ts       # E-commerce knowledge base
│   │   │   └── llmService.ts      # OpenAI integration & mock mode
│   │   └── index.ts               # Express server entry point
│   ├── data/                      # SQLite database (auto-created)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example               # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── chat.ts            # Backend API client
    │   ├── components/
    │   │   ├── ChatInput.tsx      # Message input component
    │   │   ├── ChatInput.css
    │   │   ├── Message.tsx        # Message bubble component
    │   │   └── Message.css
    │   ├── hooks/
    │   │   └── useChat.ts         # Chat state management hook
    │   ├── App.tsx                # Main application component
    │   ├── App.css
    │   └── main.tsx               # React entry point
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 20+ installed
- npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys)) - Optional, can use mock mode

### Option 1: Automated Setup (Recommended)

```bash
# Clone and navigate to project
cd spur-ai-agent

# Run automated installation (installs all dependencies)
bash install.sh

# Configure environment
cd backend
cp .env.example .env
# Edit .env and add your OpenAI API key (or use LLM_PROVIDER=mock for testing)

# Start backend (in terminal 1)
cd ..
bash start-backend.sh

# Start frontend (in terminal 2)
bash start-frontend.sh
```

Open http://localhost:5173 in your browser!

### Option 2: Manual Setup

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Configure backend
cd ../backend
cp .env.example .env
# Edit .env with your API key or use mock mode

# Start backend
npm run dev

# In a new terminal, start frontend
cd frontend
npm run dev
```

### Environment Configuration

Edit `backend/.env`:

```env
# LLM Provider: 'openai' or 'mock'
LLM_PROVIDER=openai

# OpenAI API key (only needed if LLM_PROVIDER=openai)
OPENAI_API_KEY=sk-your-key-here

# Server settings
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/chat.db
CORS_ORIGIN=http://localhost:5173
```

**Mock Mode**: Set `LLM_PROVIDER=mock` to test without an API key. It provides intelligent pattern-matched responses for common questions.

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                           │
│                  (localhost:5173)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ App.tsx  │→ │ useChat  │→ │ API      │                 │
│  │          │  │ Hook     │  │ Client   │                 │
│  └──────────┘  └──────────┘  └────┬─────┘                 │
│         ↓                          │                        │
│  ┌──────────┐  ┌──────────┐       │                       │
│  │ Message  │  │ChatInput │       │                       │
│  └──────────┘  └──────────┘       │                       │
└────────────────────────────────────┼───────────────────────┘
                                     │ HTTP POST
                                     │ /api/chat/message
                                     ↓
┌─────────────────────────────────────────────────────────────┐
│                 Express Backend                             │
│                 (localhost:3000)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Middleware: CORS, Validation, Error Handler          │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes: /api/chat/message, /api/chat/history         │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ LLM Service: OpenAI GPT-3.5 / Mock Mode              │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database: SQLite (conversations + messages)          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**1. Layered Backend Architecture**

- **Routes**: HTTP request/response handling
- **Middleware**: Validation, CORS, error handling
- **Services**: Business logic and LLM integration
- **Data**: Database models and queries

**2. SQLite Database**

- Zero configuration required
- Perfect for prototypes and demos
- File-based, portable
- Easy migration path to PostgreSQL

**3. Session Management**

- UUID-based session tracking
- Sessions stored in localStorage (frontend)
- No authentication required (as per requirements)

**4. Frontend State Management**

- Custom `useChat` hook encapsulates all chat logic
- Optimistic UI updates for better UX
- Auto-scroll to latest messages
- Clean separation between UI and logic

**5. Error Handling Strategy**

- Multiple validation layers
- Graceful LLM failure handling
- User-friendly error messages
- Global error boundary

## 📡 API Documentation

### POST `/api/chat/message`

Send a message and get AI response.

**Request:**

```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-uuid"
}
```

**Response:**

```json
{
  "reply": "We accept returns within 30 days...",
  "sessionId": "abc-123-def",
  "messageId": "msg-789",
  "timestamp": "2025-12-29T10:30:00.000Z"
}
```

**Validation:**

- `message`: Required, 1-2000 characters
- `sessionId`: Optional UUID string

### GET `/api/chat/history/:sessionId`

Retrieve conversation history for a session.

**Response:**

```json
{
  "sessionId": "abc-123-def",
  "messages": [
    {
      "id": "msg-1",
      "sender": "user",
      "text": "Hello!",
      "timestamp": "2025-12-29T10:29:00.000Z"
    }
  ],
  "conversationInfo": {
    "created_at": "2025-12-29T10:29:00.000Z",
    "updated_at": "2025-12-29T10:30:00.000Z"
  }
}
```

### GET `/api/chat/health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-29T10:30:00.000Z"
}
```

## 🤖 LLM Integration

### OpenAI GPT-3.5-turbo

The application uses OpenAI's GPT-3.5-turbo model with:

- **System prompt** with e-commerce store context
- **Conversation history** for context-aware responses
- **Knowledge base** with FAQs embedded in prompts
- **Error handling** with fallback messages

### Mock Mode

For testing without API costs:

- Pattern-matched responses for common queries
- Covers shipping, returns, tracking, payments, warranty
- Fallback to generic helpful responses
- Perfect for development and demos

**Configuration:**

```env
LLM_PROVIDER=mock  # Use mock mode
LLM_PROVIDER=openai # Use OpenAI (requires API key)
```

## 💾 Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

## 🎨 UI/UX Features

- **Professional light theme** with blue gradient accents
- **Responsive design** works on mobile and desktop
- **Message timestamps** displayed in local timezone
- **Auto-scroll** to latest messages
- **Loading states** with typing indicators
- **Error states** with user-friendly messages
- **Smooth animations** and hover effects

## ⚙️ Development

### Backend Development

```bash
cd backend
npm run dev  # Starts server with hot reload (tsx watch)
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server with hot reload
```

### Building for Production

```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
npm run preview
```

## 🧪 Testing

### Test Mock Mode

```bash
# In backend/.env
LLM_PROVIDER=mock

# Start servers and test various queries:
# - "How does shipping work?"
# - "What's your return policy?"
# - "Track my order"
# - "Payment methods?"
```

### Test OpenAI Mode

```bash
# In backend/.env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key

# Start servers and test natural language queries
```

## 🔧 Troubleshooting

### Backend won't start

- Check Node version: `node --version` (requires 20+)
- Verify .env file exists in backend/
- Check if port 3000 is available

### Frontend won't connect

- Ensure backend is running on port 3000
- Check CORS_ORIGIN in backend/.env matches frontend URL
- Verify no firewall blocking localhost connections

### SQLite errors

- Delete `backend/data/chat.db` and restart (auto-recreates)
- Check write permissions in backend/data/ folder

### OpenAI API errors

- Verify API key is valid
- Check account has credits
- Switch to `LLM_PROVIDER=mock` for testing

## 📝 Trade-offs & Future Improvements

### Current Trade-offs

1. **SQLite vs PostgreSQL**: Chose SQLite for simplicity, would use PostgreSQL for production
2. **No Authentication**: Simplified per requirements, but easy to add JWT auth
3. **Client-side Sessions**: Sessions in localStorage, would use server-side sessions in production
4. **No Rate Limiting**: Would add rate limiting for production API
5. **Simple Error Logging**: Would integrate structured logging (e.g., Winston) for production

### Future Enhancements

- **User Authentication**: JWT-based auth with login/register
- **Real-time Updates**: WebSocket for live chat updates
- **Message Search**: Full-text search across conversation history
- **File Uploads**: Support for image/document uploads
- **Admin Dashboard**: Analytics and conversation management
- **Multi-language**: i18n support for multiple languages
- **Voice Input**: Speech-to-text integration
- **Sentiment Analysis**: Track customer satisfaction
- **Export Conversations**: PDF/CSV export functionality
- **Canned Responses**: Quick reply templates for common questions

## 📄 License

MIT

## 🤝 Contributing

This is a home assignment project. Not accepting contributions at this time.

---

Built with ❤️ using TypeScript, React, and OpenAI
