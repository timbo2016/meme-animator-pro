import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'default', speed = 1 } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Return instructions for client-side TTS using Web Speech API
    // This is more reliable than server-side TTS for browser apps
    return NextResponse.json({ 
      success: true, 
      useBrowserTTS: true,
      text: text,
      voice: voice,
      speed: speed,
      message: 'Use browser Web Speech API for TTS'
    });

  } catch (error: any) {
    console.error('TTS error:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'TTS generation failed',
      fallback: true
    }, { status: 500 });
  }
}

// Voice options endpoint
export async function GET() {
  const voices = [
    { id: 'male-deep', name: 'Deep Male', gender: 'male', description: 'Deep, authoritative voice' },
    { id: 'male-casual', name: 'Casual Male', gender: 'male', description: 'Friendly, casual voice' },
    { id: 'male-excited', name: 'Excited Male', gender: 'male', description: 'Energetic, excited voice' },
    { id: 'female-soft', name: 'Soft Female', gender: 'female', description: 'Gentle, soft voice' },
    { id: 'female-energetic', name: 'Energetic Female', gender: 'female', description: 'Upbeat, energetic voice' },
    { id: 'child', name: 'Child', gender: 'child', description: 'Young, playful voice' },
    { id: 'narrator', name: 'Narrator', gender: 'neutral', description: 'Professional narration voice' },
  ];

  return NextResponse.json({ voices });
}
