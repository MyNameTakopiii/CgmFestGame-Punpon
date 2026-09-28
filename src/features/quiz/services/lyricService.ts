import type { Song, GameMode, TimeLimit } from '../types';
import { extractKeywords, containsKeyword, estimateDurationMs } from '../../../shared/utils/text';

export { extractKeywords, containsKeyword, estimateDurationMs };

export function sampleLyric(song: Song, mode: GameMode | TimeLimit = 'normal'): string {
  const targetMinDuration = mode === 3 || mode === 'hard' ? 4000 : 6000;
  const keywords = extractKeywords(song.title);
  const lines = song.lines;

  if (!lines || lines.length === 0) {
    return song.title;
  }

  // Find candidate windows of consecutive lines (1 to 3 lines)
  const candidates: { text: string; hasLeak: boolean; duration: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    for (let count = 1; count <= 3 && i + count <= lines.length; count++) {
      const slice = lines.slice(i, i + count);
      const text = slice.join(' ');
      const hasLeak = containsKeyword(text, keywords);
      const duration = estimateDurationMs(text);

      candidates.push({ text, hasLeak, duration });
    }
  }

  // 1. Try to find candidate without leakage that meets duration
  const validDurationNoLeak = candidates.filter(
    (c) => !c.hasLeak && c.duration >= targetMinDuration
  );
  if (validDurationNoLeak.length > 0) {
    const pick = validDurationNoLeak[Math.floor(Math.random() * validDurationNoLeak.length)];
    return pick.text;
  }

  // 2. Try any candidate without leakage
  const anyNoLeak = candidates.filter((c) => !c.hasLeak);
  if (anyNoLeak.length > 0) {
    anyNoLeak.sort((a, b) => b.duration - a.duration);
    return anyNoLeak[0].text;
  }

  // 3. Fallback: mask out any direct keyword match with ellipsis
  let fallbackText = lines.slice(0, Math.min(2, lines.length)).join(' ');
  keywords.forEach((kw) => {
    if (kw.length >= 3) {
      const regex = new RegExp(kw, 'gi');
      fallbackText = fallbackText.replace(regex, '...');
    }
  });

  return fallbackText;
}
