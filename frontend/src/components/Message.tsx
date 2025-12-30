import { Message as MessageType } from '../api/chat';
import './Message.css';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.sender === 'user';

  // Format time to show current local time properly
  const formatTime = (timestamp: string) => {
    // Parse the UTC timestamp
    const date = new Date(timestamp);
    const now = new Date();

    // Check if the timestamp is today
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Return time in local timezone
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className={`message ${isUser ? 'message-user' : 'message-ai'}`}>
      <div className="message-avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="message-content">
        <div className="message-sender">
          {isUser ? 'You' : 'QuickShop Support'}
        </div>
        <div className="message-text">{message.text}</div>
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
