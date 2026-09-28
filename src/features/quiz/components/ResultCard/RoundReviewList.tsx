import React from 'react';
import type { RoundData } from '../../types';
import { Check, X } from 'lucide-react';

export interface RoundReviewListProps {
  breakdown: RoundData[];
}

export const RoundReviewList: React.FC<RoundReviewListProps> = ({ breakdown }) => {
  return (
    <section
      aria-labelledby="review-list-heading"
      className="text-left bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm mb-6"
    >
      <h3
        id="review-list-heading"
        className="text-xs uppercase font-mono tracking-wider text-slate-500 font-bold mb-3 px-1"
      >
        สรุปเพลงทั้ง {breakdown.length} ข้อ:
      </h3>
      <ol className="space-y-2.5">
        {breakdown.map((r, i) => {
          const selectedSong =
            r.options.find((opt) => opt.id === r.selectedOptionId)?.title ||
            (r.selectedOptionId ? 'เพลงอื่น' : 'ไม่ได้เลือก');

          return (
            <li
              key={i}
              className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-xs ${
                r.isCorrect
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3 truncate min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    r.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {r.isCorrect ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <X className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
                <div className="truncate">
                  <div className="font-bold truncate text-sm">{r.targetSong.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-medium">{r.targetSong.group}</span>
                    <span>•</span>
                    <span>ข้อที่ {r.roundNumber}</span>
                    {!r.isCorrect && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 font-medium">ตอบ: {selectedSong}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 font-mono text-xs font-bold px-2.5 py-1 rounded-full border">
                {r.isCorrect ? (
                  <span className="text-emerald-700 bg-emerald-100/60 border-emerald-300">
                    ถูกต้อง
                  </span>
                ) : (
                  <span className="text-rose-600 bg-rose-100/60 border-rose-300">ยังไม่ถูก</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
