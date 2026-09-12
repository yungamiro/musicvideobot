import {
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  type GuildTextBasedChannel
} from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const playCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song name or YouTube URL")
        .setRequired(true)
        .setMaxLength(200)
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: "Join a voice channel first.", flags: MessageFlags.Ephemeral });
      return;
    }

    const query = interaction.options.getString("query", true).trim();
    const textChannel = interaction.channel?.isTextBased()
      ? (interaction.channel as GuildTextBasedChannel)
      : undefined;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      await getMusic().play(voiceChannel, query, {
        member,
        textChannel,
        metadata: {
          requestedById: interaction.user.id,
          requestedByName: interaction.user.username
        }
      });
      await interaction.editReply(`🎵 Added **${query}** to the music player.`);
    } catch (error) {
      console.error("/play failed", error);
      const message = error instanceof Error ? error.message : "Unknown playback error";
      await interaction.editReply(`I couldn't play that track: ${message}`);
    }
  }
};
