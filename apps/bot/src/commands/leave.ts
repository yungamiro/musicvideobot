import { SlashCommandBuilder } from "discord.js";
import { clearRoom } from "../services/api.js";
import { leaveGuildVoice } from "../services/voice.js";
import type { BotCommand } from "../types.js";

export const leaveCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("leave").setDescription("Leave the current voice channel"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", ephemeral: true });
      return;
    }

    const channelId = leaveGuildVoice(interaction.guildId);
    if (!channelId) {
      await interaction.reply({ content: "I'm not connected to voice here.", ephemeral: true });
      return;
    }

    try {
      await clearRoom(`${interaction.guildId}:${channelId}`);
      await interaction.reply({ content: "Disconnected from voice and cleared the room queue/playback state.", ephemeral: true });
    } catch (error) {
      console.error("Failed to clear room after /leave", error);
      await interaction.reply({
        content: "Disconnected from voice, but the playback API could not confirm room cleanup.",
        ephemeral: true
      });
    }
  }
};
