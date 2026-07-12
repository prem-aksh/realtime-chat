import type {ChatMessage} from "@realtime-chat/shared";

export type {ChatMessage};
export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";
export type ChatState = {
  messages: ChatMessage[];
  onlineUsers: string[];
  typingUsers: string[];
  connection: ConnectionState;
  historyLoading: boolean;
  historyError: string | null;
  draft: string;
  sendError: string | null;
  sending: boolean;
};
