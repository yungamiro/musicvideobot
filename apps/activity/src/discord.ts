import { DiscordSDK } from "@discord/embedded-app-sdk";
import { exchangeDiscordCode } from "./api";
export interface DiscordContext { roomId: string; displayName: string; embedded: boolean; }
function isDiscordEmbedded(): boolean {
  const params = new URLSearchParams(window.location.search);
  return window.location.hostname.endsWith("discordsays.com") || params.has("frame_id");
}
export async function initializeDiscord(): Promise<DiscordContext> {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
  const embedded = isDiscordEmbedded();
  if (!embedded) {
    const roomId = new URLSearchParams(window.location.search).get("room") ?? "local:preview";
    return { roomId, displayName: "Local preview", embedded: false };
  }
  if (!clientId) throw new Error("VITE_DISCORD_CLIENT_ID is missing");
  const sdk = new DiscordSDK(clientId);
  await sdk.ready();
  const { code } = await sdk.commands.authorize({ client_id: clientId, response_type: "code", state: "", prompt: "none", scope: ["identify"] });
  const accessToken = await exchangeDiscordCode(code);
  const auth = await sdk.commands.authenticate({ access_token: accessToken });
  if (!auth) throw new Error("Discord authentication failed");
  if (!sdk.guildId || !sdk.channelId) throw new Error("Launch this Activity from a server voice channel");
  return { roomId: `${sdk.guildId}:${sdk.channelId}`, displayName: auth.user.global_name ?? auth.user.username, embedded: true };
}
