// Stickman Meme Animator - Sound System
// Meme sound effects manager

import { SoundType, SoundEffect } from '../types';

// Sound configuration
interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

// Predefined sound configurations for meme sounds
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  boom: {
    frequency: 60,
    duration: 0.5,
    type: 'sine',
    volume: 1,
  },
  slap: {
    frequency: 800,
    duration: 0.1,
    type: 'square',
    volume: 0.8,
  },
  scream: {
    frequency: 600,
    duration: 0.8,
    type: 'sawtooth',
    volume: 0.6,
  },
  vine_boom: {
    frequency: 40,
    duration: 0.8,
    type: 'sine',
    volume: 1,
  },
  bonk: {
    frequency: 300,
    duration: 0.15,
    type: 'triangle',
    volume: 0.9,
  },
  oof: {
    frequency: 200,
    duration: 0.3,
    type: 'sine',
    volume: 0.7,
  },
  bruh: {
    frequency: 150,
    duration: 0.5,
    type: 'triangle',
    volume: 0.5,
  },
  laugh_track: {
    frequency: 440,
    duration: 2,
    type: 'sine',
    volume: 0.3,
  },
  sad_violin: {
    frequency: 350,
    duration: 1.5,
    type: 'triangle',
    volume: 0.4,
  },
  dramatic: {
    frequency: 100,
    duration: 1,
    type: 'sine',
    volume: 0.8,
  },
  typing: {
    frequency: 1000,
    duration: 0.05,
    type: 'square',
    volume: 0.3,
  },
  footstep: {
    frequency: 100,
    duration: 0.1,
    type: 'sine',
    volume: 0.4,
  },
};

export class SoundSystem {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, SoundEffect> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 0.5;

  // Initialize audio context (must be called after user interaction)
  initialize(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
  }

  // Enable/disable sound
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // Set master volume (0-1)
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Play a sound effect
  play(type: SoundType, volume: number = 1): void {
    if (!this.enabled || !this.audioContext) return;

    const config = SOUND_CONFIGS[type];
    if (!config) return;

    try {
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Configure oscillator
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);

      // Configure gain envelope
      const now = this.audioContext.currentTime;
      const finalVolume = config.volume * volume * this.masterVolume;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(finalVolume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + config.duration);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Special sound modifications
      this.applySoundModifications(oscillator, type, now);

      // Play
      oscillator.start(now);
      oscillator.stop(now + config.duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  // Apply special modifications for specific sounds
  private applySoundModifications(
    oscillator: OscillatorNode,
    type: SoundType,
    now: number
  ): void {
    if (!this.audioContext) return;

    switch (type) {
      case 'boom':
      case 'vine_boom':
        // Deep descending frequency
        oscillator.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        break;

      case 'slap':
        // Quick high frequency burst
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        break;

      case 'scream':
        // Rising then falling frequency
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        break;

      case 'bonk':
        // Quick descending "bonk"
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        break;

      case 'dramatic':
        // Long descending rumble
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 1);
        break;

      case 'sad_violin':
        // Tremolo effect approximation
        oscillator.frequency.setValueAtTime(350, now);
        oscillator.frequency.linearRampToValueAtTime(330, now + 0.5);
        oscillator.frequency.linearRampToValueAtTime(340, now + 1);
        break;
    }
  }

  // Schedule a sound to play at a specific time
  scheduleSound(effect: SoundEffect): void {
    this.sounds.set(`${effect.type}_${effect.startTime}`, effect);
  }

  // Play all scheduled sounds up to current frame
  playScheduledSounds(currentFrame: number, fps: number): void {
    const currentTime = currentFrame / fps;
    
    this.sounds.forEach((effect, key) => {
      const effectTime = effect.startTime / fps;
      if (currentTime >= effectTime && currentTime < effectTime + 0.1) {
        this.play(effect.type, effect.volume);
        this.sounds.delete(key);
      }
    });
  }

  // Queue a sound effect for a specific beat type
  queueBeatSound(beatType: string): void {
    const soundMap: Record<string, SoundType> = {
      punchline: 'vine_boom',
      reaction: 'oof',
      tension: 'dramatic',
      impact: 'boom',
      slap: 'slap',
      fall: 'bonk',
      scream: 'scream',
    };

    const sound = soundMap[beatType];
    if (sound) {
      this.play(sound);
    }
  }

  // Clear all scheduled sounds
  clearScheduled(): void {
    this.sounds.clear();
  }

  // Get available sound types
  getAvailableSounds(): SoundType[] {
    return Object.keys(SOUND_CONFIGS) as SoundType[];
  }

  // Clean up
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.sounds.clear();
  }
}

// Export singleton
export const soundSystem = new SoundSystem();
