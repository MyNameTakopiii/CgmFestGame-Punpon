import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('After Party Theme & On-Screen Polaroid', () => {
  const outputDir = 'test-results/screenshots';

  test('should render after-party decorations with realistic stars (no emojis) and mascot', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');

    // Check Boiled Egg Mascot
    const eggMascot = page.locator('aside[aria-label="มาสคอตน้องไข่ต้ม After Party"]');
    await expect(eggMascot).toBeVisible();

    const mascotBadge = eggMascot.locator('text=ไข่ต้ม');
    await expect(mascotBadge).toBeVisible();

    // Check speech bubble
    const speechBubble = eggMascot.locator('div:has-text("After Party")');
    await expect(speechBubble).toBeVisible();

    // Check realistic stars layer (ensure NO emojis like ✨ or ★ in stars layer)
    const starsLayer = page.getByTestId('shooting-stars-background');
    await expect(starsLayer).toBeAttached();

    const emojiCount = await starsLayer.locator(':text("✨"), :text("★"), :text("✦")').count();
    expect(emojiCount).toBe(0);

    // Check Punpon Web Title Hero Logo
    await expect(page.locator('img[alt="PUNPON CGM48"]')).toBeVisible();

    // Check On-Screen Physical Polaroid Card is visibly placed on page with Punpon photo
    const polaroidCard = page.locator('aside[aria-label="รูปโพลารอยด์ที่ระลึก After Party"]');
    await expect(polaroidCard).toBeVisible();
    await expect(polaroidCard.getByText('PUNPON CGM48')).toBeVisible();

    // Click mascot to change message (force: true because egg has infinite floating CSS animation)
    await eggMascot.locator('button').click({ force: true });
    await expect(
      eggMascot.locator('div:has-text("น้องไข่ต้มเป็นกำลังใจให้ทุกข้อเลย")')
    ).toBeVisible();

    // Capture screenshot of After Party Landing page with on-screen Polaroid & realistic stars
    await page.screenshot({
      path: path.join(outputDir, 'screenshot_after_party_home.png'),
      fullPage: true,
    });
  });

  test('should click on-screen polaroid, capture photo, and embed it into the on-screen polaroid', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');

    // Click On-Screen Polaroid Card directly
    const polaroidCard = page.locator('aside[aria-label="รูปโพลารอยด์ที่ระลึก After Party"]');
    await expect(polaroidCard).toBeVisible();
    await polaroidCard.click();

    // Photobooth Modal should appear
    await expect(page.getByText('After Party Photobooth')).toBeVisible();
    await expect(page.getByText('กล้องถ่ายรูปโพลารอยด์ที่ระลึก')).toBeVisible();

    // Viewfinder and Shutter Button
    const shutterButton = page.locator('button[title*="กดเพื่อถ่ายรูป"]');
    await expect(shutterButton).toBeVisible();

    // Caption input should be present and editable
    const captionInput = page.locator('input[placeholder*="PUNPON CGM48"]');
    await expect(captionInput).toBeVisible();
    await captionInput.fill('MEMORIES WITH PUNPON');

    // Capture screenshot of Photobooth Viewfinder modal
    await page.screenshot({
      path: path.join(outputDir, 'screenshot_photobooth_modal.png'),
      fullPage: true,
    });

    // Test file upload fallback to generate Polaroid card
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("หรือเลือกรูปภาพจากเครื่อง")').click();
    const fileChooser = await fileChooserPromise;

    // Use an in-memory buffer as the photo
    const sampleBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    await fileChooser.setFiles({
      name: 'party-photo.png',
      mimeType: 'image/png',
      buffer: sampleBuffer,
    });

    // Wait for Polaroid Card Mode to be generated in modal
    await expect(page.getByText('SOUVENIR')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /บันทึกรูปโพลารอยด์/i })).toBeVisible();

    // Close the modal to see the on-screen Polaroid updated
    await page.getByRole('button', { name: /ปิดหน้าต่างนี้/i }).click();

    // Now the on-screen Polaroid card should show the captured photo and action buttons on hover
    await expect(polaroidCard.locator('img[alt="After Party Souvenir"]')).toBeVisible();
    await expect(polaroidCard.getByText('CGM48 AFTER PARTY')).toBeVisible();

    // Hover over on-screen polaroid to verify action buttons
    await polaroidCard.hover();
    await expect(polaroidCard.getByRole('button', { name: /บันทึกรูป/i })).toBeVisible();
    await expect(polaroidCard.getByRole('button', { name: /ถ่ายใหม่/i })).toBeVisible();

    // Capture screenshot of On-Screen Polaroid updated with photo
    await page.screenshot({
      path: path.join(outputDir, 'screenshot_polaroid_card.png'),
      fullPage: true,
    });
  });

  test('should hide Boiled Egg and Polaroid card during gameplay to prevent obstructing small screens', async ({
    page,
  }) => {
    // 1. Verify on desktop (1280x800): visible on start screen, hidden during gameplay
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');

    const eggMascot = page.locator('aside[aria-label="มาสคอตน้องไข่ต้ม After Party"]');
    const polaroidCard = page.locator('aside[aria-label="รูปโพลารอยด์ที่ระลึก After Party"]');

    // On start screen on desktop, both are visible
    await expect(eggMascot).toBeVisible();
    await expect(polaroidCard).toBeVisible();

    // Start game
    await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();

    // Verify gameplay is active
    await expect(page.locator('text=ข้อ 1 / 3')).toBeVisible();

    // CRITICAL REQUIREMENT: During gameplay, egg and polaroid MUST be completely removed/hidden
    await expect(eggMascot).not.toBeAttached();
    await expect(polaroidCard).not.toBeAttached();

    // Capture screenshot of clean gameplay without obstructions
    await page.screenshot({
      path: path.join(outputDir, 'screenshot_gameplay_clean.png'),
      fullPage: true,
    });

    // 2. Verify on mobile screen (390x844): no obstruction, clean gameplay
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/');

    // Click start game on mobile without any pointer interception
    await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();
    await expect(page.locator('text=ข้อ 1 / 3')).toBeVisible();

    // During mobile gameplay, egg and polaroid are completely hidden
    await expect(eggMascot).not.toBeAttached();
    await expect(polaroidCard).not.toBeAttached();

    // Capture screenshot of clean mobile gameplay
    await page.screenshot({
      path: path.join(outputDir, 'screenshot_gameplay_clean_mobile.png'),
      fullPage: true,
    });
  });
});
