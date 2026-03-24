// Stickman Meme Animator - Animation Engine
// Fast animation primitives for comedic timing

import { Animation, AnimationFrame, AnimationType, Position } from '../types';

// ==================== ANIMATION PRESETS ====================

// Idle - subtle breathing motion
const IDLE_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 24 },
  { headOffset: { x: 0, y: -2 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 24 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 24 },
  { headOffset: { x: 0, y: -2 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 24 },
];

// Walk - Simple 2-frame loop for rough sketch style
const WALK_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: -3 }, leftArm: [-25, 0], rightArm: [25, -15], leftLeg: [-20, 35], rightLeg: [10, 40], bodyLean: 2, duration: 6 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -15], rightArm: [25, 0], leftLeg: [10, 40], rightLeg: [20, 35], bodyLean: -2, duration: 6 },
  { headOffset: { x: 0, y: -3 }, leftArm: [-25, 0], rightArm: [25, -15], leftLeg: [-20, 35], rightLeg: [10, 40], bodyLean: 2, duration: 6 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -15], rightArm: [25, 0], leftLeg: [10, 40], rightLeg: [20, 35], bodyLean: -2, duration: 6 },
];

// Run - Fast exaggerated run
const RUN_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 5, y: -8 }, leftArm: [-35, -20], rightArm: [30, 5], leftLeg: [-25, 25], rightLeg: [15, 35], bodyLean: 10, duration: 3 },
  { headOffset: { x: 0, y: -5 }, leftArm: [-30, 5], rightArm: [35, -20], leftLeg: [15, 35], rightLeg: [25, 25], bodyLean: 10, duration: 3 },
  { headOffset: { x: 5, y: -8 }, leftArm: [-35, -20], rightArm: [30, 5], leftLeg: [-25, 25], rightLeg: [15, 35], bodyLean: 10, duration: 3 },
  { headOffset: { x: 0, y: -5 }, leftArm: [-30, 5], rightArm: [35, -20], leftLeg: [15, 35], rightLeg: [25, 25], bodyLean: 10, duration: 3 },
];

// Jump - Exaggerated jump with squash/stretch
const JUMP_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 5 }, leftArm: [-30, 10], rightArm: [30, 10], leftLeg: [-20, 35], rightLeg: [20, 35], bodyLean: 0, duration: 4 }, // Crouch
  { headOffset: { x: 0, y: -20 }, leftArm: [-35, -30], rightArm: [35, -30], leftLeg: [-15, 30], rightLeg: [15, 30], bodyLean: 0, duration: 6 }, // Jump up
  { headOffset: { x: 0, y: -25 }, leftArm: [-30, -35], rightArm: [30, -35], leftLeg: [-10, 35], rightLeg: [10, 35], bodyLean: 0, duration: 4 }, // Peak
  { headOffset: { x: 0, y: -15 }, leftArm: [-25, -20], rightArm: [25, -20], leftLeg: [-20, 40], rightLeg: [20, 40], bodyLean: 0, duration: 4 }, // Fall
  { headOffset: { x: 0, y: 8 }, leftArm: [-30, 5], rightArm: [30, 5], leftLeg: [-25, 30], rightLeg: [25, 30], bodyLean: 0, duration: 6 }, // Land
];

// Fall - Exaggerated fall with limbs flailing
const FALL_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: -5 }, leftArm: [-40, -20], rightArm: [40, -20], leftLeg: [-30, 30], rightLeg: [30, 30], bodyLean: 15, duration: 3 },
  { headOffset: { x: 0, y: 10 }, leftArm: [-45, 0], rightArm: [45, 0], leftLeg: [-25, 40], rightLeg: [25, 40], bodyLean: 30, duration: 3 },
  { headOffset: { x: 0, y: 30 }, leftArm: [-35, 15], rightArm: [35, 15], leftLeg: [-30, 35], rightLeg: [30, 35], bodyLean: 45, duration: 4 },
  { headOffset: { x: 0, y: 50 }, leftArm: [-30, 25], rightArm: [30, 25], leftLeg: [-20, 40], rightLeg: [20, 40], bodyLean: 90, duration: 6 }, // Flat on ground
];

// Sit - Quick sit animation
const SIT_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 4 },
  { headOffset: { x: 0, y: 10 }, leftArm: [-25, -5], rightArm: [25, -5], leftLeg: [-25, 20], rightLeg: [25, 20], bodyLean: 5, duration: 4 },
  { headOffset: { x: 0, y: 20 }, leftArm: [-25, 0], rightArm: [25, 0], leftLeg: [-30, 15], rightLeg: [30, 15], bodyLean: 10, duration: 6 }, // Sitting
];

// Wave - Quick wave
const WAVE_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [35, -45], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [45, -40], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [35, -45], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [45, -40], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
];

// Slap/Hip - Quick slap reaction
const SLAP_FRAMES: AnimationFrame[] = [
  { headOffset: { x: -10, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 2 },
  { headOffset: { x: 15, y: -5 }, leftArm: [-35, 0], rightArm: [15, -5], leftLeg: [-20, 40], rightLeg: [10, 40], bodyLean: 15, duration: 2 },
  { headOffset: { x: 20, y: 5 }, leftArm: [-40, 5], rightArm: [10, 0], leftLeg: [-25, 40], rightLeg: [5, 40], bodyLean: 20, duration: 3 },
];

// Shake - For shock/fear
const SHAKE_FRAMES: AnimationFrame[] = [
  { headOffset: { x: -3, y: 0 }, leftArm: [-30, -5], rightArm: [30, -5], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 2 },
  { headOffset: { x: 3, y: 0 }, leftArm: [-20, -5], rightArm: [40, -5], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 2 },
  { headOffset: { x: -3, y: 0 }, leftArm: [-30, -5], rightArm: [30, -5], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 2 },
  { headOffset: { x: 3, y: 0 }, leftArm: [-20, -5], rightArm: [40, -5], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 2 },
];

// Head Snap - Sudden dramatic head turn
const HEAD_SNAP_FRAMES: AnimationFrame[] = [
  { headOffset: { x: -5, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: -5, duration: 1 },
  { headOffset: { x: 10, y: -3 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 10, duration: 4 },
  { headOffset: { x: 8, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 5, duration: 3 },
];

// Talk - Mouth movement simulation via body bob
const TALK_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: -2 }, leftArm: [-25, -10], rightArm: [30, -8], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -10], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
  { headOffset: { x: 0, y: -2 }, leftArm: [-30, -8], rightArm: [25, -10], leftLeg: [-15, 40], rightLeg: [15, 40], bodyLean: 0, duration: 3 },
];

// Scream - Dramatic scream pose
const SCREAM_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: -5 }, leftArm: [-45, -40], rightArm: [45, -40], leftLeg: [-20, 40], rightLeg: [20, 40], bodyLean: 0, duration: 4 },
  { headOffset: { x: 0, y: -8 }, leftArm: [-50, -45], rightArm: [50, -45], leftLeg: [-25, 38], rightLeg: [25, 38], bodyLean: -5, duration: 4 },
  { headOffset: { x: 0, y: -5 }, leftArm: [-45, -40], rightArm: [45, -40], leftLeg: [-20, 40], rightLeg: [20, 40], bodyLean: 0, duration: 4 },
];

// Squash - Comedic squash effect
const SQUASH_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: 10 }, leftArm: [-35, 5], rightArm: [35, 5], leftLeg: [-25, 25], rightLeg: [25, 25], bodyLean: 0, duration: 4 },
  { headOffset: { x: 0, y: 15 }, leftArm: [-30, 10], rightArm: [30, 10], leftLeg: [-20, 20], rightLeg: [20, 20], bodyLean: 0, duration: 6 },
  { headOffset: { x: 0, y: 10 }, leftArm: [-35, 5], rightArm: [35, 5], leftLeg: [-25, 25], rightLeg: [25, 25], bodyLean: 0, duration: 4 },
];

// Enter - Walk in from side
const ENTER_FRAMES: AnimationFrame[] = [
  { headOffset: { x: 0, y: -3 }, leftArm: [-25, 0], rightArm: [25, -15], leftLeg: [-20, 35], rightLeg: [10, 40], bodyLean: 2, duration: 6 },
  { headOffset: { x: 0, y: 0 }, leftArm: [-25, -15], rightArm: [25, 0], leftLeg: [10, 40], rightLeg: [20, 35], bodyLean: -2, duration: 6 },
];

// Exit - Walk out to side
const EXIT_FRAMES: AnimationFrame[] = ENTER_FRAMES;

// Animation Library
export const ANIMATION_LIBRARY: Record<AnimationType, Animation> = {
  idle: { name: 'idle', frames: IDLE_FRAMES, loop: true, fps: 12 },
  walk: { name: 'walk', frames: WALK_FRAMES, loop: true, fps: 12 },
  run: { name: 'run', frames: RUN_FRAMES, loop: true, fps: 16 },
  jump: { name: 'jump', frames: JUMP_FRAMES, loop: false, fps: 16 },
  fall: { name: 'fall', frames: FALL_FRAMES, loop: false, fps: 16 },
  sit: { name: 'sit', frames: SIT_FRAMES, loop: false, fps: 16 },
  stand: { name: 'stand', frames: [...SIT_FRAMES].reverse(), loop: false, fps: 16 },
  wave: { name: 'wave', frames: WAVE_FRAMES, loop: true, fps: 16 },
  point: { name: 'point', frames: WAVE_FRAMES, loop: false, fps: 16 },
  slap: { name: 'slap', frames: SLAP_FRAMES, loop: false, fps: 24 },
  hit: { name: 'hit', frames: SLAP_FRAMES, loop: false, fps: 24 },
  shake: { name: 'shake', frames: SHAKE_FRAMES, loop: true, fps: 24 },
  head_snap: { name: 'head_snap', frames: HEAD_SNAP_FRAMES, loop: false, fps: 24 },
  squash: { name: 'squash', frames: SQUASH_FRAMES, loop: false, fps: 16 },
  stretch: { name: 'stretch', frames: [...SQUASH_FRAMES].map(f => ({ ...f, bodyLean: -f.bodyLean })), loop: false, fps: 16 },
  blink: { name: 'blink', frames: [IDLE_FRAMES[0], IDLE_FRAMES[0]], loop: false, fps: 12 },
  talk: { name: 'talk', frames: TALK_FRAMES, loop: true, fps: 16 },
  scream: { name: 'scream', frames: SCREAM_FRAMES, loop: true, fps: 16 },
  laugh: { name: 'laugh', frames: SHAKE_FRAMES, loop: true, fps: 20 },
  cry: { name: 'cry', frames: SHAKE_FRAMES, loop: true, fps: 12 },
  enter: { name: 'enter', frames: ENTER_FRAMES, loop: true, fps: 12 },
  exit: { name: 'exit', frames: EXIT_FRAMES, loop: true, fps: 12 },
};

// ==================== ANIMATION CONTROLLER ====================

export class AnimationController {
  private animations: Map<string, { animation: Animation; currentFrame: number; frameTime: number }> = new Map();

  getAnimation(type: AnimationType): Animation {
    return ANIMATION_LIBRARY[type] || ANIMATION_LIBRARY.idle;
  }

  startAnimation(characterId: string, type: AnimationType): void {
    const animation = this.getAnimation(type);
    this.animations.set(characterId, {
      animation,
      currentFrame: 0,
      frameTime: 0,
    });
  }

  update(characterId: string, deltaTime: number): AnimationFrame | null {
    const state = this.animations.get(characterId);
    if (!state) return null;

    const { animation, currentFrame, frameTime } = state;
    const frame = animation.frames[currentFrame];
    
    const newFrameTime = frameTime + deltaTime;
    const frameDuration = 1000 / animation.fps;
    
    if (newFrameTime >= frameDuration) {
      let nextFrame = currentFrame + 1;
      
      if (nextFrame >= animation.frames.length) {
        if (animation.loop) {
          nextFrame = 0;
        } else {
          nextFrame = animation.frames.length - 1;
        }
      }
      
      this.animations.set(characterId, {
        ...state,
        currentFrame: nextFrame,
        frameTime: newFrameTime - frameDuration,
      });
    } else {
      this.animations.set(characterId, {
        ...state,
        frameTime: newFrameTime,
      });
    }
    
    return frame;
  }

  isAnimationComplete(characterId: string): boolean {
    const state = this.animations.get(characterId);
    if (!state) return true;
    
    if (state.animation.loop) return false;
    
    return state.currentFrame >= state.animation.frames.length - 1;
  }

  getCurrentFrame(characterId: string): number {
    return this.animations.get(characterId)?.currentFrame || 0;
  }

  getTotalFrames(characterId: string): number {
    const state = this.animations.get(characterId);
    return state?.animation.frames.length || 0;
  }
}

// ==================== ANIMATION UTILITIES ====================

export function getAnimationDuration(type: AnimationType): number {
  const animation = ANIMATION_LIBRARY[type];
  if (!animation) return 24;
  
  return animation.frames.reduce((sum, frame) => sum + frame.duration, 0);
}

export function getAnimationFPS(type: AnimationType): number {
  const animation = ANIMATION_LIBRARY[type];
  return animation?.fps || 12;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeIn(t: number): number {
  return t * t;
}

export function easeOut(t: number): number {
  return t * (2 - t);
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOutBounce(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  } else if (t < 2.5 / 2.75) {
    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  } else {
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
  }
}

export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
}

// Export singleton
export const animationController = new AnimationController();
