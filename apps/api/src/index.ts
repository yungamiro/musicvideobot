import cors from "cors";
import express from "express";
import { z } from "zod";
import { config } from "./config.js";
import { getPlayback, setPlayback } from "./store.js";

const app = express();
app.use(cors({ origin: config.activityOrigin }));
app.use(express.json({ limit: "64kb" }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "musicvideobot-api" }));
app.post("/api/token", async (req, res) => {
  const body = z.object({ code: z.string().min(1) }).safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid OAuth code" }); return; }
  const form = new URLSearchParams({ client_id: config.discordClientId, client_secret: config.discordClientSecret, grant_type: "authorization_code", code: body.data.code });
  try {
    const response = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: form });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) { console.error("Discord token exchange failed", payload); res.status(502).json({ error: "Discord OAuth exchange failed" }); return; }
    res.json(payload);
  } catch (error) { console.error(error); res.status(502).json({ error: "Discord OAuth is unreachable" }); }
});
app.get("/api/rooms/:roomId/playback", (req, res) => res.json(getPlayback(req.params.roomId)));
const playbackSchema = z.object({
  status: z.enum(["playing", "paused", "stopped"]),
  positionMs: z.number().finite().min(0),
  track: z.object({ id: z.string().min(1), title: z.string().min(1).max(200), audioUrl: z.string().url(), videoUrl: z.string().url().optional(), requestedBy: z.string().min(1).max(100) }).nullable()
});
app.put("/api/rooms/:roomId/playback", (req, res) => {
  if (req.header("authorization") !== `Bearer ${config.botApiKey}`) { res.status(401).json({ error: "Unauthorized" }); return; }
  const body = playbackSchema.safeParse(req.body);
  if (!body.success) { res.status(400).json({ error: "Invalid playback payload", details: z.treeifyError(body.error) }); return; }
  res.json(setPlayback(req.params.roomId, body.data));
});
app.listen(config.port, () => console.log(`MusicVideoBot API listening on http://localhost:${config.port}`));
