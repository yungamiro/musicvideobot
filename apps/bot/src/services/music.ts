import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Client
} from "discord.js";
import { SpotifyPlugin } from "@distube/spotify";
import { YouTubePlugin } from "@distube/youtube";
import { DisTube } from "distube";
import ffmpegPath from "ffmpeg-static";
import { config } from "../config.js";

let music: DisTube | null = null;

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

function createSpotifyPlugin(): SpotifyPlugin {
  if (config.spotifyClientId && config.spotifyClientSecret) {
    return new SpotifyPlugin({
      api: {
        clientId: config.spotifyClientId,
        clientSecret: config.spotifyClientSecret
      }
    });
  }

  return new SpotifyPlugin();
}

export function initializeMusic(client: Client): DisTube {
  if (music) return music;

  music = new DisTube(client, {
    emitNewSongOnly: true,
    savePreviousSongs: true,
    ffmpeg: { path: ffmpegPath ?? "ffmpeg" },
    plugins: [createSpotifyPlugin(), new YouTubePlugin()]
  });

  music.on("playSong", async (queue, song) => {
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
      if (isYouTubeUrl(song.url)) {
        // Keeping the YouTube URL in message content allows Discord to render its native video preview.
        payload.content = `🎬 ${song.url}`;
      }
    }

    await queue.textChannel.send(payload).catch((error) => {
      console.error("Failed to post now-playing embed", error);
    });
  });

  music.on("addSong", async (queue, song) => {
    if (!queue.textChannel) return;
    const position = Math.max(1, queue.songs.indexOf(song));
    const embed = new EmbedBuilder()
      .setTitle("Added to queue")
      .setDescription(`**${song.name ?? "Unknown track"}**\nPosition: ${position}`);
    if (song.thumbnail) embed.setThumbnail(song.thumbnail);
    await queue.textChannel.send({ embeds: [embed] }).catch(() => undefined);
  });

  music.on("addList", async (queue, playlist) => {
    if (!queue.textChannel) return;
    const count = playlist.songs.length;
    const embed = new EmbedBuilder()
      .setTitle("Playlist added")
      .setDescription(`**${playlist.name ?? "Spotify playlist"}**\n${count} track${count === 1 ? "" : "s"} added.`);
    if (playlist.thumbnail) embed.setThumbnail(playlist.thumbnail);
    await queue.textChannel.send({ embeds: [embed] }).catch(() => undefined);
  });

  music.on("finish", async (queue) => {
    await queue.textChannel?.send("✅ Queue finished.").catch(() => undefined);
  });

  music.on("disconnect", (queue) => {
    // Queue.stop() removes the queue, preserving our rule that disconnecting clears it.
    void queue.stop().catch(() => queue.remove());
  });

  music.on("error", (error, queue) => {
    console.error("Music playback error", error);
    void queue.textChannel?.send(`⚠️ Playback error: ${error.message}`).catch(() => undefined);
  });

  return music;
}

export function getMusic(): DisTube {
  if (!music) throw new Error("Music player has not been initialized yet.");
  return music;
}
