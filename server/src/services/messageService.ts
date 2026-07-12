import {Types} from "mongoose";
import type {ChatMessage, CreateMessageInput, MessageHistoryData} from "@realtime-chat/shared";
import {z} from "zod";
import {env} from "../config/env";
import {MessageRepository, type HistoryCursor} from "../repositories/messageRepository";
import {AppError} from "../utils/errors";
import type {MessageDocument} from "../models/message";

export const createMessageSchema = z.object({
  username: z.string().trim().min(2).max(32),
  text: z.string().trim().min(1).max(2000),
  clientMessageId: z.string().trim().min(8).max(100).optional()
});

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(env.MESSAGE_HISTORY_MAX_LIMIT).default(env.MESSAGE_HISTORY_DEFAULT_LIMIT),
  cursor: z.string().min(1).optional()
});

const toApiMessage = (record: MessageDocument): ChatMessage => ({
  id: record._id.toString(),
  ...(record.clientMessageId ? {clientMessageId: record.clientMessageId} : {}),
  username: record.username,
  text: record.text,
  createdAt: record.createdAt.toISOString(),
  status: "sent"
});

const encodeCursor = (record: MessageDocument): string =>
  Buffer.from(JSON.stringify({createdAt: record.createdAt.toISOString(), id: record._id.toString()}), "utf8").toString("base64url");

const decodeCursor = (value: string): HistoryCursor => {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as {createdAt?: string; id?: string};
    if (!parsed.createdAt || !parsed.id || Number.isNaN(Date.parse(parsed.createdAt)) || !Types.ObjectId.isValid(parsed.id)) {
      throw new Error("invalid cursor");
    }
    return {createdAt: new Date(parsed.createdAt), id: parsed.id};
  } catch {
    throw new AppError(400, "INVALID_CURSOR", "The history cursor is invalid.");
  }
};

export class MessageService {
  constructor(private readonly repository = new MessageRepository()) {}

  async create(input: CreateMessageInput): Promise<{message: ChatMessage; created: boolean}> {
    const parsed = createMessageSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(400, "VALIDATION_ERROR", "Message input is invalid.", parsed.error.flatten());
    }
    const normalized = parsed.data;
    if (normalized.clientMessageId) {
      const existing = await this.repository.findByClientMessageId(normalized.clientMessageId);
      if (existing) return {message: toApiMessage(existing), created: false};
    }
    try {
      const record = await this.repository.create(normalized);
      return {message: toApiMessage(record), created: true};
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "code" in error && (error as {code?: number}).code === 11000 && normalized.clientMessageId) {
        const existing = await this.repository.findByClientMessageId(normalized.clientMessageId);
        if (existing) return {message: toApiMessage(existing), created: false};
      }
      throw error;
    }
  }

  async history(input: unknown): Promise<MessageHistoryData> {
    const parsed = historyQuerySchema.safeParse(input);
    if (!parsed.success) throw new AppError(400, "VALIDATION_ERROR", "History query is invalid.", parsed.error.flatten());
    const cursor = parsed.data.cursor ? decodeCursor(parsed.data.cursor) : undefined;
    const {records, hasMore} = await this.repository.list(parsed.data.limit, cursor);
    const chronological = records.reverse();
    return {
      messages: chronological.map(toApiMessage),
      nextCursor: hasMore && chronological[0] ? encodeCursor(chronological[0]) : null
    };
  }
}
