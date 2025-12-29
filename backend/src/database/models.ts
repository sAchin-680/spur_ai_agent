import db from './connection';
import { v4 as uuidv4 } from 'uuid';

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
    return message;
  },

  findByConversationId(conversationId: string): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY timestamp ASC
    `);
    return stmt.all(conversationId) as Message[];
  },

  getRecentMessages(conversationId: string, limit: number = 10): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);
    const messages = stmt.all(conversationId, limit) as Message[];
    return messages.reverse(); // Return in chronological order
  }
};
