// Stickman Meme Animator - Comedy Engine
// Story to Comedy Beat Converter

import { 
  ComedyBeat, 
  BeatType, 
  Character, 
  Scene, 
  StoryInstruction,
  StoryAction,
  Dialogue,
  AnimationType,
  EmotionType,
  Position,
  CameraEffect
} from '../types';

// ==================== MEME TEMPLATES ====================

interface MemeTemplate {
  name: string;
  pattern: BeatType[];
  setupActions: string[];
  punchlineActions: string[];
  emotions: {
    setup: EmotionType;
    punchline: EmotionType;
    reaction: EmotionType;
  };
  cameraEffects: {
    punchline: CameraEffect;
  };
}

const MEME_TEMPLATES: MemeTemplate[] = [
  {
    name: 'caught_red_handed',
    pattern: ['setup', 'buildup', 'tension', 'punchline', 'reaction'],
    setupActions: ['character doing something wrong'],
    punchlineActions: ['caught!', 'shocked reaction'],
    emotions: { setup: 'smug', punchline: 'shocked', reaction: 'scared' },
    cameraEffects: { punchline: 'zoom_in' },
  },
  {
    name: 'slip_and_fall',
    pattern: ['setup', 'buildup', 'punchline', 'reaction'],
    setupActions: ['walking', 'not paying attention'],
    punchlineActions: ['slip', 'fall dramatically'],
    emotions: { setup: 'happy', punchline: 'shocked', reaction: 'sad' },
    cameraEffects: { punchline: 'shake' },
  },
  {
    name: 'unexpected_twist',
    pattern: ['setup', 'tension', 'punchline', 'aftermath'],
    setupActions: ['normal situation'],
    punchlineActions: ['unexpected thing happens', 'everyone shocked'],
    emotions: { setup: 'neutral', punchline: 'shocked', reaction: 'confused' },
    cameraEffects: { punchline: 'zoom_in' },
  },
  {
    name: 'teacher_calling',
    pattern: ['setup', 'tension', 'punchline'],
    setupActions: ['teacher looks around', 'unsuspecting student'],
    punchlineActions: ['teacher calls name', 'dramatic zoom'],
    emotions: { setup: 'neutral', punchline: 'shocked', reaction: 'scared' },
    cameraEffects: { punchline: 'zoom_in' },
  },
  {
    name: 'sneaky_steal',
    pattern: ['setup', 'buildup', 'tension', 'punchline', 'reaction'],
    setupActions: ['sneaking', 'reaching for item'],
    punchlineActions: ['caught mid-steal', 'awkward pause'],
    emotions: { setup: 'smug', punchline: 'shocked', reaction: 'confused' },
    cameraEffects: { punchline: 'shake' },
  },
];

// ==================== KEYWORD ANALYSIS ====================

const ACTION_KEYWORDS: Record<string, { type: AnimationType; duration: number }> = {
  'walk': { type: 'walk', duration: 48 },
  'walks': { type: 'walk', duration: 48 },
  'walking': { type: 'walk', duration: 48 },
  'run': { type: 'run', duration: 36 },
  'runs': { type: 'run', duration: 36 },
  'running': { type: 'run', duration: 36 },
  'sit': { type: 'sit', duration: 24 },
  'sits': { type: 'sit', duration: 24 },
  'sitting': { type: 'sit', duration: 24 },
  'jump': { type: 'jump', duration: 24 },
  'jumps': { type: 'jump', duration: 24 },
  'fall': { type: 'fall', duration: 36 },
  'falls': { type: 'fall', duration: 36 },
  'falling': { type: 'fall', duration: 36 },
  'slip': { type: 'fall', duration: 36 },
  'slips': { type: 'fall', duration: 36 },
  'wave': { type: 'wave', duration: 24 },
  'waves': { type: 'wave', duration: 24 },
  'point': { type: 'point', duration: 12 },
  'points': { type: 'point', duration: 12 },
  'slap': { type: 'slap', duration: 12 },
  'slaps': { type: 'slap', duration: 12 },
  'hit': { type: 'hit', duration: 12 },
  'hits': { type: 'hit', duration: 12 },
  'shake': { type: 'shake', duration: 24 },
  'shakes': { type: 'shake', duration: 24 },
  'scream': { type: 'scream', duration: 36 },
  'screams': { type: 'scream', duration: 36 },
  'enter': { type: 'enter', duration: 48 },
  'enters': { type: 'enter', duration: 48 },
  'exit': { type: 'exit', duration: 48 },
  'exits': { type: 'exit', duration: 48 },
  'steal': { type: 'walk', duration: 48 },
  'steals': { type: 'walk', duration: 48 },
  'stealing': { type: 'walk', duration: 48 },
  'catch': { type: 'head_snap', duration: 12 },
  'catches': { type: 'head_snap', duration: 12 },
  'caught': { type: 'shake', duration: 24 },
  'notice': { type: 'head_snap', duration: 12 },
  'notices': { type: 'head_snap', duration: 12 },
  'look': { type: 'head_snap', duration: 12 },
  'looks': { type: 'head_snap', duration: 12 },
  'talk': { type: 'talk', duration: 48 },
  'talks': { type: 'talk', duration: 48 },
  'say': { type: 'talk', duration: 48 },
  'says': { type: 'talk', duration: 48 },
  'said': { type: 'talk', duration: 48 },
};

const EMOTION_KEYWORDS: Record<string, EmotionType> = {
  'happy': 'happy',
  'glad': 'happy',
  'excited': 'happy',
  'sad': 'sad',
  'unhappy': 'sad',
  'cry': 'sad',
  'angry': 'angry',
  'mad': 'angry',
  'furious': 'angry',
  'shocked': 'shocked',
  'surprised': 'shocked',
  'amazed': 'shocked',
  'confused': 'confused',
  'puzzled': 'confused',
  'scared': 'scared',
  'afraid': 'scared',
  'terrified': 'scared',
  'evil': 'evil_grin',
  'sneaky': 'evil_grin',
  'smug': 'smug',
  'cool': 'smug',
  'nervous': 'scared',
  'worried': 'scared',
};

const SCENE_KEYWORDS: Record<string, { type: BeatType; effect?: CameraEffect }> = {
  'suddenly': { type: 'punchline', effect: 'shake' },
  'dramatic': { type: 'tension', effect: 'zoom_in' },
  'shock': { type: 'punchline', effect: 'zoom_in' },
  'caught': { type: 'punchline', effect: 'shake' },
  'fall': { type: 'punchline', effect: 'shake' },
  'slip': { type: 'punchline', effect: 'shake' },
  'bam': { type: 'punchline', effect: 'shake' },
  'boom': { type: 'punchline', effect: 'shake' },
  'then': { type: 'buildup' },
  'but': { type: 'tension' },
  'however': { type: 'tension' },
  'wait': { type: 'tension' },
  'oh no': { type: 'punchline', effect: 'zoom_in' },
  'uh oh': { type: 'punchline', effect: 'zoom_in' },
  'oops': { type: 'punchline', effect: 'shake' },
};

// ==================== COMEDY ENGINE CLASS ====================

export class ComedyEngine {
  private characters: Map<string, Character> = new Map();
  private currentFrame: number = 0;

  // Main entry point: Convert story text to comedy beats
  parseStory(storyText: string): StoryInstruction {
    this.characters = new Map();
    this.currentFrame = 0;

    // Split into sentences
    const sentences = storyText
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Analyze story structure
    const beats = this.analyzeStoryStructure(sentences);
    
    // Create scenes from beats
    const scenes = this.createScenes(beats, sentences);

    // Calculate total duration
    const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

    return {
      scenes,
      totalDuration,
      metadata: {
        title: 'Meme Animation',
        author: 'Comedy Engine',
        createdAt: new Date(),
      },
    };
  }

  // Analyze story to determine comedic structure
  private analyzeStoryStructure(sentences: string[]): ComedyBeat[] {
    const beats: ComedyBeat[] = [];

    // Determine beat types for each sentence
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].toLowerCase();
      const isFirst = i === 0;
      const isLast = i === sentences.length - 1;
      const isSecondToLast = i === sentences.length - 2;

      // Determine beat type
      let beatType: BeatType = 'setup';
      let cameraEffect: CameraEffect | undefined;

      // Check for scene keywords
      for (const [keyword, info] of Object.entries(SCENE_KEYWORDS)) {
        if (sentence.includes(keyword)) {
          beatType = info.type;
          cameraEffect = info.effect;
          break;
        }
      }

      // Default beat assignment based on position
      if (isFirst) {
        beatType = 'setup';
      } else if (isLast) {
        beatType = 'reaction';
      } else if (isSecondToLast) {
        beatType = 'punchline';
        cameraEffect = cameraEffect || 'shake';
      } else if (beatType === 'setup') {
        beatType = 'buildup';
      }

      // Extract character names
      const characters = this.extractCharacterNames(sentences[i]);
      
      // Add characters to tracking
      characters.forEach(name => {
        if (!this.characters.has(name)) {
          this.characters.set(name, this.createCharacter(name));
        }
      });

      // Extract actions
      const actions = this.extractActions(sentence);

      // Extract dialogue
      const dialogueMatch = sentences[i].match(/["']([^"']+)["']/);
      const dialogue = dialogueMatch ? dialogueMatch[1] : undefined;

      // Determine emotion
      let emotion: EmotionType = 'neutral';
      for (const [keyword, emo] of Object.entries(EMOTION_KEYWORDS)) {
        if (sentence.includes(keyword)) {
          emotion = emo;
          break;
        }
      }

      // Determine duration based on beat type
      const duration = this.getBeatDuration(beatType);

      beats.push({
        scene: sentences[i],
        description: sentences[i],
        type: beatType,
        characters: characters.map(c => c.toLowerCase()),
        actions,
        dialogue,
        sound: this.getSuggestedSound(beatType, sentence),
        cameraEffect,
        duration,
      });
    }

    return beats;
  }

  // Create scenes from comedy beats
  private createScenes(beats: ComedyBeat[], sentences: string[]): Scene[] {
    const scenes: Scene[] = [];
    let sceneId = 0;
    let currentFrame = 0;

    for (const beat of beats) {
      const scene: Scene = {
        id: sceneId++,
        description: beat.scene,
        characters: Array.from(this.characters.values())
          .filter(c => beat.characters.includes(c.id)),
        actions: [],
        dialogue: [],
        background: 'white',
        duration: beat.duration,
        cameraEffect: beat.cameraEffect,
      };

      // Create actions for characters in this beat
      for (const charId of beat.characters) {
        const char = this.characters.get(
          Array.from(this.characters.keys()).find(k => k.toLowerCase() === charId) || charId
        );
        
        if (char) {
          // Add animation actions
          for (const actionKeyword of beat.actions) {
            const actionInfo = ACTION_KEYWORDS[actionKeyword];
            if (actionInfo) {
              scene.actions.push({
                type: actionInfo.type,
                characterId: charId,
                startTime: currentFrame,
                duration: actionInfo.duration,
              });
            }
          }

          // Add dialogue if present
          if (beat.dialogue) {
            scene.dialogue.push({
              characterId: charId,
              text: beat.dialogue,
              startTime: currentFrame,
              duration: Math.max(48, beat.dialogue.length * 3),
            });
          }
        }
      }

      scenes.push(scene);
      currentFrame += beat.duration;
    }

    return scenes;
  }

  // Extract character names from sentence
  private extractCharacterNames(sentence: string): string[] {
    const words = sentence.split(/\s+/);
    const names: string[] = [];
    const commonWords = ['the', 'a', 'an', 'then', 'when', 'while', 'and', 'but', 'or', 'he', 'she', 'it', 'they', 'teacher', 'student', 'kid', 'man', 'woman'];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      
      // Check if it's a name (capitalized and not a common word or action)
      if (
        word.length > 1 &&
        word[0] === word[0].toUpperCase() &&
        word.slice(1) === word.slice(1).toLowerCase() &&
        !commonWords.includes(word.toLowerCase()) &&
        !(word.toLowerCase() in ACTION_KEYWORDS)
      ) {
        names.push(word);
      }
    }

    // If no names found, create default characters
    if (names.length === 0) {
      const lowerSentence = sentence.toLowerCase();
      if (lowerSentence.includes('teacher')) names.push('Teacher');
      if (lowerSentence.includes('student')) names.push('Student');
      if (lowerSentence.includes('kid')) names.push('Kid');
      if (lowerSentence.includes('man')) names.push('Man');
      if (lowerSentence.includes('woman')) names.push('Woman');
      if (names.length === 0) names.push('Character');
    }

    return [...new Set(names)];
  }

  // Extract action keywords from sentence
  private extractActions(sentence: string): string[] {
    const actions: string[] = [];
    const words = sentence.toLowerCase().split(/\s+/);

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (cleanWord in ACTION_KEYWORDS) {
        actions.push(cleanWord);
      }
    }

    return actions;
  }

  // Create a character
  private createCharacter(name: string): Character {
    const colors = ['#000000', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
    const colorIndex = Math.abs(name.charCodeAt(0)) % colors.length;

    return {
      id: name.toLowerCase(),
      name,
      color: colors[colorIndex],
      state: {
        position: { x: 540, y: 1200 },
        facingRight: true,
        pose: 'standing',
        emotion: 'neutral',
        isTalking: false,
        scale: 1,
        squash: 1,
        stretch: 1,
        rotation: 0,
        opacity: 1,
      },
    };
  }

  // Get beat duration based on type
  private getBeatDuration(type: BeatType): number {
    const durations: Record<BeatType, number> = {
      setup: 48,       // 2 seconds
      buildup: 36,     // 1.5 seconds
      tension: 24,     // 1 second
      punchline: 12,   // 0.5 seconds - quick!
      reaction: 36,    // 1.5 seconds
      aftermath: 24,   // 1 second
    };
    return durations[type];
  }

  // Get suggested sound for beat
  private getSuggestedSound(beatType: BeatType, sentence: string): string | undefined {
    const lowerSentence = sentence.toLowerCase();
    
    if (lowerSentence.includes('slap') || lowerSentence.includes('hit')) return 'slap';
    if (lowerSentence.includes('fall') || lowerSentence.includes('slip')) return 'boom';
    if (lowerSentence.includes('scream')) return 'scream';
    if (beatType === 'punchline') return 'vine_boom';
    
    return undefined;
  }

  // Get all parsed characters
  getCharacters(): Character[] {
    return Array.from(this.characters.values());
  }
}

// ==================== TEST CASE GENERATORS ====================

export function generateTestCase(testName: string): string {
  const testCases: Record<string, string> = {
    'kid_steals_food': 'Kid sneaks to the fridge. Kid opens the door slowly. Kid reaches for food. Mom appears behind. Dramatic zoom. Kid looks shocked. Mom smiles evil grin.',
    'man_slips_banana': 'Man walks happily down the street. Man sees something on the ground. Man slips on a banana peel. Man falls dramatically. Man lies on ground sad.',
    'teacher_calls_name': 'Teacher looks at the class. Teacher opens the attendance book. Teacher calls a random name. Student freezes in shock. Everyone looks at student. Student sweats nervously.',
  };

  return testCases[testName] || testCases['kid_steals_food'];
}

// Export singleton
export const comedyEngine = new ComedyEngine();
