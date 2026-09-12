import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder
} from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const nowPlayingCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("nowplaying").setDescription("Show the current song"),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const queue = getMusic().queues.get(interaction.guildId);
    const song = queue?.songs[0];
    if (!queue || !song) {
      await interaction.reply({ content: "Nothing is playing right now.", flags: MessageFlags.Ephemeral });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(song.name ?? "Unknown track")
      .setDescription(`**Progress:** ${queue.formattedCurrentTime} / ${song.formattedDuration || "?"}`)
      .setFooter({ text: queue.paused ? "Paused" : "Now playing" });

    if (song.url) embed.setURL(song.url);
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const components = song.url
      ? [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setLabel("Watch clip").setStyle(ButtonStyle.Link).setURL(song.url)
          )
        ]
      : [];

    await interaction.reply({ embeds: [embed], components });
  }
};
