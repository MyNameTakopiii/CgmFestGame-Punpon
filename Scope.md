# CGM48 Lyric Guess — Project Scope & Design System

> **Codename:** CGM48 Lyric Guess
> **Type:** Client-side arcade/party guessing game
> **Status:** Pre-production / Scope Draft v1.0

---

## 1. Executive Summary

CGM48 Lyric Guess is a browser-based party game where a random lyric snippet from a CGM48 song is read aloud by a synthesized "robot" voice (via the native Web Speech API) and abruptly cut off after 3 or 5 seconds. Players race against the clock to identify the correct song title from four multiple-choice options.

The entire experience is **100% client-side**: no backend server, no database, no paid API keys, and no audio files to host. Text-to-speech, game state, scoring, and sharing are all handled in-browser, making the app trivially deployable to any static host free tier (Vercel, Cloudflare Pages, Netlify, GitHub Pages).

### 1.1 Goals

| Goal                | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| Zero-cost operation | No recurring infra cost — static hosting + browser-native APIs only   |
| Fast rounds         | Each round resolves in under ~15 seconds, encouraging replayability   |
| Fair difficulty     | Keyword blocking prevents trivial answers (title leakage in lyric)    |
| Idol-brand feel     | Visual identity should feel distinctly CGM48 — fresh, green, youthful |
| Shareable results   | End screen produces a copy-pasteable result card for social posting   |

### 1.2 Non-Goals (v1)

- No user accounts, login, or persistent cloud leaderboard
- No real recorded audio clips (avoids licensing/copyright issues — TTS only)
- No mobile native app (PWA-friendly web app only)
- No multiplayer/real-time sync (local single-player or pass-the-device party play)

---

## 2. Target Audience

- CGM48 fangroup community members (Thai-speaking, primarily)
- Party/event hosts running trivia nights or fan meetups
- Casual quiz-game players interested in idol/J-pop/T-pop trivia formats

---

## 3. Game Design Specification

### 3.1 Core Loop

```
Start Game → Select Mode (Easy/Hard/Endless)
  → Round N: Pick random song → Pick lyric snippet → Speak (TTS, hard cutoff)
    → Player selects 1 of 4 choices → Instant feedback (correct/wrong)
    → Update score/streak → Next round
  → After 10 rounds → Summary Screen → Rank + Share
```

### 3.2 Game Modes

| Mode                                    | Snippet Duration  | Notes                                                                    |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------ |
| **Easy**                                | 5 seconds         | Recommended default; more forgiving cutoff                               |
| **Hard**                                | 3 seconds         | Aggressive cutoff, higher score multiplier                               |
| **Endless / Practice** (optional bonus) | Player-selectable | No round limit, no rank scoring, used for practice/learning song catalog |

### 3.3 Lyric Sampling Algorithm

1. Randomly select one song object from `songs.json`.
2. From `song.lines`, select 1–2 **consecutive** lines such that the estimated TTS speech duration exceeds the mode's cutoff threshold (so the cutoff always actually truncates speech — avoids "silence" edge cases).
3. **Keyword Blocker:** discard any candidate line(s) that contain a substring of the song title (case-insensitive, Thai + Latin normalization) to prevent trivial giveaways. If all candidate lines are blocked, fall back to the next valid pair; if none qualify, exclude the song from the current pool for this session.
4. Estimate duration heuristically (e.g., ~180–220ms per Thai syllable/character cluster, tunable constant) to decide how many lines are needed to safely exceed the cutoff window before truncation.

### 3.4 Answer Choice Generation

- 1 correct answer (the target song title)
- 3 distractors, randomly sampled from the remaining song pool, **unique**, no duplicate titles, shuffled with the correct answer into the 4-option layout.
- Distractor pool should prefer same `type` (single/coupling/theater) when possible for balanced difficulty, falling back to any song if the pool is too small.

### 3.5 Audio Playback Engine

- Uses `window.speechSynthesis` with a Thai voice (`lang: "th-TH"`); falls back gracefully (with a UI notice) if no Thai voice is available in the browser/OS.
- Playback flow:
  1. Construct `SpeechSynthesisUtterance` from the selected lyric snippet.
  2. Call `speechSynthesis.speak(utterance)`.
  3. Start a `setTimeout` for exactly 3,000ms or 5,000ms (per mode).
  4. On timeout, call `speechSynthesis.cancel()` — hard stop, no fade.
  5. Visual "Listening" pulse/waveform animates around the Listen button for the full duration, ending in sync with the cutoff.
- **Replay Limiter:** optional 1 replay per question, with a defined score penalty (e.g., −20% of round's potential points) applied if used.
- Timer, playback state, and cutoff must stay in sync even if the TTS engine finishes speaking early (no lyric line should be shorter than the cutoff, per §3.3).

### 3.6 Scoring & Streaks

- Base points per correct answer (Hard mode weighted higher than Easy).
- **Streak counter:** consecutive correct answers increase a combo multiplier; broken on first wrong answer.
- Score ticker and round indicator ("Question 3 of 10") always visible during play.

### 3.7 Feedback & Game Feel

| Event                                    | Visual                                          | Motion                                      |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Correct answer                           | Green flash, confetti burst (`canvas-confetti`) | Bounce/scale pop on selected card           |
| Wrong answer                             | Red tint, subtle shake                          | Shake animation (Framer Motion `keyframes`) |
| Streak milestone (e.g. 3, 5, 8 in a row) | Fire/combo badge appears                        | Badge pop-in with glow                      |
| Button interactions                      | Punchy hover/press states                       | Scale down on press, spring back on release |

### 3.8 Result Screen

- Final score, accuracy % (correct/10), longest streak achieved.
- **Rank system** (example thresholds, tune during playtesting):

| Rank              | Criteria (example) |
| ----------------- | ------------------ |
| **S Rank**        | 90–100% accuracy   |
| **A Rank**        | 75–89% accuracy    |
| **B Rank**        | 50–74% accuracy    |
| **CGM48 Trainee** | Below 50% accuracy |

- Rank badge with distinct color/icon per tier.
- **"Share Result" card:** auto-generated summary text formatted for X/Facebook (e.g., `I scored S Rank (9/10) on CGM48 Lyric Guess! 🎧🌿 Can you beat me?`), plus a "Copy to Clipboard" button using the Clipboard API.

---

## 4. Visual Theme & UI/UX Design System

### 4.1 Brand Identity

CGM48's aesthetic centers on fresh nature tones evoking Northern Thai / Chiang Mai greenery — clean, playful, youthful, idol-inspired.

### 4.2 Color Palette

| Token                  | Hex                     | Usage                                                  |
| ---------------------- | ----------------------- | ------------------------------------------------------ |
| `--color-primary`      | `#83B89E`               | Primary buttons, active states, headers                |
| `--color-primary-dark` | `#589873`               | Hover/pressed states, borders, emphasis text           |
| `--color-bg`           | `#FAFDF9`               | App background                                         |
| `--color-surface`      | `#E9F5EE`               | Cards, panels, secondary surfaces                      |
| `--color-accent-gold`  | `#F2C94C` _(suggested)_ | High-score highlights, S-Rank badge, streak fire badge |
| `--color-danger`       | `#E4685D` _(suggested)_ | Wrong-answer feedback, shake tint                      |
| `--color-success`      | `#4CAF7D` _(suggested)_ | Correct-answer flash, confirmation states              |
| `--color-text`         | `#1F2E27` _(suggested)_ | Primary text on light surfaces                         |

> Gold/sunlight accents are reserved for celebratory or high-score moments only — not for standard UI chrome — to keep them meaningful.

### 4.3 Typography

- Headings: rounded, friendly sans-serif (e.g., "Baloo 2", "Kanit", or "Prompt" — all support Thai glyphs well and read as youthful/idol-appropriate).
- Body: a clean, highly legible Thai-supporting sans-serif (e.g., "Noto Sans Thai", "IBM Plex Sans Thai").
- Numerals (score/timer) may use a slightly bolder tabular-figure style for readability during fast countdown moments.

### 4.4 Layout & Components

- **Listen Button:** central, large, circular; animated pulse/wave rings emanate outward while speaking; disabled state after playback completes (until next round or replay).
- **Countdown/Timer Ring:** circular SVG progress ring depleting over the 3s/5s window, color-shifts from primary green → gold as it nears zero (urgency cue).
- **Answer Grid:** 2×2 grid of bold, rounded quiz buttons (shadcn/ui-style cards); each has a distinct hover/press micro-interaction; disabled instantly on selection to prevent double-answers.
- **HUD (Heads-Up Display):** persistent top bar showing round indicator ("Q3/10"), running score, and streak badge.
- **Result Card:** portrait-oriented card suitable for screenshotting/sharing, featuring rank badge, score, accuracy, and streak, styled with the brand palette.

### 4.5 Motion Principles

- Micro-interactions should feel "punchy" and bouncy — favor spring-based easing (Framer Motion `type: "spring"`) over linear/ease-in-out for buttons and badges.
- Keep motion durations short (150–300ms) for responsiveness; reserve longer celebratory animations (confetti, rank reveal) for the result screen only.
- Respect `prefers-reduced-motion` — provide a reduced-motion fallback (fades instead of bounces/shakes).

### 4.6 Accessibility Notes

- All color-coded feedback (correct/wrong) must be paired with non-color cues (icon, shake, text label) for color-blind accessibility.
- Ensure sufficient contrast between text and the pale mint/cream surfaces (verify against WCAG AA).
- TTS-dependent gameplay should include a visible on-screen transcript toggle option for accessibility/testing purposes (hidden by default to preserve the guessing challenge).

---

## 5. Technical Specification

### 5.1 Stack

| Layer                     | Choice                                        |
| ------------------------- | --------------------------------------------- |
| Runtime & Package Manager | Bun (v1.1+)                                   |
| Framework                 | React (Vite) + TypeScript                     |
| Styling                   | Tailwind CSS v4                               |
| Testing (Unit)            | Bun Test                                      |
| Testing (E2E)             | Playwright                                    |
| Animation                 | Framer Motion                                 |
| Icons/UI                  | Lucide React + custom glassmorphic components |
| Audio/TTS                 | Web Speech API (`window.speechSynthesis`)     |
| State                     | Zustand (cross-component game state)          |
| Celebration FX            | `canvas-confetti`                             |
| Data                      | Static local JSON (`src/data/songs.json`)     |
| Deployment                | Vercel or Cloudflare Pages (free tier)        |

### 5.2 Data Schema — `songs.json`

```json
[
  {
    "id": "cgm_01",
    "title": "Chiang Mai 106",
    "group": "CGM48",
    "type": "single",
    "year": "2020",
    "lines": [
      "หนาว ยังมีวันเหือดหาย น้ำค้างเกาะพรายบนยอดหญ้า",
      "มีเรื่องราวมากมายที่ยังคงตราตรึงอยู่ในใจ",
      "เรื่องราวการเดินทางของเรากำลังเริ่มต้น",
      "ยังคงอยู่ในใจเสมอ"
    ]
  }
]
```

| Field   | Type                                           | Notes                                                   |
| ------- | ---------------------------------------------- | ------------------------------------------------------- |
| `id`    | `string`                                       | Unique slug, stable across edits                        |
| `title` | `string`                                       | Official song title (Thai & Romaji)                     |
| `group` | `"CGM48" \| "BNK48"`                           | Idol group tag                                          |
| `type`  | `"single" \| "coupling" \| "stage" \| "album"` | Used for distractor pool balancing                      |
| `year`  | `string`                                       | Release year                                            |
| `lines` | `string[]`                                     | Ordered lyric lines; sampling picks consecutive subsets |

### 5.3 Suggested Module Breakdown

```
src/
  components/
    ListenButton.tsx
    TimerRing.tsx
    AnswerGrid.tsx
    HUD.tsx
    ResultCard.tsx
  engine/
    lyricSampler.ts     # snippet selection + keyword blocker
    ttsEngine.ts         # speak() / hardStop() wrapper around speechSynthesis
    distractors.ts        # answer choice generation
    scoring.ts             # streak/multiplier/rank logic
  store/
    gameStore.ts            # Zustand store: round, score, streak, mode, timer state
  data/
    songs.json
  App.tsx
```

### 5.4 Key Technical Risks & Mitigations

| Risk                                                                       | Mitigation                                                                                                              |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Thai voice unavailable on some browsers/OSes                               | Detect via `speechSynthesis.getVoices()`; show fallback notice; consider allowing a non-Thai voice as degraded fallback |
| `speechSynthesis` behaves inconsistently across browsers (esp. Safari/iOS) | Test cutoff timing across Chrome, Firefox, Safari; add a small buffer before hard `.cancel()` if needed                 |
| Speech duration estimate inaccurate, causing early silence before cutoff   | Tune the per-character duration heuristic empirically; prefer slightly longer snippets over risking premature silence   |
| Voices list loads asynchronously                                           | Listen for `voiceschanged` event before first playback attempt                                                          |

### 5.5 Out of Scope for v1 (Future Considerations)

- Real-time multiplayer / online leaderboards (would require backend — breaks "zero backend" constraint)
- Licensed audio playback (legal/licensing complexity — TTS-only avoids this)
- Native mobile app packaging

---

## 6. After Party Photobooth & Mobile Remote Camera Specification

> **Feature Type:** Fan-Made 3-Cut Keepsake Photobooth (ตู้สติกเกอร์ 3 ช่องที่ระลึก)  
> **Status:** Production Ready (v1.1)

### 6.1 Feature Overview

The **After Party Photobooth** is an interactive souvenir feature embedded into the CGM48 Lyric Guess arcade experience. Inspired by traditional Japanese Purikura and Korean 3-Cut / 4-Cut photo strips, it allows fans to capture a 3-shot sequence, customize it with official CGM48 & Punpon After Party themes, and instantly save or share the keepsake.

### 6.2 3-Cut Sticker Strip Themes

| Theme ID | Name | Frame Art & Style | Dynamic Text Support |
| :--- | :--- | :--- | :--- |
| `punpon_sticker` | **Punpon Sticker (Mint Green)** | Solid CGM48 Mint `#49c5a8`, white photo borders, soft drop shadows, official Punpon logo & hashtag | ✅ Dynamic top header text (up to 32px equivalent) |
| `ge_sticker` | **General Election Special** | Official 35mm filmstrip artwork from CGM48 General Election | ❌ Fixed official artwork |
| `afterschool` | **After School Class** | Pastel classroom & after-school souvenir frame | ❌ Fixed official artwork |

### 6.3 Dual-Capture Architecture: PC Webcam vs Mobile Companion

Users can capture their 3 shots through two distinct modes:

```
                  ┌──────────────────────────────────────────────┐
                  │           Computer Display (Host)            │
                  │   PolaroidModal / SequenceViewfinder / Strip  │
                  └───────────────▲──────────────▲───────────────┘
                                  │              │
                   (WebRTC PeerJS)│              │(Direct getUserMedia)
                                  │              │
                  ┌───────────────┴──┐       ┌───┴──────────────┐
                  │ Mobile Companion │       │    PC Webcam     │
                  │  (4G/5G or WiFi) │       │  (Built-in / USB)│
                  └──────────────────┘       └──────────────────┘
```

1. **Computer Webcam Mode (`SequenceViewfinder`):** Direct in-browser camera feed with 3s countdown and 2s pose-change intervals between shots.
2. **Mobile Companion Mode (`MobileCameraView`):**
   - Host generates a unique room ID and renders a QR code.
   - User scans the QR code with their mobile phone (works over 4G/5G cellular data or Wi-Fi without needing same-network LAN).
   - Instant P2P communication is established via **WebRTC DataChannel (`peerjs`)** alongside a fallback **`BroadcastChannel`** for same-browser testing.

### 6.4 Front & Rear Camera Switching (`switchCamera`)

- Mobile camera view provides a one-tap camera toggle button (`RotateCcw`) with clear status badge ("กล้องหน้า" vs "กล้องหลัง").
- When toggling:
  1. Active MediaStream tracks are explicitly terminated (`track.stop()`) to release the hardware sensor.
  2. A new `getUserMedia` request is executed with `{ facingMode: { exact: nextMode } }`, falling back to `{ facingMode: nextMode }`.
  3. Video preview and snapshot canvas dynamically toggle mirror transformations:
     - **Front Camera (`user`):** Horizontal flip (`scale-x-[-1]`, canvas `scale(-1, 1)`) for intuitive mirror reflection.
     - **Rear Camera (`environment`):** Natural unmirrored perspective (`scale-x-100`, direct canvas draw).

### 6.5 WebRTC DataChannel Payload Optimization

To ensure instantaneous transmission across cellular networks and eliminate packet drops caused by SCTP DataChannel limits (64KB–256KB):
- Captured video frames are scaled down to a maximum width of **960px** at **JPEG quality 0.78**.
- The resulting payload size is reduced to **~35KB–45KB**, allowing immediate transmission within a single network packet.
- Completion signaling (`COMPLETE`) is sent as a lightweight command message, allowing the Host to assemble the final strip from the accumulated slots without redundant multi-megabyte payload bursts.

### 6.6 Real-Time PC Live Preview & Auto-Transition

1. **Real-Time Live Preview on Host:**
   - As each shot is captured on mobile, the Host receives the snap within milliseconds.
   - Host UI immediately showcases an animated, prominent **Live Preview Card** of the latest shot with a celebratory badge (`ช็อตที่ N ได้รับแล้ว! 🎉`).
   - The 3-slot filmstrip tracker displays thumbnail previews and green checkmarks.
2. **Auto-Transition:**
   - Upon receiving the 3rd shot or `COMPLETE` signal, the Host automatically transitions from the viewfinder to the **Strip Assembly (`generating`)** phase.
   - Within 500ms, the composite canvas generates the final 3-cut strip and presents the **PhotoStripCard** containing download controls and mobile download QR codes.

### 6.7 Storage & Cross-Device Download System

- **Cloudinary Direct Upload (Optional):** If `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are configured in `.env`, the composite photo strip is uploaded directly from the client to Cloudinary via unsigned REST API. A short public CDN URL is encoded into a download QR code.
- **Local In-Memory Fallback:** If Cloudinary credentials are not configured, the app seamlessly falls back to storing the data URL in local memory (`uploadService.ts`), providing an in-app download view without crashing.

