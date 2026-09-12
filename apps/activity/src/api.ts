import type { PlaybackState } from "@musicvideobot/shared";
const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const url = (path: string) => `${baseUrl}${path}`;
export async function exchangeDiscordCode(code: string): Promise<string> {
  const response = await fetch(url("/api/token"), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
  if (!response.ok) throw new Error("Discord OAuth exchange failed");
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Discord OAuth response had no access token");
  return data.access_token;
}
export async function getPlayback(roomId: string, signal?: AbortSignal): Promise<PlaybackState> {
  const response = await fetch(url(`/api/rooms/${encodeURIComponent(roomId)}/playback`), { signal, cache: "no-store" });
  if (!response.ok) throw new Error(`Playback API returned ${response.status}`);
  return (await response.json()) as PlaybackState;
}
