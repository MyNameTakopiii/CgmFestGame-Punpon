import React, { useState, useEffect, useRef } from 'react';
import { Camera, RotateCcw, Upload, Sparkles, Check, Play, RefreshCw } from 'lucide-react';
import type { UseWebcamReturn } from '../hooks/useWebcam';
import { DEFAULT_SAMPLE_SHOTS, type PhotoThemeId } from '../types/photobooth.types';

interface SequenceViewfinderProps {
  webcam: UseWebcamReturn;
  themeId: PhotoThemeId;
  onComplete: (shots: string[]) => void;
}

export const SequenceViewfinder: React.FC<SequenceViewfinderProps> = ({
  webcam,
  themeId,
  onComplete,
}) => {
  const {
    videoRef,
    isActive,
    error,
    facingMode,
    startCamera,
    switchCamera,
    captureSnapshot,
    handleFileUpload,
  } = webcam;

  const [shots, setShots] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isAutoSequencing, setIsAutoSequencing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasLoadingLong, setHasLoadingLong] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Monitor loading timeout to guide user on browser permission prompt
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (!isActive && !error) {
      timer = setTimeout(() => {
        setHasLoadingLong(true);
      }, 2500);
    } else {
      setHasLoadingLong(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isActive, error]);

  // Auto-start camera when viewfinder is mounted
  useEffect(() => {
    if (!isActive) {
      startCamera();
    }
  }, [isActive, startCamera]);

  // Handle single snapshot trigger
  const snapCurrentShot = (customShotsArray?: string[]): string[] => {
    setIsFlashing(true);
    const snap = captureSnapshot();
    setTimeout(() => setIsFlashing(false), 200);

    const validSnap = snap || DEFAULT_SAMPLE_SHOTS[activeSlot % 3];
    const currentList = customShotsArray || shots;
    const nextShots = [...currentList];
    nextShots[activeSlot] = validSnap;
    setShots(nextShots);

    return nextShots;
  };

  // Run the automated 3-shot sequence (3..2..1 snap -> prep 2s -> 3..2..1 snap -> prep 2s -> 3..2..1 snap)
  const startAutoSequence = () => {
    if (isAutoSequencing || countdown !== null || prepCountdown !== null) return;

    setIsAutoSequencing(true);
    setShots([]);
    setActiveSlot(0);

    // Shot 1
    runCountdown(
      3,
      (snap1) => {
        // Prep for Shot 2
        setActiveSlot(1);
        runPrepCountdown(2, () => {
          // Shot 2
          runCountdown(
            3,
            (snap2) => {
              // Prep for Shot 3
              setActiveSlot(2);
              runPrepCountdown(2, () => {
                // Shot 3
                runCountdown(
                  3,
                  (snap3) => {
                    setIsAutoSequencing(false);
                    const allShots = [snap1, snap2, snap3];
                    onComplete(allShots);
                  },
                  [snap1, snap2]
                );
              });
            },
            [snap1]
          );
        });
      },
      []
    );
  };

  // Helper: Run 3-2-1 countdown then snap
  const runCountdown = (
    startNum: number,
    onFinish: (latestSnap: string) => void,
    existingShots: string[]
  ) => {
    setCountdown(startNum);
    let current = startNum;

    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setCountdown(null);
        // Take snap
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
        const slotIdx = existingShots.length;
        const snap = captureSnapshot() || DEFAULT_SAMPLE_SHOTS[slotIdx % 3];
        const updated = [...existingShots, snap];
        setShots(updated);
        onFinish(snap);
      } else {
        setCountdown(current);
      }
    }, 900);
  };

  // Helper: Run prep pause countdown between shots (e.g. 2s)
  const runPrepCountdown = (startNum: number, onFinish: () => void) => {
    setPrepCountdown(startNum);
    let current = startNum;

    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setPrepCountdown(null);
        onFinish();
      } else {
        setPrepCountdown(current);
      }
    }, 1000);
  };

  // Manual single shot capture
  const handleManualSnap = () => {
    const next = snapCurrentShot();
    if (next.length >= 3 && next.filter(Boolean).length === 3) {
      onComplete(next);
    } else {
      setActiveSlot((prev) => Math.min(prev + 1, 2));
    }
  };

  // File upload fallback (supports multiple different photos)
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedList = await handleFileUpload(e);
    if (!uploadedList || uploadedList.length === 0) return;

    if (uploadedList.length >= 3) {
      // User selected 3 or more photos: fill all 3 slots with distinct photos
      const newShots = uploadedList.slice(0, 3);
      setShots(newShots);
      onComplete(newShots);
      return;
    }

    if (uploadedList.length === 2) {
      // User selected 2 photos: fill slots 0 and 1, slot 2 gets 3rd distinct sample
      const newShots = [uploadedList[0], uploadedList[1], DEFAULT_SAMPLE_SHOTS[2]];
      setShots(newShots);
      onComplete(newShots);
      return;
    }

    // Single photo selected: place in activeSlot and ensure all 3 slots have distinct photos
    const newShots = [
      activeSlot === 0 ? uploadedList[0] : shots[0] || DEFAULT_SAMPLE_SHOTS[0],
      activeSlot === 1 ? uploadedList[0] : shots[1] || DEFAULT_SAMPLE_SHOTS[1],
      activeSlot === 2 ? uploadedList[0] : shots[2] || DEFAULT_SAMPLE_SHOTS[2],
    ];
    setShots(newShots);
    onComplete(newShots);
  };

  const handleResetShots = () => {
    setShots([]);
    setActiveSlot(0);
    setIsAutoSequencing(false);
    setCountdown(null);
    setPrepCountdown(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center w-full max-w-2xl mx-auto">
      {/* Left/Main: Camera Viewfinder (Full-size camera feed) */}
      <div className="relative w-full aspect-4/3 max-w-md bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700/60 flex-1">
        {/* Video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Viewfinder Target Overlays */}
        {(() => {
          const cornerColor =
            themeId === 'ge_sticker'
              ? 'border-amber-400'
              : themeId === 'afterschool'
                ? 'border-purple-400'
                : 'border-emerald-400';
          return (
            <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl">
              <div
                className={`absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 ${cornerColor} rounded-tl-lg`}
              />
              <div
                className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 ${cornerColor} rounded-tr-lg`}
              />
              <div
                className={`absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 ${cornerColor} rounded-bl-lg`}
              />
              <div
                className={`absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 ${cornerColor} rounded-br-lg`}
              />
            </div>
          );
        })()}

        {/* Active Shot Badge (Top Left) */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-1.5 text-white text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span>ช็อตที่ {activeSlot + 1} / 3</span>
        </div>

        {/* Switch Camera Button (Top Right) */}
        {isActive && (
          <button
            onClick={switchCamera}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md shadow-md border border-white/20 transition-transform active:rotate-180 cursor-pointer"
            title="สลับกล้องหน้า/หลัง"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Countdown Overlay (3, 2, 1) */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center z-20 animate-fade-in">
            <span className="text-8xl font-black text-amber-300 animate-ping font-serif drop-shadow-2xl">
              {countdown}
            </span>
            <span className="text-sm font-bold text-white mt-4 tracking-wider uppercase">
              ช็อตที่ {activeSlot + 1} • ยิ้มหวาน!
            </span>
          </div>
        )}

        {/* Prep Pause Overlay between shots */}
        {prepCountdown !== null && (
          <div className="absolute inset-0 bg-purple-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-center p-4">
            <Sparkles className="w-8 h-8 text-pink-400 animate-bounce mb-2" />
            <h4 className="text-lg font-black text-white font-heading">เปลี่ยนท่ากันเถอะ!</h4>
            <p className="text-xs text-pink-200 mt-1">
              กำลังจะถ่ายช็อตที่ {activeSlot + 1} ในอีก {prepCountdown} วินาที...
            </p>
          </div>
        )}

        {/* Flash effect */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150" />
        )}

        {/* Inactive / Loading state */}
        {!isActive && !error && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-slate-300">
            <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-white mb-1">กำลังเชื่อมต่อกล้องเว็บแคม...</p>
            {hasLoadingLong && (
              <div className="mt-2 max-w-xs animate-fade-in bg-slate-800/90 border border-slate-700 p-3 rounded-xl shadow-lg">
                <p className="text-[11px] text-pink-300 font-medium leading-relaxed">
                  หากเบราว์เซอร์แสดงหน้าต่างขอสิทธิ์ กรุณากด{' '}
                  <strong>&quot;อนุญาต (Allow)&quot;</strong> ที่มุมบนของหน้าต่าง
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    ลองเปิดกล้องใหม่
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    เลือกรูปภาพจากเครื่อง
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Camera Error state */}
        {error && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-rose-300">
            <Camera className="w-8 h-8 mb-2 text-rose-300" />
            <p className="text-xs mb-3 text-slate-300 leading-relaxed">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              ลองเปิดกล้องใหม่
            </button>
          </div>
        )}
      </div>

      {/* Right/Side: 3-Cut Mini Preview Strip & Controls */}
      <div className="flex flex-col items-center justify-between w-full md:w-48 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <div className="w-full text-center pb-2 border-b border-slate-200 mb-2">
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-heading">
            3-Cut Film Strip
          </span>
          <p className="text-[9px] text-slate-500">แตะช่องเพื่อเลือกถ่ายซ้ำได้</p>
        </div>

        {/* 3 Mini Slots */}
        <div className="flex md:flex-col gap-2 w-full justify-center">
          {[0, 1, 2].map((slotIdx) => {
            const shot = shots[slotIdx];
            const isCurrent = activeSlot === slotIdx;

            return (
              <button
                key={slotIdx}
                type="button"
                onClick={() => !isAutoSequencing && setActiveSlot(slotIdx)}
                className={`relative flex-1 md:flex-none aspect-4/3 md:h-20 w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-pink-500 ring-2 ring-pink-400/40 scale-102 shadow-md'
                    : 'border-slate-300 hover:border-slate-400'
                } bg-slate-200`}
              >
                {shot ? (
                  <img
                    src={shot}
                    alt={`ช็อตที่ ${slotIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <Camera className="w-4 h-4 mb-0.5 opacity-60" />
                    <span className="text-[10px] font-bold font-mono">0{slotIdx + 1}</span>
                  </div>
                )}

                {/* Badge Number */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/60 text-white rounded text-[8px] font-mono font-bold">
                  {slotIdx + 1}
                </div>

                {/* Checkmark when filled */}
                {shot && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="w-full mt-3 space-y-2">
          {/* Primary: Start Auto 3-Shot Sequence */}
          <button
            onClick={startAutoSequence}
            title="กดเพื่อถ่ายรูป"
            disabled={isAutoSequencing || !isActive}
            className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer ${
              isAutoSequencing
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white active:scale-95 shadow-pink-500/25'
            }`}
            type="button"
          >
            {isAutoSequencing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังถ่าย 3 ช็อต...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>เริ่มถ่าย 3 ช็อตอัตโนมัติ</span>
              </>
            )}
          </button>

          {/* Secondary: Manual Snap 1 Shot */}
          <button
            onClick={handleManualSnap}
            title="ถ่ายเฉพาะช็อตนี้"
            disabled={isAutoSequencing || !isActive}
            className="w-full py-2 px-3 rounded-xl font-bold text-[11px] bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            type="button"
          >
            <Camera className="w-3.5 h-3.5 text-pink-500" />
            <span>ถ่ายเฉพาะช็อตที่ {activeSlot + 1}</span>
          </button>

          {/* File Upload Fallback */}
          <input
            id="photobooth-file-upload-input"
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <label
            htmlFor="photobooth-file-upload-input"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>หรือเลือกรูปภาพจากเครื่อง (เลือกได้ 1-3 รูปต่างกัน)</span>
          </label>

          {/* Quick Demo: 3 Distinct Sample Shots */}
          <button
            type="button"
            onClick={() => {
              setShots([...DEFAULT_SAMPLE_SHOTS]);
              onComplete([...DEFAULT_SAMPLE_SHOTS]);
            }}
            className="w-full py-1 text-[10px] font-semibold text-pink-600 hover:text-pink-700 hover:underline flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>ทดลองด้วยรูปตัวอย่าง 3 แบบต่างกัน</span>
          </button>

          {shots.filter(Boolean).length > 0 && shots.filter(Boolean).length < 3 && (
            <button
              type="button"
              onClick={() => {
                const filledShots: string[] = [
                  shots[0] || DEFAULT_SAMPLE_SHOTS[0],
                  shots[1] || DEFAULT_SAMPLE_SHOTS[1],
                  shots[2] || DEFAULT_SAMPLE_SHOTS[2],
                ];
                setShots(filledShots);
                onComplete(filledShots);
              }}
              className="w-full py-1.5 px-3 rounded-lg text-[10px] font-bold bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>ใช้รูปที่เลือกนี้แล้วเติมรูปตัวอย่างให้ครบ 3 ช็อต</span>
            </button>
          )}

          {shots.length > 0 && (
            <button
              onClick={handleResetShots}
              type="button"
              className="w-full text-[10px] text-rose-500 hover:text-rose-700 font-medium text-center block pt-1 cursor-pointer"
            >
              ล้างรูปทั้งหมดเพื่อเริ่มใหม่
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
