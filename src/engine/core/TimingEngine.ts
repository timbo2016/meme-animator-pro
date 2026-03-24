// Rico-Style Stickman Animation Engine
// Timing Engine - Frame-based Scheduling and Comedic Timing

import { TIMING, Timeline, Scene } from './types';

// ==================== TIMING TYPES ====================

export type TimingPhase = 'setup' | 'buildup' | 'tension' | 'punchline' | 'reaction' | 'aftermath';

export interface TimingEvent {
  frame: number;
  type: 'action_start' | 'action_end' | 'camera' | 'sound' | 'dialogue' | 'cut';
  data: any;
}

export interface TimingBlock {
  phase: TimingPhase;
  startFrame: number;
  endFrame: number;
  duration: number;
  hold?: number; // Frame hold for comedic effect
}

// ==================== TIMING CALCULATOR ====================

export class TimingEngine {
  private events: TimingEvent[] = [];
  private blocks: TimingBlock[] = [];
  private currentFrame: number = 0;
  private totalFrames: number = 0;
  private fps: number = 24;
  
  constructor(fps: number = 24) {
    this.fps = fps;
  }
  
  // Calculate timing from scenes
  calculateFromScenes(scenes: Scene[]): void {
    this.events = [];
    this.blocks = [];
    this.currentFrame = 0;
    
    let frameAccumulator = 0;
    
    scenes.forEach((scene, sceneIndex) => {
      // Create timing block for scene
      const phase = this.determinePhase(scene, sceneIndex, scenes.length);
      const block: TimingBlock = {
        phase,
        startFrame: frameAccumulator,
        endFrame: frameAccumulator + scene.duration,
        duration: scene.duration,
      };
      this.blocks.push(block);
      
      // Schedule actions
      scene.actions.forEach(action => {
        this.scheduleEvent({
          frame: frameAccumulator + action.startFrame,
          type: 'action_start',
          data: action,
        });
        
        this.scheduleEvent({
          frame: frameAccumulator + action.endFrame,
          type: 'action_end',
          data: action,
        });
      });
      
      // Schedule camera
      scene.camera.forEach(cam => {
        this.scheduleEvent({
          frame: frameAccumulator + cam.startFrame,
          type: 'camera',
          data: cam,
        });
      });
      
      // Schedule dialogue
      scene.dialogue.forEach(d => {
        this.scheduleEvent({
          frame: frameAccumulator + d.startFrame,
          type: 'dialogue',
          data: d,
        });
      });
      
      frameAccumulator += scene.duration;
    });
    
    this.totalFrames = frameAccumulator;
  }
  
  private determinePhase(scene: Scene, index: number, total: number): TimingPhase {
    // Check for punchline indicators in actions
    const hasPunchlineAction = scene.actions.some(a => 
      ['slap', 'hit', 'fall', 'shock', 'scream'].includes(a.type)
    );
    
    if (hasPunchlineAction) return 'punchline';
    
    // Position-based phase
    if (index === 0) return 'setup';
    if (index === total - 1) return 'aftermath';
    if (index === total - 2) return 'reaction';
    
    // Duration-based
    if (scene.duration <= TIMING.PUNCHLINE_DURATION * 2) return 'punchline';
    if (scene.duration <= TIMING.BUILDUP_DURATION) return 'tension';
    
    return 'buildup';
  }
  
  // Event scheduling
  scheduleEvent(event: TimingEvent): void {
    // Insert in sorted order
    let insertIndex = this.events.findIndex(e => e.frame > event.frame);
    if (insertIndex === -1) insertIndex = this.events.length;
    this.events.splice(insertIndex, 0, event);
  }
  
  // Get events at current frame
  getEventsAtFrame(frame: number): TimingEvent[] {
    return this.events.filter(e => e.frame === frame);
  }
  
  // Get events in frame range
  getEventsInRange(startFrame: number, endFrame: number): TimingEvent[] {
    return this.events.filter(e => e.frame >= startFrame && e.frame < endFrame);
  }
  
  // Get current block
  getCurrentBlock(): TimingBlock | null {
    return this.blocks.find(b => 
      this.currentFrame >= b.startFrame && this.currentFrame < b.endFrame
    ) || null;
  }
  
  // Progress
  getProgress(): number {
    return this.totalFrames > 0 ? this.currentFrame / this.totalFrames : 0;
  }
  
  // Frame navigation
  setFrame(frame: number): void {
    this.currentFrame = Math.max(0, Math.min(this.totalFrames - 1, frame));
  }
  
  advanceFrame(): void {
    if (this.currentFrame < this.totalFrames - 1) {
      this.currentFrame++;
    }
  }
  
  reset(): void {
    this.currentFrame = 0;
  }
  
  // Getters
  getCurrentFrame(): number {
    return this.currentFrame;
  }
  
  getTotalFrames(): number {
    return this.totalFrames;
  }
  
  getFPS(): number {
    return this.fps;
  }
  
  // Format time display
  formatTime(frame?: number): string {
    const f = frame ?? this.currentFrame;
    const seconds = Math.floor(f / this.fps);
    const frames = f % this.fps;
    return `${seconds}:${frames.toString().padStart(2, '0')}`;
  }
  
  formatTotalTime(): string {
    return this.formatTime(this.totalFrames);
  }
}

// ==================== COMEDIC TIMING FUNCTIONS ====================

// Hold frame for dramatic effect
export function holdFrame(frames: number): number {
  return frames;
}

// Calculate punchline timing
export function calculatePunchlineTiming(
  setupDuration: number,
  tensionDuration: number = TIMING.BUILDUP_DURATION
): { setup: number; tension: number; punchline: number; hold: number } {
  return {
    setup: setupDuration,
    tension: tensionDuration,
    punchline: TIMING.PUNCHLINE_DURATION,
    hold: TIMING.HOLD_DURATION,
  };
}

// Get timing for beat type
export function getTimingForBeat(type: TimingPhase): number {
  const timings: Record<TimingPhase, number> = {
    setup: TIMING.SETUP_DURATION,
    buildup: TIMING.BUILDUP_DURATION,
    tension: TIMING.BUILDUP_DURATION,
    punchline: TIMING.PUNCHLINE_DURATION,
    reaction: TIMING.REACTION_DURATION,
    aftermath: TIMING.SETUP_DURATION,
  };
  
  return timings[type];
}

// Create a dramatic pause
export function createDramaticPause(intensity: 'short' | 'medium' | 'long' = 'medium'): number {
  switch (intensity) {
    case 'short': return TIMING.HOLD_DURATION;
    case 'medium': return TIMING.DRAMATIC_HOLD;
    case 'long': return TIMING.DRAMATIC_HOLD * 2;
  }
}

// Frame skipping for comedic effect
export function shouldSkipFrame(frame: number, pattern: 'choppy' | 'stutter' | 'snap'): boolean {
  switch (pattern) {
    case 'choppy':
      return frame % 2 === 0; // Skip every other frame
    case 'stutter':
      return (frame % 6) < 2; // Stutter pattern
    case 'snap':
      return frame % 4 === 0; // Quick snap
    default:
      return false;
  }
}

// ==================== TIMING PRESETS ====================

export const TIMING_PRESETS = {
  // Classic 3-beat joke
  classicJoke: {
    setup: TIMING.SETUP_DURATION,
    punchline: TIMING.PUNCHLINE_DURATION,
    reaction: TIMING.REACTION_DURATION,
    total: TIMING.SETUP_DURATION + TIMING.PUNCHLINE_DURATION + TIMING.REACTION_DURATION,
  },
  
  // Slapstick hit
  slapstick: {
    setup: TIMING.SETUP_DURATION,
    tension: TIMING.BUILDUP_DURATION,
    hit: TIMING.PUNCHLINE_DURATION,
    reaction: TIMING.REACTION_DURATION,
    total: TIMING.SETUP_DURATION + TIMING.BUILDUP_DURATION + TIMING.PUNCHLINE_DURATION + TIMING.REACTION_DURATION,
  },
  
  // Shock reveal
  shockReveal: {
    setup: TIMING.SETUP_DURATION,
    hold: TIMING.DRAMATIC_HOLD,
    reveal: TIMING.PUNCHLINE_DURATION,
    reaction: TIMING.REACTION_DURATION,
    total: TIMING.SETUP_DURATION + TIMING.DRAMATIC_HOLD + TIMING.PUNCHLINE_DURATION + TIMING.REACTION_DURATION,
  },
  
  // Quick meme
  quickMeme: {
    setup: TIMING.PUNCHLINE_DURATION,
    punchline: TIMING.PUNCHLINE_DURATION,
    total: TIMING.PUNCHLINE_DURATION * 2,
  },
};

// Export singleton
export const timingEngine = new TimingEngine(24);
