import { REST, Routes } from "discord.js";
import { config } from "./config.js";
import { activityEntryPoint } from "./entryPoint.js";

const rest = new REST({ version: "10" }).setToken(config.token);

console.log("Registering Activity entry point command...");
await rest.post(Routes.applicationCommands(config.clientId), { body: activityEntryPoint });
console.log("Activity entry point command registered globally.");
