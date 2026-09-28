import type { VoiceGender } from '../types';

export interface TTSEngineState {
  isPlaying: boolean;
  isThaiVoiceAvailable: boolean;
  voiceName: string;
  voiceGender: VoiceGender;
}

export class TTSService {
  private currentTimeout: number | null = null;
  private isPlaying = false;
  private thaiVoice: SpeechSynthesisVoice | null = null;
  private maleThaiVoice: SpeechSynthesisVoice | null = null;
  private femaleThaiVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;
  private voiceGender: VoiceGender = 'female';
  private currentAudio: HTMLAudioElement | null = null;
  private listeners: ((state: TTSEngineState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  public setVoiceGender(gender: VoiceGender) {
    this.voiceGender = gender;
    this.initVoices();
    this.notify();
  }

  public getVoiceGender(): VoiceGender {
    return this.voiceGender;
  }

  private isMaleVoiceName(name: string): boolean {
    return /male|man|boy|ชาย|niwat|pattara/i.test(name);
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
      const thaiVoices = voices.filter((v) => v.lang === 'th-TH' || v.lang.startsWith('th'));

      this.thaiVoice = thaiVoices[0] || null;

      // Male voice: Pattara, Niwat, or voice with 'male'
      this.maleThaiVoice = thaiVoices.find((v) => this.isMaleVoiceName(v.name)) || this.thaiVoice;

      // Female voice: Premwadee, Achara, Kanya, Narisa, Google, or any non-male
      const explicitFemale = thaiVoices.find((v) =>
        /female|woman|girl|หญิง|prem|achara|kanya|narisa|google/i.test(v.name)
      );
      const nonMale = thaiVoices.find((v) => !this.isMaleVoiceName(v.name));

      this.femaleThaiVoice = explicitFemale || nonMale || null;

      this.notify();
    }
  }

  public subscribe(cb: (state: TTSEngineState) => void) {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getState(): TTSEngineState {
    const isFemale = this.voiceGender === 'female';
    const voiceName = isFemale
      ? 'Google Thai Female (เสียงหญิงธรรมชาติ)'
      : this.maleThaiVoice
        ? this.maleThaiVoice.name
        : 'Microsoft Pattara (เสียงชาย)';

    return {
      isPlaying: this.isPlaying,
      isThaiVoiceAvailable: true,
      voiceName,
      voiceGender: this.voiceGender,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  public isAvailable(): boolean {
    return true;
  }

  public stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isPlaying = false;
    this.notify();
  }

  /**
   * Play female voice using online Google Translate Thai Female Audio stream.
   * Gives authentic, fluent, unmistakable Thai female voice.
   */
  private playFemaleAudio(
    text: string,
    durationMs: number,
    onCutoff?: () => void,
    onFallback?: () => void
  ) {
    try {
      const encoded = encodeURIComponent(text);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encoded}`;
      const audio = new Audio(audioUrl);
      // Slow down playback to 0.82x for clearer, more deliberate speech
      audio.playbackRate = 0.82;
      audio.defaultPlaybackRate = 0.82;

      this.currentAudio = audio;
      this.isPlaying = true;
      this.notify();

      audio.onended = () => {
        this.isPlaying = false;
        this.notify();
      };

      audio.onerror = () => {
        onFallback?.();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          onFallback?.();
        });
      }

      this.currentTimeout = window.setTimeout(() => {
        if (this.currentAudio) {
          this.currentAudio.pause();
          this.currentAudio.currentTime = 0;
          this.currentAudio = null;
        }
        this.isPlaying = false;
        this.notify();
        onCutoff?.();
      }, durationMs);
    } catch {
      onFallback?.();
    }
  }

  /**
   * Play voice using local SpeechSynthesis API
   */
  private playLocalSynthesis(
    text: string,
    durationMs: number,
    isMale: boolean,
    onCutoff?: () => void,
    onError?: (err: unknown) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isPlaying = true;
      this.notify();
      this.currentTimeout = setTimeout(() => {
        this.isPlaying = false;
        this.notify();
        onCutoff?.();
      }, durationMs) as unknown as number;
      return;
    }

    try {
      if (!this.voicesLoaded || !this.thaiVoice) {
        this.initVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const chosenVoice = isMale ? this.maleThaiVoice : this.femaleThaiVoice || this.thaiVoice;

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      utterance.lang = 'th-TH';

      if (isMale) {
        // Deep masculine resonance, slower deliberate pace
        utterance.pitch = 0.65;
        utterance.rate = 0.78;
      } else {
        // High feminine pitch, relaxed tempo
        utterance.pitch = 1.45;
        utterance.rate = 0.82;
      }

      this.isPlaying = true;
      this.notify();

      window.speechSynthesis.speak(utterance);

      this.currentTimeout = window.setTimeout(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        this.isPlaying = false;
        this.notify();
        onCutoff?.();
      }, durationMs);

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          onError?.(e);
        }
      };
    } catch (err) {
      this.isPlaying = false;
      this.notify();
      onError?.(err);
      onCutoff?.();
    }
  }

  public speak(
    text: string,
    durationMs: number,
    onCutoff?: () => void,
    onError?: (err: unknown) => void
  ) {
    this.stop();

    if (this.voiceGender === 'female') {
      // 1. First priority for Female: Natural Thai Female Voice via Google Audio
      this.playFemaleAudio(text, durationMs, onCutoff, () => {
        // Fallback to local SpeechSynthesis with high pitch if offline
        this.playLocalSynthesis(text, durationMs, false, onCutoff, onError);
      });
    } else {
      // 2. Male choice: Local Thai Male voice (Microsoft Pattara)
      this.playLocalSynthesis(text, durationMs, true, onCutoff, onError);
    }
  }
}

export const ttsService = new TTSService();
