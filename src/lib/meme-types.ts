// Meme Video Types - For YouTube Shorts style content

export interface MemeCharacter {
  id: string;
  name: string;
  role: 'protagonist' | 'antagonist' | 'sidekick' | 'extra';
  position: 'left' | 'center' | 'right';
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'confused' | 'shocked' | 'smug';
  isTalking: boolean;
}

export interface MemeText {
  id: string;
  text: string;
  position: 'top' | 'bottom' | 'middle' | 'floating';
  animation: 'fadeIn' | 'typewriter' | 'bounce' | 'shake' | 'pop';
  style: 'normal' | 'bold' | 'impact' | 'handwritten';
  startTime: number;
  duration: number;
  color: string;
}

export interface MemeScene {
  id: string;
  type: 'setup' | 'reaction' | 'punchline' | 'aftermath';
  characters: MemeCharacter[];
  texts: MemeText[];
  background: string;
  duration: number;
  soundEffect?: string;
}

export interface MemeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  scenes: MemeScene[];
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'character' | 'emotion';
  defaultValue: string;
  description: string;
}

// Pre-built meme templates
export const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'bad-friend',
    name: 'The Worse Friend',
    description: 'There\'s always that one friend who\'s worse...',
    thumbnail: '🤣',
    variables: [
      { name: 'character1', type: 'character', defaultValue: 'You', description: 'First character' },
      { name: 'character2', type: 'character', defaultValue: 'Friend', description: 'The worse friend' },
      { name: 'situation', type: 'text', defaultValue: 'making mistakes', description: 'The situation' },
    ],
    scenes: [
      {
        id: 'scene1',
        type: 'setup',
        characters: [
          { id: 'char1', name: 'You', role: 'protagonist', position: 'left', emotion: 'neutral', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'When you think you\'re the worst at something...', position: 'top', animation: 'fadeIn', style: 'impact', startTime: 0, duration: 60, color: '#FFFFFF' },
        ],
        background: '#1a1a2e',
        duration: 60,
      },
      {
        id: 'scene2',
        type: 'punchline',
        characters: [
          { id: 'char1', name: 'You', role: 'protagonist', position: 'left', emotion: 'shocked', isTalking: false },
          { id: 'char2', name: 'Friend', role: 'sidekick', position: 'right', emotion: 'confused', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'Then you see your friend...', position: 'top', animation: 'bounce', style: 'impact', startTime: 0, duration: 60, color: '#FFFFFF' },
          { id: 'text2', text: '*doing it worse*', position: 'bottom', animation: 'pop', style: 'impact', startTime: 30, duration: 30, color: '#FFD700' },
        ],
        background: '#1a1a2e',
        duration: 60,
        soundEffect: 'vine-boom',
      },
    ],
  },
  {
    id: 'expectations-reality',
    name: 'Expectations vs Reality',
    description: 'What you expected vs what actually happened',
    thumbnail: '😏',
    variables: [
      { name: 'expectation', type: 'text', defaultValue: 'Getting fit', description: 'What you expected' },
      { name: 'reality', type: 'text', defaultValue: 'Eating pizza', description: 'What actually happened' },
    ],
    scenes: [
      {
        id: 'scene1',
        type: 'setup',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'center', emotion: 'happy', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'EXPECTATIONS', position: 'top', animation: 'fadeIn', style: 'impact', startTime: 0, duration: 45, color: '#00FF00' },
        ],
        background: '#2d3436',
        duration: 45,
      },
      {
        id: 'scene2',
        type: 'punchline',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'center', emotion: 'sad', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'REALITY', position: 'top', animation: 'shake', style: 'impact', startTime: 0, duration: 45, color: '#FF4444' },
        ],
        background: '#2d3436',
        duration: 45,
        soundEffect: 'sad-trombone',
      },
    ],
  },
  {
    id: 'awkward-moment',
    name: 'That Awkward Moment',
    description: 'When you realize something embarrassing',
    thumbnail: '😳',
    variables: [
      { name: 'situation', type: 'text', defaultValue: 'waving back at someone who wasn\'t waving at you', description: 'The awkward situation' },
    ],
    scenes: [
      {
        id: 'scene1',
        type: 'setup',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'left', emotion: 'happy', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'That awkward moment when...', position: 'top', animation: 'typewriter', style: 'impact', startTime: 0, duration: 45, color: '#FFFFFF' },
        ],
        background: '#0f0f23',
        duration: 45,
      },
      {
        id: 'scene2',
        type: 'reaction',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'center', emotion: 'shocked', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'You realize what just happened', position: 'top', animation: 'bounce', style: 'impact', startTime: 0, duration: 45, color: '#FFFFFF' },
          { id: 'text2', text: '💀', position: 'middle', animation: 'pop', style: 'normal', startTime: 20, duration: 25, color: '#FFFFFF' },
        ],
        background: '#0f0f23',
        duration: 45,
        soundEffect: 'oof',
      },
    ],
  },
  {
    id: 'monday-mood',
    name: 'Monday Morning Mood',
    description: 'The struggle of waking up on Monday',
    thumbnail: '😴',
    variables: [],
    scenes: [
      {
        id: 'scene1',
        type: 'setup',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'center', emotion: 'sad', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'Sunday night:', position: 'top', animation: 'fadeIn', style: 'impact', startTime: 0, duration: 30, color: '#00FF00' },
          { id: 'text2', text: '"I\'ll wake up early and be productive!"', position: 'bottom', animation: 'typewriter', style: 'normal', startTime: 10, duration: 20, color: '#FFFFFF' },
        ],
        background: '#2c3e50',
        duration: 30,
      },
      {
        id: 'scene2',
        type: 'punchline',
        characters: [
          { id: 'char1', name: 'Me', role: 'protagonist', position: 'center', emotion: 'shocked', isTalking: false },
        ],
        texts: [
          { id: 'text1', text: 'Monday morning:', position: 'top', animation: 'shake', style: 'impact', startTime: 0, duration: 30, color: '#FF4444' },
          { id: 'text2', text: '*snooze alarm 47 times*', position: 'bottom', animation: 'pop', style: 'normal', startTime: 15, duration: 15, color: '#FFD700' },
        ],
        background: '#1a1a2e',
        duration: 30,
        soundEffect: 'alarm',
      },
    ],
  },
];

// Sound effect mappings (placeholders for actual audio)
export const SOUND_EFFECTS = {
  'vine-boom': { name: 'Vine Boom', duration: 1.5 },
  'sad-trombone': { name: 'Sad Trombone', duration: 2.0 },
  'oof': { name: 'Oof', duration: 0.5 },
  'alarm': { name: 'Alarm Clock', duration: 1.0 },
  'laugh-track': { name: 'Laugh Track', duration: 3.0 },
  'drum-roll': { name: 'Drum Roll', duration: 2.0 },
  'tick': { name: 'Tick Tock', duration: 0.3 },
  'snap': { name: 'Finger Snap', duration: 0.2 },
};

// Vertical video resolutions for Shorts
export const SHORTS_RESOLUTIONS = {
  '1080x1920': { width: 1080, height: 1920, label: 'Full HD (1080p)' },
  '720x1280': { width: 720, height: 1280, label: 'HD (720p)' },
  '480x854': { width: 480, height: 854, label: 'SD (480p)' },
  '576x1024': { width: 576, height: 1024, label: 'Square-ish' },
};
