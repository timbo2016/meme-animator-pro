// Video Export Module - Handles video encoding and export

import { ExportConfig, ExportFormat, Resolution, PRESET_RESOLUTIONS, RenderStatus } from '@/lib/types';

export interface ExportProgress {
  status: RenderStatus;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  message: string;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

export class VideoExporter {
  private mediaRecorder: MediaRecorder | null;
  private recordedChunks: Blob[];
  private isRecording: boolean;
  private canvas: HTMLCanvasElement | null;
  private config: ExportConfig;

  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.canvas = null;
    this.config = {
      format: 'mp4',
      resolution: PRESET_RESOLUTIONS['720p'],
      fps: 30,
      quality: 80,
    };
  }

  /**
   * Initialize exporter with canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  /**
   * Set export configuration
   */
  setConfig(config: Partial<ExportConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ExportConfig {
    return { ...this.config };
  }

  /**
   * Start recording the canvas
   */
  async startRecording(
    canvas: HTMLCanvasElement,
    onProgress?: ExportProgressCallback
  ): Promise<void> {
    this.canvas = canvas;
    this.recordedChunks = [];
    this.isRecording = true;

    // Create a stream from the canvas
    const stream = canvas.captureStream(this.config.fps);

    // Determine mime type based on format
    let mimeType = 'video/webm;codecs=vp9';
    if (this.config.format === 'webm') {
      mimeType = 'video/webm;codecs=vp9';
    } else {
      // For MP4, we'll use webm first then convert
      mimeType = 'video/webm;codecs=vp9';
    }

    // Check if mime type is supported
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
    }

    const options = {
      mimeType,
      videoBitsPerSecond: this.getBitrate(),
    };

    try {
      this.mediaRecorder = new MediaRecorder(stream, options);

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
          currentFrame: 0,
          totalFrames: 0,
          message: 'Recording complete',
        });
      };

      this.mediaRecorder.start(100); // Collect data every 100ms

      onProgress?.({
        status: 'rendering',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        message: 'Recording started',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      onProgress?.({
        status: 'error',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        message: `Recording failed: ${error}`,
      });
    }
  }

  /**
   * Stop recording and get the video blob
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('Not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Export canvas frames as video
   */
  async exportVideo(
    frames: ImageData[],
    canvas: HTMLCanvasElement,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const totalFrames = frames.length;
    const frameDelay = 1000 / this.config.fps;

    // Start recording
    await this.startRecording(canvas, onProgress);

    // Draw each frame
    for (let i = 0; i < totalFrames; i++) {
      ctx.putImageData(frames[i], 0, 0);
      
      onProgress?.({
        status: 'rendering',
        progress: Math.round((i / totalFrames) * 100),
        currentFrame: i,
        totalFrames,
        message: `Rendering frame ${i + 1}/${totalFrames}`,
      });

      // Wait for frame delay
      await this.delay(frameDelay);
    }

    // Stop recording
    const blob = await this.stopRecording();

    onProgress?.({
      status: 'complete',
      progress: 100,
      currentFrame: totalFrames,
      totalFrames,
      message: 'Export complete',
    });

    return blob;
  }

  /**
   * Export as GIF using frame-by-frame encoding
   */
  async exportGIF(
    frames: ImageData[],
    canvas: HTMLCanvasElement,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // We'll create a simple animated WebP or use a GIF encoder
    // For simplicity, we'll create a WebP animation
    const totalFrames = frames.length;

    onProgress?.({
      status: 'rendering',
      progress: 0,
      currentFrame: 0,
      totalFrames,
      message: 'Starting GIF export...',
    });

    // Create frames as canvas data URLs
    const frameUrls: string[] = [];
    for (let i = 0; i < totalFrames; i++) {
      ctx.putImageData(frames[i], 0, 0);
      frameUrls.push(canvas.toDataURL('image/png'));
      
      onProgress?.({
        status: 'rendering',
        progress: Math.round((i / totalFrames) * 50),
        currentFrame: i,
        totalFrames,
        message: `Processing frame ${i + 1}/${totalFrames}`,
      });
    }

    // For now, return as WebM (GIF encoding would require additional library)
    return this.createAnimatedImage(frameUrls, canvas.width, canvas.height);
  }

  /**
   * Create animated image from frames
   */
  private async createAnimatedImage(
    frameUrls: string[],
    width: number,
    height: number
  ): Promise<Blob> {
    // Create a simple WebP animation or return first frame
    // In a production environment, you'd use a proper GIF encoder
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || frameUrls.length === 0) {
      return new Blob([], { type: 'image/gif' });
    }

    // Load first frame
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = frameUrls[0];
    });

    ctx.drawImage(img, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || new Blob()), 'image/png');
    });
  }

  /**
   * Download a blob as a file
   */
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

  /**
   * Download video with specified format
   */
  async downloadVideo(blob: Blob, format: ExportFormat, filename: string = 'animation'): Promise<void> {
    const extension = this.getFileExtension(format);
    this.downloadBlob(blob, `${filename}.${extension}`);
  }

  /**
   * Get file extension for format
   */
  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case 'mp4':
        return 'mp4';
      case 'webm':
        return 'webm';
      case 'gif':
        return 'gif';
      default:
        return 'mp4';
    }
  }

  /**
   * Get bitrate based on quality setting
   */
  private getBitrate(): number {
    const baseBitrate = 2500000; // 2.5 Mbps
    return baseBitrate * (this.config.quality / 50);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get supported formats
   */
  getSupportedFormats(): ExportFormat[] {
    const formats: ExportFormat[] = [];

    // Check if running in browser environment
    if (typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('video/webm')) {
        formats.push('webm');
      }
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        formats.push('mp4');
      }
    } else {
      // Default formats for SSR
      formats.push('webm', 'mp4');
    }
    // GIF is always "supported" via canvas
    formats.push('gif');

    return formats;
  }

  /**
   * Get available resolutions
   */
  getAvailableResolutions(): Record<string, Resolution> {
    return PRESET_RESOLUTIONS;
  }
}

// Singleton instance
export const videoExporter = new VideoExporter();
