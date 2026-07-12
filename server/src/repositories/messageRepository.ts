import {MessageModel, type MessageDocument} from "../models/message";

export interface HistoryCursor {
  createdAt: Date;
  id: string;
}

export class MessageRepository {
  async create(input: {username: string; text: string; clientMessageId?: string}): Promise<MessageDocument> {
    return MessageModel.create(input);
  }

  async findByClientMessageId(clientMessageId: string): Promise<MessageDocument | null> {
    return MessageModel.findOne({clientMessageId}).exec();
  }

  async list(limit: number, cursor?: HistoryCursor): Promise<{records: MessageDocument[]; hasMore: boolean}> {
    const filter = cursor
      ? {$or: [{createdAt: {$lt: cursor.createdAt}}, {createdAt: cursor.createdAt, _id: {$lt: cursor.id}}]}
      : {};
    const records = await MessageModel.find(filter).sort({createdAt: -1, _id: -1}).limit(limit + 1).exec();
    return {records: records.slice(0, limit), hasMore: records.length > limit};
  }
}
