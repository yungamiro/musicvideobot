import { GuildMember, SlashCommandBuilder } from "discord.js";
import { joinGuildVoice } from "../services/voice.js";
import type { BotCommand } from "../types.js";

export const joinCommand: BotCommand = {
  data: new SlashCommandBuilder().setName("join").setDescription("Join your current voice channel"),
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "This command only works inside a server.", ephemeral: true });
      return;
    }
    const member = interaction.member as GuildMember;
    const channel = member.voice.channel;
    if (!channel) {
      await interaction.reply({ content: "Join a voice channel first.", ephemeral: true });
      return;
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      await joinGuildVoice(interaction.guild, channel);
      await interaction.editReply(`Joined **${channel.name}**.`);
    } catch (error) {
      console.error(error);
      await interaction.editReply("I couldn't join that voice channel. Check my Connect/Speak permissions.");
    }
  }
};
