import { describe, expect, it } from 'bun:test';
import { evaluateGameSummary, getCheerMessage } from '../../src/features/quiz';
import type { RoundData, Song } from '../../src/features/quiz';

describe('summary engine (3 rounds, no score)', () => {
  it('generates appropriate cheer messages based on correct count', () => {
    expect(getCheerMessage(3, 3)).toContain('แฟนพันธุ์แท้');
    expect(getCheerMessage(2, 3)).toContain('เก่งมาก');
    expect(getCheerMessage(1, 3)).toContain('พยายามได้ดีมาก');
    expect(getCheerMessage(0, 3)).toContain('ไม่เป็นไร');
  });

  it('evaluates game summary correctly without scores or points', () => {
    const dummySong: Song = {
      id: 's1',
      title: 'Chiang Mai 106',
      group: 'CGM48',
      type: 'single',
      year: '2020',
      lines: ['test line'],
    };

    const mockRounds: RoundData[] = [
      {
        roundNumber: 1,
        totalRounds: 3,
        targetSong: dummySong,
        sampledLyric: 'test 1',
        options: [],
        isCorrect: true,
        timeTakenMs: 1500,
        hasReplayed: false,
      },
      {
        roundNumber: 2,
        totalRounds: 3,
        targetSong: dummySong,
        sampledLyric: 'test 2',
        options: [],
        isCorrect: false,
        timeTakenMs: 2500,
        hasReplayed: false,
      },
      {
        roundNumber: 3,
        totalRounds: 3,
        targetSong: dummySong,
        sampledLyric: 'test 3',
        options: [],
        isCorrect: true,
        timeTakenMs: 1200,
        hasReplayed: true,
      },
    ];

    const summary = evaluateGameSummary(mockRounds);
    expect(summary.totalRounds).toBe(3);
    expect(summary.correctCount).toBe(2);
    expect(summary.cheerMessage).toContain('เก่งมาก');
    expect(summary.breakdown).toHaveLength(3);
  });
});
