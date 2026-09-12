# MusicVideoBot

A standard Discord music bot that joins voice channels, searches for music, manages a per-server queue, and posts the resolved music-video link/preview in text when available.

Current Discord Application / Client ID: `1548297625671962629`.

## Current behavior

```text
/play query:<song name, YouTube URL, or Spotify URL>
        ↓
Bot joins the requester's voice channel
        ↓
Searches/resolves the track or Spotify metadata
        ↓
Plays the matched audio source in Discord voice
        ↓
Posts a Now Playing embed + Watch clip link in text
```

Spotify track, album, playlist, and artist URLs are resolved through Spotify's Web API. Spotify supplies metadata only; the bot does not stream Spotify's protected audio directly. The resolved artist/title is matched to a playable source such as YouTube for Discord voice playback.

When the resolved source is YouTube, the bot also keeps the YouTube URL in the Now Playing message so Discord can render its native video preview when embeds are allowed in that channel.

## Commands

- `/play query:<song or URL>` — search and play, or add to the queue; accepts song names, YouTube URLs, and Spotify URLs
- `/pause` — pause playback
- `/resume` — resume playback
- `/skip` — skip the current song
- `/stop` — stop playback and erase the queue
- `/queue` — show the current queue
- `/nowplaying` — show the current song and Watch clip button
- `/join` — manually join your voice channel
- `/leave` — stop, erase the queue, and leave voice
- `/ping` — bot latency check

Queues are isolated per Discord server. Leaving/disconnecting is a queue-cleanup boundary: the bot removes the queue instead of keeping stale music state.

## Requirements

- Node.js **22.12+**
- npm
- A Discord application with a bot token
- Discord permissions to View Channels, Send Messages, Embed Links, Connect, and Speak

The playback stack uses `discord.js`, `@discordjs/voice`, DisTube, the DisTube YouTube extractor, Opus, and a bundled FFmpeg binary. Spotify support is implemented directly against Spotify's Web API rather than through the older DisTube Spotify package.

## Setup

Clone the repository and install dependencies:

```bash
npm install
```

Copy the environment template if you do not already have a local `.env`:

```powershell
Copy-Item .env.example .env
```

Required Discord values:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
DISCORD_CLIENT_ID=1548297625671962629
DISCORD_GUILD_ID=911958598995808326
```

To accept Spotify links, also add credentials from a Spotify Developer application:

```env
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET
```

Both Spotify values must be set together. Keep the client secret private.

`DISCORD_GUILD_ID` is only used for fast development command registration. It does not restrict the running bot to that server.

Never commit `.env` or paste bot/API secrets into chat or issues.

## Register commands

For the development/test server:

```bash
npm run deploy:commands
```

For production/multi-server registration:

```bash
npm run deploy:commands:global
```

## Run

Only the bot process is required:

```bash
npm run dev:bot
```

Then join a voice channel and try either:

```text
/play query: The Weeknd Blinding Lights
/play query: https://open.spotify.com/track/...
/play query: https://open.spotify.com/playlist/...
```

The bot should join automatically, play the resolved track in voice, and post the Now Playing/clip message in the text channel where `/play` was used.

## Activity/API prototype

The repository still contains the earlier `apps/activity`, `apps/api`, and shared prototype code for reference, but they are no longer part of the active music-bot runtime. You do not need Cloudflare Tunnel, Discord Activities, URL Mappings, the Activity OAuth client secret, `BOT_API_KEY`, or either local service for normal bot operation.

## Policies

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Service](TERMS_OF_SERVICE.md)
- Contact: `nobumeqt@outlook.com`

## Next milestones

- Improve source/provider fallbacks when YouTube blocks or rate-limits a resolver.
- Add loop, shuffle, previous, seek, and volume commands.
- Improve official music-video matching, especially when a Spotify request resolves to a non-official upload.
- Add persistent settings while keeping queues ephemeral by default.
