import { NextRequest, NextResponse } from 'next/server';

// Pre-built meme templates - no database needed
const MEME_TEMPLATES = [
  {
    id: 'bruh-moment',
    name: 'Bruh Moment',
    category: 'reaction',
    description: 'Classic bruh reaction when something stupid happens',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'confused' }],
      animations: [
        { character: 'char-1', animation: 'facepalm', frame: 0 },
      ],
      effects: [
        { type: 'flash', frame: 0, intensity: 0.5 },
      ],
      text: [{ text: 'bruh', position: 'top', animation: 'pop', frame: 15 }],
      duration: 60,
    }),
  },
  {
    id: 'epic-fail',
    name: 'Epic Fail',
    category: 'fail',
    description: 'When something goes hilariously wrong',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'embarrassed' }],
      animations: [
        { character: 'char-1', animation: 'epic_fail', frame: 0 },
      ],
      effects: [
        { type: 'shake', frame: 10, intensity: 0.8 },
      ],
      text: [{ text: 'EPIC FAIL', position: 'center', animation: 'bounce', frame: 20 }],
      duration: 90,
    }),
  },
  {
    id: 'savage-response',
    name: 'Savage Response',
    category: 'reaction',
    description: 'Dropping a savage comeback',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'proud' }],
      animations: [
        { character: 'char-1', animation: 'savage', frame: 0 },
        { character: 'char-1', animation: 'mic_drop', frame: 30 },
      ],
      effects: [
        { type: 'sparkles', frame: 30, intensity: 0.7 },
      ],
      text: [{ text: 'SAVAGE', position: 'bottom', animation: 'pop', frame: 40 }],
      duration: 75,
    }),
  },
  {
    id: 'confused-math',
    name: 'Confused Math Lady',
    category: 'confused',
    description: 'Trying to understand something complicated',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'confused' }],
      animations: [
        { character: 'char-1', animation: 'thinking', frame: 0 },
        { character: 'char-1', animation: 'confused', frame: 30 },
      ],
      effects: [
        { type: 'zoom_punch', frame: 45, intensity: 0.3 },
      ],
      text: [],
      duration: 90,
    }),
  },
  {
    id: 'sad-realization',
    name: 'Sad Realization',
    category: 'sad',
    description: 'When reality hits hard',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'sad' }],
      animations: [
        { character: 'char-1', animation: 'cry', frame: 0 },
      ],
      effects: [
        { type: 'flash', frame: 0, intensity: 0.2 },
      ],
      text: [],
      duration: 120,
    }),
  },
  {
    id: 'happy-dance',
    name: 'Happy Dance',
    category: 'happy',
    description: 'Celebration dance moment',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'excited' }],
      animations: [
        { character: 'char-1', animation: 'dance', frame: 0 },
      ],
      effects: [
        { type: 'sparkles', frame: 10, intensity: 0.6 },
        { type: 'hearts', frame: 30, intensity: 0.5 },
      ],
      text: [{ text: 'YEAAAH!', position: 'top', animation: 'bounce', frame: 0 }],
      duration: 90,
    }),
  },
  {
    id: 'surprised-shock',
    name: 'Shocked Face',
    category: 'reaction',
    description: 'Unexpected plot twist reaction',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'surprised' }],
      animations: [
        { character: 'char-1', animation: 'surprised', frame: 0 },
      ],
      effects: [
        { type: 'flash', frame: 0, intensity: 0.8 },
        { type: 'shake', frame: 5, intensity: 0.5 },
      ],
      text: [],
      duration: 60,
    }),
  },
  {
    id: 'angry-rage',
    name: 'Angry Rage',
    category: 'angry',
    description: 'Losing your cool',
    thumbnail: null,
    data: JSON.stringify({
      characters: [{ id: 'char-1', name: 'Character', mood: 'angry' }],
      animations: [
        { character: 'char-1', animation: 'angry', frame: 0 },
      ],
      effects: [
        { type: 'shake', frame: 0, intensity: 0.9 },
        { type: 'impact', frame: 15, intensity: 0.8 },
      ],
      text: [],
      duration: 75,
    }),
  },
];

// Get all templates (no database - works on Vercel)
export async function GET() {
  return NextResponse.json({ templates: MEME_TEMPLATES });
}

// Create a new template (not available on serverless)
export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Template creation not available on serverless deployment',
    templates: MEME_TEMPLATES 
  });
}

// Delete a user template (not available on serverless)
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Template deletion not available on serverless deployment' 
  });
}
