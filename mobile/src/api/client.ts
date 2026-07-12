import axios from "axios";
import type {ApiSuccess, ChatMessage, CreateMessageInput, MessageHistoryData} from "@realtime-chat/shared";
import {mobileConfig} from "../config/env";

const client = axios.create({baseURL: `${mobileConfig.apiUrl}/api`, timeout: 10_000, headers: {"Content-Type": "application/json"}});

export const fetchHistory = async (cursor?: string): Promise<MessageHistoryData> => {
  const response = await client.get<ApiSuccess<MessageHistoryData>>("/messages", {params: cursor ? {cursor} : undefined});
  return response.data.data;
};

export const createMessage = async (input: CreateMessageInput): Promise<ChatMessage> => {
  const response = await client.post<ApiSuccess<ChatMessage>>("/messages", input);
  return response.data.data;
};
