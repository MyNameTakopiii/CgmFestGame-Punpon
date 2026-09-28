import { test, expect } from '@playwright/test';

test.describe('Photobooth Strip Asset Generation Tests', () => {
  test('should generate composite photo strips for all 3 sticker frame themes', async ({
    page,
  }) => {
    await page.goto('http://localhost:5173/');

    // Test in-browser generation for each theme
    const results = await page.evaluate(async () => {
      // Dynamic import of generator and theme config at browser runtime
      const importMod = new Function('path', 'return import(path)');
      const { generatePhotoStrip } = await importMod(
        '/src/features/photobooth/utils/photoStripGenerator.ts'
      );
      const { PHOTO_THEMES } = await importMod(
        '/src/features/photobooth/types/photobooth.types.ts'
      );

      // Sample dummy photos (1x1 transparent or small data URLs)
      const samplePhotos = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      ];

      const out: Record<
        string,
        { success: boolean; dataUrlLength: number; startsWithData: boolean; dataUrl?: string }
      > = {};

      for (const themeId of Object.keys(PHOTO_THEMES)) {
        try {
          const dataUrl = await generatePhotoStrip(samplePhotos, {
            themeId: themeId as any,
            caption: 'TEST BANNER 2026',
          });
          out[themeId] = {
            success: true,
            dataUrlLength: dataUrl.length,
            startsWithData: dataUrl.startsWith('data:image/jpeg;base64,'),
            dataUrl,
          };
        } catch (err: any) {
          out[themeId] = {
            success: false,
            dataUrlLength: 0,
            startsWithData: false,
          };
        }
      }

      return out;
    });

    expect(results.punpon_sticker?.success).toBe(true);
    expect(results.punpon_sticker?.startsWithData).toBe(true);
    expect(results.punpon_sticker?.dataUrlLength).toBeGreaterThan(1000);

    // Save visual artifact
    if (results.punpon_sticker?.dataUrl) {
      const fs = await import('fs');
      const path = await import('path');
      const base64Data = results.punpon_sticker.dataUrl.replace(/^data:image\/jpeg;base64,/, '');
      const outDir = path.resolve('tests/e2e/screenshots');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(outDir, 'punpon_sticker_32px.jpg'),
        Buffer.from(base64Data, 'base64')
      );
    }

    expect(results.ge_sticker?.success).toBe(true);
    expect(results.ge_sticker?.startsWithData).toBe(true);
    expect(results.ge_sticker?.dataUrlLength).toBeGreaterThan(1000);

    expect(results.afterschool?.success).toBe(true);
    expect(results.afterschool?.startsWithData).toBe(true);
    expect(results.afterschool?.dataUrlLength).toBeGreaterThan(1000);
  });
});
