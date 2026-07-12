import http from "node:http";
import mongoose from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";
import {Server as SocketServer} from "socket.io";
import {io as connectClient, type Socket} from "socket.io-client";
import {createApp} from "../src/app";
import {MessageService} from "../src/services/messageService";
import {registerSocketHandlers} from "../src/socket/handlers";
import {MessageModel} from "../src/models/message";

describe("Socket.io messaging", () => {
  let mongo: MongoMemoryServer;
  let server: http.Server;
  let ioServer: SocketServer;
  let client: Socket;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri());
    const service = new MessageService(); const app = createApp(service); server = http.createServer(app); ioServer = new SocketServer(server, {cors: {origin: "*"}}); registerSocketHandlers(ioServer, service);
    await new Promise<void>((resolve) => server.listen(0, resolve));
  });
  afterEach(async () => { client?.disconnect(); await MessageModel.deleteMany({}); });
  afterAll(async () => { await new Promise<void>((resolve) => ioServer.close(() => resolve())); await mongoose.disconnect(); await mongo.stop(); });

  it("acknowledges and broadcasts a persisted message", async () => {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No server address");
    client = connectClient(`http://127.0.0.1:${address.port}`, {transports: ["websocket"]});
    await new Promise<void>((resolve) => client.on("connect", () => { client.emit("user:join", {username: "SocketUser"}); resolve(); }));
    const broadcast = new Promise<{text: string}>((resolve) => {
      client.once("message:new", resolve);
    });
    const message = await new Promise<{success: boolean; message?: {text: string}}>((resolve) => {
      client.emit("message:send", {text: "Realtime", clientMessageId: "socket-123456"}, resolve);
    });
    const received = await broadcast;
    expect(message.success).toBe(true);
    expect(message.message?.text).toBe("Realtime");
    expect(received.text).toBe("Realtime");
    expect(await MessageModel.countDocuments({clientMessageId: "socket-123456"})).toBe(1);
  });

  it("rejects malformed message payloads safely", async () => {
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("No server address");
    client = connectClient(`http://127.0.0.1:${address.port}`, {transports: ["websocket"]});
    await new Promise<void>((resolve) => client.on("connect", () => { client.emit("user:join", {username: "SocketUser"}); resolve(); }));
    const response = await new Promise<{success: boolean; error?: {code: string}}>((resolve) => client.emit("message:send", {text: ""}, resolve));
    expect(response.success).toBe(false);
    expect(response.error?.code).toBe("VALIDATION_ERROR");
  });
});
