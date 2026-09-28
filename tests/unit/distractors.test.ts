import { describe, expect, it } from 'bun:test';
import { generateOptions } from '../../src/features/quiz';
import { shuffleArray } from '../../src/shared/utils/array';
import type { Song } from '../../src/features/quiz';

describe('distractors engine', () => {
  const mockSongs: Song[] = [
    { id: '1', title: 'Song 1', group: 'CGM48', type: 'single', year: '2020', lines: ['line'] },
    { id: '2', title: 'Song 2', group: 'CGM48', type: 'single', year: '2021', lines: ['line'] },
    { id: '3', title: 'Song 3', group: 'CGM48', type: 'coupling', year: '2022', lines: ['line'] },
    { id: '4', title: 'Song 4', group: 'CGM48', type: 'coupling', year: '2023', lines: ['line'] },
    { id: '5', title: 'Song 5', group: 'BNK48', type: 'single', year: '2024', lines: ['line'] },
    { id: '6', title: 'Song 6', group: 'BNK48', type: 'single', year: '2025', lines: ['line'] },
  ];

  it('shuffles array without losing or duplicating elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('generates exactly 4 unique options including the target song', () => {
    const target = mockSongs[0];
    const options = generateOptions(target, mockSongs);

    expect(options.length).toBe(4);
    // Must contain target song
    expect(options.some((o) => o.id === target.id)).toBe(true);

    // All options must have unique ids
    const uniqueIds = new Set(options.map((o) => o.id));
    expect(uniqueIds.size).toBe(4);
  });
});
