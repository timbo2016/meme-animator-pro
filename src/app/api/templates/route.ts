import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Pre-built meme templates
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

// Get all templates (including pre-built ones)
export async function GET() {
  try {
    // Get user templates from database
    const userTemplates = await db.userTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Combine pre-built templates with user templates
    const allTemplates = [...MEME_TEMPLATES, ...userTemplates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description || '',
      thumbnail: t.thumbnail,
      data: t.data,
      isUserCreated: true,
    }))];

    return NextResponse.json({ templates: allTemplates });
  } catch (error: any) {
    console.error('Get templates error:', error);
    // Return pre-built templates even if database fails
    return NextResponse.json({ templates: MEME_TEMPLATES });
  }
}

// Create a new template
export async function POST(request: NextRequest) {
  try {
    const { name, category, description, data, thumbnail, isPublic } = await request.json();

    if (!name || !data) {
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }

    const template = await db.userTemplate.create({
      data: {
        name,
        category: category || 'custom',
        description,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        thumbnail,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a user template
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await db.userTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
