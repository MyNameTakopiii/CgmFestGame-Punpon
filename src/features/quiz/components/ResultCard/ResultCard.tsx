import React, { useEffect } from 'react';
import { useGameSession } from '../../hooks/useGameSession';
import { Button } from '../../../../shared/ui';
import { RoundReviewList } from './RoundReviewList';
import confetti from 'canvas-confetti';
import { Trophy, Home, Sparkles } from 'lucide-react';

export const ResultCard: React.FC = () => {
  const { summary, restartGame } = useGameSession();

  useEffect(() => {
    // Multi-burst celebration confetti
    const burstConfetti = () => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    };

    burstConfetti();
    const timer = setTimeout(burstConfetti, 400);
    return () => clearTimeout(timer);
  }, []);

  if (!summary) return null;

  const isPerfect = summary.correctCount === summary.totalRounds;

  return (
    <article
      aria-labelledby="result-heading"
      className="w-full max-w-xl mx-auto px-4 py-6 animate-fade-in text-center"
    >
      {/* Trophy & Celebration Header */}
      <header className="inline-flex flex-col items-center mb-6">
        <div
          className={`w-20 h-20 rounded-full p-1 mb-3 shadow-[0_8px_25px_rgba(245,158,11,0.35),0_2px_0_#d97706] ${
            isPerfect ? 'animate-bounce' : ''
          } bg-gradient-to-tr from-amber-400 to-yellow-300`}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {isPerfect ? (
              <Trophy className="w-10 h-10 text-amber-500 fill-amber-400" />
            ) : (
              <Sparkles className="w-10 h-10 text-emerald-600 fill-emerald-200" />
            )}
          </div>
        </div>

        <span className="text-xs uppercase font-mono tracking-widest text-slate-500 font-bold mb-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          สรุปผลการเล่น 3 ข้อ
        </span>
        <h2
          id="result-heading"
          className="text-2xl sm:text-3xl font-black font-heading text-slate-900 mt-1"
        >
          {summary.cheerMessage}
        </h2>
      </header>

      {/* Prominent Score Highlight: ทายถูก X / 3 ข้อ */}
      <section
        aria-label="จำนวนข้อที่ทายถูก"
        className="bg-white border-2 border-slate-200 rounded-3xl p-6 mb-6 shadow-[0_6px_24px_rgba(15,23,42,0.06),0_2px_0_#cbd5e1]"
      >
        <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 block mb-1">
          ผลคะแนนทายเพลง
        </span>
        <div className="text-4xl sm:text-5xl font-black font-heading text-emerald-600 leading-tight">
          ทายถูก {summary.correctCount} / {summary.totalRounds} ข้อ
        </div>
      </section>

      {/* Round-by-round breakdown */}
      <RoundReviewList breakdown={summary.breakdown} />

      {/* Punpon CGM48 Fanclub Banner Decoration */}
      <section
        aria-label="ช่องทางติดตามแฟนคลับ บ้านไข่ต้ม CGM48"
        className="w-full mb-6 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm bg-white p-2"
      >
        <img
          src="/punpon-cover.png"
          alt="PUNPON CGM48 FANCLUB"
          className="w-full h-auto rounded-2xl object-cover"
        />
        <p className="text-xs font-heading font-semibold text-slate-500 mt-2.5 pb-1 text-center">
          PUNPONCGM48 FANCLUB TH • ขอบคุณที่มาร่วมสนุกทายท่อนฮิตกับบ้านไข่ต้ม
        </p>
      </section>

      {/* ONLY Button: Back to Home */}
      <footer className="w-full">
        <Button
          variant="glow"
          onClick={restartGame}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-base"
        >
          <Home className="w-5 h-5" />
          <span>กลับหน้าหลัก (Back to Home)</span>
        </Button>
      </footer>
    </article>
  );
};
