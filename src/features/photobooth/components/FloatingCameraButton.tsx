import React from 'react';
import { Camera } from 'lucide-react';

interface FloatingCameraButtonProps {
  onClick: () => void;
}

export const FloatingCameraButton: React.FC<FloatingCameraButtonProps> = ({ onClick }) => {
  return (
    <aside aria-label="กล้องโพลารอยด์ After Party" className="fixed bottom-6 right-6 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-900 font-extrabold rounded-full shadow-xl shadow-amber-500/25 border-2 border-white/80 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95 cursor-pointer"
        type="button"
        title="เปิดกล้องถ่ายโพลารอยด์ที่ระลึก After Party"
      >
        {/* Pulsing indicator */}
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>

        {/* Camera Icon */}
        <Camera className="w-5 h-5 text-slate-900 filter drop-shadow-xs" />

        {/* Text */}
        <span className="text-xs sm:text-sm font-serif tracking-wide drop-shadow-sm hidden sm:inline">
          ถ่ายโพลารอยด์
        </span>
      </button>
    </aside>
  );
};
