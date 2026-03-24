// Stickman Meme Animator - Camera System
// Meme-style camera effects: zoom, shake, quick cuts

import { CameraState, CameraEffect, Position } from '../types';

export class CameraController {
  private state: CameraState = {
    zoom: 1,
    pan: { x: 0, y: 0 },
    rotation: 0,
    shake: 0,
    effect: 'none',
    effectIntensity: 1,
  };

  private targetState: CameraState = { ...this.state };
  private transitionDuration: number = 0;
  private transitionProgress: number = 0;
  private shakeOffset: Position = { x: 0, y: 0 };
  private shakeTime: number = 0;

  // Get current camera state
  getState(): CameraState {
    return { ...this.state };
  }

  // Set camera zoom with optional transition
  setZoom(zoom: number, transition: boolean = true): void {
    this.targetState.zoom = Math.max(0.5, Math.min(5, zoom));
    if (!transition) {
      this.state.zoom = this.targetState.zoom;
    }
  }

  // Set camera pan with optional transition
  setPan(pan: Position, transition: boolean = true): void {
    this.targetState.pan = { ...pan };
    if (!transition) {
      this.state.pan = { ...pan };
    }
  }

  // Sudden zoom in (meme style)
  zoomIn(intensity: number = 2, instant: boolean = false): void {
    this.state.effect = 'zoom_in';
    this.state.effectIntensity = intensity;
    this.targetState.zoom = intensity;
    
    if (instant) {
      this.state.zoom = intensity;
    } else {
      this.transitionDuration = 100; // Very fast zoom (100ms)
      this.transitionProgress = 0;
    }
  }

  // Zoom out
  zoomOut(intensity: number = 1, instant: boolean = false): void {
    this.state.effect = 'zoom_out';
    this.targetState.zoom = intensity;
    
    if (instant) {
      this.state.zoom = intensity;
    } else {
      this.transitionDuration = 200;
      this.transitionProgress = 0;
    }
  }

  // Screen shake effect
  shake(intensity: number = 10, duration: number = 500): void {
    this.state.effect = 'shake';
    this.state.shake = intensity;
    this.shakeTime = duration;
  }

  // Quick cut effect (instant transition)
  quickCut(): void {
    this.state.effect = 'quick_cut';
    // Flash effect handled by renderer
  }

  // Pulse effect
  pulse(intensity: number = 1.2): void {
    this.state.effect = 'pulse';
    this.state.effectIntensity = intensity;
    this.targetState.zoom = intensity;
    this.transitionDuration = 150;
    this.transitionProgress = 0;
  }

  // Rotate effect
  rotate(degrees: number): void {
    this.state.effect = 'rotate';
    this.targetState.rotation = degrees;
  }

  // Reset camera to default
  reset(instant: boolean = false): void {
    this.targetState = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      rotation: 0,
      shake: 0,
      effect: 'none',
      effectIntensity: 1,
    };
    
    if (instant) {
      this.state = { ...this.targetState };
    } else {
      this.transitionDuration = 300;
      this.transitionProgress = 0;
    }
  }

  // Focus on a specific position
  focusOn(target: Position, zoom: number = 1.5): void {
    this.targetState.pan = {
      x: -target.x * (zoom - 1),
      y: -target.y * (zoom - 1),
    };
    this.targetState.zoom = zoom;
    this.transitionDuration = 200;
    this.transitionProgress = 0;
  }

  // Dramatic zoom to face (meme classic)
  dramaticZoom(target: Position, intensity: number = 3): void {
    this.focusOn(target, intensity);
    this.state.effect = 'zoom_in';
    this.transitionDuration = 50; // Very fast for dramatic effect
  }

  // Update camera state
  update(deltaTime: number): void {
    // Update shake
    if (this.state.shake > 0 && this.shakeTime > 0) {
      this.shakeTime -= deltaTime;
      const intensity = this.state.shake * (this.shakeTime / 500); // Fade out
      this.shakeOffset = {
        x: (Math.random() - 0.5) * intensity * 2,
        y: (Math.random() - 0.5) * intensity * 2,
      };
      
      if (this.shakeTime <= 0) {
        this.state.shake = 0;
        this.shakeOffset = { x: 0, y: 0 };
      }
    }

    // Update transitions
    if (this.transitionDuration > 0) {
      this.transitionProgress += deltaTime;
      const t = Math.min(1, this.transitionProgress / this.transitionDuration);
      
      // Use easeOut for smooth deceleration
      const eased = this.easeOutBack(t);
      
      this.state.zoom = this.lerp(this.state.zoom, this.targetState.zoom, eased);
      this.state.pan.x = this.lerp(this.state.pan.x, this.targetState.pan.x, eased);
      this.state.pan.y = this.lerp(this.state.pan.y, this.targetState.pan.y, eased);
      this.state.rotation = this.lerp(this.state.rotation, this.targetState.rotation, eased);
      
      if (t >= 1) {
        this.transitionDuration = 0;
        this.state.zoom = this.targetState.zoom;
        this.state.pan = { ...this.targetState.pan };
        this.state.rotation = this.targetState.rotation;
      }
    }
  }

  // Apply camera transform to canvas context
  applyTransform(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    ctx.translate(centerX, centerY);
    ctx.translate(this.shakeOffset.x, this.shakeOffset.y);
    ctx.scale(this.state.zoom, this.state.zoom);
    ctx.rotate((this.state.rotation * Math.PI) / 180);
    ctx.translate(-centerX + this.state.pan.x, -centerY + this.state.pan.y);
  }

  // Get shake offset for external use
  getShakeOffset(): Position {
    return { ...this.shakeOffset };
  }

  // Check if camera is currently transitioning
  isTransitioning(): boolean {
    return this.transitionDuration > 0;
  }

  // Helper functions
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}

// Preset camera animations for meme moments
export const CAMERA_PRESETS = {
  shocked: {
    zoom: 2.5,
    duration: 50,
    shake: 5,
  },
  dramatic: {
    zoom: 3,
    duration: 100,
    shake: 0,
  },
  punchline: {
    zoom: 2,
    duration: 30,
    shake: 10,
  },
  reaction: {
    zoom: 1.5,
    duration: 150,
    shake: 3,
  },
  impact: {
    zoom: 1.3,
    duration: 50,
    shake: 15,
  },
};

// Export singleton
export const cameraController = new CameraController();
