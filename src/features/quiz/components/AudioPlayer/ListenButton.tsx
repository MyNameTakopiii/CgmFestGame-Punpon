import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { TimerRing } from './TimerRing';

export const ListenButton: React.FC = () => {
  const { isAudioPlaying, hasReplayed, durationMs, isRoundActive, handlePlayOrReplay } =
    useAudioPlayer();

  return (
    <section
      aria-label="เครื่องเล่นท่อนเพลง"
      className="flex flex-col items-center justify-center my-6 relative"
    >
      {/* Outer ambient glow */}
      {isAudioPlaying && (
        <div
          className="absolute w-48 h-48 rounded-full bg-emerald-400/25 blur-3xl animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Pulse Rings */}
      {isAudioPlaying && (
        <div aria-hidden="true">
          <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/60 animate-pulse-ring-1 pointer-events-none" />
          <div className="absolute w-40 h-40 rounded-full border-2 border-emerald-400/40 animate-pulse-ring-2 pointer-events-none" />
          <div className="absolute w-40 h-40 rounded-full border-2 border-teal-400/30 animate-pulse-ring-3 pointer-events-none" />
        </div>
      )}

      {/* Circular white console base */}
      <div className="relative flex items-center justify-center p-3 rounded-full bg-white border-2 border-slate-200 shadow-[0_8px_25px_rgba(15,23,42,0.08),0_3px_0_#cbd5e1]">
        <TimerRing isPlaying={isAudioPlaying} totalDurationMs={durationMs} />

        {/* Central interactive 3D buzzer button */}
        <button
          onClick={handlePlayOrReplay}
          disabled={isAudioPlaying || !isRoundActive}
          className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-150 transform select-none cursor-pointer ${
            isAudioPlaying
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white scale-105 shadow-[0_4px_0_#047857,0_8px_16px_rgba(5,150,105,0.35)] cursor-default'
              : 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 text-white hover:brightness-105 shadow-[0_6px_0_#047857,0_10px_20px_rgba(5,150,105,0.35)] active:translate-y-1.5 active:shadow-[0_1px_0_#047857]'
          } ${!isRoundActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isAudioPlaying ? 'กำลังเล่นเสียงร้อง' : 'กดเพื่อฟังท่อนเพลง'}
        >
          {isAudioPlaying ? (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1 h-6">
                <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
                <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s] h-6" />
                <span className="w-1.5 bg-white rounded-full animate-bounce h-3" />
                <span className="w-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.2s] h-5" />
              </div>
              <span className="text-[10px] font-extrabold tracking-wide drop-shadow-sm">
                กำลังเล่น
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              {hasReplayed ? (
                <VolumeX className="w-6 h-6 text-white/90 drop-shadow" />
              ) : (
                <Volume2 className="w-6 h-6 text-white drop-shadow" />
              )}
              <span className="text-[10px] font-extrabold tracking-wide drop-shadow-sm">
                {hasReplayed ? 'ฟังซ้ำแล้ว' : 'กดฟังเสียง'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Replay indicator pill */}
      <aside className="mt-4" aria-label="ตัวเลือกฟังซ้ำ">
        {isRoundActive && !isAudioPlaying && (
          <button
            onClick={handlePlayOrReplay}
            disabled={hasReplayed}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${
              hasReplayed
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-white text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-50 active:translate-y-0.5'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>{hasReplayed ? 'ใช้สิทธิ์ฟังซ้ำแล้ว' : 'กดฟังอีกครั้ง (Replay)'}</span>
          </button>
        )}
      </aside>
    </section>
  );
};
