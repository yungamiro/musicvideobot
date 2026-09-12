import { Client, Events, GatewayIntentBits } from "discord.js";
import { commandMap } from "./commands/index.js";
import { config } from "./config.js";
import { clearRoom } from "./services/api.js";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command /${interaction.commandName} failed`, error);
    const message = { content: "Something went wrong while running that command.", ephemeral: true } as const;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(message).catch(() => undefined);
    } else {
      await interaction.reply(message).catch(() => undefined);
    }
  }
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (!client.user || oldState.id !== client.user.id) return;
  if (!oldState.channelId || oldState.channelId === newState.channelId) return;

  const roomId = `${oldState.guild.id}:${oldState.channelId}`;
  try {
    await clearRoom(roomId);
    console.log(`Cleared room state after voice disconnect: ${roomId}`);
  } catch (error) {
    console.error(`Failed to clear room state after voice disconnect: ${roomId}`, error);
  }
});

await client.login(config.token);
