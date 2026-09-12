import { entersState, getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import type { Guild, VoiceBasedChannel } from "discord.js";

export async function joinGuildVoice(guild: Guild, channel: VoiceBasedChannel): Promise<void> {
  getVoiceConnection(guild.id)?.destroy();
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: false
  });
  await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
}

export function leaveGuildVoice(guildId: string): boolean {
  const connection = getVoiceConnection(guildId);
  if (!connection) return false;
  connection.destroy();
  return true;
}
