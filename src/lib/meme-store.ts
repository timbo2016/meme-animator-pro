// Stickman Meme Animator - Main Store
// Central state management using Zustand

import { create } from 'zustand';
import {
  Character,
  CharacterState,
  Scene,
  StoryInstruction,
  ExportConfig,
  VERTICAL_720x1280,
  SoundType,
  EmotionType,
  AnimationType,
  Position,
  CameraEffect,
} from '@/engine/types';
import { comedyEngine, generateTestCase } from '@/engine/comedy/ComedyEngine';
import { animationController, ANIMATION_LIBRARY } from '@/engine/animation/AnimationEngine';
import { cameraController } from '@/engine/camera/CameraEngine';
import { timingEngine } from '@/engine/timing/TimingEngine';
import { soundSystem } from '@/engine/sound/SoundSystem';
import { videoExporter } from '@/engine/export/VideoExporter';

// ==================== STORE STATE ====================

interface AnimatorState {
  // Story
  storyText: string;
  parsedStory: StoryInstruction | null;
  
  // Characters
  characters: Map<string, CharacterState>;
  
  // Playback
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  
  // Camera
  cameraState: {
    zoom: number;
    pan: Position;
    rotation: number;
    shake: number;
  };
  
  // Export
  exportConfig: ExportConfig;
  isExporting: boolean;
  exportProgress: number;
  
  // UI
  selectedCharacter: string | null;
  showOnionSkin: boolean;
  onionSkinFrames: number;
  
  // Actions
  setStoryText: (text: string) => void;
  loadSampleStory: (name: string) => void;
  parseStory: () => void;
  
  // Playback controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  setCurrentFrame: (frame: number) => void;
  
  // Character controls
  setCharacterPosition: (id: string, position: Position) => void;
  setCharacterEmotion: (id: string, emotion: EmotionType) => void;
  playCharacterAnimation: (id: string, animation: AnimationType) => void;
  
  // Camera controls
  setCameraZoom: (zoom: number) => void;
  setCameraEffect: (effect: CameraEffect) => void;
  resetCamera: () => void;
  
  // Export
  updateExportConfig: (config: Partial<ExportConfig>) => void;
  exportVideo: () => Promise<void>;
  
  // Animation update
  updateAnimation: () => void;
  
  // Sound
  playSound: (type: SoundType) => void;
  initializeSound: () => void;
}

// ==================== SAMPLE STORIES ====================

const SAMPLE_STORIES = [
  {
    name: 'Kid Steals Food',
    text: generateTestCase('kid_steals_food'),
  },
  {
    name: 'Man Slips Banana',
    text: generateTestCase('man_slips_banana'),
  },
  {
    name: 'Teacher Calls Name',
    text: generateTestCase('teacher_calls_name'),
  },
  {
    name: 'Simple Walk',
    text: 'John walks in from the left. He stops. He waves. He says "Hello there!" Then he walks to the right and exits.',
  },
  {
    name: 'Shocking Moment',
    text: 'Sarah is reading a book. Suddenly she looks up. She is shocked. Her eyes go wide. She screams.',
  },
];

// ==================== ZUSTAND STORE ====================

export const useAnimatorStore = create<AnimatorState>((set, get) => ({
  // Initial state
  storyText: '',
  parsedStory: null,
  characters: new Map(),
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 0,
  fps: 24,
  cameraState: {
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
    shake: 0,
  },
  exportConfig: {
    format: 'webm',
    resolution: VERTICAL_720x1280,
    fps: 24,
    quality: 80,
    includeSound: true,
  },
  isExporting: false,
  exportProgress: 0,
  selectedCharacter: null,
  showOnionSkin: false,
  onionSkinFrames: 2,

  // Story actions
  setStoryText: (text) => set({ storyText: text }),
  
  loadSampleStory: (name) => {
    const sample = SAMPLE_STORIES.find(s => s.name === name);
    if (sample) {
      set({ storyText: sample.text });
    }
  },

  parseStory: () => {
    const { storyText } = get();
    if (!storyText.trim()) return;

    // Parse story using comedy engine
    const parsed = comedyEngine.parseStory(storyText);
    
    // Initialize characters
    const characters = new Map<string, CharacterState>();
    const characterList = comedyEngine.getCharacters();
    
    // Position characters side by side
    const spacing = 300;
    const startX = 400;
    
    characterList.forEach((char, index) => {
      characters.set(char.id, {
        position: { 
          x: startX + index * spacing, 
          y: 1200 // Near bottom for vertical video
        },
        facingRight: index % 2 === 0,
        pose: 'standing',
        emotion: 'neutral',
        isTalking: false,
        scale: 1,
        squash: 1,
        stretch: 1,
        rotation: 0,
        opacity: 1,
      });
    });

    // Calculate total frames
    const totalFrames = parsed.scenes.reduce((sum, scene) => sum + scene.duration, 0);

    set({
      parsedStory: parsed,
      characters,
      totalFrames,
      currentFrame: 0,
    });

    // Reset timing engine
    timingEngine.reset();
  },

  // Playback controls
  play: () => {
    // Initialize sound on user interaction
    soundSystem.initialize();
    set({ isPlaying: true });
  },

  pause: () => set({ isPlaying: false }),

  stop: () => {
    set({ isPlaying: false, currentFrame: 0 });
    timingEngine.reset();
    cameraController.reset(true);
  },

  stepForward: () => {
    const { currentFrame, totalFrames } = get();
    if (currentFrame < totalFrames) {
      set({ currentFrame: currentFrame + 1 });
    }
  },

  stepBackward: () => {
    const { currentFrame } = get();
    if (currentFrame > 0) {
      set({ currentFrame: currentFrame - 1 });
    }
  },

  setCurrentFrame: (frame) => set({ currentFrame: frame }),

  // Character controls
  setCharacterPosition: (id, position) => {
    const { characters } = get();
    const charState = characters.get(id);
    if (charState) {
      characters.set(id, { ...charState, position });
      set({ characters: new Map(characters) });
    }
  },

  setCharacterEmotion: (id, emotion) => {
    const { characters } = get();
    const charState = characters.get(id);
    if (charState) {
      characters.set(id, { ...charState, emotion });
      set({ characters: new Map(characters) });
    }
  },

  playCharacterAnimation: (id, animation) => {
    animationController.startAnimation(id, animation);
  },

  // Camera controls
  setCameraZoom: (zoom) => {
    cameraController.setZoom(zoom);
  },

  setCameraEffect: (effect) => {
    switch (effect) {
      case 'zoom_in':
        cameraController.zoomIn(2);
        break;
      case 'zoom_out':
        cameraController.zoomOut(1);
        break;
      case 'shake':
        cameraController.shake(10, 300);
        break;
      default:
        break;
    }
  },

  resetCamera: () => {
    cameraController.reset();
  },

  // Export
  updateExportConfig: (config) => {
    set((state) => ({
      exportConfig: { ...state.exportConfig, ...config },
    }));
  },

  exportVideo: async () => {
    const { exportConfig, parsedStory } = get();
    if (!parsedStory) return;

    set({ isExporting: true, exportProgress: 0 });
    
    try {
      // Export will be handled by UI component with canvas
      // This just sets up the state
      set({ exportProgress: 50 });
      
      // Simulate export completion for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({ exportProgress: 100, isExporting: false });
    } catch (error) {
      console.error('Export failed:', error);
      set({ isExporting: false, exportProgress: 0 });
    }
  },

  // Animation update (called each frame)
  updateAnimation: () => {
    const { parsedStory, currentFrame, characters, isPlaying } = get();
    if (!parsedStory || !isPlaying) return;

    // Find current scene and actions
    let frameAccumulator = 0;
    let currentScene: Scene | null = null;
    
    for (const scene of parsedStory.scenes) {
      if (currentFrame >= frameAccumulator && currentFrame < frameAccumulator + scene.duration) {
        currentScene = scene;
        break;
      }
      frameAccumulator += scene.duration;
    }

    if (currentScene) {
      // Apply camera effects
      if (currentScene.cameraEffect) {
        cameraController.zoomIn(2, true);
        if (currentScene.cameraEffect === 'shake') {
          cameraController.shake(10, 200);
        }
      }

      // Process actions in current scene
      currentScene.actions.forEach(action => {
        const relativeFrame = currentFrame - frameAccumulator;
        if (relativeFrame >= action.startTime && relativeFrame < action.startTime + action.duration) {
          const charState = characters.get(action.characterId);
          if (charState) {
            // Update character state based on action
            const updatedState = { ...charState };
            
            // Apply emotion
            if (action.emotion) {
              updatedState.emotion = action.emotion;
            }
            
            // Handle movement actions
            if (action.target && (action.type === 'walk' || action.type === 'run')) {
              const progress = (relativeFrame - action.startTime) / action.duration;
              updatedState.position = {
                x: charState.position.x + (action.target.x - charState.position.x) * progress,
                y: charState.position.y + (action.target.y - charState.position.y) * progress,
              };
            }
            
            characters.set(action.characterId, updatedState);
          }
          
          // Start animation
          animationController.startAnimation(action.characterId, action.type);
        }
      });

      // Process dialogue
      currentScene.dialogue.forEach(dialogue => {
        const relativeFrame = currentFrame - frameAccumulator;
        if (relativeFrame >= dialogue.startTime && relativeFrame < dialogue.startTime + dialogue.duration) {
          const charState = characters.get(dialogue.characterId);
          if (charState) {
            characters.set(dialogue.characterId, {
              ...charState,
              isTalking: true,
              emotion: dialogue.emotion || charState.emotion,
            });
            animationController.startAnimation(dialogue.characterId, 'talk');
          }
        }
      });

      set({ characters: new Map(characters) });
    }

    // Update camera
    cameraController.update(1000 / get().fps);
    
    // Update camera state for UI
    const cameraState = cameraController.getState();
    set({
      cameraState: {
        zoom: cameraState.zoom,
        pan: cameraState.pan,
        rotation: cameraState.rotation,
        shake: cameraState.shake,
      },
    });
  },

  // Sound
  playSound: (type) => {
    soundSystem.initialize();
    soundSystem.play(type);
  },

  initializeSound: () => {
    soundSystem.initialize();
  },
}));

// Export utilities
export { animationController, cameraController, soundSystem, videoExporter, ANIMATION_LIBRARY };
