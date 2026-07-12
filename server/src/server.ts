import http from "node:http";
import mongoose from "mongoose";
import {Server as SocketServer} from "socket.io";
import {env} from "./config/env";
import {createApp} from "./app";
import {MessageService} from "./services/messageService";
import {registerSocketHandlers} from "./socket/handlers";
import {logger} from "./utils/logger";

export const startServer = async (): Promise<http.Server> => {
  await mongoose.connect(env.MONGODB_URI);
  const service = new MessageService();
  let broadcastMessage: (message: unknown) => void = () => undefined;
  const app = createApp(service, (message) => broadcastMessage(message));
  const server = http.createServer(app);
  const io = new SocketServer(server, {cors: {origin: env.CLIENT_ORIGINS}});
  broadcastMessage = (message) => io.emit("message:new", message);
  registerSocketHandlers(io, service);
  server.listen(env.PORT, "0.0.0.0", () => logger.info({port: env.PORT}, "Server listening"));

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({signal}, "Shutting down");
    await new Promise<void>((resolve) => io.close(() => resolve()));
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    await mongoose.disconnect();
  };
  process.once("SIGINT", () => void shutdown("SIGINT").then(() => process.exit(0)).catch(() => process.exit(1)));
  process.once("SIGTERM", () => void shutdown("SIGTERM").then(() => process.exit(0)).catch(() => process.exit(1)));
  process.on("unhandledRejection", (reason) => logger.error({reason}, "Unhandled rejection"));
  process.on("uncaughtException", (error) => logger.fatal({err: error}, "Uncaught exception"));
  return server;
};

if (require.main === module) void startServer().catch((error) => {
  logger.fatal({err: error}, "Server failed to start");
  process.exit(1);
});
