/**
 * Video Export Service
 * Handles video encoding using FFmpeg
 * 
 * This service provides video encoding capabilities for the Stickman Story Animator.
 * It accepts frame data and encodes them into various video formats.
 */

import { serve } from 'bun';

// Types
interface ExportRequest {
  frames: string[]; // Base64 encoded PNG frames
  config: {
    width: number;
    height: number;
    fps: number;
    format: 'mp4' | 'webm' | 'gif';
    quality: number;
  };
}

interface ExportResponse {
  success: boolean;
  videoUrl?: string;
  error?: string;
}

// FFmpeg command builder
function buildFFmpegCommand(config: ExportRequest['config'], outputPath: string): string[] {
  const { width, height, fps, format, quality } = config;
  
  const baseCmd = [
    '-y', // Overwrite output
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', fps.toString(),
    '-i', '-', // Read from stdin
    '-s', `${width}x${height}`,
  ];

  switch (format) {
    case 'mp4':
      return [
        ...baseCmd,
        '-c:v', 'libx264',
        '-preset', quality > 80 ? 'slow' : quality > 50 ? 'medium' : 'fast',
        '-crf', Math.round(23 - (quality - 50) * 0.18).toString(),
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outputPath,
      ];
    case 'webm':
      return [
        ...baseCmd,
        '-c:v', 'libvpx-vp9',
        '-b:v', `${Math.round(quality * 30)}k`,
        '-pix_fmt', 'yuv420p',
        outputPath,
      ];
    case 'gif':
      return [
        ...baseCmd,
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        outputPath,
      ];
    default:
      return [...baseCmd, outputPath];
  }
}

// Check if FFmpeg is available
async function checkFFmpeg(): Promise<boolean> {
  try {
    const result = Bun.spawn(['ffmpeg', '-version'], { stdout: 'pipe', stderr: 'pipe' });
    const exitCode = await result.exited;
    return exitCode === 0;
  } catch {
    return false;
  }
}

// Process video export
async function processExport(request: ExportRequest): Promise<ExportResponse> {
  const { frames, config } = request;
  
  if (!frames || frames.length === 0) {
    return { success: false, error: 'No frames provided' };
  }

  // Check FFmpeg availability
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    return { 
      success: false, 
      error: 'FFmpeg is not installed. Please install FFmpeg to enable video export.' 
    };
  }

  const outputDir = '/home/z/my-project/download';
  const timestamp = Date.now();
  const outputPath = `${outputDir}/animation_${timestamp}.${config.format}`;

  try {
    // Build FFmpeg command
    const cmd = buildFFmpegCommand(config, outputPath);
    
    // Spawn FFmpeg process
    const ffmpeg = Bun.spawn(['ffmpeg', ...cmd.slice(1)], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
    });

    // Write frames to FFmpeg stdin
    for (const frame of frames) {
      // Decode base64 frame
      const base64Data = frame.replace(/^data:image\/png;base64,/, '');
      const frameBuffer = Buffer.from(base64Data, 'base64');
      
      const writer = ffmpeg.stdin.getWriter();
      await writer.write(frameBuffer);
      writer.releaseLock();
    }

    // Close stdin to signal end of input
    await ffmpeg.stdin.end();

    // Wait for FFmpeg to finish
    const exitCode = await ffmpeg.exited;

    if (exitCode !== 0) {
      const stderr = await new Response(ffmpeg.stderr).text();
      return { success: false, error: `FFmpeg error: ${stderr}` };
    }

    // Return success with video URL
    return {
      success: true,
      videoUrl: `/download/animation_${timestamp}.${config.format}`,
    };
  } catch (error) {
    console.error('Export error:', error);
    return { 
      success: false, 
      error: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Start the server
const PORT = 3031;

serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health') {
      const hasFFmpeg = await checkFFmpeg();
      return Response.json({ 
        status: 'ok', 
        ffmpeg: hasFFmpeg,
        service: 'video-export' 
      }, { headers: corsHeaders });
    }

    // Export endpoint
    if (url.pathname === '/export' && request.method === 'POST') {
      try {
        const body = await request.json() as ExportRequest;
        const result = await processExport(body);
        return Response.json(result, { headers: corsHeaders });
      } catch (error) {
        return Response.json(
          { success: false, error: 'Invalid request body' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Quick export with single frame (for testing)
    if (url.pathname === '/export/quick' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const frame = formData.get('frame') as string;
        const format = (formData.get('format') as string) || 'webm';
        const fps = parseInt(formData.get('fps') as string) || 30;
        
        // Create a simple test export
        const result = await processExport({
          frames: [frame],
          config: {
            width: 800,
            height: 450,
            fps,
            format: format as 'mp4' | 'webm' | 'gif',
            quality: 80,
          },
        });
        
        return Response.json(result, { headers: corsHeaders });
      } catch (error) {
        return Response.json(
          { success: false, error: 'Invalid request' },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  },
});

console.log(`Video Export Service running on port ${PORT}`);
console.log(`Health check: http://localhost:${PORT}/health`);
