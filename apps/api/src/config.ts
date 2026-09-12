import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });
const schema = z.object({
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  BOT_API_KEY: z.string().min(16),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  ACTIVITY_ORIGIN: z.string().url().default("http://localhost:5173")
});
const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid API environment variables:", z.prettifyError(parsed.error));
  process.exit(1);
}
export const config = {
  discordClientId: parsed.data.DISCORD_CLIENT_ID,
  discordClientSecret: parsed.data.DISCORD_CLIENT_SECRET,
  botApiKey: parsed.data.BOT_API_KEY,
  port: parsed.data.API_PORT,
  activityOrigin: parsed.data.ACTIVITY_ORIGIN
};
