import db from './connection';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert SQLite timestamp to ISO string with UTC marker
function toISOString(sqliteTimestamp: string): string {
  // SQLite CURRENT_TIMESTAMP format: 'YYYY-MM-DD HH:MM:SS'
  // Add 'Z' to indicate UTC if not present
  if (sqliteTimestamp && !sqliteTimestamp.endsWith('Z')) {
    return sqliteTimestamp.replace(' ', 'T') + 'Z';
  }
  return sqliteTimestamp;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const conversationModel = {
  create(): Conversation {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO conversations (id)
      VALUES (?)
    `);
    stmt.run(id);

    const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as Conversation;
    return conversation;
  },

  findById(id: string): Conversation | undefined {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id) as Conversation | undefined;
  },

  updateTimestamp(id: string): void {
    const stmt = db.prepare(`
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(id);
  }
};

export const messageModel = {
  create(conversationId: string, sender: 'user' | 'ai', text: string): Message {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO messages (id, conversation_id, sender, text)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, conversationId, sender, text);

    // Update conversation timestamp
    conversationModel.updateTimestamp(conversationId);

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as Message;
    // Convert SQLite timestamp to proper ISO format
    message.timestamp = toISOString(message.timestamp);
    return message;
  },

  findByConversationId(conversationId: string): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY timestamp ASC
    `);
    const messages = stmt.all(conversationId) as Message[];
    // Convert timestamps to ISO format
    return messages.map(msg => ({
      ...msg,
      timestamp: toISOString(msg.timestamp)
    }));
  },

  getRecentMessages(conversationId: string, limit: number = 10): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const messages = stmt.all(conversationId, limit) as Message[];
    // Convert timestamps and return in chronological order
    return messages.map(msg => ({
      ...msg,
      timestamp: toISOString(msg.timestamp)
    })).reverse();
  }
};
