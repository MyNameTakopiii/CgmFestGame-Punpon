import { test, expect } from '@playwright/test';

test.describe('Photobooth 3-Cut & QR Companion Automated Tests', () => {
  test('should open photobooth, toggle themes, and switch between computer and mobile QR modes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/');

    // 1. Locate and click on-screen polaroid card
    const polaroidCard = page.locator('aside[aria-label="รูปโพลารอยด์ที่ระลึก After Party"]');
    await expect(polaroidCard).toBeVisible();
    await polaroidCard.click();

    // 2. Check modal header
    await expect(page.getByText('After Party Photobooth')).toBeVisible();
    await expect(page.getByText('3-CUT PRO')).toBeVisible();

    // 3. Verify 3 themes in TemplateSelector
    await expect(page.getByRole('button', { name: /Punpon Sticker/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /GE 2026/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /After School/i })).toBeVisible();

    // Verify dynamic caption input is visible on Punpon Sticker
    await expect(page.getByText('Top Dynamic Text')).toBeVisible();

    // 4. Test theme switching to GE 2026 (fixed artwork)
    await page.getByRole('button', { name: /GE 2026/i }).click();
    await expect(page.getByText('GE 2026').first()).toBeVisible();
    await expect(page.getByText('Fixed Artwork')).toBeVisible();

    // Test theme switching to After School (fixed artwork)
    await page.getByRole('button', { name: /After School/i }).click();
    await expect(page.getByText('After School').first()).toBeVisible();
    await expect(page.getByText('Fixed Artwork')).toBeVisible();

    // Switch back to Punpon Sticker
    await page.getByRole('button', { name: /Punpon Sticker/i }).click();
    await expect(page.getByText('Top Dynamic Text')).toBeVisible();

    // 5. Test device switcher: Switch to Mobile Camera QR mode
    const mobileTabButton = page.getByRole('button', { name: /ใช้กล้องมือถือ \(QR\)/i });
    await expect(mobileTabButton).toBeVisible();
    await mobileTabButton.click();

    // Verify Pairing QR Code card is rendered
    await expect(page.getByText('สแกนเพื่อใช้มือถือเป็นกล้อง')).toBeVisible();
    await expect(page.getByText('เปิดกล้องมือถือส่องเพื่อเชื่อมต่อทันที')).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible(); // QRCodeSVG rendered

    // Verify 3 slot indicators are present
    await expect(page.getByText('สถานะ 3 ช็อตที่ได้รับ:')).toBeVisible();
    await expect(page.getByText('01', { exact: true })).toBeVisible();
    await expect(page.getByText('02', { exact: true })).toBeVisible();
    await expect(page.getByText('03', { exact: true })).toBeVisible();

    // 6. Switch back to computer webcam mode
    const computerTabButton = page.getByRole('button', { name: /ใช้กล้องคอมพิวเตอร์/i });
    await computerTabButton.click();
    await expect(page.getByText('เริ่มถ่าย 3 ช็อตอัตโนมัติ')).toBeVisible();
  });

  test('should render Mobile Companion Camera interface correctly on mobile route', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 14 viewport
    await page.goto('http://localhost:5173/?mode=camera&room=test_room_888');

    // Verify mobile header
    await expect(page.getByText('PUNPON COMPANION CAM')).toBeVisible();
    await expect(page.getByText('กล้องมือถือเชื่อมต่อจอใหญ่')).toBeVisible();

    // Verify mobile controls
    await expect(page.getByRole('button', { name: /กดถ่าย 3 ช็อตต่อเนื่อง/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /กดถ่ายทีละช็อต/i })).toBeVisible();

    // Verify 3 mini slot placeholders
    await expect(page.getByText('01', { exact: true })).toBeVisible();
    await expect(page.getByText('02', { exact: true })).toBeVisible();
    await expect(page.getByText('03', { exact: true })).toBeVisible();
  });

  test('should render Mobile Download view correctly with Save to Photos button', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/?mode=download&id=sample_strip_999');

    // Verify download view header
    await expect(page.getByText('PUNPON AFTER PARTY KEEPSAKE')).toBeVisible();
    await expect(page.getByText('รูปสติกเกอร์ของคุณพร้อมแล้ว!')).toBeVisible();

    // Verify action buttons
    await expect(
      page.getByRole('button', { name: /บันทึกลงอัลบั้มภาพ \(Save to Photos\)/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /แชร์รูปภาพ/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /คัดลอกลิงก์/i })).toBeVisible();
    await expect(page.getByText('กลับสู่หน้าหลักเกม PUNPON AFTER PARTY')).toBeVisible();
  });
});
