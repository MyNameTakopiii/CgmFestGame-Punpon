# 🌿 CGM48 Lyric Guess

A free, client-side arcade guessing game where you race to identify a CGM48 song from a 3-or-5-second robot-voiced lyric snippet.

![status](https://img.shields.io/badge/status-pre--production-lightgrey) ![stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20TS-83B89E)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Adding Songs](#-adding-songs)
- [Architecture](#-architecture)
- [Development Notes](#-development-notes)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎮 Overview

**CGM48 Lyric Guess** plays a short, TTS-narrated lyric snippet from a random CGM48 song and cuts it off abruptly after 3 (Hard) or 5 (Easy) seconds. Players pick the correct song title from 4 multiple-choice options across 10 rounds, building streaks and racing the clock for a final rank — from **CGM48 Trainee** up to **S Rank**.

The whole app runs **entirely in the browser**:

- No backend server
- No database
- No paid third-party APIs
- Text-to-speech via the native **Web Speech API**
- Deployable for free on Vercel, Cloudflare Pages, or Netlify

See [`SCOPE.md`](./SCOPE.md) for the full game design, UI/UX design system, and technical specification this project is built against.

---

## ✨ Features

### 🎮 CGM48 Lyric Guess Game
- 🎧 **TTS lyric snippets** with a strict, timer-enforced hard cutoff (no fading, no partial reveal past the limit)
- 🎯 **4-choice quiz engine** with unique, balanced distractors
- 🔥 **Streak & combo system** with visual fire badges
- 🎉 **Confetti + shake feedback** on correct/incorrect answers
- ⏱️ **Circular countdown ring** synced exactly to the TTS cutoff window
- 🏆 **Arcade-style ranking** (S / A / B / CGM48 Trainee) on the results screen
- 📋 **One-click "Copy Result"** for sharing scores on X / Facebook
- 🌿 **CGM48-branded design system** (forest mint / cream / gold palette)
- 💸 **Zero infrastructure cost** — 100% static, 100% client-side

### 📸 After Party Photobooth (3-Cut Pro)
- 🎞️ **3-Cut Sticker Strips**: Classic photo strips with authentic CGM48 frames (Punpon Mint Green, General Election 35mm, After School Class)
- 📱 **Mobile Companion Camera**: Scan a QR code to use your smartphone as a wireless HD remote camera over 4G/5G/Wi-Fi
- 🔄 **Front/Back Camera Toggle**: Seamless switching between selfie and rear cameras with proper mirror handling
- 📸 **Mobile-First 3-Shot Capture**: Take all 3 shots on mobile first without network dropouts, inspect in a review screen, and tap to send to PC in batch
- ⚡ **Dual-Channel Cloud & WebRTC Sync**: Guaranteed delivery combining WebRTC P2P DataChannel with parallel Cloudinary sync to bypass carrier NAT limitations
- 🪄 **Dynamic Header Typography**: Customize top header text in 32px bold lettering
- ☁️ **QR Code Cross-Device Download**: Direct Cloudinary CDN upload or local in-memory fallback for instant smartphone photo saving

---

## 🧱 Tech Stack

| Layer                     | Technology                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework                 | [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript                                                      |
| Styling                   | [Tailwind CSS v4](https://tailwindcss.com/)                                                                                 |
| Package Manager & Runtime | [Bun](https://bun.sh/) (v1.1+)                                                                                              |
| P2P Remote Camera         | WebRTC DataChannel via [PeerJS](https://peerjs.com/) + BroadcastChannel API                                                 |
| Media Capture             | Browser-native [MediaDevices API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) (`getUserMedia`) |
| Image Generation          | Client-side HTML5 Canvas Compositor (Bespoke 3-cut strip renderer)                                                          |
| Cloud Storage (Optional)  | [Cloudinary](https://cloudinary.com/) (Direct Unsigned REST Upload) + In-Memory Fallback Store                               |
| Testing (Unit)            | [Bun Test](https://bun.sh/docs/cli/test)                                                                                    |
| Testing (E2E)             | [Playwright](https://playwright.dev/)                                                                                       |
| Animation                 | [Framer Motion](https://www.framer.com/motion/)                                                                             |
| Icons / UI primitives     | [Lucide React](https://lucide.dev/) + glassmorphic components                                                               |
| Text-to-Speech            | Browser-native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (`window.speechSynthesis`) |
| State management          | [Zustand](https://zustand-demo.pmnd.rs/)                                                                                    |
| Celebration effects       | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)                                                            |
| Data source               | Static local JSON (`src/data/songs.json`)                                                                                   |
| Hosting                   | Cloudflare Pages or Vercel (free tier)                                                                                      |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.1 or higher)
- A modern browser with Web Speech API support (Chromium-based browser, Safari, or Firefox)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-org>/cgm48-lyric-guess.git
cd cgm48-lyric-guess

# Install dependencies using Bun
bun install

# Start the development server
bun dev
```

The app will be available at `http://localhost:5173`.

### Testing

```bash
# Run unit tests (Bun test)
bun test

# Run automated end-to-end tests (Playwright)
bun run test:e2e
```

### Build for Production

```bash
bun run build
bun run preview   # preview the production build locally
```

### Available Scripts

| Script                 | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `bun dev`              | Start local Vite dev server with hot reload                  |
| `bun test`             | Run fast unit tests with Bun's built-in test runner          |
| `bun run test:e2e`     | Run automated Playwright end-to-end tests                    |
| `bun run format`       | Format entire codebase using Prettier                        |
| `bun run format:check` | Check code formatting compliance                             |
| `bun run build`        | Type-check and produce optimized production build in `dist/` |
| `bun run preview`      | Serve the production build locally                           |
| `bun run lint`         | Run code linter                                              |

---

## 📁 Project Structure

```
cgm48-lyric-guess/
├── public/                           # Static assets, official frames & mascot art
├── src/
│   ├── app/                          # App bootstrap & global layout
│   │   ├── App.tsx                   # Main layout + mobile companion routing
│   │   └── main.tsx                  # React DOM entry point
│   ├── features/
│   │   ├── quiz/                     # Lyric Guess core game feature
│   │   │   ├── components/           # HUD, AnswerGrid, ListenButton, ResultCard, TimerRing
│   │   │   ├── hooks/                # useGameSession, useAudioPlayer, useKeyboardControls
│   │   │   ├── services/             # distractorService, lyricService, scoringService, ttsService
│   │   │   └── store/                # gameStore (Zustand)
│   │   ├── photobooth/               # 3-Cut Pro After Party Photobooth feature
│   │   │   ├── components/
│   │   │   │   ├── CameraViewfinder.tsx   # Direct webcam viewfinder
│   │   │   │   ├── MobileCameraView.tsx   # Wireless companion camera UI for mobile
│   │   │   │   ├── MobileDownloadView.tsx # Mobile photo strip download view
│   │   │   │   ├── OnScreenPolaroid.tsx   # Floating keepsake widget & launcher
│   │   │   │   ├── PhotoStripCard.tsx     # Result strip with QR code & themes
│   │   │   │   ├── PolaroidModal.tsx      # Main photobooth host modal
│   │   │   │   ├── QRCodeDisplay.tsx      # SVG QR code generator
│   │   │   │   ├── SequenceViewfinder.tsx # 3-shot automated sequence engine
│   │   │   │   └── TemplateSelector.tsx   # 3-Cut theme switcher
│   │   │   ├── hooks/
│   │   │   │   ├── useRemoteCamera.ts     # P2P WebRTC / BroadcastChannel remote sync
│   │   │   │   └── useWebcam.ts           # MediaDevices webcam & front/rear switcher
│   │   │   ├── services/
│   │   │   │   └── uploadService.ts       # Cloudinary REST upload & in-memory fallback
│   │   │   └── utils/
│   │   │       └── photoStripGenerator.ts # Bespoke 3-cut canvas compositor
│   │   └── decorations/              # Background stars, Boiled Egg mascot
│   ├── shared/                       # Design system primitives (Button, Card, Modal, Badge)
│   ├── data/
│   │   └── songs.json                # CGM48 song catalog
│   └── index.css                     # Tailwind CSS v4 design tokens
├── SCOPE.md                          # Full game design & photobooth specifications
├── REFACTOR.md                       # Clean Architecture migration guide
└── README.md
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` to configure optional third-party integrations:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_CLOUDINARY_CLOUD_NAME` | No | Cloudinary Cloud Name for hosting photo strips for mobile QR download |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | No | Unsigned upload preset name configured in Cloudinary |

*(Note: If left unconfigured, the photobooth will automatically use local in-memory fallback URLs without crashing).*

---

## 🎵 Adding Songs

All game content lives in `src/data/songs.json`. Each entry follows this schema:

```json
{
  "id": "cgm_01",
  "title": "Chiang Mai 106",
  "type": "single",
  "lines": [
    "บนถนนที่ยาวไกล มีต้นยางสูงใหญ่",
    "เรื่องราวการเดินทางของเรากำลังเริ่มต้น",
    "ยังคงอยู่ในใจเสมอ"
  ]
}
```

---

## 🏗️ Architecture

### 1. Game Loop

```
Select Mode (Easy/Hard/Endless)
        │
        ▼
 lyricService.ts ──► pick song + valid snippet (keyword-blocked)
        │
        ▼
   ttsService.ts ──► speak snippet, hard-stop via setTimeout + speechSynthesis.cancel()
        │
        ▼
distractorService.ts ──► generate 4 balanced shuffled answer choices
        │
        ▼
  AnswerGrid.tsx ──► player selects → instant feedback → scoringService.ts updates score
        │
        ▼
  Repeat for 10 rounds ──► ResultCard.tsx (rank, share card)
```

### 2. After Party Photobooth & Mobile Remote Camera

```
  [Mobile Smartphone Camera]
              │
  (Local 3-Shot Sequence + Front/Rear Switch)
              │
  (In-Phone Review & Confirmation)
              │
  (Dual-Sync: WebRTC DataChannel + Parallel Cloudinary Sync)
              ▼
  [PC Host: PhotoStripCard]
              │
  (3-Cut Bespoke Canvas Compositor)
              │
              ├──► Direct Save as PNG
              └──► Cloudinary CDN Upload ──► QR Code for Mobile Download
```

---

## 🛠️ Development Notes

- **Thai voice availability:** `window.speechSynthesis.getVoices()` populates asynchronously in most browsers. Listen for the `voiceschanged` event before attempting the first playback, and gracefully handle the case where no `th-TH` voice is installed (show a notice; consider a fallback voice).
- **Browser quirks:** Speech Synthesis timing and voice availability differ across Chrome, Firefox, and Safari (especially iOS Safari). Test the hard-cutoff timing on each target browser — some engines have startup latency that can shift the effective cutoff.
- **Snippet duration heuristic:** Line/snippet selection in `lyricSampler.ts` uses an estimated speech duration (approximate ms per Thai character/syllable cluster) to ensure the sampled snippet is long enough that the timer — not the natural end of speech — is what cuts it off. Tune this constant if cutoffs feel inconsistent.
- **Reduced motion:** Respect `prefers-reduced-motion` in Framer Motion configs — fall back to simple fades instead of bounce/shake effects.

---

## ☁️ Deployment

The app is a static Vite build with zero backend dependencies, so it deploys to any static host's free tier.

### Cloudflare Pages (Recommended)

1. Push the repository to GitHub.
2. In the **Cloudflare Pages** dashboard, select **Create Application** > **Pages** > **Connect to Git**.
3. Configure build settings:
   - **Framework preset:** Vite / None
   - **Build command:** `bun run build` (or `npm run build`)
   - **Build output directory:** `dist`
4. **Environment Variables (For QR Code Mobile Downloads):**
   Go to **Settings** > **Environment Variables** (Production) and add:
   - `VITE_CLOUDINARY_CLOUD_NAME`: your Cloudinary cloud name (e.g. `dx7p5ij0z`)
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: unsigned upload preset (e.g. `photobooth_preset`)
   *(Note: If omitted, the app will continue to run using the built-in local in-memory fallback store).*

### Vercel

```bash
npm install -g vercel
vercel
```
Or connect the GitHub repo directly in the Vercel dashboard for automatic deploys on push.

---

## 🗺️ Roadmap

- [ ] Core game loop (Easy/Hard modes, 10 rounds)
- [ ] Keyword blocker + snippet sampler
- [ ] Scoring, streaks, and rank system
- [ ] Result screen with shareable card
- [ ] Endless/Practice mode
- [ ] Expanded `songs.json` catalog covering full CGM48 discography
- [ ] PWA support (installable, offline-capable via cached JSON + cached voices)

---

## 📄 License

This is a fan-made, non-commercial project. CGM48 is a trademark of its respective owners; this project is not affiliated with or endorsed by CGM48 or its management. Song titles and lyric excerpts are used solely for the purposes of this guessing game (via text-to-speech, not recorded audio) and remain the property of their original rights holders.
