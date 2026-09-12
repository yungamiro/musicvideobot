import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface BotCommand {
  data: {
    readonly name: string;
    toJSON(): ReturnType<SlashCommandBuilder["toJSON"]>;
  };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
