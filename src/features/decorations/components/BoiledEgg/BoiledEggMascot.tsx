import React, { useState } from 'react';

const MESSAGES = [
  'ยินดีต้อนรับสู่ After Party !!!',
  'น้องไข่ต้มเป็นกำลังใจให้ทุกข้อเลย',
  'เพลงของ CGM48 น่ารักมาก',
  'ฟังท่อนฮิตแล้วทายให้ถูกนะ',
  'แตะที่รูปโพลารอยด์เพื่อถ่ายภาพที่ระลึก',
  'ฟังเพลงเพลินๆ แล้วลุยกันต่อเลย',
];

export const BoiledEggMascot: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
  const [isWiggling, setIsWiggling] = useState(false);

  const handleClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
    setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    setShowBubble(true);
  };

  return (
    <aside
      aria-label="มาสคอตน้องไข่ต้ม After Party"
      className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-none"
    >
      {/* Speech Bubble */}
      {showBubble && (
        <div
          onClick={handleClick}
          className="relative mb-2 ml-4 px-3 py-1.5 bg-white border-2 border-amber-300 rounded-2xl shadow-[0_4px_12px_rgba(245,158,11,0.15),0_2px_0_#d97706] text-xs font-heading font-black text-amber-950 cursor-pointer animate-fade-in hover:scale-105 transition-transform"
        >
          <span>{MESSAGES[messageIndex]}</span>
          {/* Bubble tail */}
          <div className="absolute -bottom-2 left-5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-300" />
          <div className="absolute -bottom-1.5 left-5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-white" />
        </div>
      )}

      {/* Interactive Mascot Button */}
      <button
        type="button"
        onClick={handleClick}
        title="แตะน้องไข่ต้มเพื่อคุยกัน!"
        className={`group relative cursor-pointer outline-none transition-transform duration-200 ${
          isWiggling ? 'animate-shake' : 'animate-egg-float'
        } hover:scale-110 active:scale-95`}
      >
        <svg
          width="76"
          height="88"
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_16px_rgba(15,23,42,0.12)]"
        >
          {/* Party Hat */}
          <g className="origin-bottom transform transition-transform group-hover:rotate-6">
            <path
              d="M 50 2 L 68 35 L 32 35 Z"
              fill="url(#partyHatGrad)"
              stroke="#059669"
              strokeWidth="2"
            />
            {/* Hat Stripes */}
            <path
              d="M 37 25 L 63 25"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.8"
            />
            <path d="M 43 14 L 57 14" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
            {/* Hat Pom-pom Star */}
            <circle cx="50" cy="2" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          </g>

          {/* Egg White Body (Boiled egg sliced silhouette) */}
          <path
            d="M 50 25 C 28 25, 12 45, 12 70 C 12 95, 28 110, 50 110 C 72 110, 88 95, 88 70 C 88 45, 72 25, 50 25 Z"
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="3.5"
          />

          {/* Soft inner egg white gradient */}
          <path
            d="M 50 28 C 30 28, 16 46, 16 70 C 16 92, 30 106, 50 106 C 70 106, 84 92, 84 70 C 84 46, 70 28, 50 28 Z"
            fill="url(#eggWhiteGrad)"
          />

          {/* Golden Yolk */}
          <ellipse
            cx="50"
            cy="74"
            rx="24"
            ry="24"
            fill="url(#yolkGrad)"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />

          {/* Yolk Gloss Shine */}
          <ellipse
            cx="42"
            cy="62"
            rx="6"
            ry="3.5"
            transform="rotate(-25 42 62)"
            fill="#ffffff"
            opacity="0.65"
          />

          {/* Happy Smiling Eyes (^ ^) */}
          <path
            d="M 39 72 Q 43 67 47 72"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 53 72 Q 57 67 61 72"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Cute Smile Mouth */}
          <path
            d="M 47 77 Q 50 82 53 77"
            stroke="#9a3412"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Blushing Rosy Cheeks */}
          <ellipse cx="36" cy="76" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45" />
          <ellipse cx="64" cy="76" rx="4" ry="2.5" fill="#f43f5e" opacity="0.45" />

          {/* Gradients */}
          <defs>
            <linearGradient
              id="partyHatGrad"
              x1="50"
              y1="2"
              x2="50"
              y2="35"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#10b981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
            <linearGradient
              id="eggWhiteGrad"
              x1="50"
              y1="28"
              x2="50"
              y2="106"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#f8fafc" />
            </linearGradient>
            <radialGradient id="yolkGrad" cx="0.4" cy="0.35" r="0.75" fx="0.4" fy="0.35">
              <stop stopColor="#fef08a" />
              <stop offset="0.6" stopColor="#fbbf24" />
              <stop offset="1" stopColor="#f59e0b" />
            </radialGradient>
          </defs>
        </svg>

        {/* Mascot Name Badge */}
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[9px] font-black tracking-wide shadow-sm border border-amber-400">
          ไข่ต้ม
        </span>
      </button>
    </aside>
  );
};
