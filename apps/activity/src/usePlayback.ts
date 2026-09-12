import { useEffect, useState } from "react";
import type { PlaybackState } from "@musicvideobot/shared";
import { getPlayback } from "./api";
export function usePlayback(roomId: string | null) {
  const [state, setState] = useState<PlaybackState | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!roomId) return;
    let active = true;
    let controller: AbortController | null = null;
    const refresh = async () => {
      controller?.abort(); controller = new AbortController();
      try { const next = await getPlayback(roomId, controller.signal); if (active) { setState(next); setError(null); } }
      catch (cause) { if (!active || controller.signal.aborted) return; setError(cause instanceof Error ? cause.message : "Playback sync failed"); }
    };
    void refresh(); const timer = window.setInterval(refresh, 1000);
    return () => { active = false; controller?.abort(); window.clearInterval(timer); };
  }, [roomId]);
  return { state, error };
}
