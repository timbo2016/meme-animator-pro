// Rico-Style Stickman Animation Engine
// Camera Engine - Zoom, Pan, Shake Effects

import { CameraState, CameraInstruction, Position } from './types';
import { Easing, lerp } from './RigSystem';

// ==================== CAMERA STATE ====================

export function createDefaultCameraState(): CameraState {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    shake: 0,
  };
}

// ==================== CAMERA EFFECTS ====================

export function applyCameraInstruction(
  state: CameraState,
  instruction: CameraInstruction,
  currentFrame: number,
  fps: number
): CameraState {
  const { type, startFrame, endFrame, params } = instruction;
  const relativeFrame = currentFrame - startFrame;
  const duration = endFrame - startFrame;
  const progress = Math.min(1, Math.max(0, relativeFrame / duration));
  
  switch (type) {
    case 'zoom':
      return applyZoom(state, params, progress);
    
    case 'pan':
      return applyPan(state, params, progress);
    
    case 'shake':
      return applyShake(state, params, relativeFrame, fps);
    
    case 'hold':
      return { ...state };
    
    case 'cut':
      return applyCut(state, params);
    
    default:
      return state;
  }
}

function applyZoom(
  state: CameraState,
  params: { zoom?: number; targetZoom?: number },
  progress: number
): CameraState {
  const { zoom = 1, targetZoom = 1.5 } = params;
  const eased = Easing.easeOut(progress);
  
  return {
    ...state,
    zoom: lerp(zoom, targetZoom, eased),
  };
}

function applyPan(
  state: CameraState,
  params: { panX?: number; panY?: number },
  progress: number
): CameraState {
  const { panX = 0, panY = 0 } = params;
  const eased = Easing.easeInOut(progress);
  
  return {
    ...state,
    panX: lerp(state.panX, panX, eased),
    panY: lerp(state.panY, panY, eased),
  };
}

function applyShake(
  state: CameraState,
  params: { shakeIntensity?: number },
  frame: number,
  fps: number
): CameraState {
  const intensity = params.shakeIntensity || 10;
  const time = frame / fps;
  
  // Random shake with decay
  const decay = Math.max(0, 1 - frame / 30);
  const shakeX = (Math.random() - 0.5) * intensity * decay * 2;
  const shakeY = (Math.random() - 0.5) * intensity * decay * 2;
  
  return {
    ...state,
    panX: state.panX + shakeX,
    panY: state.panY + shakeY,
    shake: intensity * decay,
  };
}

function applyCut(
  state: CameraState,
  params: { zoom?: number; panX?: number; panY?: number }
): CameraState {
  return {
    ...state,
    zoom: params.zoom ?? state.zoom,
    panX: params.panX ?? state.panX,
    panY: params.panY ?? state.panY,
  };
}

// ==================== PREDEFINED CAMERA MOVES ====================

export function createDramaticZoom(target: Position, duration: number = 12): CameraInstruction {
  return {
    type: 'zoom',
    startFrame: 0,
    endFrame: duration,
    params: {
      zoom: 1,
      targetZoom: 2.5,
    },
  };
}

export function createShake(intensity: number = 15, duration: number = 6): CameraInstruction {
  return {
    type: 'shake',
    startFrame: 0,
    endFrame: duration,
    params: {
      shakeIntensity: intensity,
    },
  };
}

export function createPan(targetX: number, targetY: number, duration: number = 24): CameraInstruction {
  return {
    type: 'pan',
    startFrame: 0,
    endFrame: duration,
    params: {
      panX: targetX,
      panY: targetY,
    },
  };
}

export function createCut(zoom?: number, panX?: number, panY?: number): CameraInstruction {
  return {
    type: 'cut',
    startFrame: 0,
    endFrame: 1,
    params: {
      zoom,
      panX,
      panY,
    },
  };
}

export function createHold(duration: number = 12): CameraInstruction {
  return {
    type: 'hold',
    startFrame: 0,
    endFrame: duration,
    params: {},
  };
}

// ==================== CAMERA CONTROLLER ====================

export class CameraController {
  private state: CameraState;
  private instructions: CameraInstruction[] = [];
  private currentInstructionIndex: number = 0;
  
  constructor() {
    this.state = createDefaultCameraState();
  }
  
  getState(): CameraState {
    return { ...this.state };
  }
  
  setInstructions(instructions: CameraInstruction[]): void {
    this.instructions = instructions.sort((a, b) => a.startFrame - b.startFrame);
    this.currentInstructionIndex = 0;
  }
  
  addInstruction(instruction: CameraInstruction): void {
    this.instructions.push(instruction);
    this.instructions.sort((a, b) => a.startFrame - b.startFrame);
  }
  
  clearInstructions(): void {
    this.instructions = [];
    this.currentInstructionIndex = 0;
  }
  
  update(currentFrame: number, fps: number): CameraState {
    // Apply all active instructions
    this.state = createDefaultCameraState();
    
    for (const instruction of this.instructions) {
      if (currentFrame >= instruction.startFrame && currentFrame < instruction.endFrame) {
        this.state = applyCameraInstruction(this.state, instruction, currentFrame, fps);
      }
    }
    
    return this.state;
  }
  
  // Quick effect methods
  zoomIn(factor: number = 2, instant: boolean = false): void {
    if (instant) {
      this.state.zoom = factor;
    } else {
      this.addInstruction({
        type: 'zoom',
        startFrame: 0,
        endFrame: instant ? 1 : 12,
        params: { zoom: this.state.zoom, targetZoom: factor },
      });
    }
  }
  
  zoomOut(factor: number = 1): void {
    this.addInstruction({
      type: 'zoom',
      startFrame: 0,
      endFrame: 12,
      params: { zoom: this.state.zoom, targetZoom: factor },
    });
  }
  
  shake(intensity: number = 10, duration: number = 6): void {
    this.addInstruction({
      type: 'shake',
      startFrame: 0,
      endFrame: duration,
      params: { shakeIntensity: intensity },
    });
  }
  
  pan(x: number, y: number, duration: number = 24): void {
    this.addInstruction({
      type: 'pan',
      startFrame: 0,
      endFrame: duration,
      params: { panX: x, panY: y },
    });
  }
  
  reset(): void {
    this.state = createDefaultCameraState();
    this.instructions = [];
  }
  
  // Apply transform to canvas context
  applyToCanvas(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    ctx.translate(centerX, centerY);
    ctx.scale(this.state.zoom, this.state.zoom);
    ctx.translate(-centerX + this.state.panX, -centerY + this.state.panY);
    ctx.rotate(this.state.rotation);
  }
}

// ==================== MEME CAMERA PRESETS ====================

export const MEME_CAMERA_PRESETS = {
  // Classic dramatic zoom
  dramatic: [
    createHold(24),
    {
      type: 'zoom' as const,
      startFrame: 24,
      endFrame: 30,
      params: { zoom: 1, targetZoom: 2.5 },
    },
    createShake(15, 6),
  ],
  
  // Vine boom style
  vineBoom: [
    createHold(12),
    {
      type: 'zoom' as const,
      startFrame: 12,
      endFrame: 14,
      params: { zoom: 1, targetZoom: 1.3 },
    },
    createShake(20, 10),
  ],
  
  // Shock reveal
  shockReveal: [
    createHold(18),
    {
      type: 'zoom' as const,
      startFrame: 18,
      endFrame: 24,
      params: { zoom: 1, targetZoom: 3 },
    },
  ],
  
  // Comedy beat
  comedyBeat: [
    createHold(36),
    createShake(10, 6),
    createHold(24),
  ],
};

// Export singleton
export const cameraController = new CameraController();
