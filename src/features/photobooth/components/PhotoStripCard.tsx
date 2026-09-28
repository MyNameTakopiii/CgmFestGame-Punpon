import React, { useState, useEffect } from 'react';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { TemplateSelector } from './TemplateSelector';
import { QRCodeDisplay } from './QRCodeDisplay';
import { uploadPhotoStrip, type UploadResult } from '../services/uploadService';
import type { PhotoThemeId } from '../types/photobooth.types';

interface PhotoStripCardProps {
  stripUrl: string;
  selectedTheme: PhotoThemeId;
  onSelectTheme: (themeId: PhotoThemeId) => void;
  onRetake: () => void;
  onClose: () => void;
}

export const PhotoStripCard: React.FC<PhotoStripCardProps> = ({
  stripUrl,
  selectedTheme,
  onSelectTheme,
  onRetake,
  onClose,
}) => {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(true);

  // Automatically prepare QR download link on render
  useEffect(() => {
    let isCancelled = false;
    setIsUploading(true);

    uploadPhotoStrip(stripUrl)
      .then((res) => {
        if (!isCancelled) {
          setUploadResult(res);
          setIsUploading(false);
        }
      })
      .catch((err) => {
        console.warn('Upload failed:', err);
        if (!isCancelled) {
          setIsUploading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [stripUrl]);

  const handleDownloadDirect = () => {
    const link = document.createElement('a');
    link.download = `punpon-after-party-3cut-${Date.now()}.png`;
    link.href = stripUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Side-by-Side Strip Preview & QR Code Display */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-5 w-full py-1">
        {/* 3-Cut Photo Strip Container */}
        <div className="relative group transition-all duration-300 max-h-[55vh] sm:max-h-[65vh] overflow-y-auto sm:overflow-visible px-2 py-1 flex-shrink-0">
          {/* Glow backdrop */}
          <div className="absolute -inset-2 bg-gradient-to-b from-pink-400/40 via-purple-500/30 to-amber-400/40 rounded-3xl blur-xl opacity-60 group-hover:opacity-85 transition duration-500" />

          {/* The Strip Image */}
          <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
            <img
              src={stripUrl}
              alt="Punpon After Party 3-Cut Photo Strip"
              className="w-48 sm:w-56 max-h-[62vh] h-auto rounded-xl shadow-inner object-contain mx-auto"
            />
          </div>

          {/* Sticker Keepsake Badge */}
          <div className="absolute -top-2.5 -right-1 bg-gradient-to-r from-amber-400 to-pink-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-white" />
            <span>SOUVENIR • 3-CUT</span>
          </div>
        </div>

        {/* QR Code Container for Mobile Download */}
        <div className="flex-1 w-full max-w-xs flex flex-col items-center justify-center">
          {isUploading && !uploadResult ? (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center w-full">
              <div className="w-10 h-10 border-4 border-pink-400 border-t-amber-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-700">
                กำลังเตรียม QR Code สำหรับมือถือ...
              </p>
            </div>
          ) : uploadResult ? (
            <QRCodeDisplay
              url={uploadResult.url}
              title="สแกนเพื่อโหลดรูปลงมือถือ"
              subtitle="เปิดกล้องมือถือส่องเพื่อบันทึกรูปนี้เก็บไว้"
              isCloud={uploadResult.isCloud}
              size={145}
            />
          ) : null}
        </div>
      </div>

      {/* Template Theme Selector (Allows live switching without re-taking photos) */}
      <div className="w-full mt-4 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-xs">
        <TemplateSelector selectedTheme={selectedTheme} onSelectTheme={onSelectTheme} />
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2.5 w-full">
        <button
          onClick={handleDownloadDirect}
          className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-xs sm:text-sm cursor-pointer"
          type="button"
        >
          <Download className="w-4 h-4" />
          <span>บันทึกรูปโพลารอยด์สติกเกอร์ (PNG)</span>
        </button>

        <button
          onClick={onRetake}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold rounded-2xl border border-slate-300 transition-all text-xs sm:text-sm cursor-pointer"
          type="button"
        >
          <RotateCcw className="w-4 h-4" />
          <span>ถ่ายใหม่ 3 ช็อต</span>
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
