import { GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";
import { updatePlayback } from "../services/api.js";
import type { BotCommand } from "../types.js";

export const stopCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("stop").setDescription("Stop Activity playback in your voice channel"),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel) {
      await interaction.reply({ content: "Join a voice channel first.", flags: MessageFlags.Ephemeral });
      return;
    }
    try {
      await updatePlayback(`${interaction.guildId}:${channel.id}`, { status: "stopped", positionMs: 0, track: null });
      await interaction.reply(`⏹️ Playback stopped in **${channel.name}**.`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "The playback API is unreachable.", flags: MessageFlags.Ephemeral });
    }
  }
};
