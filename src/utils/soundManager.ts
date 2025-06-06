// Sound URLs - using free sound effects from various sources
// NOTE: These URLs are no longer valid. Sounds are disabled by default.
// To re-enable sounds, replace these URLs with valid sound file URLs
// and set enabled: true in the SoundManager constructor
export const SOUND_URLS = {
  cardDeal: 'https://www.soundjay.com/misc/sounds/playing-card-1.wav',
  cardPlay: 'https://www.soundjay.com/misc/sounds/playing-card-2.wav',
  cardShuffle: 'https://www.soundjay.com/misc/sounds/playing-cards-shuffling-1.wav',
  bidMade: 'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
  trickWon: 'https://www.soundjay.com/misc/sounds/coins-1.wav',
  gameWon: 'https://www.soundjay.com/misc/sounds/fanfare-1.wav',
  gameLost: 'https://www.soundjay.com/misc/sounds/fail-buzzer-1.wav',
  belote: 'https://www.soundjay.com/misc/sounds/magic-chime-01.wav',
  declaration: 'https://www.soundjay.com/misc/sounds/magic-chime-02.wav',
  buttonClick: 'https://www.soundjay.com/misc/sounds/button-3.wav'
};

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = false; // Disabled by default due to missing sound files
  private volume: number = 0.5;
  private audioContext?: AudioContext;

  private constructor() {
    // Pre-load sounds
    Object.entries(SOUND_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = this.volume;
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  play(soundName: keyof typeof SOUND_URLS, volume?: number) {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      // Clone the audio to allow overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = volume ?? this.volume;
      clone.play().catch(_err => {
        // Silently fail - sounds are optional
        // console.warn(`Failed to play sound ${soundName}:`, _err);
      });
    }
  }

  playWithPanning(url: string, volume: number, panning: number) {
    if (!this.enabled) return;

    // Initialize AudioContext if not already done
    if (!this.audioContext) {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        this.audioContext = new AudioCtx();
      } catch (err) {
        console.warn('Web Audio API not supported');
        return;
      }
    }

    const audio = new Audio(url);
    audio.volume = volume * this.volume;
    
    try {
      const source = this.audioContext.createMediaElementSource(audio);
      const panNode = this.audioContext.createStereoPanner();
      panNode.pan.value = Math.max(-1, Math.min(1, panning));
      
      source.connect(panNode);
      panNode.connect(this.audioContext.destination);
      
      audio.play().catch(err => {
        console.warn('Failed to play spatial audio:', err);
      });
    } catch (err) {
      // Fallback to regular playback
      audio.play().catch(() => {});
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = this.volume;
    });
  }

  getEnabled() {
    return this.enabled;
  }

  getVolume() {
    return this.volume;
  }
}

export const soundManager = SoundManager.getInstance();

// React hook for sound settings
import { useState, useEffect } from 'react';

export function useSoundSettings() {
  const [enabled, setEnabled] = useState(soundManager.getEnabled());
  const [volume, setVolume] = useState(soundManager.getVolume());

  useEffect(() => {
    soundManager.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  return {
    enabled,
    setEnabled,
    volume,
    setVolume
  };
}