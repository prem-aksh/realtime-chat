import request from "supertest";
import mongoose from "mongoose";
import {MongoMemoryServer} from "mongodb-memory-server";
import {createApp} from "../src/app";
import {MessageService} from "../src/services/messageService";
import {MessageModel} from "../src/models/message";

describe("REST API", () => {
  let mongo: MongoMemoryServer;
  const broadcast = jest.fn();
  const service = new MessageService();
  const app = createApp(service, broadcast);

  beforeAll(async () => { mongo = await MongoMemoryServer.create(); await mongoose.connect(mongo.getUri()); });
  afterEach(async () => { broadcast.mockClear(); await MessageModel.deleteMany({}); });
  afterAll(async () => { await mongoose.disconnect(); await mongo.stop(); });

  it("returns health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it("validates message input", async () => {
    const response = await request(app).post("/api/messages").send({username: "A", text: ""});
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates and broadcasts a message", async () => {
    const response = await request(app).post("/api/messages").send({username: "Prem", text: "Hello", clientMessageId: "client-123456"});
    expect(response.status).toBe(201);
    expect(response.body.data.text).toBe("Hello");
    expect(broadcast).toHaveBeenCalledTimes(1);
  });

  it("is idempotent for duplicate client IDs", async () => {
    const payload = {username: "Prem", text: "Retry me", clientMessageId: "client-duplicate"};
    const first = await request(app).post("/api/messages").send(payload);
    const second = await request(app).post("/api/messages").send(payload);
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data.id).toBe(first.body.data.id);
    expect(broadcast).toHaveBeenCalledTimes(1);
  });

  it("returns chronological history and honors limit", async () => {
    await request(app).post("/api/messages").send({username: "A1", text: "First", clientMessageId: "history-0001"});
    await request(app).post("/api/messages").send({username: "A2", text: "Second", clientMessageId: "history-0002"});
    const response = await request(app).get("/api/messages?limit=1");
    expect(response.status).toBe(200);
    expect(response.body.data.messages).toHaveLength(1);
    expect(response.body.data.nextCursor).toEqual(expect.any(String));
  });
});
