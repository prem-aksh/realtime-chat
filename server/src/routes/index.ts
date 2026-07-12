import {Router} from "express";
import {createMessageController, healthController, historyController} from "../controllers/messageController";
import {MessageService} from "../services/messageService";

export const createRoutes = (service: MessageService, broadcast: (message: unknown) => void): Router => {
  const router = Router();
  router.get("/health", healthController);
  router.get("/messages", historyController(service));
  router.post("/messages", createMessageController(service, broadcast));
  return router;
};
