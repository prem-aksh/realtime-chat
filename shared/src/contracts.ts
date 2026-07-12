export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

export interface ChatMessage {
  id: string;
  clientMessageId?: string;
  username: string;
  text: string;
  createdAt: string;
  status?: MessageStatus;
}

export interface CreateMessageInput {
  username: string;
  text: string;
  clientMessageId?: string;
}

export interface MessageHistoryData {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type MessageAck =
  | {success: true; message: ChatMessage; created: boolean}
  | {success: false; error: {code: string; message: string}};

export interface PresencePayload {
  users: string[];
  count: number;
}

export interface TypingPayload {
  username: string;
}
