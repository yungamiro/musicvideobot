import { SlashCommandBuilder } from "discord.js";
import { leaveGuildVoice } from "../services/voice.js";
import type { BotCommand } from "../types.js";

export const leaveCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("leave").setDescription("Leave the current voice channel"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", ephemeral: true });
      return;
    }
    const left = leaveGuildVoice(interaction.guildId);
    await interaction.reply({ content: left ? "Disconnected from voice." : "I'm not connected to voice here.", ephemeral: true });
  }
};
