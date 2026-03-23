// Story Parser - Converts text story into structured animation instructions

import {
  ParsedScene,
  Character,
  AnimationAction,
  Dialogue,
  StoryInstruction,
  ActionType,
  Position,
  EmotionType,
  PoseType,
} from '@/lib/types';

// Keywords for parsing
const ACTION_KEYWORDS: Record<string, ActionType> = {
  'walk': 'walk',
  'walks': 'walk',
  'walking': 'walk',
  'ran': 'run',
  'run': 'run',
  'runs': 'run',
  'running': 'run',
  'sit': 'sit',
  'sits': 'sit',
  'sitting': 'sit',
  'sat': 'sit',
  'stand': 'stand',
  'stands': 'stand',
  'standing': 'stand',
  'jump': 'jump',
  'jumps': 'jump',
  'jumping': 'jump',
  'say': 'talk',
  'says': 'talk',
  'said': 'talk',
  'ask': 'talk',
  'asks': 'talk',
  'asked': 'talk',
  'shout': 'talk',
  'shouts': 'talk',
  'shouted': 'talk',
  'wave': 'wave',
  'waves': 'wave',
  'waving': 'wave',
  'point': 'point',
  'points': 'point',
  'pointing': 'point',
  'enter': 'enter',
  'enters': 'enter',
  'entered': 'enter',
  'exit': 'exit',
  'exits': 'exit',
  'left': 'exit',
  'leave': 'exit',
  'leaves': 'exit',
  'idle': 'idle',
  'wait': 'idle',
  'waits': 'idle',
};

const EMOTION_KEYWORDS: Record<string, EmotionType> = {
  'happy': 'happy',
  'glad': 'happy',
  'joyful': 'happy',
  'excited': 'happy',
  'sad': 'sad',
  'unhappy': 'sad',
  'depressed': 'sad',
  'angry': 'angry',
  'mad': 'angry',
  'furious': 'angry',
  'surprised': 'surprised',
  'shocked': 'surprised',
  'amazed': 'surprised',
  'scared': 'scared',
  'afraid': 'scared',
  'frightened': 'scared',
  'terrified': 'scared',
};

const DIRECTION_KEYWORDS: Record<string, Position> = {
  'left': { x: 200, y: 400 },
  'right': { x: 600, y: 400 },
  'center': { x: 400, y: 400 },
  'middle': { x: 400, y: 400 },
  'front': { x: 400, y: 450 },
  'back': { x: 400, y: 350 },
};

const OBJECT_KEYWORDS = [
  'chair', 'table', 'door', 'window', 'bed', 'tree', 'house', 'car', 'bench',
  'desk', 'couch', 'sofa', 'book', 'phone', 'computer', 'lamp', 'stairs',
];

interface ParseContext {
  characters: Map<string, Character>;
  currentScene: number;
  currentFrame: number;
  scenes: ParsedScene[];
  characterPositions: Map<string, Position>;
}

export class StoryParser {
  private context: ParseContext;

  constructor() {
    this.context = this.createContext();
  }

  private createContext(): ParseContext {
    return {
      characters: new Map(),
      currentScene: 0,
      currentFrame: 0,
      scenes: [],
      characterPositions: new Map(),
    };
  }

  /**
   * Parse a story text into structured animation instructions
   */
  parse(storyText: string): StoryInstruction {
    this.context = this.createContext();

    // Split into paragraphs/lines
    const lines = storyText
      .split(/[\n.!?]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Process each line
    for (const line of lines) {
      this.parseLine(line);
    }

    // Calculate total duration
    const totalDuration = this.context.scenes.reduce(
      (sum, scene) => sum + scene.duration,
      0
    );

    return {
      scenes: this.context.scenes,
      totalDuration,
      metadata: {
        title: 'Untitled Story',
        author: 'Anonymous',
        createdAt: new Date(),
      },
    };
  }

  private parseLine(line: string): void {
    // Check for scene markers
    if (this.isSceneMarker(line)) {
      this.startNewScene(line);
      return;
    }

    // Ensure we have at least one scene
    if (this.context.scenes.length === 0) {
      this.startNewScene('Scene 1');
    }

    // Parse the line for actions
    const currentScene = this.context.scenes[this.context.scenes.length - 1];

    // Extract character names (capitalized words)
    const characterNames = this.extractCharacterNames(line);

    // Add new characters
    for (const name of characterNames) {
      if (!this.context.characters.has(name)) {
        this.addCharacter(name);
      }
    }

    // Parse actions
    const actions = this.parseActions(line, characterNames);
    currentScene.actions.push(...actions);

    // Parse dialogue
    const dialogue = this.parseDialogue(line, characterNames);
    if (dialogue) {
      currentScene.dialogue.push(dialogue);
    }

    // Parse emotions
    this.parseEmotions(line, characterNames);

    // Update scene duration
    const maxEndTime = Math.max(
      ...currentScene.actions.map((a) => a.startTime + a.duration),
      currentScene.duration
    );
    currentScene.duration = maxEndTime;

    // Update current frame
    this.context.currentFrame = maxEndTime;
  }

  private isSceneMarker(line: string): boolean {
    const scenePatterns = [
      /^scene\s*\d+/i,
      /^chapter\s*\d+/i,
      /^\[.*\]$/, // [Scene Description]
      /^#{1,3}\s/, // Markdown headers
    ];
    return scenePatterns.some((pattern) => pattern.test(line));
  }

  private startNewScene(line: string): void {
    this.context.currentScene++;
    this.context.currentFrame = 0;

    const scene: ParsedScene = {
      id: this.context.currentScene,
      description: line.replace(/^#+\s*/, '').replace(/[\[\]]/g, ''),
      characters: [],
      actions: [],
      dialogue: [],
      background: 'default',
      duration: 60, // Default 1 second at 60fps
    };

    this.context.scenes.push(scene);
  }

  private extractCharacterNames(line: string): string[] {
    // Match capitalized words that aren't at the start of the line
    const words = line.split(/\s+/);
    const names: string[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      
      // Skip common words and action verbs
      const commonWords = ['The', 'A', 'An', 'Then', 'When', 'While', 'And', 'But', 'Or'];
      if (commonWords.includes(word)) continue;

      // Check if it's a name (capitalized and not an action keyword)
      if (
        word.length > 1 &&
        word[0] === word[0].toUpperCase() &&
        word.slice(1) === word.slice(1).toLowerCase() &&
        !(word.toLowerCase() in ACTION_KEYWORDS)
      ) {
        names.push(word);
      }
    }

    return [...new Set(names)];
  }

  private addCharacter(name: string): void {
    const position: Position = { x: 400, y: 400 };
    const character: Character = {
      id: name.toLowerCase(),
      name,
      position,
      state: {
        pose: 'standing',
        emotion: 'neutral',
        isTalking: false,
      },
    };

    this.context.characters.set(name, character);
    this.context.characterPositions.set(name, position);
  }

  private parseActions(line: string, characterNames: string[]): AnimationAction[] {
    const actions: AnimationAction[] = [];
    const words = line.toLowerCase().split(/\s+/);

    for (const characterName of characterNames) {
      for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^a-z]/g, '');
        const actionType = ACTION_KEYWORDS[word];

        if (actionType) {
          const action: AnimationAction = {
            type: actionType,
            characterId: characterName.toLowerCase(),
            duration: this.getActionDuration(actionType),
            startTime: this.context.currentFrame,
          };

          // Check for targets (directions)
          for (const [dir, pos] of Object.entries(DIRECTION_KEYWORDS)) {
            if (line.toLowerCase().includes(dir)) {
              action.target = pos;
              break;
            }
          }

          // Check for objects
          for (const obj of OBJECT_KEYWORDS) {
            if (line.toLowerCase().includes(obj)) {
              action.object = obj;
              break;
            }
          }

          actions.push(action);
          break; // One action per character per line
        }
      }
    }

    return actions;
  }

  private getActionDuration(actionType: ActionType): number {
    const durations: Record<ActionType, number> = {
      walk: 90, // 1.5 seconds
      run: 60,
      sit: 45,
      stand: 30,
      jump: 40,
      talk: 60,
      turn: 20,
      wave: 30,
      point: 20,
      pick_up: 30,
      idle: 60,
      enter: 90,
      exit: 90,
    };
    return durations[actionType] || 60;
  }

  private parseDialogue(line: string, characterNames: string[]): Dialogue | null {
    // Look for quoted text
    const quoteMatch = line.match(/["']([^"']+)["']/);
    if (quoteMatch && characterNames.length > 0) {
      return {
        characterId: characterNames[0].toLowerCase(),
        text: quoteMatch[1],
        startTime: this.context.currentFrame,
        duration: Math.max(60, quoteMatch[1].length * 3), // ~3 frames per character
      };
    }
    return null;
  }

  private parseEmotions(line: string, characterNames: string[]): void {
    const words = line.toLowerCase().split(/\s+/);

    for (const characterName of characterNames) {
      const character = this.context.characters.get(characterName);
      if (!character) continue;

      for (const word of words) {
        const emotion = EMOTION_KEYWORDS[word.replace(/[^a-z]/g, '')];
        if (emotion) {
          character.state.emotion = emotion;
          break;
        }
      }
    }
  }

  /**
   * Get all parsed characters
   */
  getCharacters(): Character[] {
    return Array.from(this.context.characters.values());
  }
}

// Export singleton instance
export const storyParser = new StoryParser();
