import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const pauseCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("pause").setDescription("Pause the current song"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const queue = getMusic().queues.get(interaction.guildId);
    if (!queue) {
      await interaction.reply({ content: "Nothing is playing right now.", flags: MessageFlags.Ephemeral });
      return;
    }
    if (queue.paused) {
      await interaction.reply({ content: "Playback is already paused.", flags: MessageFlags.Ephemeral });
      return;
    }

    await queue.pause();
    await interaction.reply("⏸️ Playback paused.");
  }
};
