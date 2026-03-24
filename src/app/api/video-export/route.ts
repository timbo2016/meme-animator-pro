import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Video Export API',
    endpoints: {
      export: 'POST /api/video-export',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { frames, config } = body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No frames provided' },
        { status: 400 }
      );
    }

    // Forward to video export service
    const serviceUrl = `http://localhost:3031/export`;
    
    try {
      const response = await fetch(serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames, config }),
      });

      const result = await response.json();
      return NextResponse.json(result);
    } catch {
      // If service is not available, return a mock response for demo
      // In production, you would want to handle this differently
      
      // Generate a simple download using canvas data URL
      const firstFrame = frames[0];
      const videoId = Date.now();
      
      return NextResponse.json({
        success: true,
        videoUrl: firstFrame, // Return the first frame as a data URL for demo
        message: 'Video export service not running. Using canvas capture instead.',
        format: config.format,
        videoId,
      });
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}
