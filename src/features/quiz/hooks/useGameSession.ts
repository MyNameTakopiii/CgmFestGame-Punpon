import { useGameStore } from '../store/gameStore';

export function useGameSession() {
  const status = useGameStore((s) => s.status);
  const settings = useGameStore((s) => s.settings);
  const totalRounds = useGameStore((s) => s.totalRounds);
  const currentRoundIndex = useGameStore((s) => s.currentRoundIndex);
  const currentRound = useGameStore((s) => s.currentRound);
  const isAudioPlaying = useGameStore((s) => s.isAudioPlaying);
  const hasReplayed = useGameStore((s) => s.hasReplayed);
  const showTranscript = useGameStore((s) => s.showTranscript);
  const summary = useGameStore((s) => s.summary);

  const setSettings = useGameStore((s) => s.setSettings);
  const startGame = useGameStore((s) => s.startGame);
  const playSnippet = useGameStore((s) => s.playSnippet);
  const replaySnippet = useGameStore((s) => s.replaySnippet);
  const selectAnswer = useGameStore((s) => s.selectAnswer);
  const nextRound = useGameStore((s) => s.nextRound);
  const restartGame = useGameStore((s) => s.restartGame);
  const toggleTranscript = useGameStore((s) => s.toggleTranscript);

  return {
    status,
    settings,
    totalRounds,
    currentRoundIndex,
    currentRound,
    isAudioPlaying,
    hasReplayed,
    showTranscript,
    summary,
    setSettings,
    startGame,
    playSnippet,
    replaySnippet,
    selectAnswer,
    nextRound,
    restartGame,
    toggleTranscript,
  };
}
