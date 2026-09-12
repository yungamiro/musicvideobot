import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";
import { activityEntryPoint } from "./entryPoint.js";

const rest = new REST({ version: "10" }).setToken(config.token);
const body = [...commands.map((command) => command.data.toJSON()), activityEntryPoint];

console.log(`Registering ${commands.length} global slash command(s) plus the Activity entry point...`);
await rest.put(Routes.applicationCommands(config.clientId), { body });
console.log("Global slash commands and Activity entry point registered for all servers that install the bot.");
