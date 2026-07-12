import "dotenv/config";
import {z} from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/realtime_chat"),
  CLIENT_ORIGINS: z.string().default("http://localhost:8081,http://localhost:19006"),
  MESSAGE_HISTORY_DEFAULT_LIMIT: z.coerce.number().int().min(1).max(100).default(50),
  MESSAGE_HISTORY_MAX_LIMIT: z.coerce.number().int().min(1).max(100).default(100)
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  CLIENT_ORIGINS: parsed.data.CLIENT_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
};
