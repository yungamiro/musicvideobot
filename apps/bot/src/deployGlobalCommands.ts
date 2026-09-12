import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

const rest = new REST({ version: "10" }).setToken(config.token);
const body = commands.map((command) => command.data.toJSON());

console.log(`Registering ${body.length} global command(s)...`);
await rest.put(Routes.applicationCommands(config.clientId), { body });
console.log("Global slash commands registered for all servers that install the bot.");
