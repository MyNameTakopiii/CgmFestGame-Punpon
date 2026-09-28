import React from 'react';
import { Sparkles, Heart, Trophy, Check } from 'lucide-react';
import { PHOTO_THEMES, type PhotoThemeId } from '../types/photobooth.types';

interface TemplateSelectorProps {
  selectedTheme: PhotoThemeId;
  onSelectTheme: (themeId: PhotoThemeId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const themeItems: {
    id: PhotoThemeId;
    icon: React.ReactNode;
    previewStyle: string;
    borderActive: string;
  }[] = [
    {
      id: 'punpon_sticker',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
      previewStyle: 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white text-emerald-950',
      borderActive: 'ring-2 ring-emerald-500 border-emerald-400 shadow-emerald-500/20',
    },
    {
      id: 'ge_sticker',
      icon: <Trophy className="w-3.5 h-3.5 text-amber-400" />,
      previewStyle: 'bg-gradient-to-br from-stone-950 via-neutral-900 to-black text-amber-200',
      borderActive: 'ring-2 ring-amber-400 border-amber-400 shadow-amber-400/20',
    },
    {
      id: 'afterschool',
      icon: <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500/20" />,
      previewStyle: 'bg-gradient-to-br from-purple-50 via-pink-50/50 to-white text-purple-950',
      borderActive: 'ring-2 ring-purple-400 border-purple-400 shadow-purple-400/20',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-bold text-slate-700 font-heading">
          เลือกสไตล์กรอบสติกเกอร์ (3 แบบ):
        </label>
        <span className="text-[11px] font-semibold text-pink-600">
          {PHOTO_THEMES[selectedTheme]?.name}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {themeItems.map(({ id, icon, previewStyle, borderActive }) => {
          const theme = PHOTO_THEMES[id];
          const isSelected = selectedTheme === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTheme(id)}
              className={`relative flex flex-col items-center text-center p-2 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${previewStyle} ${
                isSelected
                  ? `${borderActive} shadow-md scale-[1.02]`
                  : 'border-slate-200/80 opacity-80 hover:opacity-100 hover:scale-[1.01]'
              }`}
            >
              {/* Selected Check Badge */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Frame Miniature Thumbnail & Icon */}
              <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-black/10 shadow-xs mb-1.5 bg-slate-100">
                {id === 'punpon_sticker' ? (
                  <div className="w-full h-full bg-[#49c5a8] flex flex-col items-center justify-between py-1 px-1">
                    <span className="text-[5px] font-black text-white uppercase">TEXT</span>
                    <div className="w-full h-2.5 bg-white rounded-xs shadow-xs" />
                    <div className="w-full h-2.5 bg-white rounded-xs shadow-xs" />
                    <div className="w-full h-2.5 bg-white rounded-xs shadow-xs" />
                    <span className="text-[4px] font-black text-white leading-none">#Punpon</span>
                  </div>
                ) : (
                  <img
                    src={theme.framePath}
                    alt={theme.name}
                    className="w-full h-full object-cover object-top"
                  />
                )}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs">
                  {icon}
                </div>
              </div>

              <span className="text-xs font-black tracking-tight leading-tight font-heading">
                {theme.name}
              </span>

              <span className="text-[9px] mt-0.5 opacity-75 line-clamp-1 font-medium">
                {theme.subtitle.split('•')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
