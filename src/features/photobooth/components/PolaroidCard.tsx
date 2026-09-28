import React from 'react';
import { Download, RotateCcw, Sparkles } from 'lucide-react';

interface PolaroidCardProps {
  polaroidUrl: string;
  onRetake: () => void;
  onClose: () => void;
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ polaroidUrl, onRetake, onClose }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `after-party-polaroid-${Date.now()}.png`;
    link.href = polaroidUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto">
      {/* Polaroid Container with tilt & shadow */}
      <div className="relative group transition-transform duration-300 hover:rotate-0 rotate-[-1.5deg]">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-rose-300 to-emerald-400 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition duration-500" />

        {/* Polaroid Image */}
        <div className="relative bg-white p-2 rounded-xl shadow-2xl border border-slate-200">
          <img
            src={polaroidUrl}
            alt="After Party Polaroid Memory"
            className="w-full h-auto rounded-lg shadow-inner object-contain"
          />
        </div>

        {/* Badge in corner */}
        <div className="absolute -top-3 -right-3 bg-amber-400 text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-slate-900" />
          <span>SOUVENIR</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
        <button
          onClick={handleDownload}
          className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 transition-all text-sm cursor-pointer"
          type="button"
        >
          <Download className="w-4 h-4" />
          <span>บันทึกรูปโพลารอยด์</span>
        </button>

        <button
          onClick={onRetake}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl border border-slate-300 transition-all text-sm cursor-pointer"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ถ่ายใหม่</span>
        </button>
      </div>

      <button
        onClick={onClose}
        className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline font-medium transition-colors cursor-pointer"
        type="button"
      >
        ปิดหน้าต่างนี้
      </button>
    </div>
  );
};
