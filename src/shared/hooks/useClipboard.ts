import { useState, useCallback } from 'react';

export function useClipboard(timeoutMs = 2500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeoutMs);
        return true;
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        return false;
      }
    },
    [timeoutMs]
  );

  return { copied, copy };
}
