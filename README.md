# MusicVideoBot

A standard Discord music bot that joins voice channels, searches for music, manages a per-server queue, and posts the resolved music-video link/preview in text when available.

Current Discord Application / Client ID: `1548297625671962629`.

## Current behavior

```text
/play query:<song name or YouTube URL>
        ↓
Bot joins the requester's voice channel
        ↓
Searches/resolves the track
        ↓
Plays audio in Discord voice
        ↓
Posts a Now Playing embed + Watch clip link in text
```

When the resolved source is YouTube, the bot also keeps the YouTube URL in the Now Playing message so Discord can render its native video preview when embeds are allowed in that channel.

## Commands

- `/play query:<song or URL>` — search and play, or add to the queue
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

The playback stack uses `discord.js`, `@discordjs/voice`, DisTube, the DisTube YouTube extractor, Opus, and a bundled FFmpeg binary.

## Setup

Clone the repository and install dependencies:

```bash
npm install
```

Copy the environment template if you do not already have a local `.env`:

```powershell
Copy-Item .env.example .env
```

Only these values are required by the bot:

```env
DISCORD_TOKEN=YOUR_BOT_TOKEN
DISCORD_CLIENT_ID=1548297625671962629
DISCORD_GUILD_ID=911958598995808326
```

`DISCORD_GUILD_ID` is only used for fast development command registration. It does not restrict the running bot to that server.

Never commit `.env` or paste the bot token into chat/issues.

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

Then join a voice channel and try:

```text
/play query: The Weeknd Blinding Lights
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
- Add Spotify/Apple Music metadata resolution with audio-source fallback.
- Improve official music-video matching instead of always using the resolved playback video.
- Add persistent settings while keeping queues ephemeral by default.
