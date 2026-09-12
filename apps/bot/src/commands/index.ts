import type { BotCommand } from "../types.js";
import { joinCommand } from "./join.js";
import { leaveCommand } from "./leave.js";
import { nowPlayingCommand } from "./nowplaying.js";
import { pauseCommand } from "./pause.js";
import { pingCommand } from "./ping.js";
import { playCommand } from "./play.js";
import { queueCommand } from "./queue.js";
import { resumeCommand } from "./resume.js";
import { skipCommand } from "./skip.js";
import { stopCommand } from "./stop.js";

export const commands: BotCommand[] = [
  pingCommand,
  joinCommand,
  leaveCommand,
  playCommand,
  pauseCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
  queueCommand,
  nowPlayingCommand
];

export const commandMap = new Map(commands.map((command) => [command.data.name, command]));
