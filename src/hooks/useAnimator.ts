// Super App Animator State Management with Zustand
import { create } from 'zustand';
import { ProCharacter, MoodType, AnimationType, PRESET_RESOLUTIONS, GlobalEffectType, TextOverlay, AudioTrack } from '@/engine/pro/types';

// Layer types for drawing
export interface DrawingLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  canvas: HTMLCanvasElement | null;
  drawings: DrawingStroke[];
}

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
  opacity: number;
}

export type DrawingTool = 'brush' | 'eraser' | 'fill' | 'rectangle' | 'circle' | 'line' | 'text';

// Timeline types
export interface TimelineTrack {
  id: string;
  type: 'animation' | 'audio' | 'effects' | 'text';
  name: string;
  clips: TimelineClip[];
  muted: boolean;
  locked: boolean;
  color: string;
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

// Background types
export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image';
  value: string | string[];
  blur: number;
  dim: number;
}

// Export types
export interface ExportConfig {
  resolution: 'shorts' | 'square' | 'youtube';
  format: 'mp4' | 'gif' | 'png';
  quality: 'draft' | 'preview' | 'final';
  frameRange: { start: number; end: number };
}

// Sound effect types
export interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

// Character preset
export interface CharacterPreset {
  id: string;
  name: string;
  character: ProCharacter;
}

// Pre-built characters
const DEFAULT_CHARACTERS: CharacterPreset[] = [
  {
    id: 'alex',
    name: 'Alex',
    character: {
      id: 'alex',
      name: 'Alex',
      bodyType: 'average',
      height: 1,
      skinTone: '#FFD5B8',
      hair: { style: 'short', color: '#3D2314', length: 'short' },
      face: { eyeStyle: 'normal', eyeColor: '#4A90D9', eyebrowStyle: 'normal', mouthStyle: 'normal' },
      outfit: { top: { type: 'tshirt', color: '#4A90D9', pattern: 'solid' }, bottom: { type: 'jeans', color: '#2C3E50', pattern: 'solid' }, shoes: { type: 'sneakers', color: '#FFF', pattern: 'solid' } },
      accessories: [],
      transform: { x: 540, y: 960, scale: 1, rotation: 0, flipX: false, flipY: false },
      pose: { headTilt: 0, headTurn: 0, spineCurve: 0, leftArmAngle: 15, leftForearmAngle: 10, rightArmAngle: -15, rightForearmAngle: -10, leftHandPose: 'open', rightHandPose: 'open', leftLegAngle: 0, leftKneeAngle: 0, rightLegAngle: 0, rightKneeAngle: 0, leftFootAngle: 0, rightFootAngle: 0 },
      mood: 'neutral',
      currentAnimation: null,
      animationTime: 0,
    },
  },
  {
    id: 'sam',
    name: 'Sam',
    character: {
      id: 'sam',
      name: 'Sam',
      bodyType: 'slim',
      height: 0.95,
      skinTone: '#C68642',
      hair: { style: 'curly', color: '#1C1C1C', length: 'medium' },
      face: { eyeStyle: 'normal', eyeColor: '#2E8B57', eyebrowStyle: 'thick', mouthStyle: 'normal' },
      outfit: { top: { type: 'hoodie', color: '#E74C3C', pattern: 'solid' }, bottom: { type: 'pants', color: '#34495E', pattern: 'solid' }, shoes: { type: 'boots', color: '#8B4513', pattern: 'solid' } },
      accessories: [{ type: 'glasses', color: '#333', style: 'round' }],
      transform: { x: 540, y: 960, scale: 1, rotation: 0, flipX: false, flipY: false },
      pose: { headTilt: 0, headTurn: 0, spineCurve: 0, leftArmAngle: 15, leftForearmAngle: 10, rightArmAngle: -15, rightForearmAngle: -10, leftHandPose: 'open', rightHandPose: 'open', leftLegAngle: 0, leftKneeAngle: 0, rightLegAngle: 0, rightKneeAngle: 0, leftFootAngle: 0, rightFootAngle: 0 },
      mood: 'neutral',
      currentAnimation: null,
      animationTime: 0,
    },
  },
  {
    id: 'jordan',
    name: 'Jordan',
    character: {
      id: 'jordan',
      name: 'Jordan',
      bodyType: 'muscular',
      height: 1.1,
      skinTone: '#8D5524',
      hair: { style: 'spiky', color: '#000000', length: 'short' },
      face: { eyeStyle: 'normal', eyeColor: '#8B4513', eyebrowStyle: 'normal', mouthStyle: 'smile' },
      outfit: { top: { type: 'tank', color: '#27AE60', pattern: 'solid' }, bottom: { type: 'shorts', color: '#2C3E50', pattern: 'solid' }, shoes: { type: 'sneakers', color: '#FFF', pattern: 'solid' } },
      accessories: [],
      transform: { x: 540, y: 960, scale: 1, rotation: 0, flipX: false, flipY: false },
      pose: { headTilt: 0, headTurn: 0, spineCurve: 0, leftArmAngle: 15, leftForearmAngle: 10, rightArmAngle: -15, rightForearmAngle: -10, leftHandPose: 'open', rightHandPose: 'open', leftLegAngle: 0, leftKneeAngle: 0, rightLegAngle: 0, rightKneeAngle: 0, leftFootAngle: 0, rightFootAngle: 0 },
      mood: 'neutral',
      currentAnimation: null,
      animationTime: 0,
    },
  },
];

// Sound effects library
const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'bruh', name: 'Bruh', emoji: '😐', category: 'meme' },
  { id: 'oof', name: 'Oof', emoji: '😫', category: 'meme' },
  { id: 'vine_boom', name: 'Vine Boom', emoji: '💥', category: 'impact' },
  { id: 'air_horn', name: 'Air Horn', emoji: '📢', category: 'attention' },
  { id: 'bonk', name: 'Bonk', emoji: '🏏', category: 'impact' },
  { id: 'yeet', name: 'Yeet', emoji: '🚀', category: 'meme' },
  { id: 'sad_violin', name: 'Sad Violin', emoji: '🎻', category: 'emotion' },
  { id: 'dramatic', name: 'Dramatic', emoji: '🎬', category: 'tension' },
  { id: 'record_scratch', name: 'Record Scratch', emoji: '💿', category: 'transition' },
  { id: 'womp_womp', name: 'Womp Womp', emoji: '😢', category: 'meme' },
  { id: 'applause', name: 'Applause', emoji: '👏', category: 'celebration' },
  { id: 'laugh_track', name: 'Laugh Track', emoji: '😂', category: 'meme' },
];

// Animation presets
const ANIMATION_PRESETS = [
  { id: 'idle', name: 'Idle', category: 'basic' },
  { id: 'walk', name: 'Walk', category: 'movement' },
  { id: 'run', name: 'Run', category: 'movement' },
  { id: 'jump', name: 'Jump', category: 'movement' },
  { id: 'wave', name: 'Wave', category: 'social' },
  { id: 'talk', name: 'Talk', category: 'social' },
  { id: 'laugh', name: 'Laugh', category: 'emotion' },
  { id: 'cry', name: 'Cry', category: 'emotion' },
  { id: 'surprised', name: 'Surprised', category: 'emotion' },
  { id: 'angry', name: 'Angry', category: 'emotion' },
  { id: 'facepalm', name: 'Facepalm', category: 'meme' },
  { id: 'shrug', name: 'Shrug', category: 'meme' },
  { id: 'epic_fail', name: 'Epic Fail', category: 'meme' },
  { id: 'savage', name: 'Savage', category: 'meme' },
  { id: 'mic_drop', name: 'Mic Drop', category: 'meme' },
  { id: 'dance', name: 'Dance', category: 'action' },
  { id: 'punch', name: 'Punch', category: 'action' },
  { id: 'kick', name: 'Kick', category: 'action' },
];

// Background presets
const BACKGROUND_PRESETS = [
  { id: 'default', name: 'Sky', colors: ['#87CEEB', '#E0F7FA'] },
  { id: 'sunset', name: 'Sunset', colors: ['#FF6B6B', '#FFE66D'] },
  { id: 'night', name: 'Night', colors: ['#1a1a2e', '#0f3460'] },
  { id: 'warm', name: 'Warm', colors: ['#F093FB', '#F5576C'] },
  { id: 'cool', name: 'Cool', colors: ['#667eea', '#764ba2'] },
  { id: 'forest', name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { id: 'office', name: 'Office', colors: ['#E8E8E8', '#F5F5F5'] },
  { id: 'outdoor', name: 'Outdoor', colors: ['#56CCF2', '#2F80ED'] },
  { id: 'pink', name: 'Pink', colors: ['#FF9A9E', '#FECFEF'] },
  { id: 'purple', name: 'Purple', colors: ['#667eea', '#764ba2'] },
  { id: 'black', name: 'Black', colors: ['#000000', '#1a1a1a'] },
  { id: 'white', name: 'White', colors: ['#FFFFFF', '#F0F0F0'] },
];

interface AnimatorState {
  // Project
  projectName: string;
  isSaved: boolean;
  
  // Playback
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  
  // Canvas
  zoom: number;
  pan: { x: number; y: number };
  showGrid: boolean;
  showOnionSkin: boolean;
  
  // Characters
  characters: CharacterPreset[];
  selectedCharacterId: string | null;
  
  // Animation
  selectedAnimation: string;
  selectedMood: MoodType;
  
  // Drawing
  drawingTool: DrawingTool;
  brushSize: number;
  brushColor: string;
  layers: DrawingLayer[];
  activeLayerId: string | null;
  drawingHistory: DrawingStroke[][];
  historyIndex: number;
  
  // Timeline
  tracks: TimelineTrack[];
  selectedClipId: string | null;
  
  // Effects
  activeEffects: { type: GlobalEffectType; frame: number; intensity: number }[];
  
  // Text
  textOverlays: TextOverlay[];
  selectedTextId: string | null;
  
  // Audio
  audioTracks: AudioTrack[];
  selectedSoundEffect: string | null;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  
  // Background
  background: BackgroundConfig;
  
  // Export
  exportConfig: ExportConfig;
  isExporting: boolean;
  exportProgress: number;
  
  // UI State
  leftPanelTab: string;
  rightPanelTab: string;
  
  // Actions
  setProjectName: (name: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentFrame: (frame: number) => void;
  setFps: (fps: number) => void;
  setTotalFrames: (frames: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleGrid: () => void;
  toggleOnionSkin: () => void;
  selectCharacter: (id: string | null) => void;
  addCharacter: (character: CharacterPreset) => void;
  removeCharacter: (id: string) => void;
  setSelectedAnimation: (animation: string) => void;
  setSelectedMood: (mood: MoodType) => void;
  setDrawingTool: (tool: DrawingTool) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  addLayer: () => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
  undo: () => void;
  redo: () => void;
  addClip: (trackId: string, clip: Omit<TimelineClip, 'id'>) => void;
  removeClip: (clipId: string) => void;
  selectClip: (id: string | null) => void;
  triggerEffect: (type: GlobalEffectType) => void;
  addTextOverlay: (overlay: TextOverlay) => void;
  removeTextOverlay: (id: string) => void;
  selectTextOverlay: (id: string | null) => void;
  setBackground: (bg: BackgroundConfig) => void;
  setExportConfig: (config: Partial<ExportConfig>) => void;
  startExport: () => Promise<void>;
  setLeftPanelTab: (tab: string) => void;
  setRightPanelTab: (tab: string) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setVoiceVolume: (volume: number) => void;
  playSoundEffect: (id: string) => void;
}

export const useAnimatorStore = create<AnimatorState>((set, get) => ({
  // Project
  projectName: 'Untitled Project',
  isSaved: true,
  
  // Playback
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 300, // 10 seconds at 30fps
  fps: 30,
  
  // Canvas
  zoom: 1,
  pan: { x: 0, y: 0 },
  showGrid: false,
  showOnionSkin: false,
  
  // Characters
  characters: DEFAULT_CHARACTERS,
  selectedCharacterId: 'alex',
  
  // Animation
  selectedAnimation: 'idle',
  selectedMood: 'neutral',
  
  // Drawing
  drawingTool: 'brush',
  brushSize: 5,
  brushColor: '#000000',
  layers: [
    { id: 'layer-1', name: 'Layer 1', visible: true, locked: false, opacity: 1, blendMode: 'normal', canvas: null, drawings: [] }
  ],
  activeLayerId: 'layer-1',
  drawingHistory: [],
  historyIndex: -1,
  
  // Timeline
  tracks: [
    { id: 'animation-track', type: 'animation', name: 'Animation', clips: [], muted: false, locked: false, color: '#8B5CF6' },
    { id: 'audio-track', type: 'audio', name: 'Audio', clips: [], muted: false, locked: false, color: '#EC4899' },
    { id: 'effects-track', type: 'effects', name: 'Effects', clips: [], muted: false, locked: false, color: '#F59E0B' },
    { id: 'text-track', type: 'text', name: 'Text', clips: [], muted: false, locked: false, color: '#10B981' },
  ],
  selectedClipId: null,
  
  // Effects
  activeEffects: [],
  
  // Text
  textOverlays: [],
  selectedTextId: null,
  
  // Audio
  audioTracks: [],
  selectedSoundEffect: null,
  musicVolume: 80,
  sfxVolume: 100,
  voiceVolume: 100,
  
  // Background
  background: { type: 'gradient', value: ['#87CEEB', '#E0F7FA'], blur: 0, dim: 0 },
  
  // Export
  exportConfig: {
    resolution: 'shorts',
    format: 'mp4',
    quality: 'final',
    frameRange: { start: 0, end: 300 },
  },
  isExporting: false,
  exportProgress: 0,
  
  // UI State
  leftPanelTab: 'tools',
  rightPanelTab: 'effects',
  
  // Actions
  setProjectName: (name) => set({ projectName: name, isSaved: false }),
  
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, currentFrame: 0 }),
  
  setCurrentFrame: (frame) => {
    const { totalFrames } = get();
    set({ currentFrame: Math.max(0, Math.min(frame, totalFrames)) });
  },
  
  setFps: (fps) => set({ fps }),
  setTotalFrames: (frames) => set({ totalFrames: frames }),
  
  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(zoom, 4)) }),
  setPan: (pan) => set({ pan }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleOnionSkin: () => set((state) => ({ showOnionSkin: !state.showOnionSkin })),
  
  selectCharacter: (id) => set({ selectedCharacterId: id }),
  addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
  removeCharacter: (id) => set((state) => ({ 
    characters: state.characters.filter((c) => c.id !== id),
    selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
  })),
  
  setSelectedAnimation: (animation) => set({ selectedAnimation: animation }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  
  setDrawingTool: (tool) => set({ drawingTool: tool }),
  setBrushSize: (size) => set({ brushSize: size }),
  setBrushColor: (color) => set({ brushColor: color }),
  
  addLayer: () => {
    const { layers } = get();
    const newId = `layer-${Date.now()}`;
    const newLayer: DrawingLayer = {
      id: newId,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
      canvas: null,
      drawings: [],
    };
    set({ layers: [...layers, newLayer], activeLayerId: newId });
  },
  
  removeLayer: (id) => set((state) => ({
    layers: state.layers.filter((l) => l.id !== id),
    activeLayerId: state.activeLayerId === id ? state.layers[0]?.id || null : state.activeLayerId,
  })),
  
  selectLayer: (id) => set({ activeLayerId: id }),
  
  toggleLayerVisibility: (id) => set((state) => ({
    layers: state.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l),
  })),
  
  toggleLayerLock: (id) => set((state) => ({
    layers: state.layers.map((l) => l.id === id ? { ...l, locked: !l.locked } : l),
  })),
  
  undo: () => {
    const { historyIndex, drawingHistory } = get();
    if (historyIndex > 0) {
      set({ historyIndex: historyIndex - 1 });
    }
  },
  
  redo: () => {
    const { historyIndex, drawingHistory } = get();
    if (historyIndex < drawingHistory.length - 1) {
      set({ historyIndex: historyIndex + 1 });
    }
  },
  
  addClip: (trackId, clip) => set((state) => ({
    tracks: state.tracks.map((t) => 
      t.id === trackId 
        ? { ...t, clips: [...t.clips, { ...clip, id: `clip-${Date.now()}` }] }
        : t
    ),
  })),
  
  removeClip: (clipId) => set((state) => ({
    tracks: state.tracks.map((t) => ({
      ...t,
      clips: t.clips.filter((c) => c.id !== clipId),
    })),
    selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
  })),
  
  selectClip: (id) => set({ selectedClipId: id }),
  
  triggerEffect: (type) => {
    const { currentFrame } = get();
    set((state) => ({
      activeEffects: [...state.activeEffects, { type, frame: currentFrame, intensity: 1 }],
    }));
  },
  
  addTextOverlay: (overlay) => set((state) => ({
    textOverlays: [...state.textOverlays, overlay],
  })),
  
  removeTextOverlay: (id) => set((state) => ({
    textOverlays: state.textOverlays.filter((t) => t.id !== id),
    selectedTextId: state.selectedTextId === id ? null : state.selectedTextId,
  })),
  
  selectTextOverlay: (id) => set({ selectedTextId: id }),
  
  setBackground: (bg) => set({ background: bg }),
  
  setExportConfig: (config) => set((state) => ({
    exportConfig: { ...state.exportConfig, ...config },
  })),
  
  startExport: async () => {
    set({ isExporting: true, exportProgress: 0 });
    // Simulate export progress
    for (let i = 0; i <= 100; i += 2) {
      set({ exportProgress: i });
      await new Promise((r) => setTimeout(r, 50));
    }
    set({ isExporting: false, exportProgress: 0 });
  },
  
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  setVoiceVolume: (volume) => set({ voiceVolume: volume }),
  
  playSoundEffect: (id) => {
    // In a real app, this would play the sound
    console.log('Playing sound effect:', id);
  },
}));

// Export constants for use in components
export { DEFAULT_CHARACTERS, SOUND_EFFECTS, ANIMATION_PRESETS, BACKGROUND_PRESETS };
