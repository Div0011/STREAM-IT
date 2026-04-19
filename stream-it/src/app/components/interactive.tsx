"use client";

import React, {
  useEffect, useRef, useCallback, useState,
  type ReactNode, type CSSProperties, type ButtonHTMLAttributes,
} from "react";
import Link from "next/link";
import { Signal, CheckCircle2, AlertCircle } from "lucide-react";

/* ════════════════════════════════════════════════════════════════════
   CANVAS WAVE BACKGROUND
   3 rows of bars reacting to cursor with Gaussian falloff + lerp
════════════════════════════════════════════════════════════════════ */
export function WaveBackground({ opacity = 1 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onMove  = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = ()              => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const ROWS = [
      { y:0.22, bars:110, baseAmp:18,  spikeAmp:95,  speed:0.6,  radius:190, alpha:0.50, barW:2.5 },
      { y:0.50, bars:130, baseAmp:22,  spikeAmp:130, speed:0.45, radius:230, alpha:0.40, barW:2.0 },
      { y:0.78, bars: 90, baseAmp:15,  spikeAmp:85,  speed:0.7,  radius:165, alpha:0.32, barW:2.0 },
    ];

    const rowPhases = ROWS.map(r =>
      Array.from({ length: r.bars }, (_, i) => (i / r.bars) * Math.PI * 4 + Math.random() * 0.5)
    );
    const heights = ROWS.map(r => new Float32Array(r.bars).fill(0));

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ROWS.forEach((row, ri) => {
        const cy  = H * row.y;
        const gap = W / (row.bars + 1);
        for (let i = 0; i < row.bars; i++) {
          const x       = gap * (i + 1);
          const natural = row.baseAmp * (0.5 + 0.5 * Math.sin(rowPhases[ri][i] + t * row.speed));
          const dx      = x - mouse.current.x;
          const dy      = cy - mouse.current.y;
          const gauss   = Math.exp(-(dx*dx + dy*dy) / (2 * row.radius * row.radius));
          const target  = natural + row.spikeAmp * gauss;

          heights[ri][i] += (target - heights[ri][i]) * 0.12;
          const h         = Math.max(2, heights[ri][i]);
          const intensity = Math.min(1, h / (row.spikeAmp * 0.7));
          const a         = row.alpha * (0.3 + 0.7 * intensity) * opacity;
          const g         = Math.round(166 + intensity * 34);

          ctx.fillStyle = `rgba(245,${g},35,${a})`;
          ctx.beginPath();
          ctx.roundRect(x - row.barW / 2, cy - h, row.barW, h * 2, 2);
          ctx.fill();
        }
      });
      t += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [opacity]);

  return <canvas ref={canvasRef} className="wave-canvas" aria-hidden="true" />;
}

/* ════════════════════════════════════════════════════════════════════
   CURSOR SPOTLIGHT   — soft amber glow that tracks the cursor
════════════════════════════════════════════════════════════════════ */
export function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move  = (e: MouseEvent) => { el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px`; el.style.opacity = "1"; };
    const leave = ()              => { if (el) el.style.opacity = "0"; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);
  return <div ref={ref} className="cursor-spotlight" style={{ opacity:0 }} aria-hidden="true" />;
}

/* ════════════════════════════════════════════════════════════════════
   REACTIVE WAVE   — inline bars that spike under cursor on hover
════════════════════════════════════════════════════════════════════ */
export function ReactiveWave({ bars = 80, height = "h-20" }: { bars?: number; height?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX       = useRef(-1);
  const animRef      = useRef<number>(0);
  const barsRef      = useRef<(HTMLDivElement | null)[]>([]);
  const hRef         = useRef<Float32Array>(new Float32Array(bars).fill(0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove  = (e: MouseEvent) => { const r = container.getBoundingClientRect(); mouseX.current = e.clientX - r.left; };
    const onLeave = ()              => { mouseX.current = -1; };
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    let t = 0;
    const animate = () => {
      const W   = container.offsetWidth;
      const gap = W / (bars + 1);
      for (let i = 0; i < bars; i++) {
        const x       = gap * (i + 1);
        const natural = 10 + 9 * Math.abs(Math.sin(i * 0.7 + t * 0.55));
        const spike   = mouseX.current >= 0
          ? 50 * Math.exp(-((x - mouseX.current) ** 2) / (2 * 38 * 38))
          : 0;
        hRef.current[i] += (natural + spike - hRef.current[i]) * 0.14;
        const el = barsRef.current[i];
        if (el) {
          const h = Math.max(4, hRef.current[i]);
          el.style.height = `${h}px`;
          const int = Math.min(1, spike / 50);
          el.style.background = `rgba(245,${Math.round(150 + int * 70)},35,${0.22 + 0.65 * int + 0.13 * (natural / 19)})`;
        }
      }
      t += 0.016;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animRef.current); container.removeEventListener("mousemove", onMove); container.removeEventListener("mouseleave", onLeave); };
  }, [bars]);

  return (
    <div ref={containerRef} className={`flex items-center gap-[2px] ${height} w-full cursor-crosshair`}>
      {Array.from({ length: bars }, (_, i) => (
        <div key={i} ref={el => { barsRef.current[i] = el; }}
          className="flex-1 rounded-full"
          style={{ height: 6, background: "rgba(58,47,26,0.4)" }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   FREQUENCY WAVE   — static css-animated bars (no cursor logic)
════════════════════════════════════════════════════════════════════ */
export function FrequencyWave({ active, bars = 60, height = "h-16" }: { active: boolean; bars?: number; height?: string }) {
  const items = Array.from({ length: bars }, (_, i) => ({
    delay: `${(i * 0.04).toFixed(2)}s`,
    dur:   `${(0.5 + Math.abs(Math.sin(i)) * 0.5).toFixed(2)}s`,
    rH:    `${8  + Math.abs(Math.sin(i * 0.8)) * 18}%`,
    aH:    `${30 + Math.abs(Math.sin(i * 0.5)) * 65}%`,
  }));
  return (
    <div className={`flex items-center gap-[2px] ${height} w-full`}>
      {items.map((it, i) => (
        <div key={i} className="flex-1 rounded-full"
          style={{
            height: active ? it.aH : it.rH,
            background: active
              ? `rgba(245,166,35,${0.2 + Math.abs(Math.sin(i * 0.4)) * 0.75})`
              : `rgba(58,47,26,${0.3 + Math.abs(Math.sin(i * 0.6)) * 0.3})`,
            animation: active ? `wave ${it.dur} ease-in-out infinite alternate` : "none",
            animationDelay: it.delay,
          }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   VU METER
════════════════════════════════════════════════════════════════════ */
export function VUMeter({ active }: { active: boolean }) {
  const bars = [
    { rH:"20%", aH:"72%", dur:"0.90s", delay:"0.00s" },
    { rH:"38%", aH:"91%", dur:"0.70s", delay:"0.10s" },
    { rH:"55%", aH:"100%",dur:"0.50s", delay:"0.05s" },
    { rH:"42%", aH:"95%", dur:"0.60s", delay:"0.20s" },
    { rH:"28%", aH:"80%", dur:"0.80s", delay:"0.15s" },
    { rH:"50%", aH:"88%", dur:"0.65s", delay:"0.25s" },
  ];
  return (
    <div className="flex items-end gap-[3px] h-8">
      {bars.map((b, i) => (
        <div key={i} className="w-[4px] rounded-sm transition-all duration-300"
          style={{
            height: active ? b.aH : b.rH,
            background: active ? "linear-gradient(to top,#39FF14,#FFE500 60%,#FF3B30)" : "linear-gradient(to top,#3A2F1A,#5A4A28)",
            animation: active ? `eq-dance ${b.dur} ease-in-out infinite alternate` : "none",
            animationDelay: b.delay,
            "--min-h": b.rH, "--max-h": b.aH, "--dur": b.dur,
          } as CSSProperties} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   NEWS TICKER
════════════════════════════════════════════════════════════════════ */
const TICKER_ITEMS = [
  "🔴 LIVE · STREAM IT! v1.0 Now Broadcasting",
  "◆ AI Scene Analysis · Real-Time Object Detection",
  "◆ FFmpeg.wasm · Client-Side · Zero Uploads",
  "◆ Explain IT! · Pause Any Frame for Instant AI Context",
  "◆ Prompt-to-Edit · Natural Language Video Editing",
  "◆ MP4 · MKV · WebM · MOV · Any Local File",
  "◆ Keyboard Shortcuts: SPACE · F · M · ← → · ↑ ↓",
  "🔴 ON AIR · Broadcasting Intelligence In Every Frame",
];
export function NewsTicker() {
  const full = [...TICKER_ITEMS, ...TICKER_ITEMS].join("   ·   ");
  return (
    <div className="overflow-hidden h-7 flex items-center ticker-wrap"
      style={{ background:"#080605", borderTop:"1px solid #3A2F1A", borderBottom:"1px solid #3A2F1A" }}>
      <div className="ticker-content text-[11px] tracking-widest uppercase whitespace-nowrap"
        style={{ color:"rgba(245,166,35,0.55)", fontFamily:"'IBM Plex Mono',monospace" }}>
        {full}&nbsp;&nbsp;&nbsp;{full}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   TOAST SYSTEM
════════════════════════════════════════════════════════════════════ */
export interface Toast { id: number; msg: string; type: "info"|"success"|"error" }
export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id}
          className="flex items-center gap-2 px-3 py-2 rounded-none text-xs animate-in slide-in-from-right-4 fade-in duration-300 btn-wavy-sm"
          style={{
            background:"rgba(20,18,9,0.97)",
            border:`1px solid ${t.type==="error" ? "rgba(255,59,48,0.4)" : t.type==="success" ? "rgba(57,255,20,0.3)" : "rgba(245,166,35,0.3)"}`,
            color:"#EDE4C8", fontFamily:"'IBM Plex Mono',monospace",
            boxShadow:"0 4px 20px rgba(0,0,0,0.8)",
          }}>
          {t.type==="success" ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color:"#39FF14" }} />
            : t.type==="error" ? <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color:"#FF3B30" }} />
            : <Signal className="w-3.5 h-3.5 shrink-0" style={{ color:"#F5A623" }} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WAVY PROGRESS BAR
   Stable track, but the 'played' portion has an animated wave fill.
════════════════════════════════════════════════════════════════════ */
interface WavyProgressProps {
  value: number;
  max: number;
  onChange?: (val: number) => void;
  className?: string;
}
export function WavyProgress({ value, max, onChange, className = "" }: WavyProgressProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onChange || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    onChange(pos * max);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-2 w-full cursor-pointer group rounded-full overflow-hidden ${className}`}
      style={{ background: "#3A2F1A" }}
      onClick={handleSeek}
    >
      {/* The 'played' part - Wavy */}
      <div
        className="wavy-progress-fill absolute inset-y-0 left-0 transition-all duration-100 ease-out flex items-center"
        style={{ width: `${pct}%` }}
      >
        <div className="absolute right-0 w-2 h-2 rounded-full bg-white opacity-0 group-hover:opacity-100 shadow-[0_0_8px_#F5A623] transition-opacity" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   RIPPLE HELPER  — appends a ripple span at click coordinates
════════════════════════════════════════════════════════════════════ */
function spawnRipple(el: HTMLElement, e: { clientX: number; clientY: number }) {
  const rect   = el.getBoundingClientRect();
  const circle = document.createElement("span");
  circle.className = "ripple-circle";
  circle.style.left = `${e.clientX - rect.left}px`;
  circle.style.top  = `${e.clientY - rect.top}px`;
  el.appendChild(circle);
  setTimeout(() => circle.remove(), 700);
}

/* ════════════════════════════════════════════════════════════════════
   WAVY BUTTON  — large organic CTA  (morphing blob shape)
   Props: same as <button> + optional glow colour override
════════════════════════════════════════════════════════════════════ */
interface WavyBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  glow?: boolean;
}
export function WavyButton({ children, className = "", style, onClick, glow = false, ...rest }: WavyBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) spawnRipple(ref.current, e);
    onClick?.(e);
  }, [onClick]);

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) * 0.28;
    const dy = (e.clientY - rect.top  - rect.height / 2) * 0.28;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <button
      ref={ref}
      className={`btn-wavy-lg ripple-btn wave-border-btn ${className}`}
      style={{
        boxShadow: glow ? "0 0 24px rgba(245,166,35,0.3),0 0 50px rgba(245,166,35,0.12)" : "0 4px 16px rgba(0,0,0,0.5)",
        ...style,
      }}
      onClick={handleClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WAVY LINK  — same as WavyButton but navigates via Next/Link
════════════════════════════════════════════════════════════════════ */
interface WavyLinkProps {
  href: string; children: ReactNode;
  className?: string; style?: CSSProperties; glow?: boolean;
}
export function WavyLink({ href, children, className = "", style, glow = false }: WavyLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (ref.current) spawnRipple(ref.current, e);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) * 0.28;
    const dy = (e.clientY - rect.top  - rect.height / 2) * 0.28;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <Link
      ref={ref}
      href={href}
      className={`btn-wavy-lg ripple-btn wave-border-btn inline-flex items-center ${className}`}
      style={{
        textDecoration:"none",
        boxShadow: glow ? "0 0 24px rgba(245,166,35,0.3),0 0 50px rgba(245,166,35,0.12)" : "0 4px 16px rgba(0,0,0,0.5)",
        ...style,
      }}
      onClick={handleClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  );
}

/* ════════════════════════════════════════════════════════════════════
   WAVY ICON BUTTON  — small utility button (player controls etc.)
   Subtle wavy shape, magnetic pull, ripple, hover glow
════════════════════════════════════════════════════════════════════ */
interface WavyIconBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  /** amber accent when active (play btn, etc.) */
  accent?: boolean;
}
export function WavyIconBtn({
  children, className = "", style, onClick, active = false, accent = false, title, id, disabled, ...rest
}: WavyIconBtnProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (ref.current) spawnRipple(ref.current, e);
    onClick?.(e);
  }, [onClick]);

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) * 0.35;
    const dy = (e.clientY - rect.top  - rect.height / 2) * 0.35;
    el.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const onMouseLeave = () => { if (ref.current) ref.current.style.transform = ""; };

  return (
    <button
      ref={ref}
      id={id}
      title={title}
      disabled={disabled}
      className={`btn-wavy-sm ripple-btn ${active ? "btn-wavy-active" : ""} ${className}`}
      style={{
        background: accent
          ? "linear-gradient(135deg,#2A1F0A,#1C1811)"
          : active
            ? "linear-gradient(135deg,rgba(80,60,20,0.95),rgba(55,40,15,0.95))"
            : "linear-gradient(135deg,rgba(42,34,21,0.9),rgba(28,24,17,0.9))",
        border: `1px solid ${accent || active ? "rgba(245,166,35,0.5)" : "rgba(58,47,26,0.8)"}`,
        color: accent || active ? "#F5A623" : "#9E947A",
        boxShadow: accent
          ? "0 0 16px rgba(245,166,35,0.35),0 0 40px rgba(245,166,35,0.12)"
          : active
            ? "0 0 12px rgba(245,166,35,0.25)"
            : "0 2px 8px rgba(0,0,0,0.5)",
        display:"inline-flex", alignItems:"center", justifyContent:"center",
        ...style,
      }}
      onClick={handleClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ON-AIR BADGE
════════════════════════════════════════════════════════════════════ */
export function OnAirBadge({ active }: { active: boolean }) {
  return (
    <div
      className={`btn-wavy-sm flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium tracking-[0.2em] uppercase transition-all duration-500 ${
        active ? "bg-red-500/10 border border-red-500/40 text-red-400 bg-red-500/10"
               : "border border-[#3A2F1A]/60 text-[#9E947A]"
      }`}
      style={{ fontFamily:"'IBM Plex Mono',monospace", background: active ? "rgba(255,59,48,0.08)" : "rgba(58,47,26,0.3)" }}
    >
      <span className="w-2 h-2 rounded-full shrink-0"
        style={{
          background: active ? "#FF3B30" : "#3A2F1A",
          boxShadow:  active ? "0 0 6px rgba(255,59,48,0.9)" : "none",
          animation:  active ? "signal-pulse 1.5s ease-in-out infinite" : "none",
        }} />
      {active ? "ON AIR" : "STANDBY"}
    </div>
  );
}
