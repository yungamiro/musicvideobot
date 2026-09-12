export type PlaybackStatus = "playing" | "paused" | "stopped";

export interface MediaTrack {
  id: string;
  title: string;
  audioUrl: string;
  videoUrl?: string;
  requestedBy: string;
}

export interface PlaybackState {
  roomId: string;
  status: PlaybackStatus;
  track: MediaTrack | null;
  positionMs: number;
  updatedAt: number;
}

export interface PlaybackUpdateRequest {
  status: PlaybackStatus;
  track: MediaTrack | null;
  positionMs: number;
}
