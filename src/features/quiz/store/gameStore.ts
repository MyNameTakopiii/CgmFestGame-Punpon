import { create } from 'zustand';
import type { GameStatus, RoundData, GameSummary, GameSettings } from '../types';
import { songRepository } from '../services/songRepository';
import { sampleLyric } from '../services/lyricService';
import { generateOptions } from '../services/distractorService';
import { evaluateGameSummary } from '../services/summaryService';
import { ttsService } from '../services/ttsService';
import { shuffleArray } from '../../../shared/utils/array';

export const DEFAULT_SETTINGS: GameSettings = {
  answerType: 'choice',
  timeLimit: 5,
  voiceGender: 'female',
};

export interface GameStoreState {
  // State
  status: GameStatus;
  settings: GameSettings;
  totalRounds: number;
  currentRoundIndex: number;
  rounds: RoundData[];
  currentRound: RoundData | null;
  isAudioPlaying: boolean;
  hasReplayed: boolean;
  roundStartTime: number;
  showTranscript: boolean;
  summary: GameSummary | null;

  // Actions
  setSettings: (settings: Partial<GameSettings>) => void;
  startGame: (settings?: GameSettings) => void;
  playSnippet: () => void;
  replaySnippet: () => void;
  selectAnswer: (optionId: string) => void;
  nextRound: () => void;
  restartGame: () => void;
  toggleTranscript: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => {
  // Sync with TTS Service playback state
  ttsService.subscribe((ttsState) => {
    set({ isAudioPlaying: ttsState.isPlaying });
  });

  return {
    status: 'idle',
    settings: { ...DEFAULT_SETTINGS },
    totalRounds: 3,
    currentRoundIndex: 0,
    rounds: [],
    currentRound: null,
    isAudioPlaying: false,
    hasReplayed: false,
    roundStartTime: 0,
    showTranscript: false,
    summary: null,

    setSettings: (newSettings: Partial<GameSettings>) => {
      const updated = { ...get().settings, ...newSettings };
      if (newSettings.voiceGender) {
        ttsService.setVoiceGender(newSettings.voiceGender);
      }
      set({ settings: updated });
    },

    startGame: (customSettings?: GameSettings) => {
      const settings = customSettings ? { ...get().settings, ...customSettings } : get().settings;
      ttsService.setVoiceGender(settings.voiceGender);

      const totalRounds = 3;
      const allSongs = songRepository.getAll();

      // Shuffle songs to pick starting song
      const shuffledSongs = shuffleArray(allSongs);
      const chosenSong = shuffledSongs[0];
      const lyric = sampleLyric(chosenSong, settings.timeLimit);
      const options = generateOptions(chosenSong, allSongs);

      const firstRound: RoundData = {
        roundNumber: 1,
        totalRounds,
        targetSong: chosenSong,
        sampledLyric: lyric,
        options,
        timeTakenMs: 0,
        hasReplayed: false,
      };

      set({
        status: 'playing',
        settings,
        totalRounds,
        currentRoundIndex: 0,
        rounds: [],
        currentRound: firstRound,
        hasReplayed: false,
        roundStartTime: Date.now(),
        showTranscript: false,
        summary: null,
      });

      // Auto-play the lyric snippet at the start of round
      setTimeout(() => {
        get().playSnippet();
      }, 300);
    },

    playSnippet: () => {
      const { currentRound, settings } = get();
      if (!currentRound) return;

      const durationMs = settings.timeLimit * 1000;
      ttsService.speak(currentRound.sampledLyric, durationMs);
    },

    replaySnippet: () => {
      const { currentRound, settings, hasReplayed, status } = get();
      if (!currentRound || hasReplayed || status !== 'playing') return;

      set({ hasReplayed: true });
      const durationMs = settings.timeLimit * 1000;
      ttsService.speak(currentRound.sampledLyric, durationMs);
    },

    selectAnswer: (optionId: string) => {
      const { currentRound, status, roundStartTime, hasReplayed } = get();
      if (!currentRound || status !== 'playing') return;

      // Stop speech immediately on answer
      ttsService.stop();

      const timeTakenMs = Date.now() - roundStartTime;
      const isCorrect = optionId === currentRound.targetSong.id;

      const completedRound: RoundData = {
        ...currentRound,
        selectedOptionId: optionId,
        isCorrect,
        timeTakenMs,
        hasReplayed,
      };

      set({
        status: 'round_result',
        currentRound: completedRound,
      });
    },

    nextRound: () => {
      const { currentRoundIndex, totalRounds, rounds, currentRound, settings } = get();
      if (!currentRound) return;

      const updatedRounds = [...rounds, currentRound];
      const nextIndex = currentRoundIndex + 1;

      if (nextIndex >= totalRounds) {
        const summary = evaluateGameSummary(updatedRounds);
        set({
          status: 'game_over',
          rounds: updatedRounds,
          currentRound: null,
          summary,
        });
        return;
      }

      // Avoid recently used songs
      const allSongs = songRepository.getAll();
      const usedIds = new Set(updatedRounds.map((r) => r.targetSong.id));
      const pool = allSongs.filter((s) => !usedIds.has(s.id));
      const chosenPool = pool.length > 0 ? pool : allSongs;
      const chosenSong = chosenPool[Math.floor(Math.random() * chosenPool.length)];

      const lyric = sampleLyric(chosenSong, settings.timeLimit);
      const options = generateOptions(chosenSong, allSongs);

      const nextRoundData: RoundData = {
        roundNumber: nextIndex + 1,
        totalRounds,
        targetSong: chosenSong,
        sampledLyric: lyric,
        options,
        timeTakenMs: 0,
        hasReplayed: false,
      };

      set({
        status: 'playing',
        currentRoundIndex: nextIndex,
        rounds: updatedRounds,
        currentRound: nextRoundData,
        hasReplayed: false,
        roundStartTime: Date.now(),
      });

      // Auto-play the lyric snippet for the new round
      setTimeout(() => {
        get().playSnippet();
      }, 400);
    },

    restartGame: () => {
      ttsService.stop();
      set({
        status: 'idle',
        currentRound: null,
        rounds: [],
        currentRoundIndex: 0,
        hasReplayed: false,
        summary: null,
      });
    },

    toggleTranscript: () => {
      set((state) => ({ showTranscript: !state.showTranscript }));
    },
  };
});
