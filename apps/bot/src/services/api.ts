import type { PlaybackState, PlaybackUpdateRequest } from "@musicvideobot/shared";
import { config } from "../config.js";

export async function updatePlayback(roomId: string, update: PlaybackUpdateRequest): Promise<PlaybackState> {
  const response = await fetch(`${config.apiBaseUrl}/api/rooms/${encodeURIComponent(roomId)}/playback`, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify(update)
  });
  if (!response.ok) throw new Error(`Playback API returned ${response.status}: ${await response.text()}`);
  return (await response.json()) as PlaybackState;
}
