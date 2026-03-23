// Zustand store for Stickman Story Animator

import { create } from 'zustand';
import {
  StoryInstruction,
  ParsedScene,
  Character,
  AnimationAction,
  ExportConfig,
  EditorState,
  TimelineTrack,
  Resolution,
  PRESET_RESOLUTIONS,
} from '@/lib/types';
import { StoryParser } from '@/engine/parser/StoryParser';
import { AnimationController } from '@/engine/animation/AnimationController';
import { SceneManager } from '@/engine/scene/SceneManager';
import { Renderer } from '@/engine/rendering/Renderer';
import { VideoExporter } from '@/engine/export/VideoExporter';

interface AnimatorState {
  // Story data
  storyText: string;
  parsedStory: StoryInstruction | null;
  
  // Characters
  characters: Map<string, ReturnType<AnimationController['getCharacter']>>;
  
  // Scene management
  currentSceneIndex: number;
  scenes: ParsedScene[];
  
  // Playback state
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  
  // Editor state
  editorState: EditorState;
  
  // Export state
  exportConfig: ExportConfig;
  isExporting: boolean;
  exportProgress: number;
  
  // Timeline
  timelineTracks: TimelineTrack[];
  
  // Actions
  setStoryText: (text: string) => void;
  parseStory: () => void;
  setCurrentScene: (index: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentFrame: (frame: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  startExport: () => Promise<void>;
  initializeAnimation: () => void;
  updateAnimation: () => void;
}

// Core engine instances
const storyParser = new StoryParser();
const animationController = new AnimationController();
const sceneManager = new SceneManager();
const renderer = new Renderer();
const videoExporter = new VideoExporter();

export const useAnimatorStore = create<AnimatorState>((set, get) => ({
  // Initial state
  storyText: '',
  parsedStory: null,
  characters: new Map(),
  currentSceneIndex: 0,
  scenes: [],
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 0,
  fps: 30,
  editorState: {
    currentScene: 0,
    currentFrame: 0,
    isPlaying: false,
    selectedCharacter: null,
    selectedObject: null,
    zoom: 1,
  },
  exportConfig: {
    format: 'mp4',
    resolution: PRESET_RESOLUTIONS['720p'],
    fps: 30,
    quality: 80,
  },
  isExporting: false,
  exportProgress: 0,
  timelineTracks: [],

  // Actions
  setStoryText: (text: string) => {
    set({ storyText: text });
  },

  parseStory: () => {
    const { storyText } = get();
    if (!storyText.trim()) return;

    const parsed = storyParser.parse(storyText);
    const characters = storyParser.getCharacters();

    // Initialize animation controller with parsed characters
    animationController.reset();
    characters.forEach((char) => {
      animationController.addCharacter(char.id, char.position);
    });

    // Create scenes
    sceneManager.clear();
    sceneManager.createFromParsedScenes(parsed.scenes);

    // Create timeline tracks for each character
    const tracks: TimelineTrack[] = characters.map((char, index) => ({
      id: char.id,
      type: 'character',
      name: char.name,
      clips: [],
      muted: false,
      locked: false,
    }));

    // Calculate total frames
    const totalFrames = parsed.scenes.reduce((sum, scene) => sum + scene.duration, 0);

    set({
      parsedStory: parsed,
      scenes: parsed.scenes,
      characters: new Map(animationController.getCharacterIds().map(id => [id, animationController.getCharacter(id)])),
      totalFrames,
      currentFrame: 0,
      timelineTracks: tracks,
    });
  },

  setCurrentScene: (index: number) => {
    const { scenes } = get();
    if (index >= 0 && index < scenes.length) {
      set({ currentSceneIndex: index });
      sceneManager.setCurrentScene(`scene_${index + 1}`);
    }
  },

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  stop: () => {
    set({ isPlaying: false, currentFrame: 0 });
    animationController.reset();
    get().parseStory(); // Reset to initial state
  },

  setCurrentFrame: (frame: number) => {
    const { totalFrames } = get();
    const clampedFrame = Math.max(0, Math.min(frame, totalFrames));
    set({ currentFrame: clampedFrame });
  },

  stepForward: () => {
    const { currentFrame, totalFrames } = get();
    get().setCurrentFrame(currentFrame + 1);
  },

  stepBackward: () => {
    const { currentFrame } = get();
    get().setCurrentFrame(currentFrame - 1);
  },

  updateExportConfig: (config: Partial<ExportConfig>) => {
    set((state) => ({
      exportConfig: { ...state.exportConfig, ...config },
    }));
  },

  startExport: async () => {
    const { exportConfig, parsedStory } = get();
    if (!parsedStory) return;

    set({ isExporting: true, exportProgress: 0 });

    try {
      // Export logic would go here
      // For now, simulate progress
      for (let i = 0; i <= 100; i += 10) {
        set({ exportProgress: i });
        await new Promise((r) => setTimeout(r, 200));
      }
    } finally {
      set({ isExporting: false, exportProgress: 100 });
    }
  },

  initializeAnimation: () => {
    // Initialize animation controller
    const state = get();
    if (state.parsedStory) {
      state.parsedStory.scenes[state.currentSceneIndex]?.characters.forEach((char) => {
        animationController.addCharacter(char.id, char.position);
      });
    }
  },

  updateAnimation: () => {
    animationController.update();
    set({
      characters: new Map(
        animationController.getCharacterIds().map((id) => [id, animationController.getCharacter(id)])
      ),
    });
  },
}));

// Export engine instances for direct access
export { animationController, sceneManager, renderer, videoExporter, storyParser };
