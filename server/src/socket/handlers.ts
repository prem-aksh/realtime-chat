import type {Server, Socket} from "socket.io";
import {CLIENT_EVENTS, SERVER_EVENTS, type MessageAck} from "@realtime-chat/shared";
import {z} from "zod";
import {MessageService} from "../services/messageService";
import {PresenceRegistry} from "./presence";
import {logger} from "../utils/logger";
import {isAppError} from "../utils/errors";

const joinSchema = z.object({username: z.string().trim().min(2).max(32)});
const receiptSchema = z.object({messageId: z.string().min(1)});
type Ack = (result: MessageAck) => void;

export const registerSocketHandlers = (io: Server, service: MessageService): void => {
  const presence = new PresenceRegistry();
  const messageOwners = new Map<string, string>();

  io.on("connection", (socket: Socket) => {
    logger.info({socketId: socket.id}, "Socket connected");

    socket.on(CLIENT_EVENTS.join, (payload: unknown, callback?: Ack) => {
      const parsed = joinSchema.safeParse(payload);
      if (!parsed.success) {
        const error: MessageAck = {success: false, error: {code: "VALIDATION_ERROR", message: "Username is invalid."}};
        callback?.(error);
        socket.emit(SERVER_EVENTS.error, error.error);
        return;
      }
      const oldUsername = socket.data.username as string | undefined;
      if (oldUsername && oldUsername !== parsed.data.username) presence.leave(oldUsername, socket.id);
      socket.data.username = parsed.data.username;
      presence.join(parsed.data.username, socket.id);
      presence.emit(io);
      callback?.({success: true, message: {id: "presence", username: parsed.data.username, text: "", createdAt: new Date().toISOString()}, created: false});
    });

    socket.on(CLIENT_EVENTS.sendMessage, async (payload: unknown, callback?: Ack) => {
      const username = socket.data.username as string | undefined;
      if (!username) {
        const error: MessageAck = {success: false, error: {code: "NOT_JOINED", message: "Join with a username before sending messages."}};
        callback?.(error);
        socket.emit(SERVER_EVENTS.error, error.error);
        return;
      }
      const parsed = z.object({text: z.string(), clientMessageId: z.string().optional()}).safeParse(payload);
      const input = parsed.success ? {username, text: parsed.data.text, clientMessageId: parsed.data.clientMessageId} : null;
      if (!input) {
        const error: MessageAck = {success: false, error: {code: "VALIDATION_ERROR", message: "Message payload is invalid."}};
        callback?.(error);
        socket.emit(SERVER_EVENTS.error, error.error);
        return;
      }
      try {
        const result = await service.create(input);
        messageOwners.set(result.message.id, result.message.username);
        const ack: MessageAck = {success: true, message: result.message, created: result.created};
        callback?.(ack);
        socket.emit(SERVER_EVENTS.messageAck, ack);
        if (result.created) io.emit(SERVER_EVENTS.newMessage, result.message);
      } catch (error) {
        logger.warn({err: error, socketId: socket.id}, "Socket message failed");
        const ack: MessageAck = {success: false, error: {code: isAppError(error) ? error.code : "MESSAGE_FAILED", message: isAppError(error) ? error.message : "Message could not be saved."}};
        callback?.(ack);
        socket.emit(SERVER_EVENTS.error, ack.error);
      }
    });

    socket.on(CLIENT_EVENTS.typing, () => {
      const username = socket.data.username as string | undefined;
      if (username) socket.broadcast.emit(SERVER_EVENTS.typing, {username});
    });

    socket.on(CLIENT_EVENTS.stopTyping, () => {
      const username = socket.data.username as string | undefined;
      if (username) socket.broadcast.emit(SERVER_EVENTS.stopTyping, {username});
    });

    const receipt = (status: "delivered" | "read", payload: unknown): void => {
      const parsed = receiptSchema.safeParse(payload);
      if (!parsed.success) return;
      const owner = messageOwners.get(parsed.data.messageId);
      if (owner) presence.emitToUser(io, owner, SERVER_EVENTS.messageAck, {success: true, messageId: parsed.data.messageId, status});
    };
    socket.on(CLIENT_EVENTS.delivered, (payload: unknown) => receipt("delivered", payload));
    socket.on(CLIENT_EVENTS.read, (payload: unknown) => receipt("read", payload));

    socket.on("disconnect", (reason) => {
      const username = presence.leaveSocket(socket);
      if (username) presence.emit(io);
      logger.info({socketId: socket.id, reason}, "Socket disconnected");
    });
  });
};
