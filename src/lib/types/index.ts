// Stickman Story Animator - Core Types

// ============================================================================
// STORY PARSING TYPES
// ============================================================================

export interface ParsedScene {
  id: number;
  description: string;
  characters: Character[];
  actions: AnimationAction[];
  dialogue: Dialogue[];
  background: string;
  duration: number; // in frames
}

export interface Character {
  id: string;
  name: string;
  position: Position;
  state: CharacterState;
}

export interface Position {
  x: number;
  y: number;
}

export interface CharacterState {
  pose: PoseType;
  emotion: EmotionType;
  isTalking: boolean;
}

export type PoseType = 'standing' | 'sitting' | 'walking' | 'running' | 'jumping' | 'idle' | 'lying';
export type EmotionType = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'scared';

export interface AnimationAction {
  type: ActionType;
  characterId: string;
  target?: Position;
  object?: string;
  duration: number; // in frames
  startTime: number; // frame number
  params?: Record<string, unknown>;
}

export type ActionType = 
  | 'walk' 
  | 'run' 
  | 'sit' 
  | 'stand' 
  | 'jump' 
  | 'talk' 
  | 'turn' 
  | 'wave' 
  | 'point' 
  | 'pick_up' 
  | 'idle'
  | 'enter'
  | 'exit';

export interface Dialogue {
  characterId: string;
  text: string;
  startTime: number;
  duration: number;
}

export interface StoryInstruction {
  scenes: ParsedScene[];
  totalDuration: number;
  metadata: {
    title: string;
    author: string;
    createdAt: Date;
  };
}

// ============================================================================
// ANIMATION ENGINE TYPES
// ============================================================================

export interface Joint {
  id: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  parent: string | null;
  children: string[];
  length: number;
}

export interface StickmanPose {
  joints: Map<string, Joint>;
  scale: number;
}

export interface AnimationFrame {
  joints: Map<string, Joint>;
  duration: number;
  easing: EasingType;
}

export type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';

export interface Animation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
  totalDuration: number;
}

export interface StickmanState {
  position: Position;
  facingRight: boolean;
  currentPose: StickmanPose;
  currentAnimation: Animation | null;
  animationFrame: number;
  animationProgress: number;
}

// ============================================================================
// SCENE TYPES
// ============================================================================

export interface SceneObject {
  id: string;
  type: ObjectType;
  position: Position;
  scale: number;
  rotation: number;
  properties: Record<string, unknown>;
}

export type ObjectType = 'chair' | 'table' | 'door' | 'window' | 'tree' | 'house' | 'car';

export interface Scene {
  id: string;
  background: Background;
  objects: SceneObject[];
  characters: Map<string, StickmanState>;
  camera: CameraState;
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string | GradientDefinition;
}

export interface GradientDefinition {
  type: 'linear' | 'radial';
  colors: string[];
  direction?: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  pan: Position;
}

// ============================================================================
// RENDERING TYPES
// ============================================================================

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  quality: 'low' | 'medium' | 'high';
  format: ExportFormat;
}

export type ExportFormat = 'mp4' | 'webm' | 'gif';

export interface FrameData {
  imageData: ImageData;
  frameNumber: number;
  timestamp: number;
}

export interface RenderProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  status: RenderStatus;
}

export type RenderStatus = 'idle' | 'rendering' | 'encoding' | 'complete' | 'error';

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportConfig {
  format: ExportFormat;
  resolution: Resolution;
  fps: number;
  quality: number; // 1-100
}

export interface Resolution {
  width: number;
  height: number;
}

export const PRESET_RESOLUTIONS: Record<string, Resolution> = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4K': { width: 3840, height: 2160 },
};

// ============================================================================
// UI TYPES
// ============================================================================

export interface TimelineTrack {
  id: string;
  type: 'character' | 'object' | 'audio';
  name: string;
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  startFrame: number;
  duration: number;
  label: string;
  color: string;
  data: unknown;
}

export interface EditorState {
  currentScene: number;
  currentFrame: number;
  isPlaying: boolean;
  selectedCharacter: string | null;
  selectedObject: string | null;
  zoom: number;
}
