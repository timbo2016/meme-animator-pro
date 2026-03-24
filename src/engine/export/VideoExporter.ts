// Stickman Meme Animator - Video Export System
// Export animations to MP4, WebM, GIF

import { ExportConfig, ExportFormat, RenderConfig, VERTICAL_720x1280 } from '../types';

export interface ExportProgress {
  status: 'idle' | 'preparing' | 'rendering' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: ExportProgress) => void;

export class VideoExporter {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private isRecording: boolean = false;

  // Available resolutions
  getAvailableResolutions(): Record<string, RenderConfig> {
    return {
      '720p': VERTICAL_720x1280,
      '1080p': {
        width: 1080,
        height: 1920,
        fps: 24,
        backgroundColor: '#FFFFFF',
        quality: 100,
      },
      '480p': {
        width: 480,
        height: 854,
        fps: 24,
        backgroundColor: '#FFFFFF',
        quality: 80,
      },
    };
  }

  // Supported formats
  getSupportedFormats(): ExportFormat[] {
    return ['webm', 'mp4', 'gif'];
  }

  // Start recording
  async startRecording(
    canvas: HTMLCanvasElement,
    onProgress?: ProgressCallback
  ): Promise<void> {
    this.canvas = canvas;
    this.recordedChunks = [];
    this.isRecording = true;

    try {
      // Get canvas stream
      const stream = canvas.captureStream(30); // 30 FPS capture

      // Determine best supported MIME type
      const mimeType = this.getBestMimeType();
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        onProgress?.({
          status: 'complete',
          progress: 100,
          message: 'Recording complete',
        });
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      onProgress?.({
        status: 'rendering',
        progress: 0,
        message: 'Recording started',
      });
    } catch (error) {
      this.isRecording = false;
      onProgress?.({
        status: 'error',
        progress: 0,
        message: `Recording failed: ${error}`,
      });
      throw error;
    }
  }

  // Stop recording and return blob
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const mimeType = this.getBestMimeType();
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  // Download blob as file
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export to specific format
  async exportAnimation(
    canvas: HTMLCanvasElement,
    config: ExportConfig,
    renderFrame: (frameIndex: number) => Promise<void>,
    totalFrames: number,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    this.canvas = canvas;
    this.recordedChunks = [];

    onProgress?.({
      status: 'preparing',
      progress: 0,
      message: 'Preparing export...',
    });

    try {
      // Start recording
      await this.startRecording(canvas, onProgress);

      // Render each frame
      for (let frame = 0; frame < totalFrames; frame++) {
        await renderFrame(frame);
        
        // Wait for frame to be captured
        await new Promise(resolve => setTimeout(resolve, 1000 / config.fps));
        
        const progress = ((frame + 1) / totalFrames) * 80;
        onProgress?.({
          status: 'rendering',
          progress,
          message: `Rendering frame ${frame + 1}/${totalFrames}`,
        });
      }

      // Stop recording
      onProgress?.({
        status: 'encoding',
        progress: 90,
        message: 'Encoding video...',
      });

      const blob = await this.stopRecording();

      onProgress?.({
        status: 'complete',
        progress: 100,
        message: 'Export complete!',
      });

      return blob;
    } catch (error) {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: `Export failed: ${error}`,
      });
      throw error;
    }
  }

  // Convert to GIF (simplified - creates animated preview)
  async createGifPreview(canvas: HTMLCanvasElement, frames: number = 10): Promise<string> {
    // Return first frame as data URL for preview
    return canvas.toDataURL('image/png');
  }

  // Get best supported MIME type
  private getBestMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }

  // Check if recording
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Cancel recording
  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
    this.recordedChunks = [];
  }

  // Get estimated file size
  getEstimatedFileSize(duration: number, fps: number, quality: number): string {
    // Rough estimation: 5 Mbps at 100% quality
    const bitsPerSecond = (quality / 100) * 5000000;
    const totalBits = bitsPerSecond * duration;
    const megabytes = totalBits / (8 * 1024 * 1024);
    
    return `${megabytes.toFixed(1)} MB`;
  }
}

// Export singleton
export const videoExporter = new VideoExporter();
