// Rico-Style Stickman Animation Engine
// Core Data Models - Strict Schemas

// ==================== BASE TYPES ====================

export interface Position {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

// ==================== STICKMAN RIG ====================

export interface Joint {
  x: number;
  y: number;
  rotation: number; // radians
}

export interface Limb {
  startJoint: Joint;
  endJoint: Joint;
  length: number;
  angle: number;
}

export interface StickmanRig {
  // Head
  head: {
    x: number;
    y: number;
    radius: number;
    rotation: number;
    scale: number;
  };
  
  // Body (spine)
  body: {
    topX: number;
    topY: number;
    bottomX: number;
    bottomY: number;
    length: number;
  };
  
  // Arms
  leftArm: Limb;
  rightArm: Limb;
  
  // Legs
  leftLeg: Limb;
  rightLeg: Limb;
  
  // Transforms
  position: Position;
  rotation: number;
  scale: number;
  
  // State
  facingRight: boolean;
}

// ==================== CHARACTER ====================

export type CharacterState = 'idle' | 'walking' | 'running' | 'sitting' | 'jumping' | 'falling' | 'shocked';

export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'shocked' | 'scared' | 'confused' | 'evil_grin' | 'smug';

export interface Character {
  id: string;
  name: string;
  rig: StickmanRig;
  position: Position;
  state: CharacterState;
  emotion: EmotionType;
  facingRight: boolean;
  
  // Animation state
  currentAnimation: Animation | null;
  animationFrame: number;
  
  // Physics
  velocity: Vector2D;
  
  // Visual
  color: string;
  opacity: number;
}

// ==================== ANIMATION ====================

export type ActionType = 
  | 'walk' | 'run' | 'jump' | 'fall' | 'sit' | 'stand'
  | 'wave' | 'point' | 'slap' | 'hit' | 'kick'
  | 'shake' | 'freeze' | 'scream' | 'laugh'
  | 'enter' | 'exit' | 'idle' | 'slip';

export interface AnimationKeyframe {
  frame: number;
  joints: {
    head?: Partial<StickmanRig['head']>;
    leftArm?: { angle: number };
    rightArm?: { angle: number };
    leftLeg?: { angle: number };
    rightLeg?: { angle: number };
    body?: { lean: number };
  };
  position?: Position;
  emotion?: EmotionType;
  scale?: number;
}

export interface Animation {
  type: ActionType;
  keyframes: AnimationKeyframe[];
  duration: number; // frames
  loop: boolean;
  fps: number;
}

export interface Action {
  characterId: string;
  type: ActionType;
  startFrame: number;
  endFrame: number;
  params: {
    targetPosition?: Position;
    intensity?: number;
    emotion?: EmotionType;
    text?: string;
  };
}

// ==================== CAMERA ====================

export interface CameraInstruction {
  type: 'zoom' | 'pan' | 'shake' | 'cut' | 'hold';
  startFrame: number;
  endFrame: number;
  params: {
    zoom?: number;
    targetZoom?: number;
    panX?: number;
    panY?: number;
    shakeIntensity?: number;
    holdDuration?: number;
  };
}

export interface CameraState {
  zoom: number;
  panX: number;
  panY: number;
  rotation: number;
  shake: number;
}

// ==================== SCENE ====================

export interface Scene {
  id: number;
  duration: number; // frames
  background: string;
  characters: Character[];
  actions: Action[];
  camera: CameraInstruction[];
  dialogue: Dialogue[];
}

export interface Dialogue {
  characterId: string;
  text: string;
  startFrame: number;
  duration: number;
}

// ==================== TIMELINE ====================

export interface Timeline {
  totalFrames: number;
  fps: number;
  scenes: Scene[];
  currentFrame: number;
}

// ==================== SOUND ====================

export type SoundType = 
  | 'slap' | 'hit' | 'boom' | 'scream' | 'shock'
  | 'footstep' | 'fall' | 'laugh' | 'dramatic' | 'vine_boom';

export interface SoundEvent {
  type: SoundType;
  frame: number;
  volume: number;
}

// ==================== EXPORT ====================

export type ExportFormat = 'mp4' | 'webm' | 'gif';

export interface ExportConfig {
  format: ExportFormat;
  width: number;
  height: number;
  fps: number;
  quality: number;
}

// ==================== STORY PARSING ====================

export interface ParsedEntity {
  type: 'character' | 'action' | 'emotion' | 'location';
  text: string;
  position: { start: number; end: number };
}

export interface StoryBeat {
  text: string;
  characters: string[];
  actions: { character: string; action: string; target?: string }[];
  emotions: { character: string; emotion: EmotionType }[];
  dialogue?: { character: string; text: string };
  type: 'setup' | 'buildup' | 'tension' | 'punchline' | 'reaction';
}

// ==================== RENDER CONFIG ====================

export const RENDER_CONFIG = {
  VERTICAL_1080: { width: 1080, height: 1920, fps: 24 },
  VERTICAL_720: { width: 720, height: 1280, fps: 24 },
  VERTICAL_480: { width: 480, height: 854, fps: 24 },
} as const;

// ==================== ANIMATION CONSTRAINTS ====================

export const JOINT_CONSTRAINTS = {
  arm: { minAngle: -Math.PI, maxAngle: Math.PI },
  leg: { minAngle: -Math.PI / 2, maxAngle: Math.PI / 2 },
  head: { maxRotation: Math.PI / 4 },
  body: { maxLean: Math.PI / 6 },
} as const;

// ==================== TIMING CONSTANTS ====================

export const TIMING = {
  SETUP_DURATION: 48,      // 2 seconds at 24fps
  BUILDUP_DURATION: 36,    // 1.5 seconds
  PUNCHLINE_DURATION: 12,  // 0.5 seconds - instant!
  REACTION_DURATION: 36,   // 1.5 seconds
  HOLD_DURATION: 6,        // 0.25 seconds
  DRAMATIC_HOLD: 12,       // 0.5 seconds
} as const;
