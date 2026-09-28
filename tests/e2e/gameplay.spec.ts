import { test, expect } from '@playwright/test';

test.describe('CGM48 Lyric Guess Gameplay Flow (3 Rounds, No Score)', () => {
  test('configures settings, plays 3 rounds without scores, reaches result screen, and returns home', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Verify Landing Page
    await expect(page.getByText('ทายท่อนฮิต!')).toBeVisible();
    await expect(page.getByText('1. เลือกรูปแบบการตอบ:')).toBeVisible();
    await expect(page.getByText('2. เลือกเวลาฟัง:')).toBeVisible();
    await expect(page.getByText('3. เลือกเสียงร้อง:')).toBeVisible();

    // 2. Select 3s time limit and Male voice
    await page.getByText('3 วินาที').click();
    await page.getByText('เสียงชาย (Male)').click();

    // 3. Start game
    const startBtn = page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 4. Verify HUD (round 1 of 3, no score, no streak)
    await expect(page.getByText(/ข้อ 1 \/ 3/)).toBeVisible();
    await expect(page.locator('header').getByText(/3s/)).toBeVisible();
    // Ensure no score/streak is rendered
    await expect(page.getByText(/คะแนนรวม/)).not.toBeVisible();

    // 5. Verify 4 Answer Options are rendered
    const optionCards = page.locator(
      'button[disabled="false"], button:has-text("CGM48"), button:has-text("BNK48")'
    );
    await expect(optionCards).toHaveCount(4);

    // 6. Test Transcript Modal
    const transcriptBtn = page.getByTitle('ดูเนื้อเพลง (Transcript)');
    await transcriptBtn.click();
    await expect(page.getByText('เนื้อเพลงข้อนี้ (Transcript)')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // 7. Play through all 3 rounds
    for (let round = 1; round <= 3; round++) {
      await expect(page.getByText(new RegExp(`ข้อ ${round} \\/ 3`))).toBeVisible();
      const options = page.locator('button:has-text("CGM48"), button:has-text("BNK48")');
      await options.first().click();

      // Ensure no points earned text is displayed
      await expect(page.getByText(/แต้ม/)).not.toBeVisible();

      // Click next round
      const nextBtn = page.getByRole('button', { name: /ข้อถัดไป/i });
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
    }

    // 8. Verify Result Screen
    await expect(page.getByText(/สรุปผลการเล่น 3 ข้อ/)).toBeVisible();
    await expect(page.getByText(/ทายถูก \d \/ 3 ข้อ/)).toBeVisible();

    // Verify ONLY "Back to Home" button exists (no replay, no share)
    await expect(page.getByRole('button', { name: /เล่นอีกครั้ง/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /แชร์ผลคะแนน/i })).not.toBeVisible();

    const homeBtn = page.getByRole('button', { name: /กลับหน้าหลัก/i });
    await expect(homeBtn).toBeVisible();

    // 9. Return to Home
    await homeBtn.click();
    await expect(page.getByText('1. เลือกรูปแบบการตอบ:')).toBeVisible();
  });

  test('plays in Dropdown mode with live search and female voice', async ({ page }) => {
    await page.goto('/');

    // 1. Select Dropdown and Female voice
    await page.getByText('Dropdown (36 เพลง)').click();
    await page.getByText('เสียงหญิง (Female)').click();

    // 2. Start game
    await page.getByRole('button', { name: /เริ่มเกม 3 ข้อเลย/i }).click();

    // 3. Verify HUD shows Dropdown mode
    await expect(page.locator('header').getByText(/Dropdown/i)).toBeVisible();

    // 4. Test typing in Search Input
    const searchInput = page.locator('#song-search-input');
    await expect(searchInput).toBeVisible();

    // Type query "มะลิ"
    await searchInput.fill('มะลิ');

    // Verify filtered result item is visible in dropdown
    const option = page.locator('li[role="option"]:has-text("มะลิ")');
    await expect(option).toBeVisible();

    // Click to select
    await option.click();

    // Submit answer
    const submitBtn = page.getByRole('button', { name: /ยืนยันคำตอบ/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Next round
    const nextBtn = page.getByRole('button', { name: /ข้อถัดไป/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // Verify advanced to Round 2
    await expect(page.getByText(/ข้อ 2 \/ 3/)).toBeVisible();
  });
});
