import { GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getMusic } from "../services/music.js";
import type { BotCommand } from "../types.js";

export const joinCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("join").setDescription("Join your current voice channel"),
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

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      await getMusic().voices.join(channel);
      await interaction.editReply(`Joined **${channel.name}**.`);
    } catch (error) {
      console.error(error);
      await interaction.editReply("I couldn't join that voice channel. Check my Connect/Speak permissions.");
    }
  }
};
