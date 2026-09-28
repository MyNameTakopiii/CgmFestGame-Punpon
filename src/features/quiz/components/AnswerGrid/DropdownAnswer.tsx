import React, { useState, useRef, useEffect, useMemo } from 'react';
import { songRepository } from '../../services/songRepository';
import { Button } from '../../../../shared/ui';
import { Search, ChevronDown, Send, X, Check, Music } from 'lucide-react';
import type { Song } from '../../types';

export interface DropdownAnswerProps {
  isResult: boolean;
  selectedOptionId?: string;
  targetSongId: string;
  onSelect: (songId: string) => void;
}

export const DropdownAnswer: React.FC<DropdownAnswerProps> = ({
  isResult,
  selectedOptionId,
  targetSongId,
  onSelect,
}) => {
  const allSongs = useMemo(() => songRepository.getAll(), []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true); // default open so user sees songs immediately
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selected song with selectedOptionId if set externally
  useEffect(() => {
    if (selectedOptionId) {
      const found = allSongs.find((s) => s.id === selectedOptionId);
      if (found) {
        setSelectedSong(found);
        setSearchTerm(found.title);
        setIsOpen(false);
      }
    }
  }, [selectedOptionId, allSongs]);

  // Filter songs based on search term
  const filteredSongs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allSongs;
    return allSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.group.toLowerCase().includes(term) ||
        s.year.includes(term)
    );
  }, [allSongs, searchTerm]);

  const handleSelectSong = (song: Song) => {
    if (isResult) return;
    setSelectedSong(song);
    setSearchTerm(song.title);
    setIsOpen(false);
  };

  const handleClear = () => {
    if (isResult) return;
    setSearchTerm('');
    setSelectedSong(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSong && !isResult) {
      onSelect(selectedSong.id);
    }
  };

  const isCorrect = isResult && selectedOptionId === targetSongId;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm text-left animate-fade-in"
      aria-label="แบบฟอร์มค้นหาและเลือกเพลงจาก Dropdown"
    >
      <label
        htmlFor="song-search-input"
        className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2 px-1"
      >
        พิมพ์ค้นหา / เลือกชื่อเพลง (36 เพลง):
      </label>

      {/* Search Input Box */}
      <div ref={containerRef} className="relative mb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />

          <input
            id="song-search-input"
            type="text"
            disabled={isResult}
            value={searchTerm}
            placeholder="พิมพ์ค้นหาเพลง (เช่น มะลิ, 106, ดีอะ)..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedSong(null);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (!isResult) setIsOpen(true);
            }}
            className={`w-full pl-10 pr-20 py-3 rounded-2xl border-2 font-heading font-semibold text-sm sm:text-base transition-all outline-none ${
              isResult
                ? isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : 'bg-rose-50 border-rose-400 text-rose-950'
                : 'bg-slate-50 hover:bg-slate-100/80 border-slate-300 text-slate-800 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {searchTerm && !isResult && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="ล้างคำค้นหา"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              disabled={isResult}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="เปิด/ปิดรายการเพลง"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Search Results List */}
      {isOpen && !isResult && (
        <div className="mb-4 bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden animate-fade-in shadow-inner">
          <div className="px-3.5 py-1.5 bg-slate-100/90 border-b border-slate-200 text-[11px] font-mono font-bold text-slate-500 flex items-center justify-between">
            <span>ผลการค้นหา</span>
            <span>{filteredSongs.length} เพลง</span>
          </div>

          <ul
            role="listbox"
            aria-label="รายชื่อเพลงที่ค้นหา"
            className="max-h-52 overflow-y-auto divide-y divide-slate-200/60 bg-white"
          >
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song) => {
                const isCurrent = selectedSong?.id === song.id;
                return (
                  <li
                    key={song.id}
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => handleSelectSong(song)}
                    className={`px-3.5 py-2.5 flex items-center justify-between gap-2.5 cursor-pointer text-xs sm:text-sm transition-colors ${
                      isCurrent
                        ? 'bg-emerald-50 text-emerald-950 font-bold'
                        : 'hover:bg-emerald-50/50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                          song.group === 'CGM48'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {song.group}
                      </span>
                      <span className="truncate font-heading">{song.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">{song.year}</span>
                      {isCurrent && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="p-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 font-mono">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>ไม่พบชื่อเพลงที่ค้นหา ลองพิมพ์คำอื่นดูนะ</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Selected Song Confirmation Badge */}
      {selectedSong && !isResult && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 mb-4 animate-fade-in font-mono shadow-sm">
          <Music className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            เลือก:{' '}
            <strong className="font-heading font-black text-sm text-emerald-900">
              {selectedSong.title}
            </strong>{' '}
            ({selectedSong.group} • {selectedSong.year})
          </span>
        </div>
      )}

      {/* Submit Button */}
      {!isResult && (
        <Button
          type="submit"
          variant="glow"
          disabled={!selectedSong}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-base"
        >
          <Send className="w-4 h-4" />
          <span>ยืนยันคำตอบ (Submit Answer)</span>
        </Button>
      )}

      {/* Feedback when answered */}
      {isResult && selectedSong && (
        <div className="text-xs font-mono text-slate-600 px-1 pt-1">
          คุณเลือก:{' '}
          <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
            {selectedSong.title}
          </strong>{' '}
          ({selectedSong.group})
        </div>
      )}
    </form>
  );
};
