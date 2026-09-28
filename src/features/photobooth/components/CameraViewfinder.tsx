import React, { useState, useEffect } from 'react';
import { Camera, RotateCcw, Upload } from 'lucide-react';
import type { UseWebcamReturn } from '../hooks/useWebcam';

interface CameraViewfinderProps {
  webcam: UseWebcamReturn;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraViewfinder: React.FC<CameraViewfinderProps> = ({ webcam, onCapture }) => {
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

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Auto-start camera when mounted if not active
  useEffect(() => {
    if (!isActive) {
      startCamera();
    }
  }, [isActive, startCamera]);

  // Handle shutter click with optional 3s countdown
  const handleShutter = () => {
    if (countdown !== null) return;

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          triggerSnap();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  const triggerSnap = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      const snapshot = captureSnapshot();
      if (snapshot) {
        onCapture(snapshot);
      }
    }, 200);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = await handleFileUpload(e);
    if (uploaded && uploaded.length > 0) {
      onCapture(uploaded[0]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Viewfinder Frame */}
      <div className="relative w-full aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700/60">
        {/* Video stream */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Viewfinder Target / Corners Overlay */}
        <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-40">
            <div className="w-full h-[1px] bg-white absolute top-1/2" />
            <div className="h-full w-[1px] bg-white absolute left-1/2" />
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-8xl font-black text-amber-300 animate-ping font-serif drop-shadow-lg">
              {countdown}
            </span>
          </div>
        )}

        {/* Camera Flash Overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150" />
        )}

        {/* Camera Inactive / Error Overlay */}
        {!isActive && !error && (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-300">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">กำลังเปิดกล้องเว็บแคม...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-rose-300">
            <Camera className="w-8 h-8 mb-3 text-rose-300" />
            <p className="text-xs mb-4 text-slate-300 leading-relaxed">{error}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              ลองเปิดกล้องอีกครั้ง
            </button>
          </div>
        )}

        {/* Camera Switch Button (Top Right) */}
        {isActive && (
          <button
            onClick={switchCamera}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white flex items-center justify-center backdrop-blur-md shadow-md border border-white/20 transition-transform active:rotate-180 cursor-pointer"
            title="สลับกล้องหน้า/หลัง"
            type="button"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Camera Controls */}
      <div className="mt-5 flex flex-col items-center gap-3 w-full">
        {/* Shutter Button */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleShutter}
            disabled={!isActive || countdown !== null}
            className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              !isActive || countdown !== null
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            title="กดเพื่อถ่ายรูป (นับถอยหลัง 3 วิ)"
            type="button"
          >
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 group-hover:border-amber-300 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all" />
            <div className="w-16 h-16 rounded-full bg-amber-400 group-hover:bg-amber-300 flex items-center justify-center shadow-inner text-slate-900 transition-all">
              <Camera className="w-7 h-7" />
            </div>
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center font-medium">
          กดปุ่มชัตเตอร์เพื่อนับถอยหลัง 3 วิ หรือเลือกอัปโหลดรูป
        </p>

        {/* Upload Fallback */}
        <div className="mt-1">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>หรือเลือกรูปภาพจากเครื่อง</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
          </label>
        </div>
      </div>
    </div>
  );
};
