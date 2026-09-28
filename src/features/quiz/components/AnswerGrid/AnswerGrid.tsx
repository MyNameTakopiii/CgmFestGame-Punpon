import React, { useEffect } from 'react';
import { useGameSession } from '../../hooks/useGameSession';
import confetti from 'canvas-confetti';
import { Check, X, ArrowRight } from 'lucide-react';
import { AnswerCard } from './AnswerCard';
import { DropdownAnswer } from './DropdownAnswer';
import { Button } from '../../../../shared/ui';

export const AnswerGrid: React.FC = () => {
  const { currentRound, status, settings, selectAnswer, nextRound } = useGameSession();

  useEffect(() => {
    if (status === 'round_result' && currentRound?.isCorrect) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    }
  }, [status, currentRound?.isCorrect]);

  if (!currentRound) return null;

  const isResult = status === 'round_result';
  const targetId = currentRound.targetSong.id;
  const selectedId = currentRound.selectedOptionId;

  return (
    <section className="w-full max-w-xl mx-auto px-4 mt-2 mb-6" aria-labelledby="answers-heading">
      <h2 id="answers-heading" className="sr-only">
        ตัวเลือกคำตอบประจำรอบ
      </h2>

      {settings.answerType === 'choice' ? (
        <div
          role="group"
          aria-label="ตัวเลือกเพลง 4 ตัวเลือก"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
        >
          {currentRound.options.map((option, idx) => (
            <AnswerCard
              key={option.id}
              option={option}
              index={idx}
              isResult={isResult}
              isTarget={targetId === option.id}
              isSelected={selectedId === option.id}
              onSelect={(id) => {
                if (status === 'playing') {
                  selectAnswer(id);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <DropdownAnswer
          isResult={isResult}
          selectedOptionId={selectedId}
          targetSongId={targetId}
          onSelect={(id) => {
            if (status === 'playing') {
              selectAnswer(id);
            }
          }}
        />
      )}

      {isResult && (
        <article
          aria-live="polite"
          className="mt-5 p-4 rounded-3xl bg-white border-2 border-slate-200 backdrop-blur-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-[0_8px_30px_rgba(15,23,42,0.1),0_2px_0_#cbd5e1]"
        >
          <div className="flex items-center gap-3">
            {currentRound.isCorrect ? (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-300 shadow-sm shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="text-left">
                  <div className="text-emerald-700 font-black font-heading text-lg leading-tight">
                    ถูกต้อง!
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    ตอบถูกใน {((currentRound.timeTakenMs || 0) / 1000).toFixed(1)} วินาที
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border-2 border-rose-300 shadow-sm shrink-0">
                  <X className="w-6 h-6 stroke-[3]" />
                </div>
                <div className="text-left">
                  <div className="text-rose-600 font-black font-heading text-lg leading-tight">
                    ยังไม่ถูกต้อง!
                  </div>
                  <div className="text-xs text-slate-600">
                    คำตอบที่ถูกคือ:{' '}
                    <span className="text-emerald-700 font-bold">
                      {currentRound.targetSong.title}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={nextRound}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <span>ข้อถัดไป</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </article>
      )}
    </section>
  );
};
