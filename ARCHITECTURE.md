# STREAM IT! - Technical Architecture & Roadmap

## 1. Executive Summary
**STREAM IT!** is a next-generation media player that brings the power of AI to local video playback. By leveraging **WebAssembly (WASM)** for client-side processing and a modular **AI Plugin System**, it offers features like smart cropping, real-time context explanation, and natural language video editing without heavy server-side costs.

---

## 2. Technical Stack

### Core Framework
- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router) for a robust, server-rendered React framework.
- **Language**: **TypeScript** for type safety and maintainability.
- **Styling**: **Tailwind CSS** for utility-first styling, enabling the custom Glassmorphism aesthetic.
- **State Management**: **Zustand** (lightweight, high performance) or **React Context** for global player state.

### Media Processing & AI (Client-Side First)
- **Video Engine**: [FFmpeg.wasm](https://ffmpegwasm.netlify.app/)
  - *Role*: Handles video decoding, frame extraction, transcoding, and trimming directly in the browser.
- **Computer Vision**: [MediaPipe](https://developers.google.com/mediapipe) (for object detection/tracking) or [Transformers.js](https://huggingface.co/docs/transformers.js/index) (for on-device ML/LLM tasks).
- **Concurrency**: **Web Workers**
  - *Role*: Offloads heavy FFmpeg and AI inference tasks from the main thread to ensure UI smoothness (60fps).

### Backend / API (Optional/Hybrid)
- **API Routes**: Next.js API routes for lightweight metadata fetching or proxying requests to external powerful LLMs (e.g., GPT-4o, Gemini Pro Vision) when local models aren't enough.
- **Database**: LocalStorage/IndexedDB for user preferences and "Project" persistence (edits, clips).

---

## 3. Data Pipeline: "Explain IT!" Feature

### Overview
Low-latency frame analysis to provide context about the current scene.

1.  **Trigger**: User clicks "Explain This Scene" or pauses.
2.  **Capture**:
    - The `<video>` element frame is drawn to an `OffscreenCanvas` (via Web Worker).
    - Image data is extracted as a Blob/Bitmap.
3.  **Preprocessing**:
    - Downsample image (e.g., 720p -> 360p) to reduce payload size.
    - Convert to base64 or tensor format.
4.  **Inference**:
    - **Tier 1 (Local)**: Send to local MediaPipe/Transformers.js model for fast object detection (e.g., "Person", "Car").
    - **Tier 2 (Cloud - Optional)**: If deeper context is needed (e.g., "Who is this actor and what is that historical prop?"), send the frame to an external Vision LLM API.
5.  **Response**:
    - Metadata is returned and overlaid on the video using smooth SVG/Canvas layers.

---

## 4. UI/UX Design System: "Eco-Glass"

### Aesthetic
- **Glassmorphism**: High-blur backdrops (`backdrop-filter: blur(20px)`), thin semi-transparent borders (white/teal opacity), and subtle shadows.
- **Palette**:
  - **Primary**: Deep Forest Green / Black (Backgrounds)
  - **Accents**: `LuxeGreen` (Glows), `Rich Sage` (UI Elements), `Cheek White` (Text/Icons).
- **Layout**:
  - **Center Stage**: The video player takes up 80-90% of the screen.
  - **Floating Controls**: Playback controls hover at the bottom, disappearing when inactive.
  - **Context Sidebar**: A collapsible right-side panel for AI insights and chat.

---

## 5. MVP Roadmap (4-Week Sprint)

### Week 1: Foundation & Player
- [ ] Initialize Next.js + Tailwind project.
- [ ] Implement basic Glassmorphism Layout & Design System.
- [ ] Build a robust Custom Video Player (Play/Pause, Seek, Volume).
- [ ] **Milestone**: A beautiful, custom-skinned video player playing a local sample file.

### Week 2: The Core Engine (FFmpeg.wasm)
- [ ] Integrate `ffmpeg.wasm`.
- [ ] Set up Web Worker architecture for non-blocking operations.
- [ ] Implement foundational video manipulation: Load local file -> Extract a screenshot.
- [ ] **Milestone**: User can load a generic video file and take a snapshot instantly.

### Week 3: "Explain IT!" (Vision Pipeline)
- [ ] Implement `OffscreenCanvas` frame capture pipeline.
- [ ] Integrate a demo Vision API (or mock) to analyze the frame.
- [ ] Build the "Context Sidebar" to display results (Actor names, location info).
- [ ] **Milestone**: Pausing the video populates the sidebar with static/mocked analysis of the frame.

### Week 4: "Prompt-to-Edit" Prototype & Polish
- [ ] Build the "Prompt Box" UI.
- [ ] Implement basic NLP command parsing (e.g., "Cut last 5 seconds").
- [ ] Map commands to FFmpeg operations.
- [ ] Polish UI animations and transitions.
- [ ] **Milestone**: Functional "Pilot" release where a user can open a video and ask to cut a clip.

---
