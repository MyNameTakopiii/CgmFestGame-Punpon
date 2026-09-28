import React, { useState, useEffect } from 'react';
import { Camera, Download, RotateCcw, Sparkles } from 'lucide-react';
import { PolaroidModal } from './PolaroidModal';

const STORAGE_KEY = 'after_party_user_polaroid';

export const OnScreenPolaroid: React.FC = () => {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Restore saved photo from session storage if exists
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCapturedPhoto(saved);
      }
    } catch {
      // Storage unavailable in private browsing
    }
  }, []);

  const handleSavePhoto = (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    try {
      sessionStorage.setItem(STORAGE_KEY, photoDataUrl);
    } catch {
      // Storage unavailable
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!capturedPhoto) return;
    const link = document.createElement('a');
    link.download = `after-party-photostrip-${Date.now()}.png`;
    link.href = capturedPhoto;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRetake = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {/* On-Screen Keepsake / Photo Strip Container */}
      <aside
        aria-label="รูปโพลารอยด์ที่ระลึก After Party"
        className="fixed bottom-5 right-5 z-40 select-none group"
      >
        <div
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative bg-[#faf9f6] p-2 sm:p-2.5 rounded-xl shadow-[0_14px_36px_rgba(15,23,42,0.2),0_2px_6px_rgba(15,23,42,0.08)] border border-slate-200/90 cursor-pointer transform -rotate-2 hover:rotate-0 hover:scale-105 active:scale-95 transition-all duration-300 ${
            capturedPhoto ? 'w-28 sm:w-36' : 'w-44 sm:w-52'
          }`}
          title={
            capturedPhoto
              ? 'แตะเพื่อดูรูปสติกเกอร์หรือถ่ายใหม่'
              : 'แตะเพื่อเปิดตู้ถ่ายรูปสติกเกอร์ 3 ช่อง'
          }
        >
          {/* Decorative Translucent Washi Tape at Top Center */}
          <div
            className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 sm:w-16 h-4 bg-emerald-400/50 backdrop-blur-xs border border-emerald-500/40 shadow-xs transform -rotate-1 pointer-events-none z-10"
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 97% 50%, 100% 100%, 0% 100%, 3% 50%)',
            }}
          />

          {capturedPhoto ? (
            /* Render Captured 3-Cut Photo Strip Keepsake */
            <>
              <div className="relative w-full rounded-lg overflow-hidden shadow-inner border border-slate-300/80 bg-slate-900">
                <img
                  src={capturedPhoto}
                  alt="After Party Souvenir"
                  className="w-full h-auto object-contain"
                />

                {/* Hover Actions Overlay */}
                {isHovered && (
                  <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 p-2 animate-fade-in z-20">
                    <button
                      onClick={handleDownload}
                      className="w-full py-1.5 px-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-md shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                      type="button"
                    >
                      <Download className="w-3 h-3" />
                      <span>บันทึกรูป</span>
                    </button>
                    <button
                      onClick={handleRetake}
                      className="w-full py-1.5 px-2 bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold rounded-md shadow-md flex items-center justify-center gap-1 transition-transform active:scale-95 cursor-pointer"
                      type="button"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>ถ่ายใหม่</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Chin */}
              <div className="pt-2 pb-0.5 text-center">
                <div className="flex items-center justify-between px-1">
                  <div className="text-left">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-800 font-heading leading-none truncate max-w-[110px] sm:max-w-[130px]">
                      CGM48 AFTER PARTY
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                      {new Date().toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
              </div>
            </>
          ) : (
            /* Default Punpon Souvenir Card */
            <>
              <div className="relative w-full aspect-square bg-slate-900 rounded-xs overflow-hidden shadow-inner border border-slate-300/80">
                <div className="relative w-full h-full group/photo overflow-hidden">
                  <img
                    src="/punpon-profile.png"
                    alt="Punpon CGM48 Special Souvenir"
                    className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform duration-300"
                  />
                  {/* Prompt overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent flex flex-col justify-end p-2 text-center">
                    <span className="inline-flex items-center justify-center gap-1 mx-auto px-2.5 py-0.5 rounded-full bg-pink-500 text-white text-[9px] font-bold shadow-xs">
                      <Camera className="w-2.5 h-2.5" />
                      <span>ตู้สติกเกอร์ 3 ช่อง</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Chin */}
              <div className="pt-2 pb-0.5 text-center">
                <div className="flex items-center justify-between px-1">
                  <div className="text-left">
                    <p className="text-[10px] sm:text-[11px] font-black text-slate-800 font-heading leading-none">
                      PUNPON CGM48
                    </p>
                    <p className="text-[8px] text-slate-400 font-mono mt-0.5">3-Cut Photo Strip</p>
                  </div>
                  <Sparkles className="w-3 h-3 text-pink-500" />
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Photobooth Modal */}
      <PolaroidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePhoto}
        defaultCaption="PUNPON CGM48 AFTER PARTY"
      />
    </>
  );
};
