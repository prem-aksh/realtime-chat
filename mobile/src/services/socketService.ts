import {io, type Socket} from "socket.io-client";
import {CLIENT_EVENTS, SERVER_EVENTS, type ChatMessage, type MessageAck, type PresencePayload, type TypingPayload} from "@realtime-chat/shared";
import {mobileConfig} from "../config/env";

export type SocketHandlers = {
  onConnection: (state: "connected" | "disconnected" | "error") => void;
  onMessage: (message: ChatMessage) => void;
  onPresence: (presence: PresencePayload) => void;
  onTyping: (payload: TypingPayload) => void;
  onStopTyping: (payload: TypingPayload) => void;
  onReceipt: (payload: {messageId: string; status: "delivered" | "read"}) => void;
  onError: (message: string) => void;
};

export class ChatSocketService {
  private socket: Socket | null = null;

  connect(username: string, handlers: SocketHandlers): void {
    this.disconnect();
    const socket = io(mobileConfig.socketUrl, {transports: ["websocket"], autoConnect: true, reconnection: true});
    this.socket = socket;
    socket.on("connect", () => {
      handlers.onConnection("connected");
      socket.emit(CLIENT_EVENTS.join, {username});
    });
    socket.on("disconnect", () => handlers.onConnection("disconnected"));
    socket.on("connect_error", () => handlers.onConnection("error"));
    socket.on(SERVER_EVENTS.newMessage, handlers.onMessage);
    socket.on(SERVER_EVENTS.presence, handlers.onPresence);
    socket.on(SERVER_EVENTS.typing, handlers.onTyping);
    socket.on(SERVER_EVENTS.stopTyping, handlers.onStopTyping);
    socket.on(SERVER_EVENTS.messageAck, (payload: {messageId?: string; status?: "delivered" | "read"}) => {
      if (payload.messageId && payload.status) handlers.onReceipt({messageId: payload.messageId, status: payload.status});
    });
    socket.on(SERVER_EVENTS.error, (payload: {message?: string}) => handlers.onError(payload.message ?? "Socket error."));
  }

  sendTyping(): void { this.socket?.emit(CLIENT_EVENTS.typing); }
  stopTyping(): void { this.socket?.emit(CLIENT_EVENTS.stopTyping); }
  sendDelivered(messageId: string): void { this.socket?.emit(CLIENT_EVENTS.delivered, {messageId}); }
  sendRead(messageId: string): void { this.socket?.emit(CLIENT_EVENTS.read, {messageId}); }
  isConnected(): boolean { return Boolean(this.socket?.connected); }

  sendMessage(input: {text: string; clientMessageId: string}): Promise<MessageAck> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) { reject(new Error("Socket is not connected.")); return; }
      this.socket.timeout(10_000).emit(CLIENT_EVENTS.sendMessage, input, (error: Error | null, response: MessageAck) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }
}
