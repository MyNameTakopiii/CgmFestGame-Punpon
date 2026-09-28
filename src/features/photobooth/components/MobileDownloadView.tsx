import React, { useState, useEffect } from 'react';
import { Download, Share2, Sparkles, Check, Heart, ExternalLink } from 'lucide-react';
import { getStoredPhotoStrip } from '../services/uploadService';

interface MobileDownloadViewProps {
  photoId?: string;
  directImageUrl?: string;
}

export const MobileDownloadView: React.FC<MobileDownloadViewProps> = ({
  photoId,
  directImageUrl,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(directImageUrl || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (directImageUrl) {
      setImageUrl(directImageUrl);
    } else if (photoId) {
      const stored = getStoredPhotoStrip(photoId);
      if (stored) {
        setImageUrl(stored);
      }
    }
  }, [photoId, directImageUrl]);

  const handleNativeSaveOrShare = async () => {
    if (!imageUrl) return;

    // 1. Try Native Web Share API (Works natively on iOS Safari & Android Chrome)
    if (navigator.share) {
      try {
        // Attempt to fetch blob and share file directly
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], `punpon-afterparty-3cut-${Date.now()}.png`, {
          type: 'image/png',
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'PUNPON AFTER PARTY 3-Cut Keepsake',
            text: 'รูปถ่ายที่ระลึกจากตู้สติกเกอร์ PUNPON AFTER PARTY ♡',
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.warn('Native file share skipped or cancelled:', err);
      }
    }

    // 2. Standard Download Fallback
    const link = document.createElement('a');
    link.download = `punpon-afterparty-3cut-${Date.now()}.png`;
    link.href = imageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 max-w-md mx-auto selection:bg-pink-500">
      {/* Top Header */}
      <header className="text-center pt-2 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-black mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>PUNPON AFTER PARTY KEEPSAKE</span>
        </div>
        <h1 className="text-xl font-black text-white font-heading">รูปสติกเกอร์ของคุณพร้อมแล้ว!</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          แตะปุ่มด้านล่าง หรือกดค้างที่รูปภาพเพื่อบันทึก
        </p>
      </header>

      {/* Main Image View */}
      <main className="my-auto py-2 flex flex-col items-center">
        {imageUrl ? (
          <div className="relative group max-w-[270px] mx-auto animate-fade-in">
            {/* Glow behind strip */}
            <div className="absolute -inset-2 bg-gradient-to-b from-pink-500/30 via-purple-500/20 to-amber-500/30 rounded-3xl blur-lg opacity-75" />

            {/* Photo Strip Frame */}
            <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-slate-200">
              <img
                src={imageUrl}
                alt="Punpon After Party 3-Cut Photo Strip"
                className="w-full h-auto rounded-xl shadow-inner object-contain select-auto"
              />
            </div>

            {/* Hint overlay */}
            <p className="text-[10px] text-slate-400 text-center mt-3">
              💡 แตะค้างที่รูปภาพเพื่อเลือก &ldquo;บันทึกรูปภาพ (Save Image)&rdquo; ได้เลย
            </p>
          </div>
        ) : (
          <div className="p-8 bg-slate-900 rounded-3xl text-center border border-slate-800">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-slate-300">กำลังเตรียมรูปภาพของคุณ...</p>
          </div>
        )}
      </main>

      {/* Bottom Action Buttons */}
      <footer className="space-y-2.5 pt-4 border-t border-slate-900">
        <button
          type="button"
          onClick={handleNativeSaveOrShare}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>บันทึกลงอัลบั้มภาพ (Save to Photos)</span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNativeSaveOrShare}
            className="flex-1 py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-pink-400" />
            <span>แชร์รูปภาพ</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>คัดลอกลิงก์</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-[11px] text-pink-400 hover:text-pink-300 font-bold underline transition-colors"
          >
            ← กลับสู่หน้าหลักเกม PUNPON AFTER PARTY
          </a>
        </div>
      </footer>
    </div>
  );
};
