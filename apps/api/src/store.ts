import type { PlaybackState, PlaybackUpdateRequest } from "@musicvideobot/shared";

const rooms = new Map<string, PlaybackState>();

export function getPlayback(roomId: string): PlaybackState {
  return rooms.get(roomId) ?? {
    roomId,
    status: "stopped",
    track: null,
    positionMs: 0,
    updatedAt: Date.now()
  };
}

export function setPlayback(roomId: string, update: PlaybackUpdateRequest): PlaybackState {
  const state: PlaybackState = {
    roomId,
    status: update.status,
    track: update.track,
    positionMs: Math.max(0, update.positionMs),
    updatedAt: Date.now()
  };
  rooms.set(roomId, state);
  return state;
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}
