import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const queueCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("queue").setDescription("Show the current music queue"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const queue = getMusic().queues.get(interaction.guildId);
    if (!queue || queue.songs.length === 0) {
      await interaction.reply({ content: "The queue is empty.", flags: MessageFlags.Ephemeral });
      return;
    }

    const shown = queue.songs.slice(0, 10);
    const lines = shown.map((song, index) => {
      const marker = index === 0 ? "▶️" : `${index}.`;
      return `${marker} **${song.name ?? "Unknown track"}** — ${song.formattedDuration || "?"}`;
    });
    if (queue.songs.length > shown.length) lines.push(`…and ${queue.songs.length - shown.length} more.`);

    const embed = new EmbedBuilder()
      .setTitle("Music queue")
      .setDescription(lines.join("\n"))
      .setFooter({ text: `${queue.songs.length} track${queue.songs.length === 1 ? "" : "s"} queued` });

    await interaction.reply({ embeds: [embed] });
  }
};
