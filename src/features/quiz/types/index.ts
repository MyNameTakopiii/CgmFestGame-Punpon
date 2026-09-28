export type SongType = 'single' | 'coupling' | 'stage' | 'album' | 'special';
export type SongGroup = 'CGM48' | 'BNK48';

export interface Song {
  id: string;
  title: string;
  group: SongGroup;
  type: SongType;
  year: string;
  lines: string[];
}

export type AnswerType = 'choice' | 'dropdown';
export type TimeLimit = 3 | 5;
export type VoiceGender = 'male' | 'female';

export interface GameSettings {
  answerType: AnswerType;
  timeLimit: TimeLimit;
  voiceGender: VoiceGender;
}

export type GameMode = 'normal' | 'easy' | 'hard' | 'endless';

export interface GameOption {
  id: string;
  title: string;
  group: SongGroup;
  year: string;
}

export interface RoundData {
  roundNumber: number;
  totalRounds: number;
  targetSong: Song;
  sampledLyric: string;
  options: GameOption[];
  selectedOptionId?: string;
  isCorrect?: boolean;
  timeTakenMs: number;
  hasReplayed: boolean;
}

export type GameStatus = 'idle' | 'ready' | 'playing' | 'round_result' | 'game_over';

export interface GameSummary {
  totalRounds: number;
  correctCount: number;
  cheerMessage: string;
  breakdown: RoundData[];
}
