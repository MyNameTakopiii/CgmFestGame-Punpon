import React from 'react';
import { useGameSession } from '../../hooks/useGameSession';
import { FileText, RotateCcw } from 'lucide-react';
import { ProgressBar } from '../../../../shared/ui';

export const HUD: React.FC = () => {
  const { currentRound, totalRounds, settings, toggleTranscript, restartGame } = useGameSession();

  if (!currentRound) return null;

  const roundNum = currentRound.roundNumber;
  const progressPercent = Math.min(100, (roundNum / totalRounds) * 100);

  return (
    <header className="w-full max-w-xl mx-auto px-4 select-none" aria-label="แถบสถานะการเล่น">
      <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200/90 rounded-3xl p-4 shadow-[0_6px_20px_rgba(15,23,42,0.06),0_2px_0_#cbd5e1]">
        <div className="flex items-center justify-between mb-3">
          {/* Round & Settings Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 font-extrabold rounded-full text-xs tracking-wide shadow-sm">
              ข้อ {roundNum} / {totalRounds}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {settings.answerType === 'choice' ? 'Choice' : 'Dropdown'} • {settings.timeLimit}s
            </span>
          </div>

          {/* Action Navigation icons */}
          <nav aria-label="ตัวช่วยและการควบคุม" className="flex items-center gap-2">
            <button
              onClick={toggleTranscript}
              title="ดูเนื้อเพลง (Transcript)"
              aria-label="ดูเนื้อเพลง Transcript"
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition cursor-pointer shadow-sm active:translate-y-0.5"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('ต้องการเริ่มเกมใหม่หรือไม่?')) {
                  restartGame();
                }
              }}
              title="เริ่มเกมใหม่"
              aria-label="เริ่มเกมใหม่"
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition cursor-pointer shadow-sm active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </nav>
        </div>

        {/* Progress Bar */}
        <ProgressBar progressPercent={progressPercent} />
      </div>
    </header>
  );
};
