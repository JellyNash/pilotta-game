import { soundManager } from '../utils/soundManager';

export interface AccessibleSound {
  id: string;
  url: string;
  volume: number;
  category: 'game' | 'ui' | 'notification' | 'voice';
}

class AccessibleSoundManager {
  private sounds: Map<string, AccessibleSound> = new Map();
  private voiceEnabled: boolean = false;
  private voiceVolume: number = 1;
  private spatialAudioEnabled: boolean = false;
  private audioCues: {
    cardPlay: boolean;
    turnStart: boolean;
    trickWin: boolean;
    gameEvents: boolean;
    errorSounds: boolean;
  } = {
    cardPlay: true,
    turnStart: true,
    trickWin: true,
    gameEvents: true,
    errorSounds: true
  };

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Define default accessibility sounds
    const defaultSounds: AccessibleSound[] = [
      { id: 'card-play', url: '/sounds/card-play.mp3', volume: 0.5, category: 'game' },
      { id: 'card-select', url: '/sounds/card-select.mp3', volume: 0.3, category: 'ui' },
      { id: 'turn-start', url: '/sounds/turn-start.mp3', volume: 0.6, category: 'notification' },
      { id: 'trick-win', url: '/sounds/trick-win.mp3', volume: 0.7, category: 'game' },
      { id: 'invalid-move', url: '/sounds/error.mp3', volume: 0.5, category: 'ui' },
      { id: 'bid-placed', url: '/sounds/bid.mp3', volume: 0.5, category: 'game' },
      { id: 'contract-made', url: '/sounds/success.mp3', volume: 0.8, category: 'game' },
      { id: 'contract-failed', url: '/sounds/fail.mp3', volume: 0.6, category: 'game' },
      { id: 'navigation', url: '/sounds/nav.mp3', volume: 0.2, category: 'ui' }
    ];

    defaultSounds.forEach(sound => {
      this.sounds.set(sound.id, sound);
    });
  }

  play(soundId: string, options?: { 
    position?: 'north' | 'east' | 'south' | 'west';
    volume?: number;
  }) {
    const sound = this.sounds.get(soundId);
    if (!sound) return;

    // Check if the sound category is enabled
    if (!this.shouldPlaySound(sound.category)) return;

    const finalVolume = (options?.volume ?? sound.volume) * this.getMasterVolume();

    // Apply spatial audio if enabled and position is provided
    if (this.spatialAudioEnabled && options?.position) {
      const panning = this.calculatePanning(options.position);
      soundManager.playWithPanning(sound.url, finalVolume, panning);
    } else {
      soundManager.play(sound.url, finalVolume);
    }
  }

  private shouldPlaySound(category: string): boolean {
    switch (category) {
      case 'game':
        return this.audioCues.gameEvents;
      case 'ui':
        return true; // Always play UI sounds
      case 'notification':
        return this.audioCues.turnStart || this.audioCues.trickWin;
      case 'voice':
        return this.voiceEnabled;
      default:
        return true;
    }
  }

  private getMasterVolume(): number {
    // Get master volume from the main sound manager
    return soundManager.getVolume();
  }

  private calculatePanning(position: 'north' | 'east' | 'south' | 'west'): number {
    // Calculate stereo panning based on position
    // -1 = full left, 0 = center, 1 = full right
    switch (position) {
      case 'west':
        return -0.7;
      case 'east':
        return 0.7;
      case 'north':
      case 'south':
        return 0; // Center for top/bottom
      default:
        return 0;
    }
  }

  // Voice narration methods
  async speak(text: string, options?: {
    rate?: number;
    pitch?: number;
    voice?: string;
  }) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = this.voiceVolume * this.getMasterVolume();
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;

    // Set voice if specified
    if (options?.voice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(v => v.name === options.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    speechSynthesis.speak(utterance);
  }

  cancelSpeech() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  // Settings methods
  setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.cancelSpeech();
    }
  }

  setVoiceVolume(volume: number) {
    this.voiceVolume = Math.max(0, Math.min(1, volume));
  }

  setSpatialAudioEnabled(enabled: boolean) {
    this.spatialAudioEnabled = enabled;
  }

  setAudioCues(cues: Partial<typeof this.audioCues>) {
    this.audioCues = { ...this.audioCues, ...cues };
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  // Play sounds for game events
  playCardSound(position?: 'north' | 'east' | 'south' | 'west') {
    if (this.audioCues.cardPlay) {
      this.play('card-play', { position });
    }
  }

  playTurnStartSound() {
    if (this.audioCues.turnStart) {
      this.play('turn-start');
    }
  }

  playTrickWinSound(winnerPosition: 'north' | 'east' | 'south' | 'west') {
    if (this.audioCues.trickWin) {
      this.play('trick-win', { position: winnerPosition });
    }
  }

  playErrorSound() {
    if (this.audioCues.errorSounds) {
      this.play('invalid-move');
    }
  }

  playNavigationSound() {
    this.play('navigation', { volume: 0.2 });
  }
}

// Export singleton instance
export const accessibleSoundManager = new AccessibleSoundManager();

// React hook for using accessible sounds
import { useEffect } from 'react';
import { useAccessibility } from './AccessibilityContext';

export function useAccessibleSounds() {
  const { settings } = useAccessibility();

  useEffect(() => {
    // Update sound manager settings based on accessibility settings
    accessibleSoundManager.setVoiceEnabled(settings.audio.voiceNarration);
    accessibleSoundManager.setVoiceVolume(settings.audio.voiceVolume / 100);
    accessibleSoundManager.setSpatialAudioEnabled(settings.audio.spatialAudio);
    accessibleSoundManager.setAudioCues({
      cardPlay: settings.audio.audioCues.cardSounds,
      turnStart: settings.audio.audioCues.turnNotifications,
      trickWin: settings.audio.audioCues.winSounds,
      gameEvents: settings.audio.audioCues.gameEvents,
      errorSounds: settings.audio.audioCues.errorSounds
    });
  }, [settings.audio]);

  return {
    playCardSound: (position?: 'north' | 'east' | 'south' | 'west') => 
      accessibleSoundManager.playCardSound(position),
    playTurnStartSound: () => accessibleSoundManager.playTurnStartSound(),
    playTrickWinSound: (position: 'north' | 'east' | 'south' | 'west') => 
      accessibleSoundManager.playTrickWinSound(position),
    playErrorSound: () => accessibleSoundManager.playErrorSound(),
    playNavigationSound: () => accessibleSoundManager.playNavigationSound(),
    speak: (text: string, options?: Parameters<typeof accessibleSoundManager.speak>[1]) => 
      accessibleSoundManager.speak(text, options),
    cancelSpeech: () => accessibleSoundManager.cancelSpeech()
  };
}
