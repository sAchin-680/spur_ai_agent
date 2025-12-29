import { useChat } from './hooks/useChat';
import { Message } from './components/Message';
import { ChatInput } from './components/ChatInput';
import './App.css';

function App() {
  const { messages, isLoading, error, sendMessage, clearChat, messagesEndRef } =
    useChat();

  return (
    <div className="app">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-content">
            <h1>🛍️ QuickShop Support</h1>
            <p>AI-powered customer service</p>
          </div>
          {messages.length > 0 && (
            <button className="clear-button" onClick={clearChat}>
              New Chat
            </button>
          )}
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">👋</div>
              <h2>Welcome to QuickShop Support!</h2>
              <p>I'm your AI assistant. Ask me anything about:</p>
              <ul>
                <li>Shipping & delivery</li>
                <li>Returns & refunds</li>
                <li>Order tracking</li>
                <li>Product warranties</li>
                <li>Payment methods</li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <span>Agent is typing...</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}

export default App;
