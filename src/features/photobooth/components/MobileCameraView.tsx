import React, { useState, useEffect } from 'react';
import { Camera, RotateCcw, Sparkles, Check, Play, RefreshCw, Smartphone } from 'lucide-react';
import { useWebcam } from '../hooks/useWebcam';
import { useRemoteCameraClient } from '../hooks/useRemoteCamera';
import { DEFAULT_SAMPLE_SHOTS } from '../types/photobooth.types';

interface MobileCameraViewProps {
  roomId: string;
}

export const MobileCameraView: React.FC<MobileCameraViewProps> = ({ roomId }) => {
  const webcam = useWebcam();
  const { videoRef, isActive, error, facingMode, startCamera, switchCamera, captureSnapshot } =
    webcam;

  const { isConnected, sendSnap, sendComplete } = useRemoteCameraClient(roomId);

  const [shots, setShots] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isAutoSequencing, setIsAutoSequencing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Auto start camera on mobile mount
  useEffect(() => {
    if (!isActive) {
      startCamera();
    }
  }, [isActive, startCamera]);

  // Run auto 3-shot sequence
  const startAutoSequence = () => {
    if (isAutoSequencing || countdown !== null || prepCountdown !== null) return;

    setIsAutoSequencing(true);
    setShots([]);
    setActiveSlot(0);

    // Shot 1
    runCountdown(
      3,
      (snap1) => {
        sendSnap(0, snap1);
        setActiveSlot(1);
        runPrepCountdown(2, () => {
          // Shot 2
          runCountdown(
            3,
            (snap2) => {
              sendSnap(1, snap2);
              setActiveSlot(2);
              runPrepCountdown(2, () => {
                // Shot 3
                runCountdown(
                  3,
                  (snap3) => {
                    sendSnap(2, snap3);
                    setIsAutoSequencing(false);
                    const all = [snap1, snap2, snap3];
                    sendComplete(all);
                    setIsDone(true);
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
        // Snap
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
        const snap = captureSnapshot() || DEFAULT_SAMPLE_SHOTS[existingShots.length % 3];
        const updated = [...existingShots, snap];
        setShots(updated);
        onFinish(snap);
      } else {
        setCountdown(current);
      }
    }, 900);
  };

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

  // Manual single snap
  const handleSingleSnap = () => {
    setIsFlashing(true);
    const snap = captureSnapshot() || DEFAULT_SAMPLE_SHOTS[activeSlot % 3];
    setTimeout(() => setIsFlashing(false), 200);

    const updated = [...shots];
    updated[activeSlot] = snap;
    setShots(updated);
    sendSnap(activeSlot, snap);

    if (updated.length >= 3 && updated.filter(Boolean).length === 3) {
      sendComplete(updated);
      setIsDone(true);
    } else {
      setActiveSlot((prev) => Math.min(prev + 1, 2));
    }
  };

  const handleRetakeAll = () => {
    setShots([]);
    setActiveSlot(0);
    setIsDone(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight font-heading text-pink-300">
              PUNPON COMPANION CAM
            </h1>
            <p className="text-[10px] text-slate-400">กล้องมือถือเชื่อมต่อจอใหญ่</p>
          </div>
        </div>

        {/* Connection status badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-bold">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className={isConnected ? 'text-emerald-300' : 'text-amber-300'}>
            {isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-4 flex flex-col items-center">
        {isDone ? (
          /* Success Completed Screen */
          <div className="w-full bg-slate-900/90 border border-pink-500/40 rounded-3xl p-6 text-center animate-fade-in shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-pink-200 font-heading mb-1">
              ถ่ายครบ 3 ช็อตสำเร็จ!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              รูปภาพทั้ง 3 ช็อตถูกส่งไปยังจอคอมพิวเตอร์เรียบร้อยแล้ว กรุณาดูภาพสติกเกอร์ที่จอใหญ่
              และสแกน QR Code เพื่อดาวน์โหลดเก็บไว้ได้เลยครับ
            </p>

            <button
              type="button"
              onClick={handleRetakeAll}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ถ่ายใหม่อีกรอบ (Retake)</span>
            </button>
          </div>
        ) : (
          /* Viewfinder Frame */
          <div className="w-full space-y-4">
            <div className="relative w-full aspect-4/3 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-pink-500/40">
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <span className="text-8xl font-black text-amber-300 animate-ping font-serif drop-shadow-2xl">
                    {countdown}
                  </span>
                  <span className="text-xs font-bold text-white mt-3 uppercase tracking-wider">
                    ช็อตที่ {activeSlot + 1} • ยิ้มเลย!
                  </span>
                </div>
              )}

              {/* Prep countdown */}
              {prepCountdown !== null && (
                <div className="absolute inset-0 bg-purple-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-center p-4">
                  <Sparkles className="w-8 h-8 text-pink-400 animate-bounce mb-2" />
                  <h3 className="text-lg font-black text-white font-heading">เปลี่ยนท่ากันเถอะ!</h3>
                  <p className="text-xs text-pink-200 mt-1">
                    เตรียมช็อตที่ {activeSlot + 1} ในอีก {prepCountdown} วินาที...
                  </p>
                </div>
              )}

              {/* Camera Flash */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-30 transition-opacity duration-150" />
              )}

              {/* Switch camera button */}
              {isActive && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-900/80 text-white flex items-center justify-center backdrop-blur-md shadow-md border border-white/20 active:rotate-180 transition-transform cursor-pointer"
                  title="สลับกล้องหน้า/หลัง"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Target Corners */}
              <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-pink-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-pink-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-pink-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-pink-400 rounded-br-lg" />
              </div>

              {/* Loading / Error states */}
              {!isActive && !error && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-300">กำลังเปิดกล้องมือถือ...</p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-center p-6 text-rose-300">
                  <Camera className="w-8 h-8 mb-2" />
                  <p className="text-xs mb-3 text-slate-300">{error}</p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold"
                  >
                    ลองเปิดกล้องใหม่
                  </button>
                </div>
              )}
            </div>

            {/* 3 Mini Shots Indicator */}
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((idx) => {
                const s = shots[idx];
                const isCurrent = activeSlot === idx;

                return (
                  <div
                    key={idx}
                    className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 bg-slate-900 ${
                      isCurrent ? 'border-pink-500 ring-2 ring-pink-400/50' : 'border-slate-800'
                    }`}
                  >
                    {s ? (
                      <img src={s} alt={`ช็อต ${idx + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-mono text-xs">
                        0{idx + 1}
                      </div>
                    )}
                    {s && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controls */}
      {!isDone && (
        <footer className="space-y-2 pt-2 border-t border-slate-900">
          <button
            type="button"
            onClick={startAutoSequence}
            disabled={isAutoSequencing || !isActive}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isAutoSequencing
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white active:scale-95 shadow-pink-500/30'
            }`}
          >
            {isAutoSequencing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>กำลังถ่ายอัตโนมัติ 3 ช็อต...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>กดถ่าย 3 ช็อตต่อเนื่อง</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSingleSnap}
            disabled={isAutoSequencing || !isActive}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>กดถ่ายทีละช็อต (ช็อตที่ {activeSlot + 1})</span>
          </button>
        </footer>
      )}
    </div>
  );
};
