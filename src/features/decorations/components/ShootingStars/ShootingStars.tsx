import React from 'react';

/**
 * Realistic Optical Star Flare (4-point diffraction spikes with glowing core)
 * No emojis used - Pure SVG optical diffraction pattern
 */
interface OpticalStarProps {
  top: string;
  left?: string;
  right?: string;
  size: number;
  glowColor: string;
  delay: string;
  duration: string;
}

const OpticalStar: React.FC<OpticalStarProps> = ({
  top,
  left,
  right,
  size,
  glowColor,
  delay,
  duration,
}) => {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        top,
        left,
        right,
        width: `${size}px`,
        height: `${size}px`,
        animation: `star-twinkle ${duration} ease-in-out infinite ${delay}`,
      }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 ${size * 0.25}px ${glowColor})` }}
      >
        <defs>
          <radialGradient id={`core-glow-${top}-${left || right}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor={glowColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer subtle radial aura */}
        <circle
          cx="20"
          cy="20"
          r="14"
          fill={`url(#core-glow-${top}-${left || right})`}
          opacity="0.4"
        />

        {/* Horizontal needle flare */}
        <path d="M 2 20 Q 20 18.2 38 20 Q 20 21.8 2 20 Z" fill="#ffffff" opacity="0.95" />

        {/* Vertical needle flare */}
        <path d="M 20 2 Q 18.2 20 20 38 Q 21.8 20 20 2 Z" fill="#ffffff" opacity="0.95" />

        {/* Secondary subtle diagonal spikes */}
        <path d="M 10 10 Q 20 19 30 30 Q 20 21 10 10 Z" fill={glowColor} opacity="0.6" />
        <path d="M 10 30 Q 20 21 30 10 Q 20 19 10 30 Z" fill={glowColor} opacity="0.6" />

        {/* Bright white hot center core */}
        <circle cx="20" cy="20" r="2.2" fill="#ffffff" />
      </svg>
    </div>
  );
};

export const ShootingStars: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      data-testid="shooting-stars-background"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
    >
      {/* 1. Realistic High-Velocity Meteors with Ionized Comet Tails (ดาวตกสมจริง) */}
      {/* Meteor 1: Emerald & White Plasma */}
      <div
        className="absolute top-[6%] right-[8%] w-56 h-[2px] opacity-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(52,211,153,0.3) 30%, rgba(16,185,129,0.85) 75%, #ffffff 100%)',
          boxShadow: '0 0 12px rgba(52,211,153,0.9), 0 0 24px rgba(16,185,129,0.6)',
          animation: 'shooting-star 6.8s cubic-bezier(0.25, 0.1, 0.25, 1) infinite 0.6s',
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_18px_rgba(52,211,153,0.9)]" />
      </div>

      {/* Meteor 2: Warm Golden Plasma */}
      <div
        className="absolute top-[20%] right-[30%] w-64 h-[2.5px] opacity-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(245,158,11,0.25) 30%, rgba(251,191,36,0.9) 80%, #ffffff 100%)',
          boxShadow: '0 0 14px rgba(251,191,36,0.9), 0 0 28px rgba(245,158,11,0.6)',
          animation: 'shooting-star 8.5s cubic-bezier(0.25, 0.1, 0.25, 1) infinite 3.8s',
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_12px_#ffffff,0_0_20px_rgba(251,191,36,0.9)]" />
      </div>

      {/* Meteor 3: Cyan & Turquoise Plasma */}
      <div
        className="absolute top-[4%] right-[55%] w-48 h-[2px] opacity-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(14,165,233,0.3) 30%, rgba(56,189,248,0.85) 75%, #ffffff 100%)',
          boxShadow: '0 0 10px rgba(56,189,248,0.9)',
          animation: 'shooting-star 7.4s cubic-bezier(0.25, 0.1, 0.25, 1) infinite 6.2s',
        }}
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_rgba(56,189,248,0.9)]" />
      </div>

      {/* 2. Realistic Optical Diffraction Stars (ดาวแสงแฟลร์ 4 แฉก - ไม่มี Emoji) */}
      {/* Top Left Cluster */}
      <OpticalStar
        top="45px"
        left="60px"
        size={28}
        glowColor="#34d399"
        duration="3.2s"
        delay="0.3s"
      />
      <OpticalStar
        top="110px"
        left="140px"
        size={20}
        glowColor="#fbbf24"
        duration="4.1s"
        delay="1.2s"
      />
      <OpticalStar
        top="190px"
        left="45px"
        size={16}
        glowColor="#38bdf8"
        duration="3.6s"
        delay="2.0s"
      />

      {/* Top Right Cluster */}
      <OpticalStar
        top="55px"
        right="80px"
        size={32}
        glowColor="#fbbf24"
        duration="3.8s"
        delay="0.8s"
      />
      <OpticalStar
        top="130px"
        right="160px"
        size={18}
        glowColor="#34d399"
        duration="4.4s"
        delay="1.9s"
      />
      <OpticalStar
        top="220px"
        right="70px"
        size={22}
        glowColor="#38bdf8"
        duration="3.4s"
        delay="2.7s"
      />

      {/* Bottom Floating Atmosphere Stars */}
      <OpticalStar
        top="70%"
        left="80px"
        size={22}
        glowColor="#34d399"
        duration="4.0s"
        delay="1.5s"
      />
      <OpticalStar
        top="78%"
        right="100px"
        size={24}
        glowColor="#fbbf24"
        duration="3.5s"
        delay="0.5s"
      />
      <OpticalStar
        top="85%"
        left="45%"
        size={18}
        glowColor="#38bdf8"
        duration="4.2s"
        delay="2.2s"
      />

      {/* 3. Deep Celestial Star Dust (จุดละอองดาวขนาดจิ๋ว 1-2.5px เสมือนท้องฟ้าจริง) */}
      <div
        className="absolute top-16 left-1/4 w-1.5 h-1.5 rounded-full bg-emerald-300/60 shadow-[0_0_4px_#34d399]"
        style={{ animation: 'star-twinkle 2.8s ease-in-out infinite 0.4s' }}
      />
      <div
        className="absolute top-32 left-1/3 w-1 h-1 rounded-full bg-amber-200/70 shadow-[0_0_3px_#fde68a]"
        style={{ animation: 'star-twinkle 3.5s ease-in-out infinite 1.8s' }}
      />
      <div
        className="absolute top-24 right-1/4 w-2 h-2 rounded-full bg-cyan-200/60 shadow-[0_0_5px_#a5f3fc]"
        style={{ animation: 'star-twinkle 4.2s ease-in-out infinite 0.9s' }}
      />
      <div
        className="absolute top-48 right-1/3 w-1.5 h-1.5 rounded-full bg-emerald-200/60 shadow-[0_0_4px_#a7f3d0]"
        style={{ animation: 'star-twinkle 3.1s ease-in-out infinite 2.5s' }}
      />
      <div
        className="absolute bottom-32 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-200/60 shadow-[0_0_4px_#fde68a]"
        style={{ animation: 'star-twinkle 3.9s ease-in-out infinite 1.1s' }}
      />
      <div
        className="absolute bottom-44 right-1/4 w-1 h-1 rounded-full bg-cyan-200/70 shadow-[0_0_3px_#a5f3fc]"
        style={{ animation: 'star-twinkle 3.3s ease-in-out infinite 2.9s' }}
      />
    </div>
  );
};
