import { randomUUID } from "node:crypto";
import { GuildMember, SlashCommandBuilder } from "discord.js";
import { updatePlayback } from "../services/api.js";
import type { BotCommand } from "../types.js";

function parseMediaUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
}

export const playCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a direct media URL in the synchronized Activity")
    .addStringOption((option) => option.setName("audio").setDescription("Direct HTTPS audio URL").setRequired(true))
    .addStringOption((option) => option.setName("video").setDescription("Optional direct HTTPS video URL").setRequired(false))
    .addStringOption((option) => option.setName("title").setDescription("Track title").setRequired(false).setMaxLength(100)),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "This command only works inside a server.", ephemeral: true });
      return;
    }
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel) {
      await interaction.reply({ content: "Join a voice channel first.", ephemeral: true });
      return;
    }
    const audioInput = interaction.options.getString("audio", true);
    const videoInput = interaction.options.getString("video");
    const audioUrl = parseMediaUrl(audioInput);
    const videoUrl = videoInput ? parseMediaUrl(videoInput) : undefined;
    if (!audioUrl || (videoInput && !videoUrl)) {
      await interaction.reply({ content: "For now, media URLs must be direct HTTPS URLs.", ephemeral: true });
      return;
    }
    const roomId = `${interaction.guildId}:${channel.id}`;
    const title = interaction.options.getString("title") ?? "Untitled track";
    await interaction.deferReply();
    try {
      await updatePlayback(roomId, {
        status: "playing",
        positionMs: 0,
        track: { id: randomUUID(), title, audioUrl, ...(videoUrl ? { videoUrl } : {}), requestedBy: interaction.user.username }
      });
      await interaction.editReply(`▶️ **${title}** is now synced to the Activity in **${channel.name}**${videoUrl ? " with video." : "."}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply("The playback API is unreachable. Make sure `npm run dev:api` is running.");
    }
  }
};
