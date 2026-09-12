import { createRequire } from "node:module";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Client
} from "discord.js";
import { YtDlpPlugin } from "@distube/yt-dlp";
import { DisTube, Events } from "distube";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string;

let music: DisTube | null = null;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function toPlayableQuery(value: string): string {
  const query = value.trim();
  if (isHttpUrl(query) || /^ytsearch\d*:/i.test(query)) return query;
  return `ytsearch1:${query}`;
}

function isYouTubeUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const hostname = new URL(value).hostname.replace(/^www\./, "");
    return hostname === "youtube.com" || hostname === "music.youtube.com" || hostname === "youtu.be";
  } catch {
    return false;
  }
}

function watchButton(url: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setLabel("Watch clip").setStyle(ButtonStyle.Link).setURL(url)
  );
}

export function initializeMusic(client: Client): DisTube {
  if (music) return music;

  music = new DisTube(client, {
    emitNewSongOnly: true,
    savePreviousSongs: true,
    ffmpeg: { path: ffmpegPath },
    // yt-dlp is intentionally the only media extractor. It handles direct YouTube URLs
    // and ytsearch queries without relying on the archived @distube/ytdl-core stack.
    plugins: [new YtDlpPlugin({ update: true })]
  });

  music.on(Events.PLAY_SONG, async (queue, song) => {
    if (!queue.textChannel) return;

    const title = song.name ?? "Unknown track";
    const duration = song.formattedDuration || "Unknown duration";
    const requestedBy = song.user ? `<@${song.user.id}>` : "Unknown";
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`**Duration:** ${duration}\n**Requested by:** ${requestedBy}`)
      .setFooter({ text: "Now playing" })
      .setTimestamp();

    if (song.url) embed.setURL(song.url);
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);

    const payload: {
      content?: string;
      embeds: EmbedBuilder[];
      components?: ActionRowBuilder<ButtonBuilder>[];
    } = { embeds: [embed] };

    if (song.url) {
      payload.components = [watchButton(song.url)];
      if (isYouTubeUrl(song.url)) payload.content = `🎬 ${song.url}`;
    }

    await queue.textChannel.send(payload).catch((error: unknown) => {
      console.error("Failed to post now-playing embed", error);
    });
  });

  music.on(Events.ADD_SONG, async (queue, song) => {
    if (!queue.textChannel) return;
    const position = Math.max(1, queue.songs.indexOf(song));
    const embed = new EmbedBuilder()
      .setTitle("Added to queue")
      .setDescription(`**${song.name ?? "Unknown track"}**\nPosition: ${position}`);
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);
    await queue.textChannel.send({ embeds: [embed] }).catch(() => undefined);
  });

  music.on(Events.ADD_LIST, async (queue, playlist) => {
    if (!queue.textChannel) return;
    const count = playlist.songs.length;
    const embed = new EmbedBuilder()
      .setTitle("Playlist added")
      .setDescription(`**${playlist.name ?? "Playlist"}**\n${count} track${count === 1 ? "" : "s"} added.`);
    if (playlist.thumbnail) embed.setThumbnail(playlist.thumbnail);
    await queue.textChannel.send({ embeds: [embed] }).catch(() => undefined);
  });

  music.on(Events.FINISH, async (queue) => {
    await queue.textChannel?.send("✅ Queue finished.").catch(() => undefined);
  });

  music.on(Events.DISCONNECT, (queue) => {
    queue.remove();
  });

  music.on(Events.ERROR, (error, queue) => {
    console.error("Music playback error", error);
    void queue.textChannel?.send(`⚠️ Playback error: ${error.message}`).catch(() => undefined);
  });

  return music;
}

export function getMusic(): DisTube {
  if (!music) throw new Error("Music player has not been initialized yet.");
  return music;
}
