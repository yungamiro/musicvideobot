import { resolve } from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(import.meta.dirname, "../../../.env") });

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_GUILD_ID: z.string().min(1).optional(),
  SPOTIFY_CLIENT_ID: z.string().min(1).optional(),
  SPOTIFY_CLIENT_SECRET: z.string().min(1).optional()
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid bot environment variables:", z.prettifyError(parsed.error));
  process.exit(1);
}

if ((parsed.data.SPOTIFY_CLIENT_ID && !parsed.data.SPOTIFY_CLIENT_SECRET) || (!parsed.data.SPOTIFY_CLIENT_ID && parsed.data.SPOTIFY_CLIENT_SECRET)) {
  console.error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must either both be set or both be omitted.");
  process.exit(1);
}

export const config = {
  token: parsed.data.DISCORD_TOKEN,
  clientId: parsed.data.DISCORD_CLIENT_ID,
  guildId: parsed.data.DISCORD_GUILD_ID,
  spotifyClientId: parsed.data.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: parsed.data.SPOTIFY_CLIENT_SECRET
};
