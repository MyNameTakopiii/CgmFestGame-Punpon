import { useEventListener } from '../../../shared/hooks/useEventListener';
import { useGameSession } from './useGameSession';

export function useKeyboardControls() {
  const { status, currentRound, selectAnswer, nextRound, playSnippet } = useGameSession();

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (status === 'playing' && currentRound) {
      const key = e.key.toUpperCase();
      const optionMap: Record<string, number> = {
        '1': 0,
        A: 0,
        '2': 1,
        B: 1,
        '3': 2,
        C: 2,
        '4': 3,
        D: 3,
      };

      if (key in optionMap) {
        const option = currentRound.options[optionMap[key]];
        if (option) {
          selectAnswer(option.id);
        }
      } else if (key === ' ' || key === 'R') {
        playSnippet();
      }
    } else if (status === 'round_result') {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextRound();
      }
    }
  });
}
