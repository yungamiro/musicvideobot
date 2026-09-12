import type { PlaybackState, PlaybackUpdateRequest } from "@musicvideobot/shared";
import { config } from "../config.js";

function botHeaders(): HeadersInit {
  return { authorization: `Bearer ${config.apiKey}` };
}

export async function updatePlayback(roomId: string, update: PlaybackUpdateRequest): Promise<PlaybackState> {
  const response = await fetch(`${config.apiBaseUrl}/api/rooms/${encodeURIComponent(roomId)}/playback`, {
    method: "PUT",
    headers: { ...botHeaders(), "content-type": "application/json" },
    body: JSON.stringify(update)
  });

  if (!response.ok) {
    throw new Error(`Playback API returned ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as PlaybackState;
}

export async function clearRoom(roomId: string): Promise<void> {
  const response = await fetch(`${config.apiBaseUrl}/api/rooms/${encodeURIComponent(roomId)}`, {
    method: "DELETE",
    headers: botHeaders()
  });

  if (!response.ok) {
    throw new Error(`Room cleanup API returned ${response.status}: ${await response.text()}`);
  }
}
