import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {env} from "./config/env";
import {MessageService} from "./services/messageService";
import {createRoutes} from "./routes";
import {notFoundMiddleware} from "./middleware/notFound";
import {errorMiddleware} from "./middleware/error";

export const createApp = (service: MessageService, broadcast: (message: unknown) => void = () => undefined) => {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({origin: env.CLIENT_ORIGINS.length ? env.CLIENT_ORIGINS : true, credentials: false}));
  app.use(express.json({limit: "16kb"}));
  app.use(rateLimit({windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false}));
  app.use("/api", createRoutes(service, broadcast));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
  return app;
};
