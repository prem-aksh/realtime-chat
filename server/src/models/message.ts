import {Schema, model, type HydratedDocument, type InferSchemaType} from "mongoose";

const messageSchema = new Schema(
  {
    username: {type: String, required: true, trim: true, maxlength: 32},
    text: {type: String, required: true, trim: true, maxlength: 2000},
    clientMessageId: {type: String, unique: true, sparse: true, index: true}
  },
  {timestamps: true, versionKey: false}
);

messageSchema.index({createdAt: -1, _id: -1});

export type MessageRecord = InferSchemaType<typeof messageSchema> & {createdAt: Date; updatedAt: Date};
export type MessageDocument = HydratedDocument<MessageRecord>;
export const MessageModel = model<MessageRecord>("Message", messageSchema);
