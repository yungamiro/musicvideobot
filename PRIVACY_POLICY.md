# MusicVideoBot Privacy Policy

Last updated: 12 September 2026

**Application ID:** 1548297625671962629  
**Operator:** MusicVideoBot developer, GitHub account [yungamiro](https://github.com/yungamiro)  
**Privacy contact:** [nobumeqt@outlook.com](mailto:nobumeqt@outlook.com)

## Scope

This policy covers the MusicVideoBot Discord bot as currently implemented in this repository.

## Information processed and why

- **Discord interaction information:** user identifiers and usernames, server and channel identifiers, voice-channel context, and slash-command inputs are processed so the bot can respond to commands, join the correct voice channel, and manage the correct server queue.
- **Music requests and queue information:** song names, URLs, resolved track metadata, requester information, queue order, and current playback state are processed in memory so the bot can play and control music. Track information may be posted back to the Discord text channel as a Now Playing or queue embed.
- **External media resolution:** a music query or supplied media URL may be sent to the configured media-source resolver so the bot can find metadata and a playable stream. The current implementation uses a YouTube extractor for YouTube search/playback.
- **Diagnostics:** startup messages and runtime errors are written to the application's console. Error details may contain command, source, or service information needed to diagnose a failure.
- **Support correspondence:** if you email the operator, your email address and message are processed to answer your request.

The current bot does not intentionally record voice-channel conversations and does not maintain a persistent user-profile or listening-history database. Discord identifiers and usernames are still personal information even when processed temporarily.

## Retention and deletion

Music queues and playback state are held in the running bot process rather than in a persistent application database.

`/stop` removes the active queue. `/leave` stops playback, removes the queue, and disconnects the bot. If the music player is disconnected from voice, the bot also removes the associated queue. Finished queues are not intended to become permanent listening history.

Console-log retention depends on the deployment environment; the application does not currently enforce a timed log-deletion schedule. Support correspondence is handled separately from music queues. Contact the operator about retention or deletion of logs or correspondence associated with you.

Deleting a queue does not erase messages already posted in Discord or records independently held by Discord or external media services.

## Sharing and external services

Discord processes account, server, channel, interaction, and message information under its [Privacy Policy](https://discord.com/privacy).

When a request is resolved or streamed from an external media service, that service may receive requests from the bot's hosting environment and process technical information according to its own terms and privacy practices. The current implementation can resolve YouTube content and can post the resolved YouTube link so Discord may render a video preview.

GitHub hosts this repository and may host the policy pages under its [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). Hosting and email providers process the traffic and correspondence needed to provide their services.

## Your choices and requests

You can stop using the bot, use `/stop` to clear the current server queue, use `/leave` to clear the queue and disconnect the bot, or remove the bot from a server you manage.

Email [nobumeqt@outlook.com](mailto:nobumeqt@outlook.com) to ask about your information or request access, correction, or deletion. Provide only enough information to identify the relevant interaction, log, or correspondence. Never send passwords, bot tokens, or account credentials. Some temporary queue information may already have been erased.

Depending on applicable law, you may also have rights to restrict or object to processing, obtain a portable copy, or complain to a data-protection authority.

## Updates

This policy will be revised when data practices change, including changes to media providers, storage, logging, or queue retention. The date above identifies the latest revision.

See also the [Terms of Service](TERMS_OF_SERVICE.md).
