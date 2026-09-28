import React, { useState, useEffect, useCallback } from 'react';
import { Camera, X, Sparkles, Monitor, Smartphone } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import { useRemoteCameraHost } from '../hooks/useRemoteCamera';
import { generatePhotoStrip } from '../utils/photoStripGenerator';
import { SequenceViewfinder } from './SequenceViewfinder';
import { PhotoStripCard } from './PhotoStripCard';
import { TemplateSelector } from './TemplateSelector';
import { QRCodeDisplay } from './QRCodeDisplay';
import { PHOTO_THEMES, type PhotoThemeId } from '../types/photobooth.types';

interface PolaroidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (polaroidUrl: string) => void;
  defaultCaption?: string;
}

export const PolaroidModal: React.FC<PolaroidModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultCaption = 'PUNPON CGM48 AFTER PARTY',
}) => {
  const webcam = useWebcam();
  const [cameraDevice, setCameraDevice] = useState<'computer' | 'mobile'>('computer');
  const [mode, setMode] = useState<'viewfinder' | 'generating' | 'card'>('viewfinder');
  const [capturedShots, setCapturedShots] = useState<string[]>([]);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<PhotoThemeId>('punpon_sticker');
  const [caption, setCaption] = useState<string>(defaultCaption);

  // Generate strip helper
  const renderStrip = useCallback(
    async (shots: string[], themeId: PhotoThemeId, userCaption: string) => {
      setMode('generating');
      try {
        const generated = await generatePhotoStrip(shots, {
          themeId,
          caption: userCaption.trim() || 'PUNPON CGM48 AFTER PARTY',
          subCaption: `${new Date().toLocaleDateString('th-TH')} • Fan-Made Keepsake`,
        });
        setStripUrl(generated);
        onSave?.(generated);
        setMode('card');
        webcam.stopCamera();
      } catch (err) {
        console.error('Failed to generate 3-cut photo strip:', err);
        setMode('viewfinder');
      }
    },
    [onSave, webcam]
  );

  // Handle completion of 3-shot sequence (from either PC camera or Mobile camera)
  const handleSequenceComplete = useCallback(
    (shots: string[]) => {
      setCapturedShots(shots);
      renderStrip(shots, selectedTheme, caption);
    },
    [caption, renderStrip, selectedTheme]
  );

  // Remote companion camera hook for mobile
  const remoteCamera = useRemoteCameraHost(handleSequenceComplete);

  // Reset or stop camera on open/close
  useEffect(() => {
    if (isOpen) {
      setMode('viewfinder');
      setCapturedShots([]);
      setStripUrl(null);
    } else {
      webcam.stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // If remote camera receives all 3 shots, trigger sequence complete
  useEffect(() => {
    if (
      cameraDevice === 'mobile' &&
      remoteCamera.receivedShots.length >= 3 &&
      remoteCamera.receivedShots.filter(Boolean).length === 3
    ) {
      handleSequenceComplete(remoteCamera.receivedShots);
    }
  }, [cameraDevice, remoteCamera.receivedShots, handleSequenceComplete]);

  // Allow switching theme on the result card
  const handleThemeChangeOnCard = (nextTheme: PhotoThemeId) => {
    setSelectedTheme(nextTheme);
    if (capturedShots.length > 0) {
      renderStrip(capturedShots, nextTheme, caption);
    }
  };

  const handleRetake = () => {
    setStripUrl(null);
    setCapturedShots([]);
    remoteCamera.resetConnection();
    setMode('viewfinder');
  };

  const handleClose = () => {
    webcam.stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-5 sm:p-7 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight font-heading flex items-center gap-1.5">
                <span>After Party Photobooth</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                  3-CUT PRO
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                กล้องถ่ายรูปโพลารอยด์ที่ระลึก 3 ช่อง พร้อมเชื่อมต่อมือถือและ QR Code
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            type="button"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Mode */}
        {mode === 'viewfinder' && (
          <div className="space-y-4">
            {/* Device Mode Switcher (Computer vs Mobile) */}
            <div className="flex items-center justify-center p-1 bg-slate-100 rounded-2xl max-w-sm mx-auto border border-slate-200">
              <button
                type="button"
                onClick={() => setCameraDevice('computer')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  cameraDevice === 'computer'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 text-pink-500" />
                <span>ใช้กล้องคอมพิวเตอร์</span>
              </button>

              <button
                type="button"
                onClick={() => setCameraDevice('mobile')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  cameraDevice === 'mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-pink-500" />
                <span>ใช้กล้องมือถือ (QR)</span>
              </button>
            </div>

            {/* Template Selector Top */}
            <TemplateSelector selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />

            {/* Camera View Area based on Device Selection */}
            {cameraDevice === 'computer' ? (
              /* Direct PC Webcam */
              <SequenceViewfinder
                webcam={webcam}
                themeId={selectedTheme}
                onComplete={handleSequenceComplete}
              />
            ) : (
              /* Mobile Remote Camera Pairing View */
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-fade-in">
                {!remoteCamera.isConnected ? (
                  /* Screen 1: Waiting for Mobile to Scan QR */
                  <div className="flex flex-col md:flex-row gap-5 items-center justify-center py-2">
                    <div className="flex-1">
                      <QRCodeDisplay
                        url={remoteCamera.pairingUrl}
                        title="สแกนเพื่อใช้มือถือเป็นกล้อง"
                        subtitle="เปิดกล้องมือถือส่องเพื่อเชื่อมต่อทันที"
                        size={160}
                      />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center space-y-3 w-full max-w-xs">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 w-full text-center shadow-xs">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                          <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                          <span className="text-sm font-black text-slate-800 font-heading">
                            กำลังรอมือถือเชื่อมต่อ...
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          เปิดกล้องบนมือถือแล้วส่องที่ QR Code เพื่อเปิดหน้ารีโมตกล้องไร้สาย
                        </p>
                      </div>
                      <div className="w-full text-left text-[11px] text-slate-500 space-y-1 bg-white/70 p-3 rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-700">💡 ฟังก์ชันรองรับ:</p>
                        <p>• สลับกล้องหน้า/หลังได้อิสระบนมือถือ</p>
                        <p>• รูปจะเด้งขึ้นพรีวิวบนจอใหญ่นี้ทันทีแบบ Real-Time</p>
                        <p>• เมื่อครบ 3 ช็อตจะเปลี่ยนเข้าหน้าสรุปผลทันที</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Screen 2: Mobile Connected - Large Live Shot Preview & Slot Trackers */
                  <div className="space-y-4 py-1 animate-fade-in">
                    {/* Header connection bar */}
                    <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-800">
                          มือถือเชื่อมต่อสำเร็จแล้ว!
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        ช็อตที่ได้รับ: {remoteCamera.receivedShots.filter(Boolean).length}/3
                      </span>
                    </div>

                    {/* Central Display: Prominent Shot Preview or Waiting Viewfinder */}
                    <div className="relative w-full aspect-16/10 sm:aspect-16/9 bg-slate-900 rounded-2xl overflow-hidden shadow-inner border-2 border-emerald-500/40 flex items-center justify-center">
                      {remoteCamera.latestReceivedIndex !== null &&
                      remoteCamera.receivedShots[remoteCamera.latestReceivedIndex] ? (
                        /* Large Preview of the Latest Shot */
                        <div className="relative w-full h-full animate-fade-in">
                          <img
                            src={remoteCamera.receivedShots[remoteCamera.latestReceivedIndex]}
                            alt={`Preview ช็อต ${remoteCamera.latestReceivedIndex + 1}`}
                            className="w-full h-full object-contain bg-black/80"
                          />
                          {/* Overlay Tag */}
                          <div className="absolute top-3 left-3 bg-emerald-500/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>ได้รับช็อตที่ {remoteCamera.latestReceivedIndex + 1} แล้ว!</span>
                          </div>
                        </div>
                      ) : (
                        /* Waiting for first snap */
                        <div className="flex flex-col items-center justify-center text-center p-6 text-slate-300">
                          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 animate-pulse">
                            <Smartphone className="w-7 h-7 text-pink-400" />
                          </div>
                          <p className="text-sm font-bold text-white font-heading">
                            พร้อมถ่ายภาพแล้ว!
                          </p>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            กดปุ่มถ่ายที่หน้าจอมือถือ ภาพจะเด้งขึ้นแสดงที่จอคอมพิวเตอร์นี้ทันที
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 3-Slot Filmstrip Progress Indicators */}
                    <div className="grid grid-cols-3 gap-3">
                      {[0, 1, 2].map((slotIdx) => {
                        const shot = remoteCamera.receivedShots[slotIdx];
                        const isLatest = remoteCamera.latestReceivedIndex === slotIdx;
                        return (
                          <div
                            key={slotIdx}
                            className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 bg-slate-100 transition-all ${
                              shot
                                ? isLatest
                                  ? 'border-emerald-500 ring-2 ring-emerald-400/50 shadow-md scale-102'
                                  : 'border-slate-300'
                                : 'border-dashed border-slate-300'
                            } flex items-center justify-center`}
                          >
                            {shot ? (
                              <>
                                <img
                                  src={shot}
                                  alt={`ช็อต ${slotIdx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-1 right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-xs">
                                  <span className="text-[9px] font-bold px-1">0{slotIdx + 1}</span>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-400">
                                <span className="text-xs font-mono font-bold">0{slotIdx + 1}</span>
                                <span className="text-[9px]">รอช็อตนี้...</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Caption Input (Enabled exclusively for punpon_sticker) */}
            {PHOTO_THEMES[selectedTheme]?.allowCustomCaption ? (
              <div className="pt-2 border-t border-slate-100 animate-fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>ข้อความส่วนหัวด้านบน:</span>
                    <span className="text-[10px] font-semibold text-emerald-600">(ใหญ่ 32px)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Top Dynamic Text
                  </span>
                </div>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="PUNPON CGM48"
                  maxLength={30}
                  className="w-full px-4 py-2.5 text-2xl sm:text-[32px] font-black border-2 border-emerald-300 rounded-xl bg-emerald-50/40 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>กรอบนี้ใช้ลวดลายต้นฉบับอย่างเป็นทางการ</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Fixed Artwork
                </span>
              </div>
            )}
          </div>
        )}

        {/* Generating Animation Mode */}
        {mode === 'generating' && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative mb-5">
              <div className="w-16 h-16 border-4 border-pink-400 border-t-amber-400 rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </span>
            </div>
            <p className="text-base font-bold text-slate-800 font-heading">
              กำลังประกอบ Photo Sticker Strip 3 ช่อง...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ตกแต่งสติกเกอร์และกรอบลวดลาย 35mm / After Party
            </p>
          </div>
        )}

        {/* Photo Strip Card Mode */}
        {mode === 'card' && stripUrl && (
          <PhotoStripCard
            stripUrl={stripUrl}
            selectedTheme={selectedTheme}
            onSelectTheme={handleThemeChangeOnCard}
            onRetake={handleRetake}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};
