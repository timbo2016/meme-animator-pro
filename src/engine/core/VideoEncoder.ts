// Rico-Style Stickman Animation Engine
// Video Export System - Frame Capture and FFmpeg Encoding

import { ExportConfig, ExportFormat, RENDER_CONFIG } from './types';

// ==================== FRAME CAPTURE ====================

export interface CapturedFrame {
  index: number;
  dataUrl: string;
  blob?: Blob;
}

export class FrameCapture {
  private frames: CapturedFrame[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private isCapturing: boolean = false;
  
  constructor() {}
  
  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }
  
  captureFrame(index: number): CapturedFrame | null {
    if (!this.canvas) return null;
    
    const dataUrl = this.canvas.toDataURL('image/png');
    const frame: CapturedFrame = {
      index,
      dataUrl,
    };
    
    this.frames.push(frame);
    return frame;
  }
  
  async captureFrameBlob(index: number): Promise<CapturedFrame | null> {
    if (!this.canvas) return null;
    
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => {
        if (blob) {
          const frame: CapturedFrame = {
            index,
            dataUrl: '',
            blob,
          };
          this.frames.push(frame);
          resolve(frame);
        } else {
          resolve(null);
        }
      }, 'image/png');
    });
  }
  
  getFrames(): CapturedFrame[] {
    return this.frames;
  }
  
  getFrame(index: number): CapturedFrame | undefined {
    return this.frames.find(f => f.index === index);
  }
  
  clearFrames(): void {
    this.frames = [];
  }
  
  getFrameCount(): number {
    return this.frames.length;
  }
}

// ==================== VIDEO ENCODER ====================

export interface EncodingProgress {
  phase: 'capturing' | 'encoding' | 'complete' | 'error';
  progress: number;
  currentFrame: number;
  totalFrames: number;
  message: string;
}

export type ProgressCallback = (progress: EncodingProgress) => void;

export class VideoEncoder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private frameCapture: FrameCapture;
  private isRecording: boolean = false;
  
  constructor() {
    this.frameCapture = new FrameCapture();
  }
  
  // Get supported resolutions
  getResolutions(): Record<string, { width: number; height: number }> {
    return {
      '720p': { width: 720, height: 1280 },
      '1080p': { width: 1080, height: 1920 },
      '480p': { width: 480, height: 854 },
    };
  }
  
  // Get supported formats
  getFormats(): ExportFormat[] {
    return ['webm', 'mp4', 'gif'];
  }
  
  // Set canvas for capture
  setCanvas(canvas: HTMLCanvasElement): void {
    this.frameCapture.setCanvas(canvas);
  }
  
  // Start recording
  async startRecording(canvas: HTMLCanvasElement, onProgress?: ProgressCallback): Promise<void> {
    this.recordedChunks = [];
    this.isRecording = true;
    this.frameCapture.setCanvas(canvas);
    
    try {
      const stream = canvas.captureStream(24);
      const mimeType = this.getBestMimeType();
      
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        onProgress?.({
          phase: 'complete',
          progress: 100,
          currentFrame: 0,
          totalFrames: 0,
          message: 'Recording complete',
        });
      };
      
      this.mediaRecorder.start(100);
      
      onProgress?.({
        phase: 'capturing',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        message: 'Recording started',
      });
    } catch (error) {
      this.isRecording = false;
      onProgress?.({
        phase: 'error',
        progress: 0,
        currentFrame: 0,
        totalFrames: 0,
        message: `Recording failed: ${error}`,
      });
      throw error;
    }
  }
  
  // Stop recording and get blob
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
  
  // Download blob
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
  
  // Full export workflow
  async exportAnimation(
    canvas: HTMLCanvasElement,
    config: ExportConfig,
    totalFrames: number,
    renderFrame: (frameIndex: number) => Promise<void>,
    onProgress?: ProgressCallback
  ): Promise<Blob> {
    this.recordedChunks = [];
    this.frameCapture.setCanvas(canvas);
    
    // Phase 1: Start recording
    onProgress?.({
      phase: 'capturing',
      progress: 0,
      currentFrame: 0,
      totalFrames,
      message: 'Starting capture...',
    });
    
    await this.startRecording(canvas, onProgress);
    
    // Phase 2: Render and capture frames
    for (let frame = 0; frame < totalFrames; frame++) {
      await renderFrame(frame);
      
      // Wait for frame to be captured
      await new Promise(resolve => setTimeout(resolve, 1000 / config.fps));
      
      const progress = ((frame + 1) / totalFrames) * 80;
      onProgress?.({
        phase: 'capturing',
        progress,
        currentFrame: frame + 1,
        totalFrames,
        message: `Capturing frame ${frame + 1}/${totalFrames}`,
      });
    }
    
    // Phase 3: Stop recording
    onProgress?.({
      phase: 'encoding',
      progress: 90,
      currentFrame: totalFrames,
      totalFrames,
      message: 'Encoding video...',
    });
    
    const blob = await this.stopRecording();
    
    onProgress?.({
      phase: 'complete',
      progress: 100,
      currentFrame: totalFrames,
      totalFrames,
      message: 'Export complete!',
    });
    
    return blob;
  }
  
  // Quick export
  async quickExport(
    canvas: HTMLCanvasElement,
    format: ExportFormat = 'webm',
    duration: number = 5000
  ): Promise<Blob> {
    await this.startRecording(canvas);
    await new Promise(resolve => setTimeout(resolve, duration));
    return this.stopRecording();
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
    this.frameCapture.clearFrames();
  }
  
  // Estimate file size
  estimateFileSize(duration: number, fps: number, quality: number): string {
    const bitsPerSecond = (quality / 100) * 5000000;
    const totalBits = bitsPerSecond * duration;
    const megabytes = totalBits / (8 * 1024 * 1024);
    return `${megabytes.toFixed(1)} MB`;
  }
}

// ==================== GIF ENCODER (Simple implementation) ====================

export class GIFEncoder {
  private frames: string[] = [];
  private delays: number[] = [];
  
  addFrame(dataUrl: string, delay: number = 100): void {
    this.frames.push(dataUrl);
    this.delays.push(delay);
  }
  
  clear(): void {
    this.frames = [];
    this.delays = [];
  }
  
  // For now, return the first frame as PNG
  // Full GIF encoding would require a library like gif.js
  async encode(): Promise<Blob> {
    if (this.frames.length === 0) {
      throw new Error('No frames to encode');
    }
    
    // Convert first frame to blob
    const response = await fetch(this.frames[0]);
    return response.blob();
  }
}

// ==================== EXPORT UTILITIES ====================

export function getExportConfig(format: ExportFormat, quality: number = 80): ExportConfig {
  const resolution = quality >= 80 ? RENDER_CONFIG.VERTICAL_720 : RENDER_CONFIG.VERTICAL_480;
  
  return {
    format,
    resolution: { ...resolution, quality },
    fps: resolution.fps,
    quality,
    includeSound: true,
  };
}

export function generateFilename(format: ExportFormat): string {
  const timestamp = Date.now();
  const extension = format === 'webm' ? 'webm' : format === 'mp4' ? 'mp4' : 'gif';
  return `meme_animation_${timestamp}.${extension}`;
}

// Export singletons
export const frameCapture = new FrameCapture();
export const videoEncoder = new VideoEncoder();
export const gifEncoder = new GIFEncoder();
