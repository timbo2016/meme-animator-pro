// Stickman Meme Animator - Timing Engine
// Comedic timing system for meme animations

import { BeatType, TimingBeat, CameraEffect } from '../types';
import { cameraController, CAMERA_PRESETS } from '../camera/CameraEngine';

// Timing constants (in frames at 24 FPS)
export const TIMING_CONSTANTS = {
  FPS: 24,
  
  // Beat durations (in frames)
  SETUP_MIN: 24,      // 1 second minimum
  SETUP_MAX: 48,      // 2 seconds maximum
  BUILDUP_MIN: 24,    // 1 second minimum
  BUILDUP_MAX: 48,    // 2 seconds maximum
  TENSION_MIN: 12,    // 0.5 second minimum
  TENSION_MAX: 36,    // 1.5 seconds maximum
  PUNCHLINE: 6,       // 0.25 seconds - instant!
  REACTION_MIN: 12,   // 0.5 second minimum
  REACTION_MAX: 36,   // 1.5 seconds maximum
  AFTERMATH_MIN: 12,  // 0.5 second minimum
  AFTERMATH_MAX: 24,  // 1 second maximum
  
  // Hold durations for comedic effect
  SHORT_HOLD: 3,      // 3 frames
  MEDIUM_HOLD: 6,     // 6 frames (0.25 seconds)
  LONG_HOLD: 12,      // 12 frames (0.5 seconds)
  DRAMATIC_HOLD: 24,  // 24 frames (1 second)
  
  // Scene cuts
  QUICK_CUT: 1,       // 1 frame cut
  NORMAL_CUT: 3,      // 3 frame transition
};

export class TimingEngine {
  private currentBeat: number = 0;
  private beats: TimingBeat[] = [];
  private frameInBeat: number = 0;
  private totalFrames: number = 0;
  private holdRemaining: number = 0;
  private lastBeatType: BeatType | null = null;

  // Create timing beats from story structure
  createBeats(scenes: { type: BeatType; content: string }[]): TimingBeat[] {
    this.beats = scenes.map((scene, index) => this.createBeat(scene.type, index));
    this.totalFrames = this.beats.reduce((sum, beat) => sum + beat.duration + (beat.hold || 0), 0);
    this.currentBeat = 0;
    this.frameInBeat = 0;
    
    return this.beats;
  }

  // Create a single timing beat
  private createBeat(type: BeatType, index: number): TimingBeat {
    let duration: number;
    let hold: number | undefined;
    let cameraEffect: CameraEffect | undefined;

    switch (type) {
      case 'setup':
        duration = this.randomBetween(TIMING_CONSTANTS.SETUP_MIN, TIMING_CONSTANTS.SETUP_MAX);
        break;
      
      case 'buildup':
        duration = this.randomBetween(TIMING_CONSTANTS.BUILDUP_MIN, TIMING_CONSTANTS.BUILDUP_MAX);
        cameraEffect = 'zoom_in';
        break;
      
      case 'tension':
        duration = this.randomBetween(TIMING_CONSTANTS.TENSION_MIN, TIMING_CONSTANTS.TENSION_MAX);
        hold = TIMING_CONSTANTS.LONG_HOLD;
        break;
      
      case 'punchline':
        duration = TIMING_CONSTANTS.PUNCHLINE; // Instant!
        hold = TIMING_CONSTANTS.MEDIUM_HOLD;
        cameraEffect = 'shake';
        break;
      
      case 'reaction':
        duration = this.randomBetween(TIMING_CONSTANTS.REACTION_MIN, TIMING_CONSTANTS.REACTION_MAX);
        cameraEffect = 'zoom_out';
        break;
      
      case 'aftermath':
        duration = this.randomBetween(TIMING_CONSTANTS.AFTERMATH_MIN, TIMING_CONSTANTS.AFTERMATH_MAX);
        hold = TIMING_CONSTANTS.SHORT_HOLD;
        break;
      
      default:
        duration = TIMING_CONSTANTS.SETUP_MIN;
    }

    return { type, duration, hold, cameraEffect };
  }

  // Update timing state
  update(deltaTime: number): {
    beatChanged: boolean;
    currentBeat: TimingBeat | null;
    progress: number;
    isHolding: boolean;
  } {
    const currentTimingBeat = this.beats[this.currentBeat];
    
    if (!currentTimingBeat) {
      return { beatChanged: false, currentBeat: null, progress: 1, isHolding: false };
    }

    // Check if we're in a hold
    if (this.holdRemaining > 0) {
      this.holdRemaining--;
      return {
        beatChanged: false,
        currentBeat: currentTimingBeat,
        progress: 1,
        isHolding: true,
      };
    }

    this.frameInBeat++;
    const progress = this.frameInBeat / currentTimingBeat.duration;

    // Check if beat is complete
    if (this.frameInBeat >= currentTimingBeat.duration) {
      // Start hold if defined
      if (currentTimingBeat.hold) {
        this.holdRemaining = currentTimingBeat.hold;
      }

      // Move to next beat
      this.currentBeat++;
      this.frameInBeat = 0;
      this.lastBeatType = currentTimingBeat.type;

      // Apply camera effect for next beat
      const nextBeat = this.beats[this.currentBeat];
      if (nextBeat?.cameraEffect) {
        this.applyCameraEffect(nextBeat.cameraEffect, nextBeat.type);
      }

      return {
        beatChanged: true,
        currentBeat: currentTimingBeat,
        progress: 1,
        isHolding: false,
      };
    }

    return {
      beatChanged: false,
      currentBeat: currentTimingBeat,
      progress,
      isHolding: false,
    };
  }

  // Apply camera effect based on beat type
  private applyCameraEffect(effect: CameraEffect, beatType: BeatType): void {
    switch (effect) {
      case 'zoom_in':
        if (beatType === 'tension') {
          cameraController.dramaticZoom({ x: 540, y: 500 }, 2.5);
        } else if (beatType === 'punchline') {
          cameraController.zoomIn(CAMERA_PRESETS.punchline.zoom, true);
          cameraController.shake(CAMERA_PRESETS.punchline.shake, 200);
        }
        break;
      
      case 'zoom_out':
        cameraController.zoomOut(1);
        break;
      
      case 'shake':
        cameraController.shake(CAMERA_PRESETS.impact.shake, 300);
        break;
      
      case 'quick_cut':
        cameraController.quickCut();
        break;
    }
  }

  // Get total duration
  getTotalDuration(): number {
    return this.totalFrames;
  }

  // Get current beat index
  getCurrentBeatIndex(): number {
    return this.currentBeat;
  }

  // Get progress through entire animation
  getOverallProgress(): number {
    let framesBeforeCurrent = 0;
    for (let i = 0; i < this.currentBeat; i++) {
      framesBeforeCurrent += this.beats[i].duration + (this.beats[i].hold || 0);
    }
    framesBeforeCurrent += this.frameInBeat;
    
    return framesBeforeCurrent / this.totalFrames;
  }

  // Check if animation is complete
  isComplete(): boolean {
    return this.currentBeat >= this.beats.length;
  }

  // Reset timing engine
  reset(): void {
    this.currentBeat = 0;
    this.frameInBeat = 0;
    this.holdRemaining = 0;
    this.lastBeatType = null;
    cameraController.reset(true);
  }

  // Helper: random number between min and max
  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// ==================== BEAT PATTERNS ====================

// Pre-defined comedic beat patterns
export const BEAT_PATTERNS = {
  // Classic 3-beat joke structure
  classic: ['setup', 'buildup', 'punchline'] as BeatType[],
  
  // With reaction
  withReaction: ['setup', 'buildup', 'punchline', 'reaction'] as BeatType[],
  
  // Tension building
  tension: ['setup', 'buildup', 'tension', 'punchline'] as BeatType[],
  
  // Full meme structure
  full: ['setup', 'buildup', 'tension', 'punchline', 'reaction', 'aftermath'] as BeatType[],
  
  // Quick hit
  quick: ['setup', 'punchline'] as BeatType[],
  
  // Bait and switch
  baitSwitch: ['setup', 'tension', 'punchline', 'reaction'] as BeatType[],
};

// ==================== FRAME SKIP UTILITY ====================

// Frame skipping for comedic timing (makes animation look "choppy" on purpose)
export function shouldSkipFrame(currentFrame: number, skipPattern: number[]): boolean {
  const patternLength = skipPattern.reduce((a, b) => a + b, 0);
  const frameInPattern = currentFrame % patternLength;
  
  let accumulator = 0;
  for (let i = 0; i < skipPattern.length; i++) {
    accumulator += skipPattern[i];
    if (frameInPattern < accumulator) {
      return i % 2 === 1; // Skip odd-indexed intervals
    }
  }
  
  return false;
}

// Common skip patterns (1 = show, 0 = skip)
export const SKIP_PATTERNS = {
  normal: [1],           // No skipping
  choppy: [1, 0],        // Skip every other frame
  veryChoppy: [1, 1, 0], // Skip every third frame
  stutter: [1, 0, 1, 0, 1, 1, 0, 0], // Irregular stutter
  snap: [1, 1, 0, 0, 0], // Quick snap effect
};

// Export singleton
export const timingEngine = new TimingEngine();
