import { useEffect, useRef, useState } from "react";
import type { PlaybackState } from "@musicvideobot/shared";
import { initializeDiscord, type DiscordContext } from "./discord";
import { usePlayback } from "./usePlayback";

function targetSeconds(state: PlaybackState): number {
  const elapsed = state.status === "playing" ? Math.max(0, Date.now() - state.updatedAt) : 0;
  return (state.positionMs + elapsed) / 1000;
}
function syncElement(element: HTMLMediaElement | null, state: PlaybackState, setBlocked: (value: boolean) => void) {
  if (!element || !state.track) return;
  const target = targetSeconds(state);
  if (Number.isFinite(element.duration)) {
    const capped = Math.min(target, Math.max(0, element.duration - 0.05));
    if (Math.abs(element.currentTime - capped) > 0.75) element.currentTime = capped;
  } else if (Math.abs(element.currentTime - target) > 0.75) element.currentTime = target;
  if (state.status === "playing" && element.paused && !element.ended) void element.play().then(() => setBlocked(false)).catch(() => setBlocked(true));
  else if (state.status !== "playing" && !element.paused) element.pause();
}
export default function App() {
  const [discord, setDiscord] = useState<DiscordContext | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => { void initializeDiscord().then(setDiscord).catch((error) => setStartupError(error instanceof Error ? error.message : "Discord initialization failed")); }, []);
  const { state, error } = usePlayback(discord?.roomId ?? null);
  useEffect(() => { if (!state) return; syncElement(audioRef.current, state, setAutoplayBlocked); if (state.track?.videoUrl) syncElement(videoRef.current, state, () => undefined); }, [state]);
  const unlockPlayback = async () => { try { await audioRef.current?.play(); if (state?.track?.videoUrl) await videoRef.current?.play(); setAutoplayBlocked(false); } catch { setAutoplayBlocked(true); } };
  if (startupError) return <main className="center"><section className="card error"><h1>Activity error</h1><p>{startupError}</p></section></main>;
  if (!discord) return <main className="center"><section className="card"><div className="spinner" /><p>Connecting to Discord…</p></section></main>;
  const track = state?.track ?? null;
  return <main className="shell">
    <header className="topbar"><div><span className="eyebrow">MUSICVIDEOBOT</span><h1>Watch Room</h1></div><div className="identity">{discord.displayName}</div></header>
    <section className="player-card">
      <div className="stage">{track?.videoUrl ? <video ref={videoRef} key={track.videoUrl} src={track.videoUrl} muted playsInline preload="auto" /> : <div className="visualizer" aria-label="Audio-only playback">{Array.from({ length: 24 }, (_, index) => <span key={index} style={{ animationDelay: `${index * -55}ms` }} />)}</div>}</div>
      <audio ref={audioRef} key={track?.audioUrl ?? "empty"} src={track?.audioUrl} preload="auto" />
      <div className="now-playing"><div><span className="eyebrow">{state?.status ?? "waiting"}</span><h2>{track?.title ?? "Nothing playing"}</h2><p>{track ? `Requested by ${track.requestedBy}` : "Use /play in this voice channel to start the room."}</p></div><div className={`status-dot ${state?.status ?? "stopped"}`} /></div>
      {autoplayBlocked && <button className="primary" onClick={unlockPlayback}>Enable audio</button>}
      {error && <p className="inline-error">{error}</p>}
    </section>
    {!discord.embedded && <aside className="dev-note">Local preview mode. Its room is <code>{discord.roomId}</code>; launch inside Discord to bind to a voice channel.</aside>}
  </main>;
}
