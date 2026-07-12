import type {RequestHandler} from "express";
import {MessageService} from "../services/messageService";

export const healthController: RequestHandler = (_request, response) => {
  response.json({success: true, message: "Server is healthy", timestamp: new Date().toISOString()});
};

export const historyController = (service: MessageService): RequestHandler => async (request, response, next) => {
  try {
    response.json({success: true, data: await service.history(request.query)});
  } catch (error) {
    next(error);
  }
};

export const createMessageController = (service: MessageService, broadcast: (message: unknown) => void): RequestHandler => async (request, response, next) => {
  try {
    const result = await service.create(request.body);
    if (result.created) broadcast(result.message);
    response.status(result.created ? 201 : 200).json({success: true, data: result.message});
  } catch (error) {
    next(error);
  }
};
