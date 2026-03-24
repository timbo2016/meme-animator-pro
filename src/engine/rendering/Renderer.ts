// Renderer - Frame-by-frame rendering system for stickman animations

import { Scene, Background, RenderConfig, FrameData, RenderProgress, RenderStatus, Position } from '@/lib/types';
import { SceneManager, drawObject } from '../scene/SceneManager';
import { AnimationController, CharacterAnimationState } from '../animation/AnimationController';
import { StickmanRig } from '../animation/StickmanRig';

export class Renderer {
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private config: RenderConfig;
  private frameBuffer: FrameData[];
  private progress: RenderProgress;
  private isRendering: boolean;

  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.config = {
      width: 800,
      height: 600,
      fps: 30,
      quality: 'high',
      format: 'mp4',
    };
    this.frameBuffer = [];
    this.progress = {
      currentFrame: 0,
      totalFrames: 0,
      percentage: 0,
      status: 'idle',
    };
    this.isRendering = false;
  }

  /**
   * Initialize the renderer with a canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize(this.config.width, this.config.height);
  }

  /**
   * Resize the canvas
   */
  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.config.width = width;
      this.config.height = height;
    }
  }

  /**
   * Set render configuration
   */
  setConfig(config: Partial<RenderConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.width || config.height) {
      this.resize(config.width || this.config.width, config.height || this.config.height);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): RenderConfig {
    return { ...this.config };
  }

  /**
   * Clear the canvas
   */
  clearCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the background
   */
  private drawBackground(background: Background): void {
    if (!this.ctx || !this.canvas) return;

    if (background.type === 'color') {
      this.ctx.fillStyle = background.value as string;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (background.type === 'gradient') {
      const gradient = background.value as { type: string; colors: string[]; direction?: number };
      let grad: CanvasGradient;

      if (gradient.type === 'linear') {
        const angle = (gradient.direction || 180) * (Math.PI / 180);
        const x1 = this.canvas.width / 2 - Math.sin(angle) * this.canvas.height;
        const y1 = this.canvas.height / 2 - Math.cos(angle) * this.canvas.height;
        const x2 = this.canvas.width / 2 + Math.sin(angle) * this.canvas.height;
        const y2 = this.canvas.height / 2 + Math.cos(angle) * this.canvas.height;
        grad = this.ctx.createLinearGradient(x1, y1, x2, y2);
      } else {
        grad = this.ctx.createRadialGradient(
          this.canvas.width / 2,
          this.canvas.height / 2,
          0,
          this.canvas.width / 2,
          this.canvas.height / 2,
          this.canvas.width / 2
        );
      }

      gradient.colors.forEach((color, index) => {
        grad.addColorStop(index / (gradient.colors.length - 1), color);
      });

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Draw a stickman character
   */
  private drawStickman(state: CharacterAnimationState): void {
    if (!this.ctx) return;

    const { rig, position, facingRight } = state;
    const joints = rig.getAllJoints();

    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    
    if (!facingRight) {
      this.ctx.scale(-1, 1);
    }

    // Set line style
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Draw limbs
    this.drawLimb(joints, 'leftUpperArm', 'leftForearm', 'leftHand');
    this.drawLimb(joints, 'rightUpperArm', 'rightForearm', 'rightHand');
    this.drawLimb(joints, 'leftUpperLeg', 'leftLowerLeg', 'leftFoot');
    this.drawLimb(joints, 'rightUpperLeg', 'rightLowerLeg', 'rightFoot');

    // Draw spine
    this.drawBody(joints);

    // Draw head
    this.drawHead(joints);

    // Draw face
    this.drawFace(joints, state);

    this.ctx.restore();
  }

  /**
   * Draw a limb (arm or leg)
   */
  private drawLimb(joints: ReturnType<StickmanRig['getAllJoints']>, upper: string, lower: string, extremity: string): void {
    if (!this.ctx) return;

    const upperJoint = joints.find(j => j.name === upper);
    const lowerJoint = joints.find(j => j.name === lower);
    const extremityJoint = joints.find(j => j.name === extremity);

    if (!upperJoint || !lowerJoint) return;

    // Upper segment
    this.ctx.beginPath();
    this.ctx.moveTo(upperJoint.x, upperJoint.y);
    
    // Calculate end point using rotation
    const upperEndX = upperJoint.x + Math.sin((upperJoint.rotation * Math.PI) / 180) * upperJoint.length;
    const upperEndY = upperJoint.y + Math.cos((upperJoint.rotation * Math.PI) / 180) * upperJoint.length;
    this.ctx.lineTo(upperEndX, upperEndY);
    this.ctx.stroke();

    // Lower segment
    this.ctx.beginPath();
    this.ctx.moveTo(upperEndX, upperEndY);
    const lowerEndX = upperEndX + Math.sin(((upperJoint.rotation + lowerJoint.rotation) * Math.PI) / 180) * lowerJoint.length;
    const lowerEndY = upperEndY + Math.cos(((upperJoint.rotation + lowerJoint.rotation) * Math.PI) / 180) * lowerJoint.length;
    this.ctx.lineTo(lowerEndX, lowerEndY);
    this.ctx.stroke();

    // Draw joint circles
    this.ctx.fillStyle = '#555555';
    this.ctx.beginPath();
    this.ctx.arc(upperJoint.x, upperJoint.y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(upperEndX, upperEndY, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw the body (spine)
   */
  private drawBody(joints: ReturnType<StickmanRig['getAllJoints']>): void {
    if (!this.ctx) return;

    const spine = joints.find(j => j.name === 'spine');
    const neck = joints.find(j => j.name === 'neck');
    const hip = joints.find(j => j.name === 'hip');

    if (!spine || !neck || !hip) return;

    // Draw spine line
    this.ctx.beginPath();
    this.ctx.moveTo(hip.x, hip.y);
    this.ctx.lineTo(spine.x, spine.y);
    this.ctx.lineTo(neck.x, neck.y);
    this.ctx.stroke();

    // Draw shoulder line
    const leftShoulder = joints.find(j => j.name === 'leftShoulder');
    const rightShoulder = joints.find(j => j.name === 'rightShoulder');

    if (leftShoulder && rightShoulder) {
      this.ctx.beginPath();
      this.ctx.moveTo(leftShoulder.x, leftShoulder.y);
      this.ctx.lineTo(rightShoulder.x, rightShoulder.y);
      this.ctx.stroke();
    }

    // Draw hip line
    const leftUpperLeg = joints.find(j => j.name === 'leftUpperLeg');
    const rightUpperLeg = joints.find(j => j.name === 'rightUpperLeg');

    if (leftUpperLeg && rightUpperLeg) {
      this.ctx.beginPath();
      this.ctx.moveTo(leftUpperLeg.x, leftUpperLeg.y);
      this.ctx.lineTo(rightUpperLeg.x, rightUpperLeg.y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw the head
   */
  private drawHead(joints: ReturnType<StickmanRig['getAllJoints']>): void {
    if (!this.ctx) return;

    const head = joints.find(j => j.name === 'head');
    if (!head) return;

    const neck = joints.find(j => j.name === 'neck');
    const headY = neck ? neck.y - 25 : head.y;

    // Draw head circle
    this.ctx.beginPath();
    this.ctx.arc(0, headY, 20, 0, Math.PI * 2);
    this.ctx.fillStyle = '#FFE4C4';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  /**
   * Draw the face (eyes, mouth, expression)
   */
  private drawFace(joints: ReturnType<StickmanRig['getAllJoints']>, state: CharacterAnimationState): void {
    if (!this.ctx) return;

    const neck = joints.find(j => j.name === 'neck');
    const headY = neck ? neck.y - 25 : -60;

    // Eyes
    this.ctx.fillStyle = '#333333';
    this.ctx.beginPath();
    this.ctx.arc(-7, headY - 3, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(7, headY - 3, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Mouth based on current animation
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const animationName = state.currentAnimation?.name;
    if (animationName === 'talk') {
      // Talking mouth
      const mouthOpen = Math.sin(Date.now() / 100) * 2 + 2;
      this.ctx.ellipse(0, headY + 8, 5, mouthOpen, 0, 0, Math.PI * 2);
    } else if (animationName === 'jump') {
      // Excited open mouth
      this.ctx.arc(0, headY + 8, 6, 0, Math.PI, false);
    } else {
      // Normal mouth
      this.ctx.arc(0, headY + 6, 5, 0.1 * Math.PI, 0.9 * Math.PI, false);
    }
    this.ctx.stroke();
  }

  /**
   * Render a single frame
   */
  renderFrame(
    scene: Scene,
    characterStates: Map<string, CharacterAnimationState>
  ): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.clearCanvas();

    // Apply camera transform
    this.ctx.save();
    this.ctx.translate(
      -scene.camera.x * scene.camera.zoom + this.canvas.width / 2,
      -scene.camera.y * scene.camera.zoom + this.canvas.height / 2
    );
    this.ctx.scale(scene.camera.zoom, scene.camera.zoom);

    // Draw background
    this.drawBackground(scene.background);

    // Draw ground line
    this.ctx.strokeStyle = '#654321';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-1000, 520);
    this.ctx.lineTo(2000, 520);
    this.ctx.stroke();

    // Draw scene objects
    for (const object of scene.objects) {
      drawObject(this.ctx, object);
    }

    // Draw characters
    characterStates.forEach((state) => {
      this.drawStickman(state);
    });

    this.ctx.restore();
  }

  /**
   * Capture current frame to buffer
   */
  captureFrame(frameNumber: number): FrameData | null {
    if (!this.ctx || !this.canvas) return null;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const frameData: FrameData = {
      imageData,
      frameNumber,
      timestamp: Date.now(),
    };

    this.frameBuffer.push(frameData);
    return frameData;
  }

  /**
   * Get frame buffer
   */
  getFrameBuffer(): FrameData[] {
    return this.frameBuffer;
  }

  /**
   * Clear frame buffer
   */
  clearFrameBuffer(): void {
    this.frameBuffer = [];
  }

  /**
   * Get canvas as data URL
   */
  getDataURL(format: string = 'image/png'): string {
    if (!this.canvas) return '';
    return this.canvas.toDataURL(format);
  }

  /**
   * Get canvas as blob
   */
  async getBlob(format: string = 'image/png', quality: number = 0.9): Promise<Blob | null> {
    if (!this.canvas) return null;

    return new Promise((resolve) => {
      this.canvas!.toBlob(
        (blob) => resolve(blob),
        format,
        quality
      );
    });
  }

  /**
   * Get rendering progress
   */
  getProgress(): RenderProgress {
    return { ...this.progress };
  }

  /**
   * Update rendering progress
   */
  updateProgress(currentFrame: number, totalFrames: number, status: RenderStatus): void {
    this.progress = {
      currentFrame,
      totalFrames,
      percentage: Math.round((currentFrame / totalFrames) * 100),
      status,
    };
  }
}

// Singleton instance
export const renderer = new Renderer();
