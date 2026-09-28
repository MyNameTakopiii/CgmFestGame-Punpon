# Clean Architecture Refactoring Guide — CGM48 Lyric Guess

## 1. Architectural Analysis: Current Issues & Why Refactor

The initial implementation achieved 100% test coverage and functional completeness, but its structure suffered from several common architectural antipatterns that hinder long-term scalability:

### 1.1 Flat Component Hierarchy

- **Issue**: All components (`StartScreen`, `ResultCard`, `HUD`, `AnswerGrid`, `ListenButton`, `TimerRing`, `TranscriptModal`, `VoiceNotice`) were dumped in a single flat `src/components/` directory.
- **Impact**: As the project grows (e.g. adding an idol profile gallery, song list browser, settings page), this directory becomes unmanageable. Screen-level components are mixed with microscopic primitives.

### 1.2 Tight Coupling of Presentation and Business Logic

- **Issue**: Components directly orchestrated global state mutations, speech synthesis timings, confetti bursts, and keybindings.
- **Impact**: UI components are harder to unit-test independently with Storybook or React Testing Library without mocking the whole world.

### 1.3 Missing Shared Design System Primitives

- **Issue**: Glassmorphic styles (`bg-stone-900/80 border border-emerald-500/30 backdrop-blur-md rounded-2xl...`), idol group tags (`CGM48` vs `BNK48`), and modal dialogs were coded with raw inline Tailwind classes repeatedly across multiple files.
- **Impact**: Inconsistent UI tweaks require changes in 5 different files; violations of the DRY (Don't Repeat Yourself) principle.

### 1.4 Direct Data Access in State Store

- **Issue**: `gameStore.ts` directly imported `songs.json`, bypassing any data access or repository abstraction.
- **Impact**: If songs need to be fetched from an API, cached in IndexedDB, or filtered dynamically, the core store would need to be rewritten.

---

## 2. Target Clean Architecture Structure

The application has been restructured into a modular, **Feature-Based Clean Architecture**:

```
src/
├── app/                              # Application bootstrap, routing & global shell
│   ├── App.tsx                       # Main application layout & feature mounting
│   └── main.tsx                      # React DOM root entry point
│
├── features/                         # Domain-driven feature modules
│   └── quiz/                         # The Lyric Guess Game core feature
│       ├── components/               # Feature-specific UI components
│       │   ├── AnswerGrid/
│       │   │   ├── AnswerCard.tsx    # Individual 2x2 choice card
│       │   │   └── AnswerGrid.tsx    # Grid layout & round feedback banner
│       │   ├── AudioPlayer/
│       │   │   ├── ListenButton.tsx  # Central audio wave button
│       │   │   └── TimerRing.tsx     # Circular countdown ring
│       │   ├── HUD/
│       │   │   ├── HUD.tsx           # Status bar (round, score, streak)
│       │   │   └── StreakBadge.tsx   # Animated combo flame badge
│       │   ├── ResultCard/
│       │   │   ├── ResultCard.tsx    # Game over summary card
│       │   │   ├── StatCard.tsx      # Metric tile (Score, Accuracy, Streak)
│       │   │   └── RoundReviewList.tsx # Per-round answer breakdown
│       │   ├── StartScreen/
│       │   │   ├── StartScreen.tsx   # Menu & mode selector
│       │   │   └── ModeCard.tsx      # Individual mode option button
│       │   ├── TranscriptModal/
│       │   │   └── TranscriptModal.tsx # Accessibility lyric inspector
│       │   └── VoiceNotice/
│       │       └── VoiceNotice.tsx   # Thai TTS detection & banner
│       │
│       ├── hooks/                    # Feature business logic hooks
│       │   ├── useAudioPlayer.ts     # Speech synthesis & hard cutoff lifecycle
│       │   ├── useGameSession.ts     # Game state orchestration & round transitions
│       │   └── useKeyboardControls.ts# Keyboard shortcuts (1-4, A-D, Space, Enter)
│       │
│       ├── services/                 # Feature domain services
│       │   ├── distractorService.ts  # Choice generation & balance weighting
│       │   ├── lyricService.ts       # Lyric sampling & keyword blocker
│       │   ├── scoringService.ts     # Multipliers, ranks, and share text
│       │   ├── songRepository.ts     # Data access layer for song catalog
│       │   └── ttsService.ts         # Browser Web Speech API adapter
│       │
│       ├── store/                    # Feature state store
│       │   └── gameStore.ts          # Zustand store for active session
│       │
│       ├── types/                    # Feature domain types
│       │   └── index.ts              # Song, GameMode, RoundData, GameSummary
│       │
│       └── index.ts                  # Public feature barrel export
│
├── shared/                           # Reusable building blocks across features
│   ├── ui/                           # Design System Primitives
│   │   ├── Badge.tsx                 # Group & status tags (CGM48, BNK48)
│   │   ├── Button.tsx                # Reusable buttons (primary, glow, icon)
│   │   ├── Card.tsx                  # Reusable glassmorphic container
│   │   ├── Modal.tsx                 # Generic backdrop + dialog modal
│   │   └── ProgressBar.tsx           # Animated progress indicator
│   ├── hooks/                        # Generic utility hooks
│   │   ├── useClipboard.ts           # Copy to clipboard with auto-reset status
│   │   └── useEventListener.ts       # Window/document event subscriber
│   └── utils/                        # Pure utility functions
│       ├── array.ts                  # Fisher-Yates array shuffle
│       └── text.ts                   # Keyword extraction & tokenization
│
├── data/                             # Static datasets
│   └── songs.json                    # 36 verified songs
│
└── index.css                         # Global CSS & Tailwind design tokens
```

---

## 3. Refactored Code Examples: Before vs. After

### 3.1 Separation of Concerns: Keyboard Controls

#### Before (`App.tsx`):

Monolithic component containing global event listener with direct store mutations:

```tsx
// BEFORE: Raw event listener in view layer
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (status === 'playing' && currentRound) {
      const key = e.key.toUpperCase();
      if (key === '1' || key === 'A') {
        if (currentRound.options[0]) selectAnswer(currentRound.options[0].id);
      }
      // ... repeated for 2, 3, 4, Space, Enter, R
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [status, currentRound, selectAnswer, nextRound, playSnippet]);
```

#### After (`features/quiz/hooks/useKeyboardControls.ts`):

Clean custom hook using generic `useEventListener`:

```tsx
// AFTER: Isolated, testable custom hook
export function useKeyboardControls() {
  const { status, currentRound, selectAnswer, nextRound, playSnippet } = useGameSession();

  useEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (status === 'playing' && currentRound) {
      const key = e.key.toUpperCase();
      const optionMap: Record<string, number> = {
        '1': 0,
        A: 0,
        '2': 1,
        B: 1,
        '3': 2,
        C: 2,
        '4': 3,
        D: 3,
      };
      if (key in optionMap) {
        const option = currentRound.options[optionMap[key]];
        if (option) selectAnswer(option.id);
      } else if (key === ' ' || key === 'R') {
        playSnippet();
      }
    } else if (
      status === 'round_result' &&
      (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')
    ) {
      e.preventDefault();
      nextRound();
    }
  });
}
```

---

### 3.2 Design System Primitives: Badges & Cards

#### Before:

Repeated inline Tailwind styles for idol tags and cards:

```tsx
// BEFORE: Inline repetitive styles
<span
  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
    option.group === 'CGM48'
      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
      : 'bg-purple-950 text-purple-300 border border-purple-500/30'
  }`}
>
  {option.group}
</span>
```

#### After (`shared/ui/Badge.tsx`):

Reusable atomic primitive:

```tsx
// AFTER: Declarative shared primitive
export const GroupBadge: React.FC<{ group: 'CGM48' | 'BNK48' }> = ({ group }) => (
  <Badge variant={group === 'CGM48' ? 'emerald' : 'purple'}>{group}</Badge>
);
```

---

### 3.3 Data Layer Abstraction: Song Repository

#### Before:

`gameStore.ts` directly importing raw `songs.json`:

```tsx
// BEFORE: Tightly coupled to static JSON
import songsData from '../data/songs.json';
const songs = songsData as Song[];
```

#### After (`features/quiz/services/songRepository.ts`):

Clean Repository Pattern with caching and query helpers:

```tsx
// AFTER: Repository abstraction allows mocking, caching, and future remote API sync
export class SongRepository {
  private songs: Song[];

  constructor(initialSongs: Song[] = rawSongs as Song[]) {
    this.songs = initialSongs;
  }

  getAll(): Song[] {
    return [...this.songs];
  }

  getById(id: string): Song | undefined {
    return this.songs.find((s) => s.id === id);
  }

  getByGroup(group: 'CGM48' | 'BNK48'): Song[] {
    return this.songs.filter((s) => s.group === group);
  }
}
export const songRepository = new SongRepository();
```

---

### 3.4 Semantic HTML5 & Accessible DOM Architecture

#### Before:

The application suffered from standard `<div>` soup with no landmark elements, making accessibility tools and SEO scrapers blind to content hierarchy.

#### After:

The application uses strict HTML5 semantic elements throughout the component tree:

| Component                 | Semantic Element                                              | ARIA & Role Enhancements                                                  |
| :------------------------ | :------------------------------------------------------------ | :------------------------------------------------------------------------ |
| **`App.tsx`**             | `<main id="main-content">`, `<footer className="...">`        | Landmark main container and semantic footer                               |
| **`StartScreen.tsx`**     | `<article>`, `<header>`, `<section>`, `<aside>`, `<footer>`   | `role="radiogroup"` for mode picker                                       |
| **`ModeCard.tsx`**        | `<button type="button">`                                      | `role="radio"`, `aria-checked={isSelected}`                               |
| **`HUD.tsx`**             | `<header>`, `<nav>`, `<section>`                              | `aria-label="แถบสถานะและคะแนน"`, `aria-label="คะแนนและคอมโบ"`             |
| **`ListenButton.tsx`**    | `<section>`, `<aside>`                                        | `aria-label="เครื่องเล่นท่อนเพลง"`, `aria-label="ตัวเลือกฟังซ้ำ"`         |
| **`AnswerGrid.tsx`**      | `<section>`, `<article>`                                      | `aria-labelledby="answers-heading"`, `aria-live="polite"` feedback banner |
| **`AnswerCard.tsx`**      | `<button type="button">`                                      | `aria-pressed={isSelected}`                                               |
| **`ResultCard.tsx`**      | `<article>`, `<header>`, `<section>`, `<nav>`, `<footer>`     | `aria-labelledby="result-heading"`, `<ol>`/`<li>` round breakdown         |
| **`VoiceNotice.tsx`**     | `<aside>`                                                     | `aria-label="สถานะเสียงสังเคราะห์ภาษาไทย"`                                |
| **`TranscriptModal.tsx`** | `<article>`, `<header>`, `<blockquote>`, `<footer>`           | `role="dialog"`, `aria-modal="true"` accessible modal                     |
| **`Card.tsx`**            | Polymorphic `as?: 'div' \| 'article' \| 'section' \| 'aside'` | Enables clean semantic DOM composition without CSS duplication            |

---

## 4. Further Improvements & Scalability Roadmap

1. **Audio Pre-caching / Offline Audio Worklet**:
   - Provide an optional offline TTS fallback using Web Audio API synthesis or pre-recorded fan clips for zero network dependency.
2. **Global Leaderboard with Edge KV**:
   - Introduce Cloudflare Workers KV or Supabase to persist community high scores without heavy servers.
3. **Sound FX & Haptics**:
   - Add subtle Web Audio API chimes (correct chime, wrong thud) and mobile device vibration (`navigator.vibrate`) for tactile party feel.
4. **Theme Customization**:
   - Support dark emerald (Chiang Mai Forest) and light lavender (BNK48 Orchid) themes via CSS variable switching.
