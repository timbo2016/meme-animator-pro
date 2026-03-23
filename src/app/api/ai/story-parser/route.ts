import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

interface StoryScene {
  id: string;
  description: string;
  dialogue: { character: string; text: string; emotion: string }[];
  actions: { character: string; action: string; timing: number }[];
  mood: string;
  duration: number;
}

interface ParsedStory {
  title: string;
  scenes: StoryScene[];
  characters: { id: string; name: string; role: string }[];
  suggestedAnimations: { character: string; animation: string; frame: number }[];
  suggestedEffects: { type: string; frame: number; intensity: number }[];
}

export async function POST(request: NextRequest) {
  try {
    const { story } = await request.json();

    if (!story || typeof story !== 'string') {
      return NextResponse.json({ error: 'Story text is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are an expert animation director specializing in creating viral animated meme shorts. 
Parse the given story into structured animation data including:
- Scenes with descriptions and timing
- Character emotions and expressions
- Suggested animations for each character
- Camera effects and transitions
- Sound effect cues

Always respond with valid JSON in this exact format:
{
  "title": "string",
  "scenes": [
    {
      "id": "scene-1",
      "description": "string",
      "dialogue": [{ "character": "string", "text": "string", "emotion": "neutral|happy|sad|angry|surprised|scared|confused|excited|embarrassed|proud|thinking|love" }],
      "actions": [{ "character": "string", "action": "string", "timing": 0-1 }],
      "mood": "neutral|happy|sad|angry|surprised|scared|confused|excited|embarrassed|proud|thinking|love",
      "duration": number in seconds
    }
  ],
  "characters": [{ "id": "string", "name": "string", "role": "protagonist|antagonist|supporting|extra" }],
  "suggestedAnimations": [{ "character": "string", "animation": "idle|walk|run|jump|wave|talk|laugh|cry|surprised|angry|facepalm|shrug|epic_fail|savage|mic_drop|dance|punch|kick", "frame": number }],
  "suggestedEffects": [{ "type": "shake|zoom_punch|flash|impact|sparkles|speed_lines|hearts", "frame": number, "intensity": 0-1 }]
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Parse this meme story into animation data:\n\n${story}` }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      return NextResponse.json({ error: 'Failed to parse story' }, { status: 500 });
    }

    // Extract JSON from response
    let parsedStory: ParsedStory;
    try {
      // Try to parse directly
      parsedStory = JSON.parse(responseContent);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsedStory = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback to a basic structure
        parsedStory = {
          title: 'Untitled Story',
          scenes: [{
            id: 'scene-1',
            description: story.slice(0, 200),
            dialogue: [],
            actions: [],
            mood: 'neutral',
            duration: 5
          }],
          characters: [{ id: 'char-1', name: 'Character 1', role: 'protagonist' }],
          suggestedAnimations: [],
          suggestedEffects: []
        };
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: parsedStory 
    });

  } catch (error: any) {
    console.error('Story parser error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse story' },
      { status: 500 }
    );
  }
}
