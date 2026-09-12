# MusicVideoBot

A Discord music project split into three parts:

- **Bot** — slash commands and voice-channel coordination.
- **API** — Discord Activity OAuth plus shared playback state.
- **Activity** — synchronized audio/video player embedded inside Discord.

The project intentionally starts with direct media URLs. A provider layer for song-name search/catalog integrations can be added next without coupling it to the Discord code.

## Architecture

```text
Discord
├── Bot (apps/bot)
│   ├── /ping
│   ├── /join
│   ├── /leave
│   ├── /play
│   └── /stop
│
├── Activity (apps/activity)
│   └── synchronized audio/video player
│
└── API (apps/api)
    ├── OAuth token exchange
    └── room playback state
```

A room is currently identified as `<guildId>:<voiceChannelId>`. The bot writes playback state to the API and every Activity opened in that channel reads the same state. Playback uses a server timestamp so clients can correct drift.

## Requirements

- Node.js **22.12+**
- npm
- A Discord application with a bot
- Activities enabled for that Discord application

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Fill in the private `.env` file. Never commit your bot token or client secret.

```env
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=...
BOT_API_KEY=use-a-long-random-value-here
API_PORT=3001
API_BASE_URL=http://localhost:3001
ACTIVITY_ORIGIN=http://localhost:5173
VITE_DISCORD_CLIENT_ID=...
VITE_API_BASE_URL=http://localhost:3001
```

`DISCORD_CLIENT_ID` / `VITE_DISCORD_CLIENT_ID` are the Discord Application ID. `DISCORD_GUILD_ID` is your development server ID.

4. Register the development slash commands:

```bash
npm run deploy:commands
```

5. Start each service in its own terminal:

```bash
npm run dev:api
npm run dev:bot
npm run dev:activity
```

## Discord Activity setup

For local browser development, the Activity can run at `http://localhost:5173`. You can preview a real Discord room state with `http://localhost:5173/?room=<guildId>:<voiceChannelId>`.

For testing inside Discord, expose the Activity/API through HTTPS and configure the application's **Activities > URL Mappings** in the Discord Developer Portal. Discord's Activity proxy can map `/` to the Activity host and `/api` to the API host.

Any external media domains used by the player also need to be allowed through the Activity proxy/URL mappings.

The Activity authenticates through the Embedded App SDK and the API exchanges the temporary OAuth code using `DISCORD_CLIENT_SECRET`. The secret never belongs in frontend code.

## First playable flow

1. Join a voice channel.
2. Launch the Activity in that channel.
3. Run `/play` with an HTTPS audio URL and, optionally, an HTTPS video URL.
4. Every Activity in that voice channel receives the same playback state.
5. `/stop` clears the room.

This first version does **not** scrape or download music from third-party sites. Media provider integrations belong behind a dedicated resolver layer and should use sources you are permitted to stream.

## Repository layout

```text
apps/
  api/        Express API and room state
  bot/        discord.js bot and slash commands
  activity/   React + Vite Discord Activity
packages/
  shared/     shared TypeScript contracts
```

## Next milestones

- Replace direct URLs with a media resolver/provider layer.
- Add a queue, pause/resume, seek, skip, previous, shuffle and loop.
- Broadcast state through WebSockets for lower-latency updates.
- Add album artwork, metadata and synchronized lyrics.
- Add optional bot-side voice audio playback where appropriate.
- Add persistent room/queue storage.
- Add production deployment and CI.
