// Rico-Style Stickman Animation Engine
// Animation Engine - Low-level Animation Primitives

import { StickmanRig, Position, Animation, ActionType, AnimationKeyframe, TIMING } from './types';
import {
  createDefaultRig,
  setArmAngles,
  setLegAngles,
  setBodyLean,
  setHeadRotation,
  translateRig,
  lerpRigs,
  cloneRig,
  Easing,
  lerp,
} from './RigSystem';

// ==================== ANIMATION DEFINITIONS ====================

// Walk animation - sinusoidal leg motion
export function animateWalk(rig: StickmanRig, frame: number, speed: number = 1): StickmanRig {
  const cycleLength = 12; // frames per walk cycle
  const t = (frame % cycleLength) / cycleLength;
  const angle = Math.sin(t * Math.PI * 2) * 0.4; // leg swing angle
  
  // Move legs in opposite directions
  const leftLegAngle = Math.PI / 2 + angle;
  const rightLegAngle = Math.PI / 2 - angle;
  
  // Arms swing opposite to legs
  const leftArmAngle = Math.PI / 2 - angle * 0.5;
  const rightArmAngle = Math.PI / 2 + angle * 0.5;
  
  // Slight body bob
  const bobOffset = Math.abs(Math.sin(t * Math.PI * 2)) * 3;
  const bodyLean = Math.sin(t * Math.PI * 2) * 0.03;
  
  let newRig = setLegAngles(rig, leftLegAngle, rightLegAngle);
  newRig = setArmAngles(newRig, leftArmAngle, rightArmAngle);
  newRig = setBodyLean(newRig, bodyLean);
  newRig = translateRig(newRig, 0, -bobOffset);
  
  return newRig;
}

// Run animation - faster, more exaggerated
export function animateRun(rig: StickmanRig, frame: number): StickmanRig {
  const cycleLength = 6; // faster cycle
  const t = (frame % cycleLength) / cycleLength;
  const angle = Math.sin(t * Math.PI * 2) * 0.7;
  
  const leftLegAngle = Math.PI / 2 + angle;
  const rightLegAngle = Math.PI / 2 - angle;
  
  // Arms pump more
  const leftArmAngle = Math.PI / 4 - angle * 0.8;
  const rightArmAngle = Math.PI / 4 + angle * 0.8;
  
  // More pronounced bob
  const bobOffset = Math.abs(Math.sin(t * Math.PI * 2)) * 8;
  const bodyLean = 0.15; // Forward lean when running
  
  let newRig = setLegAngles(rig, leftLegAngle, rightLegAngle);
  newRig = setArmAngles(newRig, leftArmAngle, rightArmAngle);
  newRig = setBodyLean(newRig, bodyLean);
  newRig = translateRig(newRig, 0, -bobOffset);
  
  return newRig;
}

// Jump animation
export function animateJump(rig: StickmanRig, frame: number, totalFrames: number): StickmanRig {
  const t = frame / totalFrames;
  
  // Crouch -> Jump -> Land
  let newRig = cloneRig(rig);
  
  if (t < 0.2) {
    // Crouch phase
    const crouchT = Easing.easeIn(t / 0.2);
    newRig = setLegAngles(newRig, Math.PI / 3, Math.PI / 3);
    newRig = translateRig(newRig, 0, crouchT * 15);
  } else if (t < 0.7) {
    // Jump phase
    const jumpT = (t - 0.2) / 0.5;
    const height = Math.sin(jumpT * Math.PI) * 80;
    
    newRig = setLegAngles(newRig, Math.PI / 2.5, Math.PI / 2.5);
    newRig = setArmAngles(newRig, -Math.PI / 4, Math.PI / 4);
    newRig = translateRig(newRig, 0, -height);
  } else {
    // Land phase
    const landT = Easing.easeOutBounce((t - 0.7) / 0.3);
    newRig = setLegAngles(newRig, Math.PI / 3, Math.PI / 3);
    newRig = translateRig(newRig, 0, 15 * (1 - landT));
  }
  
  return newRig;
}

// Fall animation
export function animateFall(rig: StickmanRig, frame: number): StickmanRig {
  const t = Math.min(frame / 20, 1);
  
  let newRig = cloneRig(rig);
  
  // Rotate and fall
  newRig.rotation = t * Math.PI / 2;
  newRig = setArmAngles(newRig, -Math.PI / 3 + t * 0.5, Math.PI / 3 - t * 0.5);
  newRig = setLegAngles(newRig, Math.PI / 3 + t * 0.3, Math.PI / 3 - t * 0.3);
  
  return newRig;
}

// Hit/slap reaction animation
export function animateHitReaction(rig: StickmanRig, frame: number, intensity: number = 1): StickmanRig {
  let newRig = cloneRig(rig);
  
  // First few frames - impact
  if (frame < 3) {
    // Snap back
    const t = frame / 3;
    newRig = setBodyLean(newRig, -0.3 * intensity * Easing.easeOut(t));
    newRig = setHeadRotation(newRig, 0.4 * intensity);
    newRig = setArmAngles(newRig, -Math.PI / 4, Math.PI / 2);
  } 
  // Recovery
  else if (frame < 15) {
    const t = (frame - 3) / 12;
    newRig = setBodyLean(newRig, -0.3 * intensity * (1 - Easing.easeOut(t)));
    newRig = setHeadRotation(newRig, 0.4 * intensity * (1 - t));
  }
  
  return newRig;
}

// Slap animation (for the attacker)
export function animateSlap(rig: StickmanRig, frame: number): StickmanRig {
  let newRig = cloneRig(rig);
  
  if (frame < 5) {
    // Wind up
    const t = Easing.easeIn(frame / 5);
    newRig = setArmAngles(newRig, Math.PI / 4, -Math.PI / 3 + t * 0.5);
    newRig = setBodyLean(newRig, -0.1);
  } else if (frame < 8) {
    // Strike!
    const t = (frame - 5) / 3;
    newRig = setArmAngles(newRig, Math.PI / 4, Math.PI / 2 - t * 1.5);
    newRig = setBodyLean(newRig, 0.15);
  } else {
    // Follow through
    const t = Easing.easeOut((frame - 8) / 10);
    newRig = setArmAngles(newRig, Math.PI / 4, -Math.PI / 6 + t * Math.PI / 4);
    newRig = setBodyLean(newRig, 0.15 * (1 - t));
  }
  
  return newRig;
}

// Shock/freeze animation
export function animateShock(rig: StickmanRig, frame: number): StickmanRig {
  let newRig = cloneRig(rig);
  
  if (frame < 3) {
    // Initial freeze
    const scale = 1 + frame * 0.02;
    newRig.head.scale = scale;
    newRig = setArmAngles(newRig, -Math.PI / 6 * frame, Math.PI / 6 * frame);
  } else {
    // Hold shocked pose
    newRig.head.scale = 1.06;
    newRig = setArmAngles(newRig, -Math.PI / 2, Math.PI / 2);
    newRig = setLegAngles(newRig, Math.PI / 3, Math.PI / 3);
    
    // Add shake
    const shake = Math.sin(frame * 2) * 2;
    newRig = translateRig(newRig, shake, 0);
  }
  
  return newRig;
}

// Scream animation
export function animateScream(rig: StickmanRig, frame: number): StickmanRig {
  let newRig = cloneRig(rig);
  
  // Head tilted back, arms up, shaking
  const shake = Math.sin(frame * 3) * 3;
  const headTilt = -0.3 + Math.sin(frame * 0.5) * 0.1;
  
  newRig = setHeadRotation(newRig, headTilt);
  newRig = setArmAngles(newRig, -Math.PI * 0.7, Math.PI * 0.7);
  newRig = translateRig(newRig, shake, 0);
  
  return newRig;
}

// Idle animation with subtle breathing
export function animateIdle(rig: StickmanRig, frame: number): StickmanRig {
  const breathe = Math.sin(frame / 30) * 2;
  const sway = Math.sin(frame / 60) * 0.02;
  
  let newRig = cloneRig(rig);
  newRig = translateRig(newRig, 0, breathe);
  newRig = setBodyLean(newRig, sway);
  
  return newRig;
}

// Sit animation
export function animateSit(rig: StickmanRig, frame: number, totalFrames: number): StickmanRig {
  const t = Math.min(frame / totalFrames, 1);
  const eased = Easing.easeOutBack(t);
  
  let newRig = cloneRig(rig);
  
  // Lower body
  newRig = translateRig(newRig, 0, eased * 40);
  
  // Bend knees
  newRig = setLegAngles(newRig, Math.PI / 4, Math.PI / 4);
  
  // Lean forward slightly
  newRig = setBodyLean(newRig, 0.05 * eased);
  
  return newRig;
}

// Wave animation
export function animateWave(rig: StickmanRig, frame: number): StickmanRig {
  const waveCycle = Math.sin(frame / 4) * 0.3;
  
  let newRig = cloneRig(rig);
  newRig = setArmAngles(newRig, Math.PI / 4, -Math.PI / 2 + waveCycle);
  newRig = setHeadRotation(newRig, Math.sin(frame / 8) * 0.1);
  
  return newRig;
}

// Point animation
export function animatePoint(rig: StickmanRig, frame: number, targetAngle: number = 0): StickmanRig {
  let newRig = cloneRig(rig);
  
  if (frame < 5) {
    const t = Easing.easeOutBack(frame / 5);
    newRig = setArmAngles(newRig, Math.PI / 4, -Math.PI / 2 + targetAngle * t);
    newRig = setHeadRotation(newRig, targetAngle * 0.3 * t);
  } else {
    // Hold pointing pose
    newRig = setArmAngles(newRig, Math.PI / 4, -Math.PI / 2 + targetAngle);
    newRig = setHeadRotation(newRig, targetAngle * 0.3);
  }
  
  return newRig;
}

// Slip animation
export function animateSlip(rig: StickmanRig, frame: number): StickmanRig {
  let newRig = cloneRig(rig);
  
  if (frame < 10) {
    // Initial slip
    const t = frame / 10;
    newRig.rotation = t * Math.PI / 6;
    newRig = setArmAngles(newRig, -Math.PI / 3 * t, Math.PI / 3 * t);
    newRig = setLegAngles(newRig, Math.PI / 4 * t, -Math.PI / 4 * t);
  } else if (frame < 20) {
    // Fall
    const t = (frame - 10) / 10;
    newRig.rotation = Math.PI / 6 + t * Math.PI / 3;
    newRig = setArmAngles(newRig, -Math.PI / 3 + t * 0.5, Math.PI / 3 - t * 0.5);
  } else {
    // On ground
    newRig.rotation = Math.PI / 2;
    newRig = setArmAngles(newRig, -Math.PI / 6, Math.PI / 6);
  }
  
  return newRig;
}

// Enter from side
export function animateEnter(rig: StickmanRig, frame: number, totalFrames: number, fromRight: boolean = true): StickmanRig {
  const t = Math.min(frame / totalFrames, 1);
  const eased = Easing.easeOut(t);
  
  let newRig = cloneRig(rig);
  newRig = animateWalk(newRig, frame);
  newRig.facingRight = fromRight;
  
  return newRig;
}

// ==================== ANIMATION PLAYBACK ====================

export interface AnimationState {
  rig: StickmanRig;
  frame: number;
  totalFrames: number;
  animation: ActionType;
  params: Record<string, any>;
}

export function createAnimationState(
  animation: ActionType,
  rig: StickmanRig,
  totalFrames: number,
  params: Record<string, any> = {}
): AnimationState {
  return {
    rig: cloneRig(rig),
    frame: 0,
    totalFrames,
    animation,
    params,
  };
}

export function updateAnimation(state: AnimationState): AnimationState {
  const { animation, rig, frame, params } = state;
  
  let newRig: StickmanRig;
  
  switch (animation) {
    case 'walk':
      newRig = animateWalk(rig, frame, params.speed || 1);
      break;
    case 'run':
      newRig = animateRun(rig, frame);
      break;
    case 'jump':
      newRig = animateJump(rig, frame, state.totalFrames);
      break;
    case 'fall':
      newRig = animateFall(rig, frame);
      break;
    case 'sit':
      newRig = animateSit(rig, frame, state.totalFrames);
      break;
    case 'idle':
      newRig = animateIdle(rig, frame);
      break;
    case 'wave':
      newRig = animateWave(rig, frame);
      break;
    case 'slap':
      newRig = animateSlap(rig, frame);
      break;
    case 'hit':
      newRig = animateHitReaction(rig, frame, params.intensity || 1);
      break;
    case 'shock':
      newRig = animateShock(rig, frame);
      break;
    case 'scream':
      newRig = animateScream(rig, frame);
      break;
    case 'slip':
      newRig = animateSlip(rig, frame);
      break;
    case 'point':
      newRig = animatePoint(rig, frame, params.angle || 0);
      break;
    default:
      newRig = animateIdle(rig, frame);
  }
  
  return {
    ...state,
    rig: newRig,
    frame: frame + 1,
  };
}

// ==================== ANIMATION DURATIONS ====================

export const ANIMATION_DURATIONS: Record<ActionType, number> = {
  idle: TIMING.SETUP_DURATION,
  walk: TIMING.SETUP_DURATION,
  run: TIMING.BUILDUP_DURATION,
  jump: TIMING.BUILDUP_DURATION,
  fall: TIMING.PUNCHLINE_DURATION,
  sit: TIMING.BUILDUP_DURATION,
  stand: TIMING.BUILDUP_DURATION,
  wave: TIMING.PUNCHLINE_DURATION * 2,
  point: TIMING.PUNCHLINE_DURATION,
  slap: TIMING.PUNCHLINE_DURATION,
  hit: TIMING.PUNCHLINE_DURATION * 2,
  kick: TIMING.PUNCHLINE_DURATION,
  shake: TIMING.PUNCHLINE_DURATION,
  freeze: TIMING.PUNCHLINE_DURATION,
  scream: TIMING.PUNCHLINE_DURATION * 2,
  laugh: TIMING.REACTION_DURATION,
  enter: TIMING.SETUP_DURATION,
  exit: TIMING.SETUP_DURATION,
};
