import React, { useState, useEffect } from 'react';
import {
  Camera,
  RotateCcw,
  Sparkles,
  Check,
  Play,
  RefreshCw,
  Smartphone,
  Send,
  CheckCircle2,
} from 'lucide-react';
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

  const { isConnected, sendBatchShots } = useRemoteCameraClient(roomId);

  const [shots, setShots] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [prepCountdown, setPrepCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isAutoSequencing, setIsAutoSequencing] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Auto start camera on mobile mount
  useEffect(() => {
    if (!isActive) {
      startCamera();
    }
  }, [isActive, startCamera]);

  // Run auto 3-shot sequence locally on mobile
  const startAutoSequence = () => {
    if (isAutoSequencing || countdown !== null || prepCountdown !== null) return;

    setIsAutoSequencing(true);
    setShots([]);
    setActiveSlot(0);
    setIsReviewing(false);

    // Shot 1
    runCountdown(
      3,
      (snap1) => {
        setActiveSlot(1);
        runPrepCountdown(2, () => {
          // Shot 2
          runCountdown(
            3,
            (snap2) => {
              setActiveSlot(2);
              runPrepCountdown(2, () => {
                // Shot 3
                runCountdown(
                  3,
                  (snap3) => {
                    setIsAutoSequencing(false);
                    setShots([snap1, snap2, snap3]);
                    setIsReviewing(true);
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
        // Flash & Snap
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
        const snap =
          captureSnapshot(960, 0.78) || DEFAULT_SAMPLE_SHOTS[existingShots.length % 3];
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
    const snap = captureSnapshot(960, 0.78) || DEFAULT_SAMPLE_SHOTS[activeSlot % 3];
    setTimeout(() => setIsFlashing(false), 200);

    const updated = [...shots];
    updated[activeSlot] = snap;
    setShots(updated);

    if (activeSlot >= 2 || (updated[0] && updated[1] && updated[2])) {
      setIsReviewing(true);
    } else {
      setActiveSlot((prev) => Math.min(prev + 1, 2));
    }
  };

  // Reset to retake
  const handleRetakeAll = () => {
    setShots([]);
    setActiveSlot(0);
    setIsReviewing(false);
    setIsDone(false);
    setIsSending(false);
  };

  // Submit all 3 shots to computer in batch
  const handleSendToComputer = async () => {
    if (shots.length < 3 || isSending) return;

    setIsSending(true);
    try {
      await sendBatchShots([shots[0], shots[1], shots[2]]);
      setIsDone(true);
      setIsReviewing(false);
    } catch (err) {
      console.error('Failed to send shots:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between p-4 max-w-md mx-auto font-sans">
      {/* Top Header */}
      <header className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 font-heading">
              PUNPON COMPANION CAM
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">กล้องมือถือถ่ายภาพคู่จอคอม</p>
          </div>
        </div>

        {/* Connection status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs text-[11px] font-bold">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className={isConnected ? 'text-emerald-700' : 'text-amber-700'}>
            {isConnected ? 'พร้อมส่งภาพ' : 'เชื่อมต่อจอ'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-3 flex flex-col items-center w-full">
        {/* State 1: Success / Done Screen */}
        {isDone ? (
          <div className="w-full bg-white border border-pink-100 rounded-3xl p-6 text-center shadow-xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-heading mb-2">
              ส่งภาพ 3 ช็อตไปยังคอมเรียบร้อย!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              รูปภาพทั้ง 3 ช็อตแสดงบนจอคอมพิวเตอร์แล้วครับ เชิญดูหน้าจอใหญ่เพื่อเลือกกรอบ
              ตกแต่งสติกเกอร์ และรับภาพที่ระลึกได้เลย!
            </p>

            <button
              type="button"
              onClick={handleRetakeAll}
              className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>ถ่ายชุดใหม่อีกรอบ (Take Another)</span>
            </button>
          </div>
        ) : isReviewing ? (
          /* State 2: Review Screen (ตรวจดูภาพ 3 ช็อตก่อนส่ง) */
          <div className="w-full bg-white border border-pink-100 rounded-3xl p-5 shadow-xl animate-fade-in space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-[11px] font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ถ่ายครบ 3 ช็อตแล้ว!</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                ตรวจดูภาพถ่ายของคุณ
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ตรวจสอบภาพให้พอใจ แล้วกดปุ่มส่งภาพไปยังหน้าจอคอมพิวเตอร์
              </p>
            </div>

            {/* 3 Review Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {[0, 1, 2].map((idx) => {
                const s = shots[idx];
                return (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm"
                  >
                    {s ? (
                      <img
                        src={s}
                        alt={`ช็อตที่ ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                        0{idx + 1}
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons for Review */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSendToComputer}
                disabled={isSending}
                className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  isSending
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/30 active:scale-95'
                }`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>กำลังส่งภาพไปยังจอคอม...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 fill-current" />
                    <span>ส่งภาพ 3 ช็อตไปที่คอมพิวเตอร์</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRetakeAll}
                disabled={isSending}
                className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>ไม่ถูกใจ ถ่ายใหม่อีกรอบ (Retake)</span>
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Live Viewfinder Screen */
          <div className="w-full space-y-3">
            <div className="relative w-full aspect-4/3 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-2 border-slate-200">
              {/* Video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  facingMode === 'user' ? 'scale-x-[-1]' : 'scale-x-100'
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
                <div className="absolute inset-0 bg-pink-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 text-center p-4">
                  <Sparkles className="w-8 h-8 text-pink-300 animate-bounce mb-2" />
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

              {/* Switch camera button (กล้องหน้า / กล้องหลัง) */}
              {isActive && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-full bg-white/90 text-slate-800 flex items-center gap-1.5 backdrop-blur-md shadow-md border border-slate-200 active:scale-90 transition-all cursor-pointer hover:bg-white"
                  title="แตะเพื่อสลับกล้องหน้า/หลัง"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
                  <span className="text-[11px] font-bold">
                    {facingMode === 'user' ? 'กล้องหน้า' : 'กล้องหลัง'}
                  </span>
                </button>
              )}

              {/* Viewfinder Target Framing Corners */}
              <div className="absolute inset-4 pointer-events-none border border-white/30 rounded-2xl">
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
                    className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 bg-white shadow-xs ${
                      isCurrent
                        ? 'border-pink-500 ring-2 ring-pink-400/40'
                        : 'border-slate-200'
                    }`}
                  >
                    {s ? (
                      <img
                        src={s}
                        alt={`ช็อต ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                        <span>ช็อต {idx + 1}</span>
                      </div>
                    )}
                    {s && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
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

      {/* Bottom Controls (Only when in live viewfinder mode) */}
      {!isDone && !isReviewing && (
        <footer className="space-y-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={startAutoSequence}
            disabled={isAutoSequencing || !isActive}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isAutoSequencing
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 text-white active:scale-95 shadow-pink-500/25'
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
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
          >
            <Camera className="w-4 h-4 text-pink-500" />
            <span>กดถ่ายทีละช็อต (ช็อตที่ {activeSlot + 1})</span>
          </button>
        </footer>
      )}
    </div>
  );
};
