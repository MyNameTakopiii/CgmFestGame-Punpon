import React from 'react';
import {
  useGameSession,
  useKeyboardControls,
  StartScreen,
  HUD,
  ListenButton,
  AnswerGrid,
  ResultCard,
  TranscriptModal,
} from '../features/quiz';
import { ShootingStars, BoiledEggMascot } from '../features/decorations';
import { OnScreenPolaroid } from '../features/photobooth';
import { MobileCameraView } from '../features/photobooth/components/MobileCameraView';
import { MobileDownloadView } from '../features/photobooth/components/MobileDownloadView';

export const App: React.FC = () => {
  const { status } = useGameSession();

  // Attach global game keyboard shortcuts (1-4, A-D, Space, Enter, R)
  useKeyboardControls();

  // Check URL query parameters for mobile companion views
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const mode = searchParams?.get('mode');
  const room = searchParams?.get('room');
  const photoId = searchParams?.get('id');
  const directUrl = searchParams?.get('url');

  if (mode === 'camera' && room) {
    return <MobileCameraView roomId={room} />;
  }

  if (mode === 'download') {
    return (
      <MobileDownloadView photoId={photoId || undefined} directImageUrl={directUrl || undefined} />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 arcade-bg flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* After Party Shooting Stars & Star Dust Layer */}
      <ShootingStars />

      {/* Playful pastel ambient ambient glows */}
      <div
        className="fixed top-0 left-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed top-20 right-10 w-80 h-80 bg-amber-200/40 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="fixed bottom-10 right-1/4 w-96 h-96 bg-teal-200/35 rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Semantic Main Content */}
      <main id="main-content" className="relative z-10 w-full flex-1 flex flex-col justify-between">
        {status === 'idle' && (
          <div className="flex-1 flex items-center justify-center py-6">
            <StartScreen />
          </div>
        )}

        {(status === 'playing' || status === 'round_result') && (
          <section
            aria-label="สนามแข่งขันเกมทายเพลง"
            className="flex-1 flex flex-col justify-between py-4"
          >
            <HUD />
            <section
              aria-label="เวทีตอบคำถามและฟังเสียง"
              className="my-auto flex flex-col items-center"
            >
              <ListenButton />
              <AnswerGrid />
            </section>
          </section>
        )}

        {status === 'game_over' && (
          <div className="flex-1 flex items-center justify-center py-6">
            <ResultCard />
          </div>
        )}
      </main>

      {/* After Party Boiled Egg Mascot (น้องไข่ต้ม) - ซ่อนระหว่างเล่นเกม และซ่อนบนจอเล็กเพื่อไม่ให้บังปุ่ม */}
      {status !== 'playing' && status !== 'round_result' && (
        <div className="hidden md:block">
          <BoiledEggMascot />
        </div>
      )}

      {/* Physical On-Screen Polaroid Keepsake Card - ซ่อนระหว่างเล่นเกม และซ่อนบนจอเล็กเพื่อไม่ให้บังปุ่ม */}
      {status !== 'playing' && status !== 'round_result' && (
        <div className="hidden md:block">
          <OnScreenPolaroid />
        </div>
      )}

      {/* Accessibility / Inspector modal */}
      <TranscriptModal />

      {/* Semantic Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 font-mono border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <span>CGM48 Lyric Guess • ข้อมูลเพลงและเนื้อร้องถูกต้อง • Fan-Made Arcade Game</span>
      </footer>
    </div>
  );
};

export default App;
