"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Radio, Sparkles, Mic2, FileVideo, ChevronRight,
  SkipBack, SkipForward, Repeat, Shuffle,
  Signal, Antenna, Headphones, Activity, Camera,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  CursorSpotlight, FrequencyWave, VUMeter, NewsTicker,
  WavyButton, WavyLink, WavyIconBtn, OnAirBadge,
  WavyProgress, type Toast,
} from "../components/interactive";

/* ── Helpers ──────────────────────────────────────────────────────── */
function fmt(s: number) {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}
function cleanFileName(raw: string) { return raw.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "); }

/* ── Time-aware mock AI ─────────────────────────────────────────── */
interface SceneData {
  description: string;
  objects: { label: string; emoji: string; conf: number; highlight: boolean }[];
  commentary: string;
}
function getSceneData(t: number, fileName: string): SceneData {
  const n = fileName || "Big Buck Bunny";
  if (t < 30)  return { description:`Opening sequence of "${n}". Soft morning light washes over a lush forest clearing. The camera pans slowly from the canopy down to the ground.`, objects:[{label:"Forest",emoji:"🌲",conf:97,highlight:false},{label:"Sky",emoji:"⛅",conf:91,highlight:false},{label:"Grass",emoji:"🌿",conf:88,highlight:false}], commentary:`The opening frames of "${n}" use warm, diffused lighting to create an inviting world. Wide-angle establishing shot characteristic of Blender Foundation's style.` };
  if (t < 90)  return { description:`Character introduction at ${fmt(t)}. A large animated rabbit emerges from a floral resting spot, yawning and stretching in the morning light.`, objects:[{label:"Rabbit",emoji:"🐰",conf:99,highlight:true},{label:"Flowers",emoji:"🌺",conf:87,highlight:false},{label:"Tree",emoji:"🌳",conf:82,highlight:false},{label:"Sky",emoji:"⛅",conf:74,highlight:false}], commentary:`Big Buck Bunny wakes — subsurface scattering gives the fur a realistic glow. This scene established many of Blender's early HDRI lighting techniques.` };
  if (t < 200) return { description:`Antagonist encounter at ${fmt(t)}. Three small woodland creatures appear — a squirrel and two chipmunks — acting as mischievous bullies.`, objects:[{label:"Squirrel",emoji:"🐿️",conf:94,highlight:true},{label:"Chipmunk",emoji:"🐭",conf:91,highlight:true},{label:"Rabbit",emoji:"🐰",conf:88,highlight:false},{label:"Grass",emoji:"🌿",conf:76,highlight:false}], commentary:`Quick cuts and Dutch angles create comedic tension. The chipmunks' exaggerated facial expressions foreshadow the slapstick action sequence ahead.` };
  if (t < 350) return { description:`Action sequence at ${fmt(t)}. High-energy chase and trap-setting scenes involving mechanical contraptions built from natural materials.`, objects:[{label:"Rabbit",emoji:"🐰",conf:96,highlight:true},{label:"Wood/Trap",emoji:"🪵",conf:89,highlight:false},{label:"Motion blur",emoji:"💨",conf:85,highlight:false},{label:"Forest",emoji:"🌲",conf:78,highlight:false}], commentary:`The climax showcases Blender's rigid-body physics engine. Each trap was hand-keyed for comedic timing, secondary animation on fur responding to rapid movement.` };
  return { description:`Resolution at ${fmt(t)}. Harmony restored in the forest. Soft golden-hour lighting bathes the final frames.`, objects:[{label:"Rabbit",emoji:"🐰",conf:95,highlight:true},{label:"Golden light",emoji:"🌅",conf:88,highlight:false},{label:"Forest",emoji:"🌲",conf:82,highlight:false}], commentary:`The closing moments use a warm color grade shift to golden amber — a classic filmmaking technique signalling resolution and emotional payoff.` };
}

function captureFrame(video: HTMLVideoElement): string | null {
  try {
    const c = document.createElement("canvas");
    c.width = Math.min(video.videoWidth, 640); c.height = Math.min(video.videoHeight, 360);
    const ctx = c.getContext("2d"); if (!ctx) return null;
    ctx.drawImage(video, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.7);
  } catch { return null; }
}

/* ── Toast container (inline since it uses local state) ─────────── */
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 px-3 py-2 text-xs btn-wavy-sm animate-in slide-in-from-right-4 fade-in duration-300"
          style={{
            background:"rgba(20,18,9,0.97)",
            border:`1px solid ${t.type==="error"?"rgba(255,59,48,0.4)":t.type==="success"?"rgba(57,255,20,0.3)":"rgba(245,166,35,0.3)"}`,
            color:"#EDE4C8", fontFamily:"'IBM Plex Mono',monospace", boxShadow:"0 4px 20px rgba(0,0,0,0.8)",
          }}>
          {t.type==="success"?<CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color:"#39FF14" }}/>
            :t.type==="error"?<AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color:"#FF3B30" }}/>
            :<Signal className="w-3.5 h-3.5 shrink-0" style={{ color:"#F5A623" }}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PLAYER PAGE
════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [isPlaying,       setIsPlaying]       = useState(false);
  const [currentTime,     setCurrentTime]     = useState(0);
  const [duration,        setDuration]        = useState(0);
  const [volume,          setVolume]          = useState(0.8);
  const [isMuted,         setIsMuted]         = useState(false);
  const [isFullscreen,    setIsFullscreen]    = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isRepeat,        setIsRepeat]        = useState(false);
  const [isShuffle,       setIsShuffle]       = useState(false);
  const [fileLoaded,      setFileLoaded]      = useState(false);
  const [fileName,        setFileName]        = useState("Big Buck Bunny");
  const [frameThumb,      setFrameThumb]      = useState<string | null>(null);
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);
  const [isAnalyzing,     setIsAnalyzing]     = useState(false);
  const [aiScene,         setAiScene]         = useState<SceneData | null>(null);
  const [promptText,      setPromptText]      = useState("");
  const [promptHistory,   setPromptHistory]   = useState<{q:string;a:string}[]>([]);
  const [toasts,          setToasts]          = useState<Toast[]>([]);

  const toastId      = useRef(0);
  const videoRef     = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptEndRef = useRef<HTMLDivElement>(null);

  const seekPct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const volPct  = isMuted ? 0 : volume * 100;

  const addToast = useCallback((msg: string, type: Toast["type"] = "info") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => { const v = videoRef.current; if (v) { v.volume = isMuted ? 0 : volume; v.muted = isMuted; } }, [volume, isMuted]);
  useEffect(() => { if (videoRef.current) videoRef.current.loop = isRepeat; }, [isRepeat]);
  useEffect(() => { const h = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener("fullscreenchange", h); return () => document.removeEventListener("fullscreenchange", h); }, []);
  useEffect(() => { promptEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [promptHistory]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    v.paused ? v.play().catch(()=>{}) : v.pause();
  }, []);

  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(() => setControlsVisible(false), 3200);
  }, [isPlaying]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); togglePlay(); break;
        case "f": case "F": toggleFullscreen(); break;
        case "m": case "M": setIsMuted(p => !p); break;
        case "ArrowRight": e.preventDefault(); if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime+10); addToast("+10s"); break;
        case "ArrowLeft":  e.preventDefault(); if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime-10); addToast("-10s"); break;
        case "ArrowUp":    e.preventDefault(); setVolume(p => Math.min(1, parseFloat((p+0.1).toFixed(1)))); break;
        case "ArrowDown":  e.preventDefault(); setVolume(p => Math.max(0, parseFloat((p-0.1).toFixed(1)))); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, duration]);

  const handleExplain = useCallback(() => {
    const v = videoRef.current; if (!v) return;
    if (!v.paused) v.pause();
    setFrameThumb(captureFrame(v));
    setIsAnalyzing(true); setIsSidebarOpen(true); setAiScene(null);
    const t = v.currentTime, fName = fileName;
    setTimeout(() => { setAiScene(getSceneData(t, fName)); setIsAnalyzing(false); addToast("AI analysis complete","success"); }, 2000);
  }, [fileName, addToast]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    if (isSidebarOpen && !isAnalyzing) handleExplain();
  }, [isSidebarOpen, isAnalyzing, handleExplain]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current; if (!el) return;
    !document.fullscreenElement ? el.requestFullscreen().catch(()=>{}) : document.exitFullscreen().catch(()=>{});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const v = videoRef.current; if (!v) return;
    v.src = URL.createObjectURL(file); v.load();
    const name = cleanFileName(file.name);
    setFileName(name); setFileLoaded(false); setCurrentTime(0); setDuration(0);
    setIsPlaying(false); setAiScene(null); setFrameThumb(null);
    addToast(`Loaded: ${name}`, "success");
    e.target.value = "";
  };

  const handlePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    const q = promptText.trim(); if (!q) return;
    setPromptText("");
    const v = videoRef.current; const t = v?.currentTime ?? 0;
    let answer = "";
    const ql = q.toLowerCase();
    if (/cut|trim|clip|remove/.test(ql))         answer = `FFmpeg.wasm: "${q}" → ffmpeg -i input.mp4 -ss ${fmt(t)} -t [duration] output.mp4`;
    else if (/screenshot|snapshot|capture|frame/.test(ql)) { const th = v ? captureFrame(v) : null; if (th) setFrameThumb(th); answer = `Frame captured at ${fmt(t)}.`; }
    else if (/explain|what|describe|scene|show/.test(ql))  { const scene = getSceneData(t, fileName); answer = `At ${fmt(t)}: ${scene.description}`; setAiScene(scene); }
    else if (/mute|volume|sound/.test(ql))        { setIsMuted(p=>!p); answer = "Volume toggled."; }
    else if (/play|start/.test(ql))               { togglePlay(); answer = "Playback started."; }
    else if (/pause|stop/.test(ql))               { v?.pause(); answer = "Playback paused."; }
    else answer = `Command queued: "${q}". Full AI pipeline will route to FFmpeg.wasm or Transformers.js.`;
    setPromptHistory(p => [...p, { q, a: answer }]);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background:"#0D0B08" }}
      onMouseMove={resetHideTimer} onMouseEnter={resetHideTimer}>

      <CursorSpotlight />
      <ToastContainer toasts={toasts} />

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background:"radial-gradient(circle,#F5A623,transparent 70%)", filter:"blur(80px)" }} />
        {["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"].map(pos => (
          <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full opacity-30`} style={{ border:"1px solid #3A2F1A" }} />
        ))}
      </div>

      {/* ════════════ HEADER ═══════════════════════════════════════════ */}
      <header className="relative z-30 w-full"
        style={{ background:"linear-gradient(180deg,#0A0806,#0D0B08)", borderBottom:"1px solid #3A2F1A" }}>
        <div className="flex items-center justify-between px-4 md:px-8 py-3 gap-3">

          {/* Logo → nav back home */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group" style={{ textDecoration:"none" }}>
            <div className="flex items-center justify-center w-9 h-9 btn-wavy-sm group-hover:scale-105 transition-transform"
              style={{ background:"linear-gradient(135deg,#1C1811,#2A2215)", border:"1px solid rgba(181,144,42,0.4)", boxShadow:"0 0 16px rgba(245,166,35,0.2)" }}>
              <Radio className="w-4 h-4" style={{ color:"#F5A623" }} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold leading-none tracking-[0.15em] uppercase title-shimmer"
                style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#F5A623" }}>
                STREAM<span style={{ color:"#EDE4C8" }}> IT!</span>
              </h1>
              <p className="text-[9px] tracking-[0.3em] uppercase mt-0.5"
                style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                AI Broadcast Station
              </p>
            </div>
          </Link>

          {/* Instruments */}
          <div className="hidden lg:flex items-center gap-5">
            <div className="text-center">
              <p className="text-[9px] tracking-widest uppercase mb-0.5" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Frequency</p>
              <p className="text-sm font-bold tabular-nums" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace", textShadow:"0 0 8px rgba(245,166,35,0.4)" }}>103.7 FM</p>
            </div>
            <div className="w-px h-8 opacity-40" style={{ background:"linear-gradient(to bottom,transparent,#5A4A28,transparent)" }} />
            <VUMeter active={isPlaying} />
            <div className="w-px h-8 opacity-40" style={{ background:"linear-gradient(to bottom,transparent,#5A4A28,transparent)" }} />
            <div>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Signal</p>
              <div className="flex items-end gap-[3px]">
                {[1,2,3,4,5].map(bar => (
                  <div key={bar} className="w-[4px] rounded-sm transition-all duration-500"
                    style={{
                      height:`${bar*4+4}px`,
                      background: fileLoaded && bar<=(isPlaying?4:3) ? "#39FF14" : "#3A2F1A",
                      boxShadow: fileLoaded && bar<=(isPlaying?4:3) ? "0 0 4px rgba(57,255,20,0.8)" : "none",
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <OnAirBadge active={isPlaying} />
            <WavyButton id="open-file-btn" onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wide"
              style={{ background:"linear-gradient(135deg,rgba(42,34,21,0.9),rgba(28,24,17,0.9))", border:"1px solid rgba(58,47,26,0.8)", color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
              <FileVideo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">OPEN FILE</span>
            </WavyButton>
            <WavyButton id="explain-btn" onClick={handleExplain}
              glow={isSidebarOpen}
              className="flex items-center gap-2 px-3 py-1.5 text-[11px] tracking-wide"
              style={{
                background: isSidebarOpen ? "linear-gradient(135deg,rgba(80,60,20,0.95),rgba(55,40,15,0.95))" : "linear-gradient(135deg,rgba(42,34,21,0.9),rgba(28,24,17,0.9))",
                border:`1px solid ${isSidebarOpen ? "rgba(245,166,35,0.5)" : "rgba(58,47,26,0.8)"}`,
                color: isSidebarOpen ? "#F5A623" : "#9E947A", fontFamily:"'IBM Plex Mono',monospace",
              }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">EXPLAIN IT!</span>
            </WavyButton>
          </div>
        </div>
        <NewsTicker />
      </header>

      {/* ════════════ MAIN ═════════════════════════════════════════════ */}
      <main className="relative z-10 flex flex-1 overflow-hidden" style={{ minHeight:0 }}>

        {/* VIDEO STAGE */}
        <div ref={containerRef} id="video-stage"
          className="relative flex-1 flex flex-col overflow-hidden bg-black"
          style={{ borderRight: isSidebarOpen ? "1px solid #3A2F1A" : "none" }}>

          <div className="scan-line pointer-events-none absolute inset-0 z-10" aria-hidden="true" style={{ mixBlendMode:"overlay" }} />

          <video ref={videoRef} id="main-video"
            className="w-full h-full object-contain cursor-pointer"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            onTimeUpdate={() => { if (videoRef.current) setCurrentTime(videoRef.current.currentTime); }}
            onLoadedMetadata={() => { const v = videoRef.current; if (v) { setDuration(v.duration); setFileLoaded(true); } }}
            onPlay={() => setIsPlaying(true)}
            onPause={handleVideoPause}
            onEnded={() => { setIsPlaying(false); if (!isRepeat) setCurrentTime(0); }}
            onClick={togglePlay}
            playsInline
          />

          <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true"
            style={{ background:"radial-gradient(ellipse at center,transparent 50%,rgba(13,11,8,0.65) 100%)" }} />

          {/* Intro overlay */}
          {!isPlaying && currentTime === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="radio-panel flex flex-col items-center gap-5 p-8 btn-wavy-lg text-center" style={{ maxWidth:360 }}>
                <div className="relative w-20 h-20 flex items-center justify-center btn-wavy-lg"
                  style={{ background:"radial-gradient(circle at 35% 35%,#2A2215,#0D0B08)", border:"1px solid rgba(245,166,35,0.3)", boxShadow:"0 0 30px rgba(245,166,35,0.2)" }}>
                  <Antenna className="w-8 h-8" style={{ color:"#F5A623" }} />
                  <div className="absolute inset-[-6px] border animate-ping" style={{ borderColor:"rgba(245,166,35,0.25)", animationDuration:"2s", borderRadius:"inherit" }} />
                  <div className="absolute inset-[-14px] border animate-ping" style={{ borderColor:"rgba(245,166,35,0.12)", animationDuration:"2.5s", animationDelay:"0.5s", borderRadius:"inherit" }} />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-1" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Station Initialized</p>
                  <h2 className="text-2xl font-semibold italic mb-2" style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}>
                    Ready to Broadcast
                  </h2>
                  <p className="text-xs" style={{ color:"#7A7060" }}>
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-[10px] mx-0.5 btn-wavy-sm" style={{ background:"#1C1811", border:"1px solid #3A2F1A", color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>SPACE</kbd>
                    {" "}or click to play
                  </p>
                </div>
                <div className="w-full" style={{ borderTop:"1px solid #2A2215", paddingTop:8 }}>
                  <FrequencyWave active={false} bars={40} height="h-10" />
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-[9px]" style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>
                  {[["SPACE","Play/Pause"],["F","Fullscreen"],["M","Mute"],["←→","±10s"],["↑↓","Volume"]].map(([k,l]) => (
                    <span key={k} className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 btn-wavy-sm" style={{ background:"#1C1811", border:"1px solid #3A2F1A", color:"#F5A623" }}>{k}</kbd>
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Controls bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 transition-all duration-500"
            style={{ transform: controlsVisible||!isPlaying ? "translateY(0)" : "translateY(110%)", opacity: controlsVisible||!isPlaying ? 1 : 0 }}>

            <div style={{ background:"linear-gradient(0deg,rgba(13,11,8,0.98),transparent)" }}>
              <FrequencyWave active={isPlaying} bars={60} height="h-12" />
            </div>

            <div className="mx-3 mb-3 p-3 btn-wavy-lg"
              style={{
                background:"linear-gradient(180deg,rgba(22,19,10,0.97),rgba(13,11,8,0.99))",
                border:"1px solid rgba(58,47,26,0.9)",
                borderTop:"1px solid rgba(181,144,42,0.25)",
                boxShadow:"0 -4px 30px rgba(0,0,0,0.8)",
              }}>

                {/* Seek */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-[10px] w-9 text-right tabular-nums shrink-0" style={{ color: "#9E947A", fontFamily: "'IBM Plex Mono',monospace" }}>{fmt(currentTime)}</span>
                  <WavyProgress
                    value={currentTime}
                    max={duration || 100}
                    onChange={(val) => { if (videoRef.current) videoRef.current.currentTime = val; setCurrentTime(val); }}
                    className="flex-1"
                  />
                  <span className="text-[10px] w-9 tabular-nums shrink-0" style={{ color: "#9E947A", fontFamily: "'IBM Plex Mono',monospace" }}>{fmt(duration)}</span>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-2">

                  {/* Transport */}
                  <div className="flex items-center gap-1.5">
                    <WavyIconBtn id="repeat-btn" title="Repeat" active={isRepeat}
                      className="p-1.5" onClick={() => { setIsRepeat(p => !p); addToast(!isRepeat ? "Repeat ON" : "Repeat OFF"); }}>
                      <Repeat className="w-3.5 h-3.5" />
                    </WavyIconBtn>
                    <WavyIconBtn id="skip-back-btn" title="Back 10s" className="p-1.5"
                      onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.max(0, currentTime - 10); }}>
                      <SkipBack className="w-4 h-4" />
                    </WavyIconBtn>
                    <WavyIconBtn id="play-pause-btn" accent className="w-9 h-9" onClick={togglePlay}>
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </WavyIconBtn>
                    <WavyIconBtn id="skip-fwd-btn" title="Forward 10s" className="p-1.5"
                      onClick={() => { if (videoRef.current) videoRef.current.currentTime = Math.min(duration, currentTime + 10); }}>
                      <SkipForward className="w-4 h-4" />
                    </WavyIconBtn>
                    <WavyIconBtn id="shuffle-btn" title="Shuffle" active={isShuffle}
                      className="p-1.5 hidden sm:flex"
                      onClick={() => { setIsShuffle(p => !p); addToast(!isShuffle ? "Shuffle ON" : "Shuffle OFF"); }}>
                      <Shuffle className="w-3.5 h-3.5" />
                    </WavyIconBtn>
                  </div>

                  {/* Now playing */}
                  <div className="hidden md:flex flex-col items-center flex-1 mx-2 min-w-0">
                    <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#9E947A", fontFamily: "'IBM Plex Mono',monospace" }}>
                      {fileLoaded ? "Now Playing" : "Ready"}
                    </p>
                    <p className="text-sm font-medium truncate w-full text-center" style={{ color: "#EDE4C8", fontFamily: "'Playfair Display',Georgia,serif", maxWidth: 260 }} title={fileName}>
                      {fileName}
                    </p>
                  </div>

                  {/* Right tools */}
                  <div className="flex items-center gap-1.5">
                    <WavyIconBtn id="snapshot-btn" title="Capture frame" className="p-1.5 hidden sm:flex"
                      onClick={() => { const v = videoRef.current; if (!v) return; const th = captureFrame(v); if (th) { setFrameThumb(th); addToast("Frame captured", "success"); } }}>
                      <Camera className="w-3.5 h-3.5" />
                    </WavyIconBtn>
                    <WavyIconBtn id="mute-btn" title="Mute (M)" className="p-1.5"
                      onClick={() => { setIsMuted(p => !p); addToast(isMuted ? "Unmuted" : "Muted"); }}>
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </WavyIconBtn>
                    <div className="w-24 hidden sm:block">
                      <WavyProgress
                        value={isMuted ? 0 : volume * 100}
                        max={100}
                        onChange={(val) => { const v = val / 100; setVolume(v); setIsMuted(v === 0); }}
                      />
                    </div>
                    <WavyIconBtn id="fullscreen-btn" title="Fullscreen (F)" className="p-1.5" onClick={toggleFullscreen}>
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </WavyIconBtn>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* ════════════ AI SIDEBAR ════════════════════════════════════ */}
        <div className="flex flex-col shrink-0 transition-all duration-500 ease-in-out overflow-hidden"
          style={{ width: isSidebarOpen ? "clamp(280px,27vw,390px)" : "0px", opacity: isSidebarOpen ? 1 : 0, background:"#0D0B08" }}>

          {isSidebarOpen && (
            <div className="flex flex-col h-full w-full overflow-hidden">
              {/* Sidebar header */}
              <div className="px-4 py-2.5 shrink-0 flex items-center justify-between"
                style={{ background:"linear-gradient(180deg,#0A0806,#0D0B08)", borderBottom:"1px solid #3A2F1A" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center btn-wavy-sm"
                    style={{ background:"linear-gradient(135deg,#1C1811,#2A2215)", border:"1px solid rgba(245,166,35,0.3)" }}>
                    <Activity className="w-3.5 h-3.5" style={{ color:"#F5A623" }} />
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Intelligence Bureau</p>
                    <p className="text-sm font-semibold" style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>Explain IT!</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <WavyIconBtn id="re-analyze-btn" title="Re-analyze" className="p-1.5" onClick={handleExplain}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </WavyIconBtn>
                  <WavyIconBtn id="sidebar-close-btn" className="p-1.5" onClick={() => setIsSidebarOpen(false)}>
                    <ChevronRight className="w-4 h-4" />
                  </WavyIconBtn>
                </div>
              </div>

              {/* Status strip */}
              <div className="px-4 py-1.5 shrink-0 flex items-center gap-2"
                style={{ borderBottom:"1px solid #3A2F1A", background:"rgba(10,8,6,0.5)" }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isAnalyzing?"#F5A623":aiScene?"#39FF14":"#3A2F1A",
                    boxShadow: isAnalyzing?"0 0 6px rgba(245,166,35,0.8)":aiScene?"0 0 4px rgba(57,255,20,0.7)":"none",
                    animation: isAnalyzing?"signal-pulse 1s ease-in-out infinite":"none",
                  }} />
                <p className="text-[10px] tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                  {isAnalyzing?"Analyzing broadcast...":aiScene?`Analysis @ ${fmt(currentTime)}`:"Awaiting signal..."}
                </p>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">

                {frameThumb && (
                  <div className="btn-wavy-sm overflow-hidden" style={{ border:"1px solid #3A2F1A" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frameThumb} alt="Captured frame" className="w-full object-cover"
                      style={{ maxHeight:140, filter:"brightness(0.9) contrast(1.05)" }} />
                    <div className="flex items-center justify-between px-2 py-1" style={{ background:"rgba(13,11,8,0.9)" }}>
                      <p className="text-[9px] tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Captured Frame</p>
                      <p className="text-[9px] tabular-nums" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>{fmt(currentTime)}</p>
                    </div>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="space-y-3">
                    <div className="p-3 btn-wavy-sm" style={{ background:"rgba(20,18,9,0.8)", border:"1px solid #3A2F1A" }}>
                      <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Processing Frame @ {fmt(currentTime)}</p>
                      <FrequencyWave active={true} bars={40} height="h-10" />
                    </div>
                    <div className="space-y-2">
                      {["Capturing frame data","Running object detection","Generating AI context","Composing analysis"].map((step,i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:"#F5A623", boxShadow:"0 0 6px rgba(245,166,35,0.8)", animation:`signal-pulse 1.5s ease-in-out ${i*0.3}s infinite` }} />
                          <p className="text-[11px]" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>{step}…</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isAnalyzing && aiScene && (
                  <div className="space-y-3">
                    <div className="p-3 btn-wavy-sm" style={{ background:"rgba(20,18,9,0.8)", border:"1px solid #3A2F1A" }}>
                      <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Scene Analysis</p>
                      <p className="text-[13px] leading-relaxed" style={{ color:"#EDE4C8" }}>{aiScene.description}</p>
                    </div>

                    <div>
                      <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Detected Objects</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiScene.objects.map(obj => (
                          <span key={obj.label} className="px-2 py-1 text-[11px] font-medium flex items-center gap-1 btn-wavy-sm"
                            style={{
                              fontFamily:"'IBM Plex Mono',monospace",
                              background: obj.highlight ? "rgba(245,166,35,0.12)" : "rgba(20,18,9,0.8)",
                              border:`1px solid ${obj.highlight ? "rgba(245,166,35,0.4)" : "#3A2F1A"}`,
                              color: obj.highlight ? "#F5A623" : "#9E947A",
                            }}>
                            <span>{obj.emoji}</span><span>{obj.label}</span><span style={{ opacity:0.5 }}>{obj.conf}%</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 btn-wavy-sm"
                      style={{ background:"linear-gradient(135deg,rgba(35,26,10,0.9),rgba(20,18,9,0.95))", border:"1px solid rgba(245,166,35,0.22)" }}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Mic2 className="w-3 h-3 shrink-0" style={{ color:"#F5A623" }} />
                        <p className="text-[9px] uppercase tracking-widest" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>AI Correspondent</p>
                      </div>
                      <p className="text-[13px] leading-relaxed italic" style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>
                        &ldquo;{aiScene.commentary}&rdquo;
                      </p>
                    </div>

                    <WavyButton onClick={handleExplain}
                      className="w-full flex items-center justify-center gap-2 py-2 text-[11px] tracking-wide"
                      style={{ background:"linear-gradient(135deg,rgba(42,34,21,0.9),rgba(28,24,17,0.9))", border:"1px solid rgba(58,47,26,0.8)", color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                      <Camera className="w-3.5 h-3.5" />
                      Re-analyze current frame
                    </WavyButton>
                  </div>
                )}

                {!isAnalyzing && !aiScene && (
                  <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-4">
                    <div className="w-14 h-14 flex items-center justify-center btn-wavy-lg"
                      style={{ background:"radial-gradient(circle,#1C1811,#0D0B08)", border:"1px solid #3A2F1A" }}>
                      <Headphones className="w-6 h-6" style={{ color:"#3A2F1A" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>Broadcast Intelligence</p>
                      <p className="text-xs leading-relaxed" style={{ color:"#7A7060" }}>
                        Pause the video or press <span style={{ color:"#F5A623" }}>EXPLAIN IT!</span> to beam AI analysis into this panel.
                      </p>
                    </div>
                  </div>
                )}

                {promptHistory.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[9px] tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Command Log</p>
                    {promptHistory.map((entry, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-start gap-1.5">
                          <span className="text-[10px] shrink-0 mt-0.5" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>&gt;</span>
                          <p className="text-[11px]" style={{ color:"#EDE4C8", fontFamily:"'IBM Plex Mono',monospace" }}>{entry.q}</p>
                        </div>
                        <div className="p-2 ml-4 btn-wavy-sm" style={{ background:"rgba(20,18,9,0.7)", border:"1px solid #2A2215" }}>
                          <p className="text-[11px] leading-relaxed" style={{ color:"#9E947A" }}>{entry.a}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={promptEndRef} />
                  </div>
                )}
              </div>

              {/* Prompt box */}
              <div className="shrink-0 p-3" style={{ borderTop:"1px solid #3A2F1A", background:"linear-gradient(180deg,#0D0B08,#0A0806)" }}>
                <form onSubmit={handlePrompt} className="relative">
                  <input id="prompt-input" type="text" value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    placeholder='Ask or command… "cut last 5s"'
                    className="w-full pr-9 py-2.5 px-3 text-[11px] outline-none transition-all duration-200 btn-wavy-sm"
                    style={{ background:"rgba(20,18,9,0.9)", border:"1px solid #3A2F1A", color:"#EDE4C8", fontFamily:"'IBM Plex Mono',monospace" }}
                    onFocus={e => { e.currentTarget.style.borderColor="rgba(245,166,35,0.5)"; e.currentTarget.style.boxShadow="0 0 0 2px rgba(245,166,35,0.07)"; }}
                    onBlur={e  => { e.currentTarget.style.borderColor="#3A2F1A"; e.currentTarget.style.boxShadow="none"; }}
                  />
                  <WavyIconBtn type="submit" id="prompt-submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
                    </svg>
                  </WavyIconBtn>
                </form>
                <p className="text-[9px] mt-1 tracking-wide" style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>
                  Try: "explain this" · "cut last 10s" · "snapshot"
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ════════════ FOOTER ═══════════════════════════════════════════ */}
      <footer className="relative z-20 px-4 md:px-8 py-2.5 flex items-center justify-between flex-wrap gap-2"
        style={{ background:"#0A0806", borderTop:"1px solid #3A2F1A" }}>
        <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>
          STREAM IT! &copy; {new Date().getFullYear()} · AI Broadcast Engine
        </p>
        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
          {["Next.js 16","FFmpeg.wasm","Transformers.js","TypeScript"].map(tech => (
            <span key={tech} className="px-2 py-0.5 text-[9px] btn-wavy-sm tracking-wider uppercase"
              style={{ background:"rgba(20,18,9,0.8)", border:"1px solid #3A2F1A", color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>
              {tech}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background:"#39FF14", boxShadow:"0 0 6px rgba(57,255,20,0.8)", animation:"signal-pulse 2.5s ease-in-out infinite" }} />
          <p className="text-[9px] tracking-widest uppercase" style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>Broadcast Ready</p>
        </div>
      </footer>

      <input ref={fileInputRef} type="file" accept="video/*,audio/*" className="hidden" onChange={handleFileChange} id="file-input" />
    </div>
  );
}
