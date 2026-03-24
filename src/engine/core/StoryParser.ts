// Rico-Style Stickman Animation Engine
// Story Parser - Rule-based Text to Animation Converter

import { 
  StoryBeat, 
  ActionType, 
  EmotionType, 
  Position,
  Scene,
  Character,
  Action,
  Dialogue,
  TIMING 
} from './types';
import { createDefaultRig } from './RigSystem';

// ==================== KEYWORD RULES ====================

// Action keyword mapping
const ACTION_RULES: Record<string, { type: ActionType; duration: number }> = {
  // Movement
  'walk': { type: 'walk', duration: TIMING.SETUP_DURATION },
  'walks': { type: 'walk', duration: TIMING.SETUP_DURATION },
  'walking': { type: 'walk', duration: TIMING.SETUP_DURATION },
  'run': { type: 'run', duration: TIMING.BUILDUP_DURATION },
  'runs': { type: 'run', duration: TIMING.BUILDUP_DURATION },
  'running': { type: 'run', duration: TIMING.BUILDUP_DURATION },
  'enter': { type: 'enter', duration: TIMING.SETUP_DURATION },
  'enters': { type: 'enter', duration: TIMING.SETUP_DURATION },
  'exit': { type: 'exit', duration: TIMING.SETUP_DURATION },
  'exits': { type: 'exit', duration: TIMING.SETUP_DURATION },
  
  // Actions
  'jump': { type: 'jump', duration: TIMING.BUILDUP_DURATION },
  'jumps': { type: 'jump', duration: TIMING.BUILDUP_DURATION },
  'sit': { type: 'sit', duration: TIMING.BUILDUP_DURATION },
  'sits': { type: 'sit', duration: TIMING.BUILDUP_DURATION },
  'stand': { type: 'stand', duration: TIMING.BUILDUP_DURATION },
  'stands': { type: 'stand', duration: TIMING.BUILDUP_DURATION },
  
  // Interactions
  'slap': { type: 'slap', duration: TIMING.PUNCHLINE_DURATION },
  'slaps': { type: 'slap', duration: TIMING.PUNCHLINE_DURATION },
  'hit': { type: 'hit', duration: TIMING.PUNCHLINE_DURATION },
  'hits': { type: 'hit', duration: TIMING.PUNCHLINE_DURATION },
  'kick': { type: 'kick', duration: TIMING.PUNCHLINE_DURATION },
  'kicks': { type: 'kick', duration: TIMING.PUNCHLINE_DURATION },
  
  // Reactions
  'fall': { type: 'fall', duration: TIMING.PUNCHLINE_DURATION },
  'falls': { type: 'fall', duration: TIMING.PUNCHLINE_DURATION },
  'falling': { type: 'fall', duration: TIMING.PUNCHLINE_DURATION },
  'slip': { type: 'slip', duration: TIMING.PUNCHLINE_DURATION },
  'slips': { type: 'slip', duration: TIMING.PUNCHLINE_DURATION },
  'slipped': { type: 'slip', duration: TIMING.PUNCHLINE_DURATION },
  
  // Expressions
  'wave': { type: 'wave', duration: TIMING.PUNCHLINE_DURATION * 2 },
  'waves': { type: 'wave', duration: TIMING.PUNCHLINE_DURATION * 2 },
  'point': { type: 'point', duration: TIMING.PUNCHLINE_DURATION },
  'points': { type: 'point', duration: TIMING.PUNCHLINE_DURATION },
  
  // Special
  'freeze': { type: 'freeze', duration: TIMING.PUNCHLINE_DURATION },
  'frozen': { type: 'freeze', duration: TIMING.PUNCHLINE_DURATION },
  'shake': { type: 'shake', duration: TIMING.PUNCHLINE_DURATION },
  'shakes': { type: 'shake', duration: TIMING.PUNCHLINE_DURATION },
};

// Emotion keyword mapping
const EMOTION_RULES: Record<string, EmotionType> = {
  'happy': 'happy',
  'glad': 'happy',
  'excited': 'happy',
  'joyful': 'happy',
  
  'sad': 'sad',
  'unhappy': 'sad',
  'depressed': 'sad',
  'crying': 'sad',
  'cry': 'sad',
  
  'angry': 'angry',
  'mad': 'angry',
  'furious': 'angry',
  'rage': 'angry',
  
  'shocked': 'shocked',
  'shock': 'shocked',
  'surprised': 'shocked',
  'surprise': 'shocked',
  'amazed': 'shocked',
  'stunned': 'shocked',
  
  'scared': 'scared',
  'afraid': 'scared',
  'terrified': 'scared',
  'frightened': 'scared',
  'nervous': 'scared',
  'worried': 'scared',
  
  'confused': 'confused',
  'puzzled': 'confused',
  'bewildered': 'confused',
  
  'evil': 'evil_grin',
  'sneaky': 'evil_grin',
  'sinister': 'evil_grin',
  'menacing': 'evil_grin',
  
  'smug': 'smug',
  'confident': 'smug',
  'cocky': 'smug',
  
  'scream': 'shocked',
  'screams': 'shocked',
  'screaming': 'shocked',
  'laugh': 'happy',
  'laughs': 'happy',
  'laughing': 'happy',
};

// Scene type keywords
const BEAT_TYPE_RULES: Record<string, 'setup' | 'buildup' | 'tension' | 'punchline' | 'reaction'> = {
  'suddenly': 'punchline',
  'then': 'buildup',
  'but': 'tension',
  'however': 'tension',
  'dramatic': 'tension',
  'zoom': 'tension',
  'shock': 'punchline',
  'slap': 'punchline',
  'hit': 'punchline',
  'fall': 'punchline',
  'slip': 'punchline',
  'boom': 'punchline',
  'bam': 'punchline',
  'caught': 'punchline',
  'oh no': 'punchline',
  'uh oh': 'punchline',
  'oops': 'punchline',
};

// ==================== TEXT NORMALIZATION ====================

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s.,!?'"-]/g, '') // Remove special chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// ==================== ENTITY EXTRACTION ====================

export function extractCharacters(text: string): string[] {
  const words = text.split(/\s+/);
  const characters: string[] = [];
  const commonWords = new Set([
    'the', 'a', 'an', 'then', 'when', 'while', 'and', 'but', 'or',
    'he', 'she', 'it', 'they', 'him', 'her', 'them', 'his', 'hers',
    'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were',
  ]);
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    
    // Check if capitalized and not a common word or action
    if (
      cleanWord.length > 1 &&
      cleanWord[0] === cleanWord[0].toUpperCase() &&
      cleanWord.slice(1) === cleanWord.slice(1).toLowerCase() &&
      !commonWords.has(cleanWord.toLowerCase()) &&
      !(cleanWord.toLowerCase() in ACTION_RULES)
    ) {
      characters.push(cleanWord);
    }
  }
  
  return [...new Set(characters)];
}

export function extractActions(text: string): { keyword: string; type: ActionType; duration: number }[] {
  const words = text.toLowerCase().split(/\s+/);
  const actions: { keyword: string; type: ActionType; duration: number }[] = [];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord in ACTION_RULES) {
      actions.push({ keyword: cleanWord, ...ACTION_RULES[cleanWord] });
    }
  }
  
  return actions;
}

export function extractEmotions(text: string): { keyword: string; emotion: EmotionType }[] {
  const words = text.toLowerCase().split(/\s+/);
  const emotions: { keyword: string; emotion: EmotionType }[] = [];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (cleanWord in EMOTION_RULES) {
      emotions.push({ keyword: cleanWord, emotion: EMOTION_RULES[cleanWord] });
    }
  }
  
  return emotions;
}

export function extractDialogue(text: string): { character: string; text: string } | null {
  const match = text.match(/["']([^"']+)["']/);
  if (match) {
    // Find character before the dialogue
    const beforeDialogue = text.substring(0, text.indexOf(match[0]));
    const characters = extractCharacters(beforeDialogue);
    
    return {
      character: characters[characters.length - 1] || 'Character',
      text: match[1],
    };
  }
  return null;
}

export function determineBeatType(sentence: string): 'setup' | 'buildup' | 'tension' | 'punchline' | 'reaction' {
  const lower = sentence.toLowerCase();
  
  for (const [keyword, type] of Object.entries(BEAT_TYPE_RULES)) {
    if (lower.includes(keyword)) {
      return type;
    }
  }
  
  // Check for emotion words indicating reaction
  const emotions = extractEmotions(sentence);
  if (emotions.length > 0) {
    return 'reaction';
  }
  
  // Default based on content
  const actions = extractActions(sentence);
  if (actions.some(a => ['slap', 'hit', 'fall', 'slip', 'kick'].includes(a.type))) {
    return 'punchline';
  }
  
  return 'setup';
}

// ==================== STORY PARSING ====================

export function parseStory(storyText: string): StoryBeat[] {
  // Step 1: Normalize
  const normalized = normalizeText(storyText);
  
  // Step 2: Split into sentences
  const sentences = splitSentences(normalized);
  
  // Step 3: Process each sentence
  const beats: StoryBeat[] = sentences.map((sentence, index) => {
    const characters = extractCharacters(sentence);
    const actions = extractActions(sentence);
    const emotions = extractEmotions(sentence);
    const dialogue = extractDialogue(sentence);
    const type = determineBeatType(sentence);
    
    // Assign actions to characters
    const actionAssignments: { character: string; action: string; target?: string }[] = [];
    
    for (let i = 0; i < actions.length; i++) {
      const charIndex = Math.min(i, characters.length - 1);
      const character = characters[charIndex] || characters[0] || 'Character';
      actionAssignments.push({
        character,
        action: actions[i].keyword,
      });
    }
    
    // Assign emotions to characters
    const emotionAssignments: { character: string; emotion: EmotionType }[] = [];
    
    for (let i = 0; i < emotions.length; i++) {
      const charIndex = Math.min(i, characters.length - 1);
      const character = characters[charIndex] || characters[0] || 'Character';
      emotionAssignments.push({
        character,
        emotion: emotions[i].emotion,
      });
    }
    
    return {
      text: sentence,
      characters: characters.length > 0 ? characters : ['Character'],
      actions: actionAssignments,
      emotions: emotionAssignments,
      dialogue: dialogue ? { character: dialogue.character, text: dialogue.text } : undefined,
      type,
    };
  });
  
  return beats;
}

// ==================== SCENE GENERATION ====================

export function generateScenes(beats: StoryBeat[]): Scene[] {
  const scenes: Scene[] = [];
  let currentFrame = 0;
  const characterMap = new Map<string, Character>();
  
  // Initialize characters from all beats
  const allCharacters = new Set<string>();
  beats.forEach(beat => {
    beat.characters.forEach(c => allCharacters.add(c));
  });
  
  let charIndex = 0;
  allCharacters.forEach(name => {
    const id = name.toLowerCase().replace(/\s+/g, '_');
    characterMap.set(id, {
      id,
      name,
      rig: createDefaultRig({ x: 300 + charIndex * 250, y: 1200 }),
      position: { x: 300 + charIndex * 250, y: 1200 },
      state: 'idle',
      emotion: 'neutral',
      facingRight: charIndex === 0,
      currentAnimation: null,
      animationFrame: 0,
      velocity: { x: 0, y: 0 },
      color: ['#000000', '#2563eb', '#dc2626', '#16a34a'][charIndex % 4],
      opacity: 1,
    });
    charIndex++;
  });
  
  // Generate scenes from beats
  beats.forEach((beat, beatIndex) => {
    const duration = getBeatDuration(beat.type);
    
    // Create actions
    const actions: Action[] = beat.actions.map(a => {
      const actionInfo = ACTION_RULES[a.action] || { type: 'idle' as ActionType, duration: TIMING.PUNCHLINE_DURATION };
      return {
        characterId: a.character.toLowerCase().replace(/\s+/g, '_'),
        type: actionInfo.type,
        startFrame: currentFrame,
        endFrame: currentFrame + actionInfo.duration,
        params: {},
      };
    });
    
    // Create dialogue
    const dialogue: Dialogue[] = [];
    if (beat.dialogue) {
      dialogue.push({
        characterId: beat.dialogue.character.toLowerCase().replace(/\s+/g, '_'),
        text: beat.dialogue.text,
        startFrame: currentFrame,
        duration: Math.max(TIMING.PUNCHLINE_DURATION, beat.dialogue.text.length * 2),
      });
    }
    
    // Update character emotions
    beat.emotions.forEach(e => {
      const charId = e.character.toLowerCase().replace(/\s+/g, '_');
      const char = characterMap.get(charId);
      if (char) {
        char.emotion = e.emotion;
      }
    });
    
    scenes.push({
      id: beatIndex,
      duration,
      background: 'white',
      characters: Array.from(characterMap.values()),
      actions,
      camera: [],
      dialogue,
    });
    
    currentFrame += duration;
  });
  
  return scenes;
}

function getBeatDuration(type: 'setup' | 'buildup' | 'tension' | 'punchline' | 'reaction'): number {
  switch (type) {
    case 'setup': return TIMING.SETUP_DURATION;
    case 'buildup': return TIMING.BUILDUP_DURATION;
    case 'tension': return TIMING.BUILDUP_DURATION;
    case 'punchline': return TIMING.PUNCHLINE_DURATION;
    case 'reaction': return TIMING.REACTION_DURATION;
  }
}

// ==================== FULL PIPELINE ====================

export interface ParsedStory {
  beats: StoryBeat[];
  scenes: Scene[];
  totalFrames: number;
  characters: Character[];
}

export function parseStoryToAnimation(storyText: string): ParsedStory {
  // Step 1: Parse story into beats
  const beats = parseStory(storyText);
  
  // Step 2: Generate scenes from beats
  const scenes = generateScenes(beats);
  
  // Step 3: Calculate total frames
  const totalFrames = scenes.reduce((sum, scene) => sum + scene.duration, 0);
  
  // Step 4: Extract final character list
  const characterSet = new Set<string>();
  beats.forEach(beat => {
    beat.characters.forEach(c => characterSet.add(c.toLowerCase().replace(/\s+/g, '_')));
  });
  
  const characters: Character[] = Array.from(characterSet).map((id, index) => ({
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' '),
    rig: createDefaultRig({ x: 300 + index * 250, y: 1200 }),
    position: { x: 300 + index * 250, y: 1200 },
    state: 'idle' as const,
    emotion: 'neutral' as EmotionType,
    facingRight: index === 0,
    currentAnimation: null,
    animationFrame: 0,
    velocity: { x: 0, y: 0 },
    color: ['#000000', '#2563eb', '#dc2626', '#16a34a'][index % 4],
    opacity: 1,
  }));
  
  return {
    beats,
    scenes,
    totalFrames,
    characters,
  };
}
