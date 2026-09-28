import { describe, expect, it } from 'bun:test';
import {
  extractKeywords,
  containsKeyword,
  estimateDurationMs,
  sampleLyric,
} from '../../src/features/quiz';
import type { Song } from '../../src/features/quiz';

describe('lyricSampler engine', () => {
  it('extracts meaningful title keywords and ignores stop words', () => {
    const keywords = extractKeywords('Chiang Mai 106 (CGM48 Ver.)');
    expect(keywords).toContain('chiang');
    expect(keywords).toContain('mai');
    expect(keywords).toContain('106');
    expect(keywords).not.toContain('ver');
    expect(keywords).not.toContain('cgm48');
  });

  it('detects when a lyric line contains title keywords', () => {
    const keywords = ['chiang', 'mai', '106'];
    expect(containsKeyword('ยินดีต้อนรับสู่ Chiang Mai ที่สดใส', keywords)).toBe(true);
    expect(containsKeyword('ยินดีต้อนรับสู่แดนดินถิ่นล้านนา', keywords)).toBe(false);
  });

  it('estimates speech duration based on character length', () => {
    const shortText = 'สวัสดี';
    const longText =
      'หนาว ยังมีวันเหือดหาย น้ำค้างเกาะพรายบนยอดหญ้า มีเรื่องราวมากมายที่ยังคงตราตรึงอยู่ในใจ';
    expect(estimateDurationMs(longText)).toBeGreaterThan(estimateDurationMs(shortText));
    expect(estimateDurationMs(longText)).toBeGreaterThan(3000);
  });

  it('samples valid consecutive lines from a song without title leak', () => {
    const mockSong: Song = {
      id: 'mock_01',
      title: 'มะลิ (Mali)',
      group: 'CGM48',
      type: 'single',
      year: '2021',
      lines: [
        'เจ้าดอกมะลิหอมฟุ้งไปทั่วดอย',
        'ลมพัดพาความรักมาสู่หัวใจของพวกเราทุกคนในวันนี้',
        'ก้าวเดินต่อไปด้วยความหวังที่สดใสในวันข้างหน้า',
      ],
    };

    const sampled = sampleLyric(mockSong, 'easy');
    expect(typeof sampled).toBe('string');
    expect(sampled.length).toBeGreaterThan(0);
    // Should avoid leaking "มะลิ" or "Mali"
    expect(sampled).not.toContain('มะลิ');
    expect(sampled.toLowerCase()).not.toContain('mali');
    const isFromValidLines =
      sampled.includes('ลมพัดพาความรัก') || sampled.includes('ก้าวเดินต่อไปด้วยความหวัง');
    expect(isFromValidLines).toBe(true);
  });
});
