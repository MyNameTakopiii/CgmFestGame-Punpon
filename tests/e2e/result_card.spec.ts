import { test, expect } from '@playwright/test';
import path from 'path';

test('capture result card screen (3 rounds, no score)', async ({ page }) => {
  const outputDir = 'test-results/screenshots';

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');

  // Start game on default settings
  await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();

  // Answer 3 rounds
  for (let i = 1; i <= 3; i++) {
    await page.waitForSelector(`text=ข้อ ${i} / 3`);
    const optionCards = page.locator('button:has-text("CGM48"), button:has-text("BNK48")');
    await optionCards.first().click();
    await page.waitForSelector('text=ข้อถัดไป');
    await page.getByRole('button', { name: /ข้อถัดไป/i }).click();
  }

  // Verify Result Card Screen
  await page.waitForSelector('text=สรุปผลการเล่น 3 ข้อ');
  await expect(page.getByText(/ทายถูก \d \/ 3 ข้อ/)).toBeVisible();
  await expect(page.getByRole('button', { name: /กลับหน้าหลัก/i })).toBeVisible();

  await page.screenshot({ path: path.join(outputDir, 'screenshot_result.png'), fullPage: true });
});
