# MusicVideoBot Privacy Policy

Last updated: 12 September 2026

**Application ID:** 1548297625671962629  
**Operator:** MusicVideoBot developer, GitHub account [yungamiro](https://github.com/yungamiro)  
**Privacy contact:** [nobumeqt@outlook.com](mailto:nobumeqt@outlook.com)

## Scope

This policy covers MusicVideoBot's Discord bot and synchronized audio/video Activity as currently implemented in this repository.

## Information processed and why

- **Discord interaction information:** user identifiers and usernames, server and channel identifiers, voice-channel context, and command inputs are processed to respond to commands and coordinate playback.
- **Playback information:** the supplied track title, audio URL, optional video URL, requester's Discord username, generated track identifier, playback position, status, and update time are held in server memory to synchronize the room. The requester name and track information are shown to participants.
- **Activity authentication:** the Activity requests Discord's `identify` permission. A temporary authorization code is exchanged through the backend for an OAuth token, which is used to authenticate with Discord. The Activity uses the returned username or display name. These credentials are not deliberately saved in a database by the current application.
- **Diagnostics:** startup messages and runtime errors are written to the application's console. Error details may contain request or service information; these logs are separate from playback state.
- **Support correspondence:** if you email the operator, your email address and message are processed to answer your request.

The current application has no persistent user-profile or listening-history database. It does not intentionally request sensitive personal information or record voice-channel conversations. Discord identifiers and usernames are still personal information even when processed temporarily.

## Retention and deletion

Playback state is held in the API process's memory, without database or disk persistence in the application code.

A successful `/stop` clears the current track, including its media URLs and requester name. Starting another track replaces the previous track. The room identifier and stopped playback metadata can remain in memory until the room is deleted or the API process stops or restarts.

When the bot leaves a voice channel through `/leave`, is moved to another voice channel, or Discord reports that the bot has left the channel, the application deletes that room's in-memory state. This clears the current playback state and is also the cleanup boundary intended for future per-room queue data. Closing the Activity by itself does not delete the room state while the bot remains connected.

Console-log retention depends on the deployment environment; the application does not currently enforce a timed log-deletion schedule. Support correspondence is handled separately from playback state. Contact the operator about retention or deletion of logs or correspondence associated with you.

Clearing playback state does not erase messages in Discord or records independently held by other services.

## Sharing and external services

Playback information is sent between the bot, its backend, and Activity clients. The current playback-read endpoint does not verify room membership, so someone who knows a room identifier and can reach the endpoint can retrieve its playback state. Do not submit confidential media URLs or credentials.

Discord processes account and interaction information under its [Privacy Policy](https://discord.com/privacy). The Activity loads the media URLs supplied by users. The relevant media hosts, and any intermediary proxy, process the requests needed to deliver playback; technical data they receive depends on the delivery route.

GitHub hosts this repository and may host the policy pages under its [Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). Hosting and email providers process the traffic and correspondence needed to provide their services. Their independent records are not cleared by stopping playback.

## Your choices and requests

You can stop using the Activity, remove the bot from a server you manage, and revoke the Activity's authorization in Discord. Use `/stop` in the relevant voice channel to clear the active track, or disconnect the bot to delete that room's in-memory state.

Email [nobumeqt@outlook.com](mailto:nobumeqt@outlook.com) to ask about your information or request access, correction, or deletion. Provide only enough information to identify the relevant session or correspondence. Never send passwords, bot tokens, or OAuth tokens. Some temporary information may already have been erased. Depending on applicable law, you may also have rights to restrict or object to processing, obtain a portable copy, or complain to a data-protection authority.

## Updates

This policy will be revised when data practices change, including changes to authentication, media providers, storage, or cleanup. The date above identifies the latest revision. Material changes should be communicated through the app or its support channels before they take effect.

See also the [Terms of Service](TERMS_OF_SERVICE.md).
