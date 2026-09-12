import {
  GuildMember,
  MessageFlags,
  SlashCommandBuilder,
  type GuildTextBasedChannel
} from "discord.js";
import {
  getMusic,
  resolvePlayableInput,
  resolveSearchSong,
  resolveSearchSongs
} from "../services/music.js";
import { isSpotifyUrl, resolveSpotifyUrl } from "../services/spotify.js";
import type { BotCommand } from "../types.js";

export const playCommand: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song in your voice channel")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Song name, YouTube URL, or Spotify URL")
        .setRequired(true)
        .setMaxLength(300)
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "This command only works inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: "Join a voice channel first.", flags: MessageFlags.Ephemeral });
      return;
    }

    const query = interaction.options.getString("query", true).trim();
    const textChannel = interaction.channel?.isTextBased()
      ? (interaction.channel as GuildTextBasedChannel)
      : undefined;
    const metadata = {
      requestedById: interaction.user.id,
      requestedByName: interaction.user.username
    };

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const music = getMusic();

      if (isSpotifyUrl(query)) {
        const spotify = await resolveSpotifyUrl(query);
        if (spotify.tracks.length === 0) throw new Error("Spotify returned no playable tracks.");

        if (spotify.tracks.length === 1) {
          const track = spotify.tracks[0];
          if (!track) throw new Error("Spotify returned no playable track.");
          const song = await resolveSearchSong(track.searchQuery);
          await music.play(voiceChannel, song, {
            member,
            textChannel,
            metadata: { ...metadata, source: "spotify", sourceUrl: track.spotifyUrl }
          });
          await interaction.editReply(`🎵 Added Spotify track **${track.artists.join(", ")} - ${track.title}**.`);
          return;
        }

        const songs = await resolveSearchSongs(spotify.tracks.map((track) => track.searchQuery));
        const playlist = await music.createCustomPlaylist(songs, {
          member,
          metadata: { ...metadata, source: "spotify", sourceUrl: spotify.sourceUrl },
          name: spotify.name,
          parallel: true,
          source: "spotify",
          url: spotify.sourceUrl,
          ...(spotify.thumbnail ? { thumbnail: spotify.thumbnail } : {})
        });

        await music.play(voiceChannel, playlist, {
          member,
          textChannel,
          metadata: { ...metadata, source: "spotify", sourceUrl: spotify.sourceUrl }
        });
        await interaction.editReply(`🎵 Added Spotify ${spotify.kind} **${spotify.name}** (${spotify.tracks.length} tracks).`);
        return;
      }

      const playable = await resolvePlayableInput(query);
      await music.play(voiceChannel, playable, { member, textChannel, metadata });
      await interaction.editReply(`🎵 Added **${query}** to the music player.`);
    } catch (error) {
      console.error("/play failed", error);
      const message = error instanceof Error ? error.message : "Unknown playback error";
      await interaction.editReply(`I couldn't play that track: ${message}`);
    }
  }
};
