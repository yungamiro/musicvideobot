import { REST, Routes } from "discord.js";
import { commands } from "./commands/index.js";
import { config } from "./config.js";

const rest = new REST({ version: "10" }).setToken(config.token);
const body = commands.map((command) => command.data.toJSON());
console.log(`Registering ${body.length} guild command(s)...`);
await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body });
console.log("Slash commands registered.");
