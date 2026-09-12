import { config } from "../config.js";

export interface SpotifyResolvedTrack {
  title: string;
  artists: string[];
  searchQuery: string;
  spotifyUrl: string;
  thumbnail?: string;
}

export interface SpotifyResolvedCollection {
  kind: "track" | "album" | "playlist" | "artist";
  name: string;
  sourceUrl: string;
  tracks: SpotifyResolvedTrack[];
  thumbnail?: string;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function spotifyCredentials(): { clientId: string; clientSecret: string } {
  if (!config.spotifyClientId || !config.spotifyClientSecret) {
    throw new Error(
      "Spotify links require SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your .env."
    );
  }
  return { clientId: config.spotifyClientId, clientSecret: config.spotifyClientSecret };
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.accessToken;

  const { clientId, clientSecret } = spotifyCredentials();
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" })
  });

  if (!response.ok) {
    throw new Error(`Spotify authentication failed (${response.status}).`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("Spotify authentication returned no access token.");

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000
  };
  return data.access_token;
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Spotify API returned ${response.status}.`);
  return (await response.json()) as T;
}

function parseSpotifyUrl(value: string): { kind: SpotifyResolvedCollection["kind"]; id: string } | null {
  try {
    const url = new URL(value);
    if (url.hostname !== "open.spotify.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    const supported = new Set(["track", "album", "playlist", "artist"]);
    const typeIndex = parts.findIndex((part) => supported.has(part));
    if (typeIndex < 0 || !parts[typeIndex + 1]) return null;
    return {
      kind: parts[typeIndex] as SpotifyResolvedCollection["kind"],
      id: parts[typeIndex + 1]
    };
  } catch {
    return null;
  }
}

export function isSpotifyUrl(value: string): boolean {
  return parseSpotifyUrl(value) !== null;
}

interface SpotifyArtist {
  name: string;
}
interface SpotifyImage {
  url: string;
}
interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  external_urls?: { spotify?: string };
  album?: { images?: SpotifyImage[] };
}

function toResolvedTrack(track: SpotifyTrack, fallbackUrl: string): SpotifyResolvedTrack {
  const artists = track.artists.map((artist) => artist.name).filter(Boolean);
  return {
    title: track.name,
    artists,
    searchQuery: `${artists.join(", ")} - ${track.name}`,
    spotifyUrl: track.external_urls?.spotify ?? fallbackUrl,
    ...(track.album?.images?.[0]?.url ? { thumbnail: track.album.images[0].url } : {})
  };
}

async function resolveTrack(id: string, sourceUrl: string): Promise<SpotifyResolvedCollection> {
  const track = await spotifyGet<SpotifyTrack>(`/tracks/${encodeURIComponent(id)}`);
  const resolved = toResolvedTrack(track, sourceUrl);
  return {
    kind: "track",
    name: `${resolved.artists.join(", ")} - ${resolved.title}`,
    sourceUrl,
    tracks: [resolved],
    ...(resolved.thumbnail ? { thumbnail: resolved.thumbnail } : {})
  };
}

async function resolveAlbum(id: string, sourceUrl: string): Promise<SpotifyResolvedCollection> {
  const album = await spotifyGet<{
    name: string;
    images?: SpotifyImage[];
    tracks: { items: SpotifyTrack[]; next: string | null };
  }>(`/albums/${encodeURIComponent(id)}?market=US`);

  const tracks = album.tracks.items.slice(0, 100).map((track) => toResolvedTrack(track, sourceUrl));
  return {
    kind: "album",
    name: album.name,
    sourceUrl,
    tracks,
    ...(album.images?.[0]?.url ? { thumbnail: album.images[0].url } : {})
  };
}

async function resolvePlaylist(id: string, sourceUrl: string): Promise<SpotifyResolvedCollection> {
  const playlist = await spotifyGet<{
    name: string;
    images?: SpotifyImage[];
    tracks: { items: Array<{ track: SpotifyTrack | null }> };
  }>(`/playlists/${encodeURIComponent(id)}?market=US`);

  const tracks = playlist.tracks.items
    .map((item) => item.track)
    .filter((track): track is SpotifyTrack => Boolean(track))
    .slice(0, 100)
    .map((track) => toResolvedTrack(track, sourceUrl));

  return {
    kind: "playlist",
    name: playlist.name,
    sourceUrl,
    tracks,
    ...(playlist.images?.[0]?.url ? { thumbnail: playlist.images[0].url } : {})
  };
}

async function resolveArtist(id: string, sourceUrl: string): Promise<SpotifyResolvedCollection> {
  const [artist, topTracks] = await Promise.all([
    spotifyGet<{ name: string; images?: SpotifyImage[] }>(`/artists/${encodeURIComponent(id)}`),
    spotifyGet<{ tracks: SpotifyTrack[] }>(`/artists/${encodeURIComponent(id)}/top-tracks?market=US`)
  ]);

  return {
    kind: "artist",
    name: `${artist.name} — Top Tracks`,
    sourceUrl,
    tracks: topTracks.tracks.slice(0, 10).map((track) => toResolvedTrack(track, sourceUrl)),
    ...(artist.images?.[0]?.url ? { thumbnail: artist.images[0].url } : {})
  };
}

export async function resolveSpotifyUrl(value: string): Promise<SpotifyResolvedCollection> {
  const parsed = parseSpotifyUrl(value);
  if (!parsed) throw new Error("That is not a supported Spotify URL.");

  switch (parsed.kind) {
    case "track":
      return resolveTrack(parsed.id, value);
    case "album":
      return resolveAlbum(parsed.id, value);
    case "playlist":
      return resolvePlaylist(parsed.id, value);
    case "artist":
      return resolveArtist(parsed.id, value);
  }
}
