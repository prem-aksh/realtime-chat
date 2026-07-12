import type {ErrorRequestHandler} from "express";
import {ZodError} from "zod";
import {isAppError} from "../utils/errors";
import {logger} from "../utils/logger";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  if (isAppError(error)) {
    response.status(error.statusCode).json({success: false, error: {code: error.code, message: error.message, details: error.details}});
    return;
  }
  if (error instanceof ZodError) {
    response.status(400).json({success: false, error: {code: "VALIDATION_ERROR", message: "Request input is invalid.", details: error.flatten()}});
    return;
  }
  logger.error({err: error}, "Unhandled request error");
  response.status(500).json({success: false, error: {code: "INTERNAL_ERROR", message: "An unexpected error occurred."}});
};
