"use client";

import React, { useEffect, useState } from "react";
import {
  Radio, Sparkles, FileVideo, Mic2, Antenna,
  Play, Activity, Signal, Zap, ChevronRight,
  Volume2, Layers, Cpu, Eye, Pause,
} from "lucide-react";
import {
  WaveBackground, CursorSpotlight, ReactiveWave, FrequencyWave,
  VUMeter, NewsTicker, WavyButton, WavyLink, WavyIconBtn,
  WavyProgress,
} from "./components/interactive";

/* ── Animated counter ─────────────────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let v = 0;
        const step = to / 60;
        const id = setInterval(() => { v += step; if (v >= to) { setVal(to); clearInterval(id); } else setVal(Math.floor(v)); }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Feature card ─────────────────────────────────────────────────── */
function FeatureCard({ icon: Icon, tag, title, desc, accent = false }: {
  icon: React.ElementType; tag: string; title: string; desc: string; accent?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top)  / r.height)* 100}%`);
  };
  const onMouseLeave = () => { ref.current?.style.removeProperty("--mx"); ref.current?.style.removeProperty("--my"); };

  return (
    <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
      className="group relative rounded-none p-5 transition-all duration-300 btn-wavy-sm hover:-translate-y-1.5 cursor-default"
      style={{
        background: accent ? "linear-gradient(135deg,rgba(42,30,8,0.95),rgba(22,18,10,0.98))" : "linear-gradient(135deg,rgba(25,20,12,0.9),rgba(18,15,8,0.95))",
        border:`1px solid ${accent ? "rgba(245,166,35,0.3)" : "rgba(58,47,26,0.7)"}`,
        boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
      }}>
      <div className="absolute inset-0 rounded-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{ background:"radial-gradient(circle at var(--mx,50%) var(--my,50%),rgba(245,166,35,0.09),transparent 55%)" }} />
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 btn-wavy-sm"
          style={{
            background: accent ? "rgba(245,166,35,0.15)" : "rgba(42,34,21,0.8)",
            border:`1px solid ${accent ? "rgba(245,166,35,0.4)" : "#3A2F1A"}`,
          }}>
          <Icon className="w-4 h-4" style={{ color: accent ? "#F5A623" : "#9E947A" }} />
        </div>
        <span className="text-[9px] tracking-[0.25em] uppercase"
          style={{ color: accent ? "#F5A623" : "#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
          {tag}
        </span>
      </div>
      <h3 className="text-base font-semibold mb-2 transition-colors group-hover:text-amber-200"
        style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed" style={{ color:"#7A7060" }}>{desc}</p>
    </div>
  );
}

/* ── Step ─────────────────────────────────────────────────────────── */
function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="shrink-0 w-10 h-10 flex items-center justify-center font-bold text-sm btn-wavy-sm transition-all duration-300"
        style={{
          background:"linear-gradient(135deg,#1C1811,#2A2215)",
          border:"1px solid rgba(245,166,35,0.3)",
          color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(245,166,35,0.3)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
        {n}
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-0.5 group-hover:text-amber-200 transition-colors"
          style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>{title}</h4>
        <p className="text-[13px] leading-relaxed" style={{ color:"#7A7060" }}>{desc}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [heroPlayed, setHeroPlayed] = useState(false);
  const [waveActive, setWaveActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaveActive(true), 400);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("revealed"); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal-section").forEach(el => obs.observe(el));
    return () => { clearTimeout(t); obs.disconnect(); };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background:"#0D0B08", color:"#EDE4C8" }}>
      <WaveBackground />
      <CursorSpotlight />

      {/* Grain */}
      <div className="pointer-events-none fixed inset-0 z-[2]" aria-hidden="true"
        style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", backgroundRepeat:"repeat", backgroundSize:"200px", opacity:0.5 }} />

      {/* Corner screws */}
      <div className="pointer-events-none fixed inset-0 z-[2]" aria-hidden="true">
        {["top-3 left-3","top-3 right-3","bottom-3 left-3","bottom-3 right-3"].map(p => (
          <div key={p} className={`absolute ${p} w-2.5 h-2.5 rounded-full opacity-25`} style={{ border:"1px solid #5A4A28" }} />
        ))}
      </div>

      {/* ══════════ NAV ══════════════════════════════════════════════ */}
      <nav className="relative z-30 w-full"
        style={{ background:"rgba(10,8,6,0.88)", borderBottom:"1px solid rgba(58,47,26,0.6)", backdropFilter:"blur(24px)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-3 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center btn-wavy-sm transition-all duration-300 hover:scale-110"
              style={{ background:"linear-gradient(135deg,#1C1811,#2A2215)", border:"1px solid rgba(181,144,42,0.4)", boxShadow:"0 0 14px rgba(245,166,35,0.2)" }}>
              <Radio className="w-4 h-4" style={{ color:"#F5A623" }} />
            </div>
            <div>
              <span className="text-base font-bold tracking-[0.15em] uppercase title-shimmer"
                style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#F5A623" }}>
                STREAM
              </span>
              <span className="text-base font-bold tracking-[0.15em] uppercase"
                style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}> IT!</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {[["Features","#features"],["How it Works","#how-it-works"],["Tech Stack","#tech"]].map(([label,href]) => (
              <a key={label} href={href}
                className="text-xs tracking-wide transition-all duration-200 hover:text-amber-400 hover:-translate-y-px"
                style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" }}>
                {label}
              </a>
            ))}
          </div>

          <WavyLink href="/player"
            className="gap-2 px-4 py-2 text-xs font-medium tracking-wide"
            glow
            style={{
              background:"linear-gradient(135deg,#2A1F0A,#1C1811)",
              border:"1px solid rgba(245,166,35,0.5)",
              color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace",
            }}>
            <Play className="w-3 h-3 fill-current" />
            LAUNCH PLAYER
          </WavyLink>
        </div>
      </nav>

      {/* ══════════ HERO ═════════════════════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-20 pb-10 px-6">

        <div className="inline-flex items-center gap-2 px-4 py-1.5 btn-wavy-sm mb-8"
          style={{ background:"rgba(20,18,9,0.85)", border:"1px solid rgba(245,166,35,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background:"#FF3B30", boxShadow:"0 0 6px rgba(255,59,48,0.9)", animation:"signal-pulse 1.5s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>
            Live Broadcast · AI Station
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 max-w-4xl"
          style={{ fontFamily:"'Playfair Display',Georgia,serif" }}>
          <span className="title-shimmer" style={{ color:"#F5A623" }}>Stream.</span>{" "}
          <span style={{ color:"#EDE4C8" }}>Explain.</span>{" "}
          <em style={{ color:"#9E947A", fontStyle:"italic" }}>Edit.</em>
        </h1>

        <p className="text-base md:text-lg max-w-2xl mb-3 leading-relaxed" style={{ color:"#9E947A" }}>
          STREAM IT! is an AI-powered broadcast media player — open any local video, pause any frame,
          and let on-device AI narrate, identify, and edit like a seasoned radio correspondent.
        </p>
        <p className="text-sm mb-10" style={{ color:"#5A4A28", fontFamily:"'IBM Plex Mono',monospace" }}>
          No cloud. No uploads. Pure client-side intelligence.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <WavyLink href="/player" glow
            className="gap-2.5 px-6 py-3 text-sm font-medium tracking-wide"
            style={{
              background:"linear-gradient(135deg,#3A2A08,#241C08)",
              border:"1px solid rgba(245,166,35,0.55)",
              color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace",
            }}>
            <Play className="w-4 h-4 fill-current" />
            OPEN THE STUDIO
          </WavyLink>

          <WavyButton
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior:"smooth" })}
            className="gap-2.5 px-6 py-3 text-sm font-medium tracking-wide"
            style={{
              background:"rgba(20,18,9,0.7)",
              border:"1px solid rgba(58,47,26,0.9)",
              color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace",
            }}>
            VIEW FEATURES <ChevronRight className="w-3.5 h-3.5" />
          </WavyButton>
        </div>

        {/* Cursor-reactive waveform */}
        <div className="w-full max-w-4xl mb-4">
          <ReactiveWave bars={90} height="h-24" />
        </div>

        {/* Player mockup */}
        <div className="w-full max-w-4xl btn-wavy-lg overflow-hidden"
          style={{
            background:"linear-gradient(180deg,rgba(18,14,8,0.98),rgba(12,10,6,1))",
            border:"1px solid rgba(58,47,26,0.9)",
            borderTop:"1px solid rgba(181,144,42,0.2)",
            boxShadow:"0 20px 80px rgba(0,0,0,0.8)",
          }}>
          {/* Video area */}
          <div className="relative bg-black h-60 md:h-80 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={() => setHeroPlayed(p => !p)}
            style={{ backgroundImage:"radial-gradient(ellipse at center,#0D0B08 30%,#000 100%)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.07) 2px,rgba(0,0,0,0.07) 4px)" }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background:"radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,0.65) 100%)" }} />

            <div className={`flex flex-col items-center gap-3 z-10 transition-all duration-400 ${heroPlayed ? "opacity-0 scale-90 pointer-events-none" : "opacity-100 scale-100"}`}>
              <div className="relative w-16 h-16 flex items-center justify-center btn-wavy-lg"
                style={{ background:"radial-gradient(circle at 35% 35%,#2A2215,#0D0B08)", border:"1px solid rgba(245,166,35,0.4)", boxShadow:"0 0 30px rgba(245,166,35,0.25)" }}>
                <Play className="w-7 h-7 fill-current ml-1" style={{ color:"#F5A623" }} />
                <div className="absolute inset-[-6px] border animate-ping"
                  style={{ borderColor:"rgba(245,166,35,0.2)", animationDuration:"2s", borderRadius:"inherit" }} />
              </div>
              <p className="text-xs tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                Click to preview
              </p>
            </div>

            {heroPlayed && (
              <div className="absolute inset-0 flex items-end justify-between p-4 z-10">
                <VUMeter active={true} />
                <div className="flex-1 mx-4">
                  <WavyProgress value={33} max={100} />
                </div>
                <span className="text-[10px] tabular-nums" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                  1:47 / 9:56
                </span>
              </div>
            )}

            <div className="absolute top-3 right-3 flex flex-col gap-1.5 pointer-events-none z-10"
              style={{ opacity: heroPlayed ? 0.9 : 0.25, transition:"all 0.6s" }}>
              <div className="px-2 py-0.5 text-[9px] tracking-widest btn-wavy-sm"
                style={{ background:"rgba(20,18,9,0.92)", border:"1px solid rgba(245,166,35,0.3)", color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>
                AI · Explain IT!
              </div>
              <div className="w-32 p-2 btn-wavy-sm" style={{ background:"rgba(13,11,8,0.95)", border:"1px solid #3A2F1A" }}>
                <p className="text-[9px] leading-relaxed" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                  🐰 Animal 98%<br/>🌳 Tree 92%<br/>⛅ Sky 75%
                </p>
              </div>
            </div>
          </div>

          {/* Mockup controls */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ borderTop:"1px solid #2A2215" }}>
            <WavyIconBtn accent={heroPlayed} onClick={() => setHeroPlayed(p => !p)}
              className="w-8 h-8">
              {heroPlayed
                ? <div className="flex gap-0.5"><span className="w-0.5 h-3 bg-current rounded"/><span className="w-0.5 h-3 bg-current rounded"/></div>
                : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </WavyIconBtn>
            <div className="flex-1">
              <WavyProgress value={heroPlayed ? 33 : 0} max={100} />
            </div>
            <Volume2 className="w-3.5 h-3.5 transition-all duration-300" style={{ color: heroPlayed ? "#9E947A" : "#3A2F1A" }} />
            <Sparkles className="w-3.5 h-3.5 transition-all duration-300" style={{ color: heroPlayed ? "#F5A623" : "#3A2F1A" }} />
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="relative z-10"><NewsTicker /></div>

      {/* ══════════ STATS ════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 px-6 reveal-section">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val:100, suffix:"%",        label:"Client-Side AI" },
            { val:0,   suffix:" Uploads", label:"Data Leaves Device" },
            { val:60,  suffix:"fps",      label:"Smooth Playback" },
            { val:5,   suffix:"+ Formats",label:"Video Support" },
          ].map((s, i) => (
            <div key={i} className="text-center p-4 btn-wavy-sm transition-all duration-300 hover:-translate-y-1 cursor-default group"
              style={{ background:"rgba(20,18,9,0.7)", border:"1px solid #3A2F1A" }}>
              <p className="text-3xl font-bold mb-0.5 transition-all group-hover:text-amber-300"
                style={{ color:"#F5A623", fontFamily:"'Playfair Display',Georgia,serif", textShadow:"0 0 12px rgba(245,166,35,0.3)" }}>
                <Counter to={s.val} suffix={s.suffix} />
              </p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ═════════════════════════════════════════ */}
      <section id="features" className="relative z-10 py-20 px-6 reveal-section" style={{ borderTop:"1px solid #1C1811" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px" style={{ background:"#F5A623" }} />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>
              Broadcast Features
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-3 max-w-xl"
            style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}>
            Intelligence built for every frame.
          </h2>
          <p className="text-sm mb-4 max-w-lg leading-relaxed" style={{ color:"#7A7060" }}>
            From raw video to AI-powered broadcast in seconds.
          </p>
          <div className="mb-10"><ReactiveWave bars={50} height="h-10" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard accent icon={Sparkles} tag="Core Feature" title="Explain IT!"
              desc="Pause any frame for instant AI scene analysis — object detection, character identification, and contextual narration." />
            <FeatureCard icon={Mic2} tag="AI Editing" title="Prompt-to-Edit"
              desc='Type "cut the last 5 seconds" and FFmpeg.wasm handles the rest. Natural language, real video operations.' />
            <FeatureCard icon={FileVideo} tag="Local Playback" title="Universal File Support"
              desc="Open MP4, MKV, WebM, MOV from your device. Zero cloud dependency or file uploads required." />
            <FeatureCard icon={Eye} tag="Computer Vision" title="Real-Time Detection"
              desc="MediaPipe and Transformers.js run entirely in your browser via Web Workers, keeping the UI at 60fps." />
            <FeatureCard icon={Cpu} tag="WebAssembly" title="FFmpeg.wasm Engine"
              desc="Full FFmpeg compiled to WASM. Frame extraction, transcoding, trimming — all inside the browser." />
            <FeatureCard accent icon={Layers} tag="Architecture" title="AI Plugin System"
              desc="Swap between local Transformers.js and cloud LLMs like GPT-4o or Gemini Vision with one config line." />
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ═════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 reveal-section" style={{ borderTop:"1px solid #1C1811" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px" style={{ background:"#F5A623" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>
                How It Works
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-10"
              style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}>
              From file to broadcast in three acts.
            </h2>
            <div className="space-y-8">
              <Step n="01" title="Open Any Local Video"
                desc="Click OPEN FILE or drag-and-drop. Loads entirely client-side — nothing leaves your device." />
              <div className="w-px h-6 ml-5" style={{ background:"linear-gradient(to bottom,#3A2F1A,transparent)" }} />
              <Step n="02" title="Pause & Explain"
                desc='Hit "EXPLAIN IT!" — canvas captures the frame, AI runs on-device, the sidebar fills with scene intelligence.' />
              <div className="w-px h-6 ml-5" style={{ background:"linear-gradient(to bottom,#3A2F1A,transparent)" }} />
              <Step n="03" title="Prompt to Edit"
                desc="Type editing commands in plain English. AI routes intent to the correct FFmpeg.wasm operation." />
            </div>
          </div>

          {/* AI sidebar preview */}
          <div className="btn-wavy-lg overflow-hidden p-5"
            style={{ background:"linear-gradient(135deg,rgba(25,20,12,0.95),rgba(18,14,8,0.98))", border:"1px solid rgba(245,166,35,0.2)", boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Antenna className="w-4 h-4" style={{ color:"#F5A623" }} />
                <span className="text-[10px] tracking-widest uppercase" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>
                  Intelligence Bureau
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background:"#39FF14", boxShadow:"0 0 6px rgba(57,255,20,0.8)", animation:"signal-pulse 2s infinite" }} />
                <span className="text-[9px] uppercase" style={{ color:"#39FF14", fontFamily:"'IBM Plex Mono',monospace" }}>Live</span>
              </div>
            </div>
            <div className="mb-4"><FrequencyWave active={waveActive} bars={40} height="h-12" /></div>
            <div className="p-3 mb-3 btn-wavy-sm" style={{ background:"rgba(13,11,8,0.8)", border:"1px solid #3A2F1A" }}>
              <p className="text-[9px] tracking-widest uppercase mb-1.5" style={{ color:"#9E947A", fontFamily:"'IBM Plex Mono',monospace" }}>Scene Analysis</p>
              <p className="text-[12px] leading-relaxed" style={{ color:"#EDE4C8" }}>
                Animated rabbit character in a lush forest clearing. Morning light with natural subsurface scattering on fur.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[{e:"🐰",l:"Animal",c:"98%",hi:true},{e:"🌳",l:"Tree",c:"92%",hi:false},{e:"🌿",l:"Grass",c:"88%",hi:false},{e:"⛅",l:"Sky",c:"75%",hi:false}].map(t => (
                <span key={t.l} className="px-2 py-0.5 text-[10px] btn-wavy-sm transition-all hover:scale-105"
                  style={{
                    background: t.hi ? "rgba(245,166,35,0.12)" : "rgba(20,18,9,0.8)",
                    border:`1px solid ${t.hi ? "rgba(245,166,35,0.4)" : "#3A2F1A"}`,
                    color: t.hi ? "#F5A623" : "#9E947A", fontFamily:"'IBM Plex Mono',monospace",
                  }}>
                  {t.e} {t.l} <span style={{ opacity:0.5 }}>{t.c}</span>
                </span>
              ))}
            </div>
            <div className="p-3 btn-wavy-sm" style={{ background:"linear-gradient(135deg,rgba(35,26,10,0.9),rgba(20,18,9,0.95))", border:"1px solid rgba(245,166,35,0.2)" }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Mic2 className="w-3 h-3" style={{ color:"#F5A623" }} />
                <span className="text-[9px] uppercase tracking-widest" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>AI Correspondent</span>
              </div>
              <p className="text-[12px] leading-relaxed italic" style={{ color:"#EDE4C8", fontFamily:"'Playfair Display',Georgia,serif" }}>
                &ldquo;Big Buck Bunny&apos;s subsurface scattering gives the fur a warm, lifelike glow — a landmark in Blender Foundation&apos;s open-source rendering history.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TECH STACK ════════════════════════════════════════ */}
      <section id="tech" className="relative z-10 py-20 px-6 reveal-section" style={{ borderTop:"1px solid #1C1811" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-px" style={{ background:"#F5A623" }} />
            <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace" }}>On-Air Technology</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-8"
            style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}>
            The broadcast stack.
          </h2>
          <div className="mb-8"><ReactiveWave bars={40} height="h-8" /></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { name:"Next.js 16",      role:"App Framework",   icon:Zap },
              { name:"TypeScript",      role:"Type Safety",     icon:Cpu },
              { name:"Tailwind v4",     role:"Styling System",  icon:Layers },
              { name:"Framer Motion",   role:"Animations",      icon:Activity },
              { name:"FFmpeg.wasm",     role:"Video Engine",    icon:FileVideo },
              { name:"Transformers.js", role:"On-Device AI",    icon:Sparkles },
              { name:"MediaPipe",       role:"Computer Vision", icon:Eye },
              { name:"Web Workers",     role:"Concurrency",     icon:Signal },
            ].map(t => (
              <div key={t.name}
                className="group p-3 btn-wavy-sm transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ background:"rgba(20,18,9,0.7)", border:"1px solid #3A2F1A" }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 20px rgba(245,166,35,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>
                <t.icon className="w-4 h-4 mb-2 transition-all duration-300 group-hover:text-amber-400 group-hover:scale-110" style={{ color:"#9E947A" }} />
                <p className="text-sm font-medium mb-0.5 group-hover:text-amber-200 transition-colors"
                  style={{ color:"#EDE4C8", fontFamily:"'IBM Plex Mono',monospace" }}>{t.name}</p>
                <p className="text-[10px]" style={{ color:"#7A7060" }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-6 reveal-section" style={{ borderTop:"1px solid #1C1811" }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8"><ReactiveWave bars={70} height="h-16" /></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
            style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#EDE4C8" }}>
            Start your first{" "}
            <span className="title-shimmer" style={{ color:"#F5A623" }}>broadcast.</span>
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color:"#7A7060" }}>
            Open the studio, load any video, and let the AI do the heavy lifting.
            No signup. No API keys. No data leaves your machine.
          </p>
          <WavyLink href="/player" glow
            className="gap-3 px-8 py-4 text-sm font-medium tracking-wide"
            style={{
              background:"linear-gradient(135deg,#3A2A08,#241C08)",
              border:"1px solid rgba(245,166,35,0.6)",
              color:"#F5A623", fontFamily:"'IBM Plex Mono',monospace",
            }}>
            <Radio className="w-4 h-4" />
            OPEN THE STUDIO
            <ChevronRight className="w-4 h-4" />
          </WavyLink>
          <p className="text-[10px] mt-4 tracking-widest uppercase" style={{ color:"#5A4A28", fontFamily:"'IBM Plex Mono',monospace" }}>
            Free · Open Source · Runs In Your Browser
          </p>
        </div>
      </section>

      {/* ══════════ FOOTER ═══════════════════════════════════════════ */}
      <footer className="relative z-20 px-6 md:px-10 py-6" style={{ background:"rgba(8,6,5,0.95)", borderTop:"1px solid #3A2F1A" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4" style={{ color:"#F5A623" }} />
            <span className="text-sm font-bold tracking-[0.15em] uppercase title-shimmer"
              style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#F5A623" }}>STREAM IT!</span>
            <span className="text-[10px]" style={{ color:"#5A4A28", fontFamily:"'IBM Plex Mono',monospace" }}>
              &copy; {new Date().getFullYear()} · AI Broadcast Engine
            </span>
          </div>
          <div className="flex items-center gap-4">
            {[["Home","/"],["Player","/player"],["Features","#features"]].map(([l,h]) => (
              <a key={l} href={h}
                className="text-[11px] tracking-wide transition-all hover:text-amber-400 hover:-translate-y-px"
                style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace", textDecoration:"none" }}>
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background:"#39FF14", boxShadow:"0 0 6px rgba(57,255,20,0.8)", animation:"signal-pulse 2.5s ease-in-out infinite" }} />
            <span className="text-[9px] tracking-widest uppercase" style={{ color:"#7A7060", fontFamily:"'IBM Plex Mono',monospace" }}>Broadcast Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
