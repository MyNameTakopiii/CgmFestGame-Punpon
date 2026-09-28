import React from 'react';
import { useGameSession } from '../../hooks/useGameSession';
import {
  Play,
  Music,
  Sparkles,
  Gamepad2,
  Grid,
  ListFilter,
  Timer,
  Zap,
  Clock,
  Volume2,
  Mic,
} from 'lucide-react';
import { ToggleOption } from './ToggleOption';
import { Button } from '../../../../shared/ui';

export const StartScreen: React.FC = () => {
  const { settings, setSettings, startGame } = useGameSession();

  return (
    <article
      aria-labelledby="start-screen-title"
      className="w-full max-w-xl mx-auto px-4 py-4 flex flex-col items-center text-center animate-fade-in"
    >
      {/* Brand & Hero Logo Header (ชมพู.PNG as Title Web) */}
      <header className="flex flex-col items-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 border border-pink-200 text-pink-700 text-xs font-bold mb-3 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span className="font-heading tracking-wide">PUNPON CGM48 TRIBUTE GAME</span>
        </div>

        {/* Hero Web Title Logo */}
        <div className="relative group my-1">
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-300/35 via-sky-300/30 to-amber-200/35 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <img
            src="/punpon-logo.png"
            alt="PUNPON CGM48"
            className="relative w-48 sm:w-56 h-auto object-contain filter drop-shadow-[0_8px_18px_rgba(244,114,182,0.28)] hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="mt-2 text-center">
          <h1
            id="start-screen-title"
            className="text-2xl sm:text-3xl font-black font-heading text-slate-800 tracking-tight"
          >
            ทายท่อนฮิต!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mt-1 font-body">
            ฟังเสียงท่อนเพลงสั้นเพียงไม่กี่วินาทีก่อนตัดเสียง แล้วร่วมทายชื่อเพลง CGM48 (มินิเกม 3
            ข้อจบ)
          </p>
        </div>
      </header>

      {/* Settings Selection Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startGame(settings);
        }}
        className="w-full space-y-4 mb-6 text-left"
        aria-label="ตั้งค่าการเล่นเกม"
      >
        {/* 1. Answer Type */}
        <section aria-labelledby="setting-type-heading" className="space-y-2">
          <h2
            id="setting-type-heading"
            className="text-xs uppercase font-mono tracking-wider text-slate-600 font-bold px-1 flex items-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-600" />
            <span>1. เลือกรูปแบบการตอบ:</span>
          </h2>
          <div className="flex gap-2.5">
            <ToggleOption
              id="setting-answer-choice"
              label="Choice (4 ตัวเลือก)"
              sublabel="กดเลือกจาก 4 ตัวเลือกด่วน"
              icon={<Grid className="w-4 h-4 text-emerald-600" />}
              isActive={settings.answerType === 'choice'}
              onClick={() => setSettings({ answerType: 'choice' })}
            />
            <ToggleOption
              id="setting-answer-dropdown"
              label="Dropdown (36 เพลง)"
              sublabel="ค้นหาจากรายชื่อเพลงทั้งหมด"
              icon={<ListFilter className="w-4 h-4 text-emerald-600" />}
              isActive={settings.answerType === 'dropdown'}
              onClick={() => setSettings({ answerType: 'dropdown' })}
            />
          </div>
        </section>

        {/* 2. Listening Time */}
        <section aria-labelledby="setting-time-heading" className="space-y-2">
          <h2
            id="setting-time-heading"
            className="text-xs uppercase font-mono tracking-wider text-slate-600 font-bold px-1 flex items-center gap-1.5"
          >
            <Timer className="w-4 h-4 text-amber-500" />
            <span>2. เลือกเวลาฟัง:</span>
          </h2>
          <div className="flex gap-2.5">
            <ToggleOption
              id="setting-time-3s"
              label="3 วินาที (ท้าทาย)"
              sublabel="ตัดฉับใน 3 วิ ทดสอบความไว"
              icon={<Zap className="w-4 h-4 text-amber-500" />}
              isActive={settings.timeLimit === 3}
              onClick={() => setSettings({ timeLimit: 3 })}
            />
            <ToggleOption
              id="setting-time-5s"
              label="5 วินาที (ฟังสบาย)"
              sublabel="ฟังท่อนยาว 5 วิ ผ่อนคลายสบายๆ"
              icon={<Clock className="w-4 h-4 text-teal-600" />}
              isActive={settings.timeLimit === 5}
              onClick={() => setSettings({ timeLimit: 5 })}
            />
          </div>
        </section>

        {/* 3. Voice Gender */}
        <section aria-labelledby="setting-voice-heading" className="space-y-2">
          <h2
            id="setting-voice-heading"
            className="text-xs uppercase font-mono tracking-wider text-slate-600 font-bold px-1 flex items-center gap-1.5"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>3. เลือกเสียงร้อง:</span>
          </h2>
          <div className="flex gap-2.5">
            <ToggleOption
              id="setting-voice-male"
              label="เสียงชาย (Male)"
              sublabel="โทนเสียงทุ้มนุ่ม ลึกชัดเจน"
              icon={<Mic className="w-4 h-4 text-blue-500" />}
              isActive={settings.voiceGender === 'male'}
              onClick={() => setSettings({ voiceGender: 'male' })}
            />
            <ToggleOption
              id="setting-voice-female"
              label="เสียงหญิง (Female)"
              sublabel="โทนเสียงสดใส คีย์มาตรฐาน"
              icon={<Music className="w-4 h-4 text-pink-500" />}
              isActive={settings.voiceGender === 'female'}
              onClick={() => setSettings({ voiceGender: 'female' })}
            />
          </div>
        </section>

        {/* Info Badges */}
        <aside
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-2xl bg-white border-2 border-slate-200 text-xs text-slate-600 font-mono font-medium shadow-xs"
          aria-label="ข้อมูลเกม"
        >
          <div className="flex items-center gap-1 text-slate-700">
            <Music className="w-3.5 h-3.5 text-emerald-600" />
            <span>36 เพลงยอดนิยม</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1 text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>เล่นสั้น 3 ข้อจบ</span>
          </div>
        </aside>

        {/* Start Button */}
        <footer className="pt-2">
          <Button
            type="submit"
            variant="glow"
            className="w-full flex items-center justify-center gap-2 text-base py-3.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>เริ่มเกม 3 ข้อเลย! (START)</span>
          </Button>
        </footer>
      </form>
    </article>
  );
};
