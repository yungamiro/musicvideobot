import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const leaveCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("leave").setDescription("Stop music, clear the queue, and leave voice"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const music = getMusic();
    const queue = music.queues.get(interaction.guildId);
    const voice = music.voices.get(interaction.guildId);

    if (!queue && !voice) {
      await interaction.reply({ content: "I'm not connected to voice here.", flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      if (queue) await queue.stop();
      if (music.voices.get(interaction.guildId)) music.voices.leave(interaction.guildId);
      await interaction.reply({ content: "Disconnected and cleared the music queue.", flags: MessageFlags.Ephemeral });
    } catch (error) {
      console.error("Failed to leave voice cleanly", error);
      await interaction.reply({ content: "I couldn't leave voice cleanly.", flags: MessageFlags.Ephemeral });
    }
  }
};
