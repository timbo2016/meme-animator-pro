// Rico-Style Stickman Animation Engine
// Main Store - Central State Management

import { create } from 'zustand';
import {
  Character,
  Scene,
  Action,
  Dialogue,
  CameraState,
  ExportConfig,
  EmotionType,
  ActionType,
  Position,
  Timeline,
  RENDER_CONFIG,
  StickmanRig,
} from './types';
import { createDefaultRig, cloneRig, translateRig } from './RigSystem';
import { parseStoryToAnimation, ParsedStory } from './StoryParser';
import { CameraController, cameraController } from './CameraEngine';
import { TimingEngine, timingEngine } from './TimingEngine';
import { VideoEncoder, videoEncoder } from './VideoEncoder';
import { updateAnimation, ANIMATION_DURATIONS } from './AnimationEngine';

// ==================== STORE STATE ====================

interface AnimationStore {
  // Story
  storyText: string;
  parsedStory: ParsedStory | null;
  
  // Characters
  characters: Map<string, Character>;
  
  // Timeline
  timeline: Timeline | null;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  
  // Playback
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
  
  // Camera
  cameraState: CameraState;
  
  // Export
  exportConfig: ExportConfig;
  isExporting: boolean;
  exportProgress: number;
  
  // UI State
  selectedCharacter: string | null;
  currentSceneIndex: number;
  
  // Actions
  setStoryText: (text: string) => void;
  parseStory: () => void;
  
  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  setFrame: (frame: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // Character
  selectCharacter: (id: string | null) => void;
  moveCharacter: (id: string, position: Position) => void;
  setCharacterEmotion: (id: string, emotion: EmotionType) => void;
  playCharacterAction: (id: string, action: ActionType) => void;
  
  // Camera
  setCameraZoom: (zoom: number) => void;
  setCameraPan: (x: number, y: number) => void;
  triggerShake: (intensity: number) => void;
  resetCamera: () => void;
  
  // Export
  setExportConfig: (config: Partial<ExportConfig>) => void;
  startExport: (canvas: HTMLCanvasElement) => Promise<void>;
  
  // Animation
  updateFrame: () => void;
}

// ==================== SAMPLE STORIES ====================

const SAMPLE_STORIES = {
  slipAndFall: 'Man walks happily down the street. Man sees something on the ground. Man slips on a banana peel. Man falls dramatically. Man lies on ground sad.',
  
  teacherSlap: 'Teacher stands in classroom. Teacher looks at student. Teacher slaps student suddenly. Student is shocked. Student cries.',
  
  shockFreeze: 'Guy walks in. Guy sees something unexpected. Guy freezes in shock. Guy screams loudly. Everyone laughs.',
  
  simpleWalk: 'John walks in from the left. John stops in the center. John waves. John says "Hello everyone!" John walks to the right and exits.',
};

// ==================== ZUSTAND STORE ====================

export const useAnimationStore = create<AnimationStore>((set, get) => ({
  // Initial state
  storyText: '',
  parsedStory: null,
  characters: new Map(),
  timeline: null,
  currentFrame: 0,
  totalFrames: 0,
  fps: 24,
  isPlaying: false,
  isPaused: false,
  playbackSpeed: 1,
  cameraState: {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    shake: 0,
  },
  exportConfig: {
    format: 'webm',
    resolution: RENDER_CONFIG.VERTICAL_720,
    fps: 24,
    quality: 80,
    includeSound: true,
  },
  isExporting: false,
  exportProgress: 0,
  selectedCharacter: null,
  currentSceneIndex: 0,
  
  // Story actions
  setStoryText: (text) => set({ storyText: text }),
  
  parseStory: () => {
    const { storyText } = get();
    if (!storyText.trim()) return;
    
    const parsed = parseStoryToAnimation(storyText);
    
    // Convert characters Map
    const charactersMap = new Map<string, Character>();
    parsed.characters.forEach(char => {
      charactersMap.set(char.id, char);
    });
    
    // Build timeline
    const timeline: Timeline = {
      totalFrames: parsed.totalFrames,
      fps: 24,
      scenes: parsed.scenes,
      currentFrame: 0,
    };
    
    set({
      parsedStory: parsed,
      characters: charactersMap,
      timeline,
      totalFrames: parsed.totalFrames,
      currentFrame: 0,
      currentSceneIndex: 0,
    });
    
    // Initialize timing engine
    timingEngine.calculateFromScenes(parsed.scenes);
    
    // Reset camera
    cameraController.reset();
  },
  
  // Playback
  play: () => {
    set({ isPlaying: true, isPaused: false });
  },
  
  pause: () => {
    set({ isPlaying: false, isPaused: true });
  },
  
  stop: () => {
    set({
      isPlaying: false,
      isPaused: false,
      currentFrame: 0,
      currentSceneIndex: 0,
    });
    cameraController.reset();
  },
  
  setFrame: (frame) => {
    const { totalFrames } = get();
    const clampedFrame = Math.max(0, Math.min(totalFrames - 1, frame));
    set({ currentFrame: clampedFrame });
  },
  
  stepForward: () => {
    const { currentFrame, totalFrames } = get();
    if (currentFrame < totalFrames - 1) {
      set({ currentFrame: currentFrame + 1 });
    }
  },
  
  stepBackward: () => {
    const { currentFrame } = get();
    if (currentFrame > 0) {
      set({ currentFrame: currentFrame - 1 });
    }
  },
  
  setPlaybackSpeed: (speed) => {
    set({ playbackSpeed: Math.max(0.25, Math.min(4, speed)) });
  },
  
  // Character
  selectCharacter: (id) => set({ selectedCharacter: id }),
  
  moveCharacter: (id, position) => {
    const { characters } = get();
    const char = characters.get(id);
    if (char) {
      char.position = position;
      char.rig = translateRig(char.rig, position.x - char.rig.position.x, position.y - char.rig.position.y);
      characters.set(id, { ...char });
      set({ characters: new Map(characters) });
    }
  },
  
  setCharacterEmotion: (id, emotion) => {
    const { characters } = get();
    const char = characters.get(id);
    if (char) {
      char.emotion = emotion;
      characters.set(id, { ...char });
      set({ characters: new Map(characters) });
    }
  },
  
  playCharacterAction: (id, action) => {
    const { characters, currentFrame } = get();
    const char = characters.get(id);
    if (char) {
      char.state = action as any;
      char.currentAnimation = {
        type: action,
        frame: currentFrame,
        totalFrames: ANIMATION_DURATIONS[action] || 24,
      };
      characters.set(id, { ...char });
      set({ characters: new Map(characters) });
    }
  },
  
  // Camera
  setCameraZoom: (zoom) => {
    const { cameraState } = get();
    set({ cameraState: { ...cameraState, zoom: Math.max(0.5, Math.min(5, zoom)) } });
    cameraController.state.zoom = zoom;
  },
  
  setCameraPan: (x, y) => {
    const { cameraState } = get();
    set({ cameraState: { ...cameraState, panX: x, panY: y } });
  },
  
  triggerShake: (intensity) => {
    const { cameraState } = get();
    cameraController.shake(intensity, 300);
    set({ cameraState: { ...cameraState, shake: intensity } });
  },
  
  resetCamera: () => {
    cameraController.reset();
    set({
      cameraState: {
        zoom: 1,
        panX: 0,
        panY: 0,
        rotation: 0,
        shake: 0,
      },
    });
  },
  
  // Export
  setExportConfig: (config) => {
    const { exportConfig } = get();
    set({ exportConfig: { ...exportConfig, ...config } });
  },
  
  startExport: async (canvas: HTMLCanvasElement) => {
    const { exportConfig, totalFrames, isPlaying, currentFrame } = get();
    
    set({ isExporting: true, exportProgress: 0 });
    
    try {
      const blob = await videoEncoder.quickExport(canvas, exportConfig.format, (totalFrames / 24) * 1000);
      
      // Download
      const filename = `meme_animation_${Date.now()}.${exportConfig.format}`;
      videoEncoder.downloadBlob(blob, filename);
      
      set({ isExporting: false, exportProgress: 100 });
    } catch (error) {
      console.error('Export failed:', error);
      set({ isExporting: false, exportProgress: 0 });
    }
  },
  
  // Animation update
  updateFrame: () => {
    const { parsedStory, characters, currentFrame, timeline } = get();
    if (!parsedStory || !timeline) return;
    
    // Find current scene
    let frameAccumulator = 0;
    let currentScene: Scene | null = null;
    let sceneIndex = 0;
    
    for (let i = 0; i < timeline.scenes.length; i++) {
      const scene = timeline.scenes[i];
      if (currentFrame >= frameAccumulator && currentFrame < frameAccumulator + scene.duration) {
        currentScene = scene;
        sceneIndex = i;
        break;
      }
      frameAccumulator += scene.duration;
    }
    
    if (currentScene) {
      const relativeFrame = currentFrame - frameAccumulator;
      
      // Process actions
      currentScene.actions.forEach(action => {
        if (relativeFrame >= action.startFrame && relativeFrame <= action.endFrame) {
          const char = characters.get(action.characterId);
          if (char) {
            char.state = action.type as any;
            characters.set(action.characterId, { ...char });
          }
        }
      });
      
      // Process dialogue
      currentScene.dialogue.forEach(d => {
        if (relativeFrame >= d.startFrame && relativeFrame < d.startFrame + d.duration) {
          const char = characters.get(d.characterId);
          if (char) {
            char.state = 'idle';
            characters.set(d.characterId, { ...char });
          }
        }
      });
      
      // Apply camera effects from scene
      if (currentScene.camera && currentScene.camera.length > 0) {
        // Apply camera instructions
      }
      
      set({
        characters: new Map(characters),
        currentSceneIndex: sceneIndex,
      });
    }
    
    // Update camera state
    const camState = cameraController.getState();
    set({ cameraState: camState });
  },
}));

// Export utilities
export { SAMPLE_STORIES };
export { cameraController } from './CameraEngine';
export { videoEncoder } from './VideoEncoder';
export { timingEngine } from './TimingEngine';
