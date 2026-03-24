// Stickman Meme Animator - Core Types
// Rico-Style Engine Type Definitions

// ==================== CHARACTER SYSTEM ====================

export type EmotionType = 
  | 'neutral' 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'shocked' 
  | 'confused' 
  | 'evil_grin'
  | 'scared'
  | 'smug';

export type PoseType = 
  | 'standing' 
  | 'walking' 
  | 'running' 
  | 'sitting' 
  | 'falling' 
  | 'jumping'
  | 'lying'
  | 'crouching';

export type AnimationType = 
  | 'idle'
  | 'walk'
  | 'run'
  | 'jump'
  | 'fall'
  | 'sit'
  | 'stand'
  | 'wave'
  | 'point'
  | 'slap'
  | 'hit'
  | 'shake'
  | 'head_snap'
  | 'squash'
  | 'stretch'
  | 'blink'
  | 'talk'
  | 'scream'
  | 'laugh'
  | 'cry'
  | 'enter'
  | 'exit';

export interface Position {
  x: number;
  y: number;
}

export interface CharacterState {
  position: Position;
  facingRight: boolean;
  pose: PoseType;
  emotion: EmotionType;
  isTalking: boolean;
  currentAnimation?: {
    name: AnimationType;
    frame: number;
    totalFrames: number;
  };
  scale: number;
  squash: number;
  stretch: number;
  rotation: number;
  opacity: number;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  state: CharacterState;
}

// ==================== ANIMATION SYSTEM ====================

export interface AnimationFrame {
  headOffset: Position;
  leftArm: number[];
  rightArm: number[];
  leftLeg: number[];
  rightLeg: number[];
  bodyLean: number;
  duration: number;
}

export interface Animation {
  name: AnimationType;
  frames: AnimationFrame[];
  loop: boolean;
  fps: number;
}

// ==================== CAMERA SYSTEM ====================

export type CameraEffect = 
  | 'none'
  | 'zoom_in'
  | 'zoom_out'
  | 'shake'
  | 'quick_cut'
  | 'pulse'
  | 'rotate';

export interface CameraState {
  zoom: number;
  pan: Position;
  rotation: number;
  shake: number;
  effect: CameraEffect;
  effectIntensity: number;
  target?: Position;
}

// ==================== TIMING SYSTEM ====================

export type BeatType = 
  | 'setup'
  | 'buildup'
  | 'tension'
  | 'punchline'
  | 'reaction'
  | 'aftermath';

export interface TimingBeat {
  type: BeatType;
  duration: number; // in frames
  hold?: number; // frame hold for comedic effect
  cameraEffect?: CameraEffect;
}

// ==================== COMEDY ENGINE ====================

export interface ComedyBeat {
  scene: string;
  description: string;
  type: BeatType;
  characters: string[];
  actions: string[];
  dialogue?: string;
  sound?: string;
  cameraEffect?: CameraEffect;
  duration: number;
  hold?: number;
}

export interface MemeTemplate {
  name: string;
  setup: string[];
  punchline: string;
  tags: string[];
}

// ==================== STORY SYSTEM ====================

export interface StoryAction {
  type: AnimationType;
  characterId: string;
  startTime: number;
  duration: number;
  target?: Position;
  emotion?: EmotionType;
  object?: string;
}

export interface Dialogue {
  characterId: string;
  text: string;
  startTime: number;
  duration: number;
  emotion?: EmotionType;
}

export interface Scene {
  id: number;
  description: string;
  characters: Character[];
  actions: StoryAction[];
  dialogue: Dialogue[];
  background: string;
  duration: number;
  cameraEffect?: CameraEffect;
}

export interface StoryInstruction {
  scenes: Scene[];
  totalDuration: number;
  metadata: {
    title: string;
    author: string;
    createdAt: Date;
  };
}

// ==================== SOUND SYSTEM ====================

export type SoundType = 
  | 'boom'
  | 'slap'
  | 'scream'
  | 'vine_boom'
  | 'bonk'
  | 'oof'
  | 'bruh'
  | 'laugh_track'
  | 'sad_violin'
  | 'dramatic'
  | 'typing'
  | 'footstep';

export interface SoundEffect {
  type: SoundType;
  startTime: number;
  volume: number;
  duration?: number;
}

// ==================== RENDERING SYSTEM ====================

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  backgroundColor: string;
  quality: number;
}

export const VERTICAL_1080x1920: RenderConfig = {
  width: 1080,
  height: 1920,
  fps: 24,
  backgroundColor: '#FFFFFF',
  quality: 100,
};

export const VERTICAL_720x1280: RenderConfig = {
  width: 720,
  height: 1280,
  fps: 24,
  backgroundColor: '#FFFFFF',
  quality: 100,
};

// ==================== EXPORT SYSTEM ====================

export type ExportFormat = 'mp4' | 'webm' | 'gif';

export interface ExportConfig {
  format: ExportFormat;
  resolution: RenderConfig;
  fps: number;
  quality: number;
  includeSound: boolean;
}

// ==================== EXPRESSION DEFINITIONS ====================

export interface ExpressionDef {
  eyes: 'dots' | 'wide' | 'angry' | 'closed' | 'x_eyes' | 'swirl';
  mouth: 'flat' | 'open' | 'smile' | 'frown' | 'scream' | 'smirk' | 'o_shape';
  eyebrows?: 'normal' | 'raised' | 'angry' | 'worried';
  extraLines?: Position[];
}

export const EXPRESSION_MAP: Record<EmotionType, ExpressionDef> = {
  neutral: {
    eyes: 'dots',
    mouth: 'flat',
    eyebrows: 'normal',
  },
  happy: {
    eyes: 'closed',
    mouth: 'smile',
    eyebrows: 'normal',
  },
  sad: {
    eyes: 'dots',
    mouth: 'frown',
    eyebrows: 'worried',
  },
  angry: {
    eyes: 'angry',
    mouth: 'frown',
    eyebrows: 'angry',
  },
  shocked: {
    eyes: 'wide',
    mouth: 'o_shape',
    eyebrows: 'raised',
  },
  confused: {
    eyes: 'dots',
    mouth: 'flat',
    eyebrows: 'raised',
    extraLines: [{ x: 5, y: -5 }, { x: 10, y: -10 }],
  },
  evil_grin: {
    eyes: 'angry',
    mouth: 'smirk',
    eyebrows: 'angry',
  },
  scared: {
    eyes: 'wide',
    mouth: 'scream',
    eyebrows: 'worried',
  },
  smug: {
    eyes: 'closed',
    mouth: 'smirk',
    eyebrows: 'normal',
  },
};
