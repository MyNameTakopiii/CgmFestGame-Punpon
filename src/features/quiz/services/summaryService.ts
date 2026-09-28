import type { RoundData, GameSummary } from '../types';

export function getCheerMessage(correctCount: number, totalRounds: number = 3): string {
  if (correctCount === totalRounds) {
    return 'สุดยอดความแม่นยำ! คุณคือแฟนพันธุ์แท้ตัวจริงของ CGM48';
  }
  if (correctCount >= 2) {
    return 'เก่งมากครับ! ทายถูกเกือบครบทุกเพลงแล้ว';
  }
  if (correctCount >= 1) {
    return 'พยายามได้ดีมากครับ! มาร่วมฟังเพลงและฝึกไปด้วยกันอีกครั้งนะ';
  }
  return 'ไม่เป็นไรนะครับ! มาร่วมฟังและทายเพลงใหม่อีกรอบได้เสมอ';
}

export function evaluateGameSummary(rounds: RoundData[]): GameSummary {
  const correctCount = rounds.filter((r) => r.isCorrect).length;
  const totalRounds = rounds.length || 3;
  const cheerMessage = getCheerMessage(correctCount, totalRounds);

  return {
    totalRounds,
    correctCount,
    cheerMessage,
    breakdown: rounds,
  };
}
