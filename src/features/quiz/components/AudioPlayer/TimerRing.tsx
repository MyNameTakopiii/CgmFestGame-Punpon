import React, { useEffect, useState } from 'react';

export interface TimerRingProps {
  isPlaying: boolean;
  totalDurationMs: number;
}

export const TimerRing: React.FC<TimerRingProps> = ({ isPlaying, totalDurationMs }) => {
  const [timeLeftMs, setTimeLeftMs] = useState(totalDurationMs);

  useEffect(() => {
    if (!isPlaying) {
      setTimeLeftMs(totalDurationMs);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDurationMs - elapsed);
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, totalDurationMs]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = isPlaying ? timeLeftMs / totalDurationMs : 1;
  const strokeDashoffset = circumference * (1 - progressRatio);

  let strokeColor = '#059669'; // emerald-600
  if (progressRatio < 0.3) {
    strokeColor = '#e11d48'; // rose-600
  } else if (progressRatio < 0.6) {
    strokeColor = '#d97706'; // amber-600
  }

  const secondsDisplay = (timeLeftMs / 1000).toFixed(1);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 148 148">
        <circle
          cx="74"
          cy="74"
          r={radius}
          className="stroke-slate-200/90"
          strokeWidth="7"
          fill="transparent"
        />
        <circle
          cx="74"
          cy="74"
          r={radius}
          stroke={strokeColor}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-75 ease-linear"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="font-mono text-xl font-black transition-colors duration-150"
          style={{ color: strokeColor }}
        >
          {isPlaying ? `${secondsDisplay}s` : `${(totalDurationMs / 1000).toFixed(0)}s`}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
          {isPlaying ? 'กำลังตัด...' : 'เวลาตัด'}
        </span>
      </div>
    </div>
  );
};
