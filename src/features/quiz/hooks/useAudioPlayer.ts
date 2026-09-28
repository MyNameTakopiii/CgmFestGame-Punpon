import { useGameSession } from './useGameSession';

export function useAudioPlayer() {
  const { isAudioPlaying, hasReplayed, settings, status, playSnippet, replaySnippet } =
    useGameSession();

  const durationMs = settings.timeLimit * 1000;
  const isRoundActive = status === 'playing';

  const handlePlayOrReplay = () => {
    if (isAudioPlaying) return;
    if (!hasReplayed) {
      replaySnippet();
    } else {
      playSnippet();
    }
  };

  return {
    isAudioPlaying,
    hasReplayed,
    durationMs,
    isRoundActive,
    handlePlayOrReplay,
  };
}
