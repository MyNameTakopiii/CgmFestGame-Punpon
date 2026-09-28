// Clean title words to check for leakage
export function extractKeywords(title: string): string[] {
  // Strip version markers like (CGM48 Ver.), parenthesis, punctuation
  const cleaned = title
    .replace(/\(.*?\)/g, '')
    .replace(/[!?,.՝—]/g, ' ')
    .trim();

  // Split into components (Thai phrases, English words)
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length >= 2);

  // Common stop words in Thai idol titles that shouldn't trigger block by themselves
  const stopWords = new Set([
    'ver',
    'the',
    'of',
    'in',
    'and',
    '48',
    'cgm',
    'bnk',
    'แห่ง',
    'ความ',
    'ที่',
  ]);
  return tokens.filter((t) => !stopWords.has(t));
}

export function containsKeyword(line: string, keywords: string[]): boolean {
  const normalizedLine = line.toLowerCase();
  return keywords.some((keyword) => {
    if (keyword.length < 3) return false;
    return normalizedLine.includes(keyword);
  });
}

// Estimate how long TTS takes to speak text in ms (roughly 150ms per Thai/Latin char cluster)
export function estimateDurationMs(text: string): number {
  const clean = text.replace(/\s+/g, '');
  return Math.max(1500, clean.length * 150);
}
