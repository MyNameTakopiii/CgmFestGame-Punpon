import type { Song, GameOption } from '../types';
import { shuffleArray } from '../../../shared/utils/array';

export function generateOptions(targetSong: Song, allSongs: Song[]): GameOption[] {
  const correctOption: GameOption = {
    id: targetSong.id,
    title: targetSong.title,
    group: targetSong.group,
    year: targetSong.year,
  };

  // Exclude target song
  const candidatePool = allSongs.filter((s) => s.id !== targetSong.id);

  // Group candidates into primary (same group & type), secondary (same group), tertiary (any)
  const primaryPool = candidatePool.filter(
    (s) => s.group === targetSong.group && s.type === targetSong.type
  );
  const secondaryPool = candidatePool.filter(
    (s) => s.group === targetSong.group && s.type !== targetSong.type
  );
  const otherPool = candidatePool.filter((s) => s.group !== targetSong.group);

  const selectedDistractors: Song[] = [];
  const pickedIds = new Set<string>([targetSong.id]);

  function pickFrom(pool: Song[], needed: number) {
    const shuffled = shuffleArray(pool);
    let added = 0;
    for (const song of shuffled) {
      if (added >= needed || selectedDistractors.length >= 3) break;
      if (!pickedIds.has(song.id)) {
        pickedIds.add(song.id);
        selectedDistractors.push(song);
        added++;
      }
    }
  }

  // Pick up to 2 from primary pool if available
  pickFrom(primaryPool, 2);
  // Pick from secondary pool
  if (selectedDistractors.length < 3) {
    pickFrom(secondaryPool, 3 - selectedDistractors.length);
  }
  // Fill remaining from other pool or any candidate
  if (selectedDistractors.length < 3) {
    pickFrom(otherPool, 3 - selectedDistractors.length);
  }
  if (selectedDistractors.length < 3) {
    pickFrom(candidatePool, 3 - selectedDistractors.length);
  }

  const distractorOptions: GameOption[] = selectedDistractors.map((s) => ({
    id: s.id,
    title: s.title,
    group: s.group,
    year: s.year,
  }));

  return shuffleArray([correctOption, ...distractorOptions]);
}
