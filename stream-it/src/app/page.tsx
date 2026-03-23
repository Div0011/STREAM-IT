"use client";

import React, { useState, useRef } from "react";
import { Play, Pause, Volume2, Maximize, Settings, FileVideo, Sparkles } from "lucide-react";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="relative min-h-[100svh] bg-[#011E13] text-[#F8FDF6] overflow-hidden selection:bg-[#00FFA3] selection:text-black font-sans flex flex-col">
      {/* Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00FFA3] blur-[150px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#849F8C] blur-[200px] opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="w-full z-40 flex items-center justify-between px-6 md:px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,255,163,0.3)]">
            <Play className="w-5 h-5 text-[#00FFA3] ml-1" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-widest text-[#F8FDF6]">
            STREAM <span className="text-[#00FFA3] text-glow">IT!</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="glass-button flex items-center gap-2 text-sm font-medium hover:text-[#00FFA3]">
            <FileVideo className="w-4 h-4" /> <span className="hidden sm:inline">Open File</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`glass-button flex items-center gap-2 text-sm font-medium transition-colors ${isSidebarOpen ? 'text-[#00FFA3] border-[#00FFA3]/30 bg-[#00FFA3]/10' : ''}`}
          >
            <Sparkles className="w-4 h-4" /> <span className="hidden sm:inline">Explain IT!</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 w-full px-4 md:px-8 pb-8 gap-6 transition-all duration-500 overflow-hidden relative z-10">

        {/* Video Container (Center Stage) */}
        <div
          className={`relative h-full flex-1 rounded-2xl overflow-hidden glass-panel flex flex-col items-center justify-center transition-all duration-500 bg-black/80 ring-1 ring-white/5 shadow-2xl ${isSidebarOpen ? 'w-full md:w-auto' : 'w-full mx-auto max-w-[1400px]'}`}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Mock Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain cursor-pointer"
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />

          {/* Floating Controls */}
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] sm:w-[90%] max-w-4xl glass-panel !bg-black/60 rounded-2xl p-3 sm:p-4 transition-all duration-500 border border-white/10 ${isHovering || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Progress Bar */}
              <div className="flex items-center gap-2 sm:gap-3 w-full group">
                <span className="text-[10px] sm:text-xs font-mono text-white/70 w-8 sm:w-10 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#00FFA3] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,163,0.8)] focus:outline-none"
                />
                <span className="text-[10px] sm:text-xs font-mono text-white/70 w-8 sm:w-10">{formatTime(duration)}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button onClick={togglePlay} className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-[#00FFA3]/20 hover:text-[#00FFA3] transition-colors focus:outline-none">
                    {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 text-current" />}
                  </button>
                  <div className="flex items-center gap-2 group hidden sm:flex">
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white focus:outline-none">
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3 text-white/80">
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors hover:text-white focus:outline-none">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors hover:text-white focus:outline-none">
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Intro Overlay Overlay */}
          {!isPlaying && currentTime === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
              <div className="glass-panel p-6 rounded-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-[#00FFA3]/20 flex items-center justify-center border border-[#00FFA3]/30 shadow-[0_0_30px_rgba(0,255,163,0.3)]">
                  <Play className="w-8 h-8 text-[#00FFA3] ml-1" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">Ready to Stream</h3>
                  <p className="text-sm text-[#849F8C]">Click play to begin</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explain IT Sidebar */}
        <div className={`shrink-0 h-full glass-panel !bg-black/40 rounded-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out border border-white/10 ${isSidebarOpen ? 'w-full md:w-[350px] lg:w-[400px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-8 border-none md:translate-x-0 hidden md:flex'}`}>
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center gap-3 bg-black/30 shrink-0">
            <Sparkles className="w-5 h-5 text-[#00FFA3]" />
            <h2 className="font-semibold tracking-wide text-white">Context Analytics</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {!isPlaying && currentTime > 0 ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 transition-colors hover:bg-white/10">
                  <h3 className="text-xs uppercase tracking-wider text-[#849F8C] mb-2 font-semibold">Current Scene</h3>
                  <p className="text-sm leading-relaxed text-white/90">
                    A verdant forest environment with soft lighting. The focus is on a large, animated rabbit character interacting with the environment.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#849F8C] mb-3 font-semibold">Detected Objects</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20 rounded-full text-[11px] font-medium tracking-wide">🐰 Animal (98%)</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-wide text-white/80">🌳 Tree (92%)</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-wide text-white/80">🌿 Grass (88%)</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] font-medium tracking-wide text-white/80">⛅ Sky (75%)</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#00FFA3]/10 to-transparent rounded-xl p-4 border border-[#00FFA3]/20 mt-4 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFA3]/0 via-[#00FFA3]/10 to-[#00FFA3]/0 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00FFA3]" />
                    <h3 className="text-xs uppercase tracking-wider text-[#00FFA3] font-semibold">AI Assistant</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-white/90">
                    This is "Big Buck Bunny", an open-source animated short film. In this specific timestamp, we see Big Buck Bunny waking up in his natural habitat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70 space-y-4 px-4 pb-12 animate-in fade-in duration-1000">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                  <Pause className="w-6 h-6 text-[#849F8C]" />
                </div>
                <p className="text-sm text-[#849F8C] max-w-[220px] leading-relaxed">
                  Pause the video at any time to analyze the current frame and generate context.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/30 shrink-0">
            <div className="relative group">
              <input
                type="text"
                placeholder="Ask about this scene or command edit..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm outline-none focus:border-[#00FFA3]/50 focus:bg-white/10 focus:ring-1 focus:ring-[#00FFA3]/50 transition-all placeholder:text-white/30 text-white"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-transparent text-white/40 hover:text-[#00FFA3] hover:bg-[#00FFA3]/10 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
