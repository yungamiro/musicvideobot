import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const skipCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip the current song"),
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

    try {
      const next = await queue.skip();
      await interaction.reply(`⏭️ Skipped. Next: **${next.name ?? "Unknown track"}**.`);
    } catch {
      await queue.stop();
      await interaction.reply("⏭️ Skipped the last song. Queue cleared.");
    }
  }
};
