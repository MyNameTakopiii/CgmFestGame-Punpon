import { test } from '@playwright/test';
import path from 'path';

test('capture screenshots of CGM48 lyric guess game', async ({ page }) => {
  const outputDir = 'test-results/screenshots';

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  // 1. Capture Start Screen (Landing Page)
  await page.waitForSelector('text=ทายท่อนฮิต!');
  await page.screenshot({ path: path.join(outputDir, 'screenshot_start.png'), fullPage: true });

  // 2. Select 3s & start game
  await page.getByText('3 วินาที').click();
  await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();

  // 3. Capture Gameplay Screen
  await page.waitForSelector('text=ข้อ 1 / 3');
  await page.screenshot({ path: path.join(outputDir, 'screenshot_gameplay.png'), fullPage: true });

  // 4. Answer question and capture feedback
  const optionCards = page.locator('button:has-text("CGM48"), button:has-text("BNK48")');
  await optionCards.first().click();
  await page.waitForSelector('text=ข้อถัดไป');
  await page.screenshot({ path: path.join(outputDir, 'screenshot_feedback.png'), fullPage: true });
});

test('capture searchable dropdown screenshot', async ({ page }) => {
  const outputDir = 'test-results/screenshots';

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  // Select Dropdown mode
  await page.getByText('Dropdown (36 เพลง)').click();
  await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();

  // Focus and type in search box
  const searchInput = page.locator('#song-search-input');
  await searchInput.fill('มะลิ');

  // Capture Searchable Dropdown state
  await page.waitForSelector('li[role="option"]');
  await page.screenshot({ path: path.join(outputDir, 'screenshot_dropdown.png'), fullPage: true });
});
