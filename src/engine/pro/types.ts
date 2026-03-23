/**
 * Professional Animation Engine Types
 * Designed for creating viral animated meme shorts like Rico Animations
 */

// ============================================================================
// CHARACTER SYSTEM
// ============================================================================

export interface ProCharacter {
  id: string;
  name: string;
  // Body
  bodyType: 'slim' | 'average' | 'chubby' | 'muscular';
  height: number; // scale multiplier
  // Appearance
  skinTone: string;
  hair: HairConfig;
  face: FaceConfig;
  outfit: OutfitConfig;
  accessories: Accessory[];
  // Position & State
  transform: Transform;
  pose: CharacterPose;
  mood: MoodType;
  // Animation state
  currentAnimation: string | null;
  animationTime: number;
}

export interface HairConfig {
  style: HairStyle;
  color: string;
  length: 'short' | 'medium' | 'long';
}

export type HairStyle = 
  | 'none' | 'short' | 'spiky' | 'curly' | 'wavy' 
  | 'ponytail' | 'bald' | 'mohawk' | 'afro' | 'bun';

export interface FaceConfig {
  eyeStyle: EyeStyle;
  eyeColor: string;
  eyebrowStyle: EyebrowStyle;
  mouthStyle: MouthStyle;
  facialHair?: FacialHairConfig;
}

export type EyeStyle = 'normal' | 'big' | 'small' | 'closed' | 'angry' | 'happy' | 'surprised';
export type EyebrowStyle = 'normal' | 'thick' | 'thin' | 'angry' | 'raised';
export type MouthStyle = 'normal' | 'smile' | 'frown' | 'open' | 'laugh' | 'smirk';

export interface FacialHairConfig {
  type: 'beard' | 'mustache' | 'goatee' | 'stubble';
  color: string;
}

export interface OutfitConfig {
  top: ClothingItem;
  bottom: ClothingItem;
  shoes: ClothingItem;
  hat?: ClothingItem;
}

export interface ClothingItem {
  type: string;
  color: string;
  pattern?: 'solid' | 'striped' | 'plaid' | 'dots';
}

export interface Accessory {
  type: 'glasses' | 'earrings' | 'necklace' | 'watch' | 'bracelet' | 'backpack';
  color: string;
  style: string;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface CharacterPose {
  // Head
  headTilt: number; // -45 to 45 degrees
  headTurn: number; // -90 to 90 (profile views)
  
  // Body
  spineCurve: number; // -30 to 30 (slouch/back straight)
  
  // Arms (angle from body)
  leftArmAngle: number;
  leftForearmAngle: number;
  rightArmAngle: number;
  rightForearmAngle: number;
  
  // Hands
  leftHandPose: HandPose;
  rightHandPose: HandPose;
  
  // Legs
  leftLegAngle: number;
  leftKneeAngle: number;
  rightLegAngle: number;
  rightKneeAngle: number;
  
  // Feet
  leftFootAngle: number;
  rightFootAngle: number;
}

export type HandPose = 
  | 'open' | 'fist' | 'point' | 'thumbs_up' | 'peace' 
  | 'wave' | 'grab' | 'hold' | 'wave_hand';

export type MoodType = 
  | 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' 
  | 'scared' | 'disgusted' | 'confused' | 'excited' | 'embarrassed'
  | 'proud' | 'nervous' | 'thinking' | 'love' | 'sleepy';

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

export interface ProAnimation {
  id: string;
  name: string;
  type: AnimationType;
  keyframes: ProKeyframe[];
  duration: number; // in frames
  loop: boolean;
  blendMode: 'override' | 'additive' | 'blend';
}

export type AnimationType = 
  // Movement
  | 'idle' | 'walk' | 'run' | 'jump' | 'fall' | 'land'
  | 'climb' | 'swim' | 'crawl' | 'sneak'
  // Actions
  | 'sit' | 'stand' | 'lie' | 'wave' | 'point' | 'grab'
  | 'throw' | 'catch' | 'kick' | 'punch' | 'dance'
  // Social
  | 'talk' | 'listen' | 'laugh' | 'cry' | 'scream'
  | 'whisper' | 'shout' | 'argue' | 'hug' | 'high_five'
  // Reactions
  | 'surprised' | 'shocked' | 'scared' | 'embarrassed'
  | 'proud' | 'thinking' | 'confused' | 'disgusted'
  | 'love' | 'heartbreak' | 'angry' | 'rage'
  // Meme-specific
  | 'facepalm' | 'shrug' | 'epic_fail' | 'savage' | 'mic_drop';

export interface ProKeyframe {
  frame: number;
  easing: EasingFunction;
  pose: Partial<CharacterPose>;
  transform?: Partial<Transform>;
  expression?: ExpressionKeyframe;
  effects?: EffectKeyframe[];
}

export interface ExpressionKeyframe {
  eyes?: EyeStyle;
  eyebrows?: EyebrowStyle;
  mouth?: MouthStyle;
  blush?: number; // 0-1 intensity
  sweat?: boolean;
  tears?: boolean;
  veins?: boolean; // anger veins
  sparkles?: boolean;
}

export interface EffectKeyframe {
  type: EffectType;
  intensity: number;
  duration: number;
}

export type EffectType = 
  | 'shake' | 'zoom' | 'flash' | 'zoom_in' | 'zoom_out'
  | 'spin' | 'bounce' | 'squash' | 'stretch';

export type EasingFunction = 
  | 'linear' 
  | 'easeIn' | 'easeOut' | 'easeInOut'
  | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic'
  | 'easeInBounce' | 'easeOutBounce' | 'easeInOutBounce'
  | 'easeInBack' | 'easeOutBack' | 'easeInOutBack'
  | 'spring' | 'bounce';

// ============================================================================
// SCENE SYSTEM
// ============================================================================

export interface ProScene {
  id: string;
  name: string;
  duration: number; // frames
  // Background
  background: ProBackground;
  // Objects
  objects: SceneObject[];
  // Characters
  characters: ProCharacter[];
  // Camera
  camera: ProCamera;
  // Effects
  effects: SceneEffect[];
  // Audio
  audio: AudioTrack[];
  // Transitions
  transitionIn?: Transition;
  transitionOut?: Transition;
}

export interface ProBackground {
  type: 'solid' | 'gradient' | 'image' | 'video';
  value: string | GradientConfig | MediaSource;
  blur?: number;
  dim?: number; // darken overlay
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}

export interface MediaSource {
  url: string;
  type: 'image' | 'video';
  loop?: boolean;
}

export interface SceneObject {
  id: string;
  type: ObjectType;
  transform: Transform;
  properties: Record<string, unknown>;
  animation?: ObjectAnimation;
}

export type ObjectType = 
  | 'furniture' | 'prop' | 'decoration' | 'vehicle'
  | 'food' | 'electronics' | 'nature' | 'building';

export interface ObjectAnimation {
  type: 'idle' | 'bounce' | 'spin' | 'float' | 'swing';
  speed: number;
}

export interface ProCamera {
  position: { x: number; y: number };
  zoom: number;
  rotation: number;
  shake: { intensity: number; frequency: number };
  follow: string | null; // character id to follow
}

export interface SceneEffect {
  type: GlobalEffectType;
  startFrame: number;
  endFrame: number;
  intensity: number;
  params: Record<string, unknown>;
}

export type GlobalEffectType = 
  | 'shake' | 'zoom_punch' | 'flash' | 'slow_motion' 
  | 'speed_lines' | 'impact' | 'sparkles' | 'hearts';

export interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve';
  duration: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

// ============================================================================
// AUDIO SYSTEM
// ============================================================================

export interface AudioTrack {
  id: string;
  type: AudioType;
  source: string | TTSConfig;
  volume: number;
  startTime: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}

export type AudioType = 'music' | 'sfx' | 'voice' | 'ambient';

export interface TTSConfig {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  emotion: MoodType;
}

export interface SoundEffect {
  id: string;
  name: string;
  category: SFXCategory;
  source: string;
}

export type SFXCategory = 
  | 'impact' | 'whoosh' | 'pop' | 'click' | 'splat'
  | 'laugh' | 'gasp' | 'scream' | 'applause' | 'cricket';

// ============================================================================
// STORY & DIRECTOR
// ============================================================================

export interface StoryScript {
  title: string;
  description: string;
  duration: number; // seconds
  scenes: StoryScene[];
  characters: CharacterDefinition[];
  style: AnimationStyle;
}

export interface StoryScene {
  id: string;
  description: string;
  dialogue: DialogueLine[];
  actions: StoryAction[];
  mood: MoodType;
  duration: number;
}

export interface DialogueLine {
  character: string;
  text: string;
  emotion: MoodType;
  timing: number; // when to show (0-1 of scene duration)
}

export interface StoryAction {
  character: string;
  action: AnimationType;
  target?: string;
  timing: number;
}

export interface CharacterDefinition {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'extra';
  appearance: Partial<ProCharacter>;
  personality: string;
}

export interface AnimationStyle {
  artStyle: 'simple' | 'detailed' | 'chibi' | 'realistic';
  colorPalette: 'vibrant' | 'pastel' | 'dark' | 'muted';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'snappy';
  humor: 'subtle' | 'moderate' | 'exaggerated' | 'absurd';
}

// ============================================================================
// MEME EFFECTS
// ============================================================================

export interface MemeEffect {
  type: MemeEffectType;
  trigger: 'instant' | 'timing' | 'reaction';
  params: Record<string, unknown>;
}

export type MemeEffectType = 
  | 'bruh' | 'oof' | 'yeet' | 'bonk' | 'stonks'
  | 'sad_violin' | 'dramatic' | 'vine_boom' | 'air_horn'
  | 'record_scratch' | 'womp_womp' | 'fbi_open_up';

export interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: TextStyle;
  animation: TextAnimation;
  timing: { start: number; end: number };
}

export interface TextStyle {
  font: string;
  size: number;
  color: string;
  outline?: string;
  shadow?: boolean;
  bold: boolean;
  italic: boolean;
}

export interface TextAnimation {
  type: 'none' | 'fade' | 'slide' | 'bounce' | 'pop' | 'typewriter';
  duration: number;
}

// ============================================================================
// RENDERING
// ============================================================================

export interface RenderSettings {
  resolution: { width: number; height: number };
  fps: number;
  quality: 'draft' | 'preview' | 'final' | '4k';
  format: 'mp4' | 'webm' | 'gif';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
}

export const PRESET_RESOLUTIONS = {
  shorts: { width: 1080, height: 1920 }, // 9:16
  tiktok: { width: 1080, height: 1920 },
  reel: { width: 1080, height: 1920 },
  youtube: { width: 1920, height: 1080 }, // 16:9
  square: { width: 1080, height: 1080 }, // 1:1
  portrait: { width: 1080, height: 1350 }, // 4:5
};

export interface ExportProgress {
  stage: 'preparing' | 'rendering' | 'encoding' | 'finalizing' | 'complete';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  estimatedTimeRemaining: number;
}
