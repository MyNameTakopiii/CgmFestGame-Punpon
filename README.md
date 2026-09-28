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

- 🎧 **TTS lyric snippets** with a strict, timer-enforced hard cutoff (no fading, no partial reveal past the limit)
- 🎯 **4-choice quiz engine** with unique, balanced distractors
- 🔥 **Streak & combo system** with visual fire badges
- 🎉 **Confetti + shake feedback** on correct/incorrect answers
- ⏱️ **Circular countdown ring** synced exactly to the TTS cutoff window
- 🏆 **Arcade-style ranking** (S / A / B / CGM48 Trainee) on the results screen
- 📋 **One-click "Copy Result"** for sharing scores on X / Facebook
- 🌿 **CGM48-branded design system** (forest mint / cream / gold palette)
- 💸 **Zero infrastructure cost** — 100% static, 100% client-side

---

## 🧱 Tech Stack

| Layer                     | Technology                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Framework                 | [React](https://react.dev/) + [Vite](https://vitejs.dev/) + TypeScript                                                      |
| Styling                   | [Tailwind CSS](https://tailwindcss.com/)                                                                                    |
| Package Manager & Runtime | [Bun](https://bun.sh/) (v1.1+)                                                                                              |
| Testing (Unit)            | [Bun Test](https://bun.sh/docs/cli/test)                                                                                    |
| Testing (E2E)             | [Playwright](https://playwright.dev/)                                                                                       |
| Animation                 | [Framer Motion](https://www.framer.com/motion/)                                                                             |
| Icons / UI primitives     | [Lucide React](https://lucide.dev/) + shadcn/ui-style components                                                            |
| Text-to-Speech            | Browser-native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (`window.speechSynthesis`) |
| State management          | [Zustand](https://zustand-demo.pmnd.rs/)                                                                                    |
| Celebration effects       | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)                                                            |
| Data source               | Static local JSON (`src/data/songs.json`)                                                                                   |
| Hosting                   | Vercel or Cloudflare Pages (free tier)                                                                                      |

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
├── public/
├── src/
│   ├── components/
│   │   ├── ListenButton.tsx      # Central play button + pulse animation
│   │   ├── TimerRing.tsx          # Circular countdown synced to TTS cutoff
│   │   ├── AnswerGrid.tsx          # 2x2 multiple-choice quiz buttons
│   │   ├── HUD.tsx                  # Round indicator, score, streak badge
│   │   └── ResultCard.tsx            # End-game rank + share card
│   ├── engine/
│   │   ├── lyricSampler.ts             # Snippet selection + keyword blocker
│   │   ├── ttsEngine.ts                 # speak() / hardStop() wrapper
│   │   ├── distractors.ts                # Answer choice generation
│   │   └── scoring.ts                     # Streak/multiplier/rank logic
│   ├── store/
│   │   └── gameStore.ts                    # Zustand store (round/score/mode/timer)
│   ├── data/
│   │   └── songs.json                        # CGM48 song + lyric database
│   ├── App.tsx
│   └── main.tsx
├── SCOPE.md
├── README.md
├── package.json
└── vite.config.ts
```

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

| Field   | Type                                  | Description                                                        |
| ------- | ------------------------------------- | ------------------------------------------------------------------ |
| `id`    | `string`                              | Unique, stable slug (e.g. `cgm_01`)                                |
| `title` | `string`                              | Official song title in Thai                                        |
| `type`  | `"single" \| "coupling" \| "theater"` | Used to balance distractor selection                               |
| `lines` | `string[]`                            | Ordered lyric lines the sampler can draw consecutive snippets from |

**Guidelines when adding entries:**

- Include at least 3–4 `lines` per song so the sampler has enough material to build snippets that reliably exceed the 3s/5s cutoff.
- Avoid lines that contain the song title verbatim as your _only_ available lines — the keyword blocker will filter them out, and a song with no valid lines left will be skipped by the sampler.
- Keep `id`s stable once shipped; other systems (and future save data) may reference them.

---

## 🏗️ Architecture

### Game Loop

```
Select Mode (Easy/Hard/Endless)
        │
        ▼
 lyricSampler.ts ──► pick song + valid snippet (keyword-blocked)
        │
        ▼
  ttsEngine.ts ──► speak snippet, hard-stop via setTimeout + speechSynthesis.cancel()
        │
        ▼
 distractors.ts ──► generate 4 shuffled answer choices
        │
        ▼
   AnswerGrid.tsx ──► player selects → instant feedback → scoring.ts updates score/streak
        │
        ▼
   Repeat for 10 rounds ──► ResultCard.tsx (rank, share card)
```

### State Management

`gameStore.ts` (Zustand) is the single source of truth for:

- Current round number and total rounds
- Score, streak, and combo multiplier
- Current mode (Easy / Hard / Endless)
- TTS playback state (idle / speaking / cut-off) and replay-used flag
- Session song pool (songs already used, to avoid repeats within a session)

### Audio / TTS Engine

`ttsEngine.ts` wraps `window.speechSynthesis`:

1. Builds a `SpeechSynthesisUtterance` for the sampled snippet, with `lang = "th-TH"`.
2. Calls `speechSynthesis.speak(utterance)`.
3. Starts a `setTimeout` for exactly 3,000ms (Hard) or 5,000ms (Easy).
4. On timeout, force-calls `speechSynthesis.cancel()` — a true hard stop regardless of how much of the utterance has played.
5. Emits playback state changes so `ListenButton.tsx` and `TimerRing.tsx` can animate in sync.

---

## 🛠️ Development Notes

- **Thai voice availability:** `window.speechSynthesis.getVoices()` populates asynchronously in most browsers. Listen for the `voiceschanged` event before attempting the first playback, and gracefully handle the case where no `th-TH` voice is installed (show a notice; consider a fallback voice).
- **Browser quirks:** Speech Synthesis timing and voice availability differ across Chrome, Firefox, and Safari (especially iOS Safari). Test the hard-cutoff timing on each target browser — some engines have startup latency that can shift the effective cutoff.
- **Snippet duration heuristic:** Line/snippet selection in `lyricSampler.ts` uses an estimated speech duration (approximate ms per Thai character/syllable cluster) to ensure the sampled snippet is long enough that the timer — not the natural end of speech — is what cuts it off. Tune this constant if cutoffs feel inconsistent.
- **Reduced motion:** Respect `prefers-reduced-motion` in Framer Motion configs — fall back to simple fades instead of bounce/shake effects.

---

## ☁️ Deployment

The app is a static Vite build with zero backend dependencies, so it deploys to any static host's free tier.

### Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo directly in the Vercel dashboard for automatic deploys on push.

### Cloudflare Pages

1. Push the repo to GitHub.
2. In the Cloudflare Pages dashboard, create a new project from the repo.
3. Build command: `npm run build`
4. Output directory: `dist`

No environment variables or secrets are required — there are no external API keys in this project.

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
