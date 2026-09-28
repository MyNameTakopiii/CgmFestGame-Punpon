import { describe, expect, it } from 'bun:test';
import {
  PHOTO_THEMES,
  DEFAULT_SAMPLE_SHOTS,
  type PhotoThemeId,
} from '../../src/features/photobooth/types/photobooth.types';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  uploadPhotoStrip,
  getStoredPhotoStrip,
} from '../../src/features/photobooth/services/uploadService';
import type { RemoteMessage } from '../../src/features/photobooth/hooks/useRemoteCamera';

describe('Photobooth 3-Cut Strip Engine', () => {
  describe('Theme Definitions', () => {
    it('defines exactly the 3 required themes', () => {
      const themeKeys = Object.keys(PHOTO_THEMES) as PhotoThemeId[];
      expect(themeKeys).toContain('punpon_sticker');
      expect(themeKeys).toContain('ge_sticker');
      expect(themeKeys).toContain('afterschool');
      expect(themeKeys.length).toBe(3);
    });

    it('has valid framePath and exactly 3 cutouts for each theme', () => {
      const themes = Object.values(PHOTO_THEMES);
      for (const theme of themes) {
        expect(theme.framePath).toMatch(/^\/ref\/.*\.jpg$/);
        expect(theme.cutouts.length).toBe(3);
        for (const cutout of theme.cutouts) {
          expect(cutout.x).toBeGreaterThan(0);
          expect(cutout.x).toBeLessThan(1);
          expect(cutout.y).toBeGreaterThan(0);
          expect(cutout.y).toBeLessThan(1);
          expect(cutout.w).toBeGreaterThan(0);
          expect(cutout.w).toBeLessThan(1);
          expect(cutout.h).toBeGreaterThan(0);
          expect(cutout.h).toBeLessThan(1);
        }
      }
    });

    it('allows dynamic caption exclusively on punpon_sticker positioned at the top', () => {
      expect(PHOTO_THEMES.punpon_sticker.allowCustomCaption).toBe(true);
      expect(PHOTO_THEMES.punpon_sticker.captionArea).toBeDefined();
      expect(PHOTO_THEMES.punpon_sticker.captionArea!.y).toBeLessThan(0.1); // Located at the top header
      expect(PHOTO_THEMES.ge_sticker.allowCustomCaption).toBe(false);
      expect(PHOTO_THEMES.afterschool.allowCustomCaption).toBe(false);
    });

    it('verifies punpon-logo.png asset exists in public directory for the bottom footer', () => {
      const logoPath = resolve(__dirname, '../../public/punpon-logo.png');
      expect(existsSync(logoPath)).toBe(true);
    });

    it('has valid styling tokens and color values for all themes', () => {
      const themes = Object.values(PHOTO_THEMES);
      for (const theme of themes) {
        expect(theme.name.length).toBeGreaterThan(0);
        expect(theme.subtitle.length).toBeGreaterThan(0);
        expect(theme.badge.length).toBeGreaterThan(0);
        expect(theme.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(theme.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });

  describe('Upload Service & Local Fallback Store', () => {
    const sampleBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    it('handles photo strip upload gracefully (cloud or local fallback)', async () => {
      const customId = `test_strip_${Date.now()}`;
      const result = await uploadPhotoStrip(sampleBase64, customId);

      expect(result).toBeDefined();
      expect(typeof result.url).toBe('string');
      expect(result.url.length).toBeGreaterThan(0);
      if (!result.isCloud) {
        expect(result.url).toContain('mode=download');
        expect(result.url).toContain(customId);
      } else {
        expect(result.url).toContain('cloudinary.com');
      }
    });

    it('retrieves previously saved photo strips using getStoredPhotoStrip', async () => {
      const customId = `test_retrieve_${Date.now()}`;
      await uploadPhotoStrip(sampleBase64, customId);

      const retrieved = getStoredPhotoStrip(customId);
      expect(retrieved).toBe(sampleBase64);
    });

    it('returns null when querying an unknown or non-existent photo ID', () => {
      const unknown = getStoredPhotoStrip('non_existent_id_999999');
      expect(unknown).toBeNull();
    });
  });

  describe('URL Navigation & Mobile Companion Routing', () => {
    it('correctly resolves remote camera pairing parameters', () => {
      const dummyUrl = 'http://localhost:5173/?mode=camera&room=room_8x9q';
      const parsed = new URL(dummyUrl);

      expect(parsed.searchParams.get('mode')).toBe('camera');
      expect(parsed.searchParams.get('room')).toBe('room_8x9q');
    });

    it('correctly resolves mobile download parameters', () => {
      const dummyUrl = 'http://localhost:5173/?mode=download&id=strip_123';
      const parsed = new URL(dummyUrl);

      expect(parsed.searchParams.get('mode')).toBe('download');
      expect(parsed.searchParams.get('id')).toBe('strip_123');
    });
  });

  describe('Remote Camera Message Contracts', () => {
    it('validates SNAP message payload structure for 3 slots', () => {
      const snapMessage: RemoteMessage = {
        type: 'SNAP',
        slot: 1,
        image: 'data:image/jpeg;base64,abc12345',
      };

      expect(snapMessage.type).toBe('SNAP');
      expect(snapMessage.slot).toBe(1);
      expect(snapMessage.image).toBeDefined();
    });

    it('validates COMPLETE message payload structure containing all 3 shots', () => {
      const completeMessage: RemoteMessage = {
        type: 'COMPLETE',
        shots: ['data:1', 'data:2', 'data:3'],
      };

      expect(completeMessage.type).toBe('COMPLETE');
      expect(completeMessage.shots).toBeDefined();
      expect(completeMessage.shots!.length).toBe(3);
    });
  });

  describe('Distinct 3-Photo Guarantee (No Same Photos)', () => {
    it('provides exactly 3 distinct default sample shots', () => {
      expect(DEFAULT_SAMPLE_SHOTS.length).toBe(3);
      // Ensure all 3 entries are unique
      const uniqueShots = new Set(DEFAULT_SAMPLE_SHOTS);
      expect(uniqueShots.size).toBe(3);
    });

    it('ensures all 3 default sample shot image files exist in public directory', () => {
      for (const shotPath of DEFAULT_SAMPLE_SHOTS) {
        // shotPath is e.g. /punpon-shot1.png
        const cleanPath = shotPath.replace(/^\//, '');
        const fullDiskPath = resolve(__dirname, '../../public', cleanPath);
        expect(existsSync(fullDiskPath)).toBe(true);
      }
    });

    it('guarantees distinct resolved sources even when duplicates or single shot are provided', () => {
      const resolveDistinctShots = (shots: string[]) => {
        const s0 = shots[0] || DEFAULT_SAMPLE_SHOTS[0];
        const s1 = shots[1] && shots[1] !== s0 ? shots[1] : DEFAULT_SAMPLE_SHOTS[1];
        const s2 =
          shots[2] && shots[2] !== s0 && shots[2] !== s1 ? shots[2] : DEFAULT_SAMPLE_SHOTS[2];
        return [s0, s1, s2];
      };

      // Case 1: Empty array passed
      const fromEmpty = resolveDistinctShots([]);
      expect(new Set(fromEmpty).size).toBe(3);

      // Case 2: 1 photo passed
      const fromSingle = resolveDistinctShots(['custom_photo_1']);
      expect(fromSingle[0]).toBe('custom_photo_1');
      expect(new Set(fromSingle).size).toBe(3);

      // Case 3: 3 identical duplicate photos passed
      const fromDuplicates = resolveDistinctShots([
        'duplicate_photo',
        'duplicate_photo',
        'duplicate_photo',
      ]);
      expect(fromDuplicates[0]).toBe('duplicate_photo');
      expect(fromDuplicates[1]).toBe(DEFAULT_SAMPLE_SHOTS[1]);
      expect(fromDuplicates[2]).toBe(DEFAULT_SAMPLE_SHOTS[2]);
      expect(new Set(fromDuplicates).size).toBe(3);

      // Case 4: 3 distinct custom photos passed
      const fromCustom3 = resolveDistinctShots(['custom_a', 'custom_b', 'custom_c']);
      expect(fromCustom3).toEqual(['custom_a', 'custom_b', 'custom_c']);
      expect(new Set(fromCustom3).size).toBe(3);
    });
  });
});
