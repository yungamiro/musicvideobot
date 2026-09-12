import type { BotCommand } from "../types.js";
import { joinCommand } from "./join.js";
import { leaveCommand } from "./leave.js";
import { pingCommand } from "./ping.js";
import { playCommand } from "./play.js";
import { stopCommand } from "./stop.js";

export const commands: BotCommand[] = [pingCommand, joinCommand, leaveCommand, playCommand, stopCommand];
export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
