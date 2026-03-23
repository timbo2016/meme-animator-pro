/**
 * Professional Animation System
 * Smooth, high-quality animations with proper easing and transitions
 */

import { 
  ProAnimation, 
  ProKeyframe, 
  CharacterPose, 
  AnimationType,
  EasingFunction,
  ExpressionKeyframe
} from '../types';

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

export const Easing = {
  linear: (t: number) => t,
  
  // Quad
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Cubic
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // Elastic
  easeInElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
  },
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  easeInOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    t = t * 2;
    if (t < 1) return -0.5 * Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
    return 0.5 * Math.pow(2, -10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI) + 1;
  },
  
  // Bounce
  easeInBounce: (t: number) => 1 - Easing.easeOutBounce(1 - t),
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  },
  easeInOutBounce: (t: number) => t < 0.5 
    ? Easing.easeInBounce(t * 2) * 0.5 
    : Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5,
  
  // Spring
  spring: (t: number, damping: number = 0.5, stiffness: number = 0.8) => {
    const d = Math.exp(-damping * t * 10);
    return 1 - d * Math.cos(stiffness * t * 20);
  },
  
  // Back (overshoot)
  easeInBack: (t: number) => t * t * (2.70158 * t - 1.70158),
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

// Alias for common easings
export const easeIn = Easing.easeInCubic;
export const easeOut = Easing.easeOutCubic;
export const easeInOut = Easing.easeInOutCubic;

// ============================================================================
// ANIMATION DEFINITIONS
// ============================================================================

interface AnimationDefinition {
  name: AnimationType;
  duration: number;
  loop: boolean;
  keyframes: Omit<ProKeyframe, 'frame'>[];
}

// Base pose (neutral standing)
const BASE_POSE: CharacterPose = {
  headTilt: 0,
  headTurn: 0,
  spineCurve: 0,
  leftArmAngle: 15,
  leftForearmAngle: 10,
  rightArmAngle: -15,
  rightForearmAngle: -10,
  leftHandPose: 'open',
  rightHandPose: 'open',
  leftLegAngle: 0,
  leftKneeAngle: 0,
  rightLegAngle: 0,
  rightKneeAngle: 0,
  leftFootAngle: 0,
  rightFootAngle: 0,
};

// Animation library
export const ANIMATION_LIBRARY: Record<AnimationType, AnimationDefinition> = {
  // Movement animations
  idle: {
    name: 'idle',
    duration: 120,
    loop: true,
    keyframes: [
      { frame: 0, easing: 'easeInOut', pose: BASE_POSE },
      { frame: 60, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 2 } },
      { frame: 120, easing: 'easeInOut', pose: BASE_POSE },
    ],
  },
  
  walk: {
    name: 'walk',
    duration: 30,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, leftArmAngle: 30, leftLegAngle: 25, rightArmAngle: -30, rightLegAngle: -25, rightKneeAngle: 30 } 
      },
      { 
        frame: 15, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, leftArmAngle: -30, leftLegAngle: -25, leftKneeAngle: 30, rightArmAngle: 30, rightLegAngle: 25 } 
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, leftArmAngle: 30, leftLegAngle: 25, rightArmAngle: -30, rightLegAngle: -25, rightKneeAngle: 30 } 
      },
    ],
  },
  
  run: {
    name: 'run',
    duration: 16,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -10,
          leftArmAngle: 45, 
          leftLegAngle: 35, 
          leftKneeAngle: 60,
          rightArmAngle: -45, 
          rightLegAngle: -35, 
        } 
      },
      { 
        frame: 8, 
        easing: 'easeInOut', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -10,
          leftArmAngle: -45, 
          leftLegAngle: -35, 
          rightArmAngle: 45, 
          rightLegAngle: 35, 
          rightKneeAngle: 60,
        } 
      },
      { 
        frame: 16, 
        easing: 'easeInOut', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -10,
          leftArmAngle: 45, 
          leftLegAngle: 35, 
          leftKneeAngle: 60,
          rightArmAngle: -45, 
          rightLegAngle: -35, 
        } 
      },
    ],
  },
  
  jump: {
    name: 'jump',
    duration: 40,
    loop: false,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeIn', 
        pose: { ...BASE_POSE, spineCurve: 15, leftKneeAngle: 45, rightKneeAngle: 45 } 
      },
      { 
        frame: 10, 
        easing: 'easeOut', 
        pose: { ...BASE_POSE, spineCurve: -10, leftArmAngle: -60, rightArmAngle: -60, leftLegAngle: -15, rightLegAngle: -15 } 
      },
      { 
        frame: 25, 
        easing: 'easeIn', 
        pose: { ...BASE_POSE, spineCurve: -5, leftArmAngle: -45, rightArmAngle: -45, leftLegAngle: 10, rightLegAngle: 10 } 
      },
      { 
        frame: 40, 
        easing: 'easeOutBounce', 
        pose: { ...BASE_POSE, spineCurve: 10, leftKneeAngle: 30, rightKneeAngle: 30 } 
      },
    ],
  },
  
  sit: {
    name: 'sit',
    duration: 30,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'easeInOut', pose: BASE_POSE },
      { 
        frame: 30, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: 5,
          leftLegAngle: 90, 
          leftKneeAngle: -90, 
          rightLegAngle: 90, 
          rightKneeAngle: -90,
          leftFootAngle: 0,
          rightFootAngle: 0,
        } 
      },
    ],
  },
  
  stand: {
    name: 'stand',
    duration: 20,
    loop: false,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: 5,
          leftLegAngle: 90, 
          leftKneeAngle: -90, 
          rightLegAngle: 90, 
          rightKneeAngle: -90,
        } 
      },
      { frame: 20, easing: 'easeOutBack', pose: BASE_POSE },
    ],
  },
  
  wave: {
    name: 'wave',
    duration: 40,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'easeOut', pose: BASE_POSE },
      { 
        frame: 10, 
        easing: 'easeOutBack', 
        pose: { ...BASE_POSE, rightArmAngle: -120, rightForearmAngle: -30, rightHandPose: 'wave' } 
      },
      { 
        frame: 20, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, rightArmAngle: -120, rightForearmAngle: -50, rightHandPose: 'wave' } 
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, rightArmAngle: -120, rightForearmAngle: -10, rightHandPose: 'wave' } 
      },
      { frame: 40, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  point: {
    name: 'point',
    duration: 30,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'easeOut', pose: BASE_POSE },
      { 
        frame: 10, 
        easing: 'easeOutBack', 
        pose: { ...BASE_POSE, rightArmAngle: -90, rightForearmAngle: -45, rightHandPose: 'point' } 
      },
      { frame: 25, easing: 'linear', pose: { ...BASE_POSE, rightArmAngle: -90, rightForearmAngle: -45, rightHandPose: 'point' } },
      { frame: 30, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  talk: {
    name: 'talk',
    duration: 24,
    loop: true,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE, expression: { mouth: 'normal' } },
      { frame: 6, easing: 'linear', pose: BASE_POSE, expression: { mouth: 'open' } },
      { frame: 12, easing: 'linear', pose: BASE_POSE, expression: { mouth: 'normal' } },
      { frame: 18, easing: 'linear', pose: BASE_POSE, expression: { mouth: 'open' } },
      { frame: 24, easing: 'linear', pose: BASE_POSE, expression: { mouth: 'normal' } },
    ],
  },
  
  laugh: {
    name: 'laugh',
    duration: 20,
    loop: true,
    keyframes: [
      { frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: -5 }, expression: { mouth: 'laugh', eyes: 'happy' } },
      { frame: 10, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 5 }, expression: { mouth: 'laugh', eyes: 'closed' } },
      { frame: 20, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: -5 }, expression: { mouth: 'laugh', eyes: 'happy' } },
    ],
  },
  
  cry: {
    name: 'cry',
    duration: 60,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: 15, headTilt: 10 }, 
        expression: { eyes: 'small', mouth: 'frown', tears: true } 
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: 20, headTilt: -10 }, 
        expression: { eyes: 'closed', mouth: 'frown', tears: true } 
      },
      { 
        frame: 60, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: 15, headTilt: 10 }, 
        expression: { eyes: 'small', mouth: 'frown', tears: true } 
      },
    ],
  },
  
  // MEME-SPECIFIC ANIMATIONS
  facepalm: {
    name: 'facepalm',
    duration: 45,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'easeOut', pose: BASE_POSE },
      { 
        frame: 15, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          headTilt: 15,
          leftArmAngle: -120, 
          leftForearmAngle: 60, 
          leftHandPose: 'open',
        },
        expression: { eyes: 'small', mouth: 'frown' }
      },
      { 
        frame: 35, 
        easing: 'linear', 
        pose: { 
          ...BASE_POSE, 
          headTilt: 20,
          spineCurve: 10,
          leftArmAngle: -120, 
          leftForearmAngle: 60, 
          leftHandPose: 'open',
        },
        expression: { eyes: 'closed', mouth: 'frown' }
      },
      { frame: 45, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  shrug: {
    name: 'shrug',
    duration: 40,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'easeOut', pose: BASE_POSE },
      { 
        frame: 15, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          headTilt: 5,
          leftArmAngle: 80, 
          leftForearmAngle: 80, 
          rightArmAngle: -80, 
          rightForearmAngle: -80,
          leftHandPose: 'open',
          rightHandPose: 'open',
        },
        expression: { eyebrows: 'raised', mouth: 'smirk' }
      },
      { frame: 30, easing: 'linear', pose: { ...BASE_POSE, leftArmAngle: 80, leftForearmAngle: 80, rightArmAngle: -80, rightForearmAngle: -80 }, expression: { eyebrows: 'raised', mouth: 'smirk' } },
      { frame: 40, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  epic_fail: {
    name: 'epic_fail',
    duration: 60,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 15, 
        easing: 'easeIn', 
        pose: { ...BASE_POSE, spineCurve: -20 },
        expression: { eyes: 'big', mouth: 'open' }
      },
      { 
        frame: 30, 
        easing: 'easeOutBounce', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: 40, 
          leftKneeAngle: 60, 
          rightKneeAngle: 60,
          leftArmAngle: 60,
          rightArmAngle: -60,
        },
        expression: { eyes: 'closed', mouth: 'frown' }
      },
      { 
        frame: 50, 
        easing: 'linear', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: 45, 
          leftKneeAngle: 60, 
          rightKneeAngle: 60,
          leftArmAngle: 50,
          rightArmAngle: -50,
        },
        expression: { eyes: 'small', mouth: 'frown' }
      },
      { frame: 60, easing: 'linear', pose: { ...BASE_POSE, spineCurve: 45, leftKneeAngle: 60, rightKneeAngle: 60 }, expression: { eyes: 'small', mouth: 'frown' } },
    ],
  },
  
  savage: {
    name: 'savage',
    duration: 50,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 15, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          headTilt: -10,
          leftArmAngle: 70, 
          leftForearmAngle: 90, 
          rightArmAngle: -30,
          rightHandPose: 'point',
        },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' }
      },
      { frame: 35, easing: 'linear', pose: { ...BASE_POSE, headTilt: -10, leftArmAngle: 70, leftForearmAngle: 90, rightArmAngle: -30, rightHandPose: 'point' }, expression: { eyebrows: 'raised', mouth: 'smirk' } },
      { frame: 50, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  mic_drop: {
    name: 'mic_drop',
    duration: 50,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 10, 
        easing: 'easeOut', 
        pose: { 
          ...BASE_POSE, 
          leftArmAngle: -90, 
          leftForearmAngle: 30, 
          leftHandPose: 'fist',
        },
        expression: { eyes: 'normal', mouth: 'smirk' }
      },
      { 
        frame: 20, 
        easing: 'easeIn', 
        pose: { 
          ...BASE_POSE, 
          leftArmAngle: -90, 
          leftForearmAngle: -30, 
          leftHandPose: 'open',
        },
        expression: { eyes: 'normal', mouth: 'smirk' }
      },
      { 
        frame: 30, 
        easing: 'easeOutBounce', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -5,
          leftArmAngle: -30, 
          leftForearmAngle: 20, 
          rightArmAngle: 30,
          rightForearmAngle: -20,
        },
        expression: { eyes: 'happy', mouth: 'laugh' }
      },
      { frame: 50, easing: 'linear', pose: { ...BASE_POSE, spineCurve: -5 }, expression: { eyes: 'happy', mouth: 'laugh' } },
    ],
  },
  
  surprised: {
    name: 'surprised',
    duration: 30,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 8, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -10,
          leftArmAngle: 45, 
          rightArmAngle: -45, 
        },
        expression: { eyes: 'big', eyebrows: 'raised', mouth: 'open' }
      },
      { frame: 25, easing: 'linear', pose: { ...BASE_POSE, spineCurve: -10, leftArmAngle: 45, rightArmAngle: -45 }, expression: { eyes: 'big', eyebrows: 'raised', mouth: 'open' } },
      { frame: 30, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  shocked: {
    name: 'shocked',
    duration: 40,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 10, 
        easing: 'easeOutElastic', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -15,
          leftArmAngle: 60, 
          leftForearmAngle: 30,
          rightArmAngle: -60, 
          rightForearmAngle: -30,
        },
        expression: { eyes: 'big', eyebrows: 'raised', mouth: 'open' }
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -15, leftArmAngle: 60, leftForearmAngle: 30, rightArmAngle: -60, rightForearmAngle: -30 }, 
        expression: { eyes: 'big', eyebrows: 'raised', mouth: 'open', sweat: true } 
      },
      { frame: 40, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  embarrassed: {
    name: 'embarrassed',
    duration: 60,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 20, 
        easing: 'easeOut', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: 15,
          headTilt: -20,
          leftArmAngle: 30, 
          rightArmAngle: -30,
        },
        expression: { eyes: 'small', mouth: 'frown', blush: 0.5 }
      },
      { frame: 50, easing: 'linear', pose: { ...BASE_POSE, spineCurve: 15, headTilt: -20, leftArmAngle: 30, rightArmAngle: -30 }, expression: { eyes: 'small', mouth: 'frown', blush: 0.8 } },
      { frame: 60, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  proud: {
    name: 'proud',
    duration: 50,
    loop: false,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 15, 
        easing: 'easeOutBack', 
        pose: { 
          ...BASE_POSE, 
          spineCurve: -15,
          headTilt: 10,
          leftArmAngle: -60, 
          leftForearmAngle: 60, 
          leftHandPose: 'fist',
        },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' }
      },
      { frame: 40, easing: 'linear', pose: { ...BASE_POSE, spineCurve: -15, headTilt: 10, leftArmAngle: -60, leftForearmAngle: 60, leftHandPose: 'fist' }, expression: { eyebrows: 'raised', mouth: 'smirk' } },
      { frame: 50, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  thinking: {
    name: 'thinking',
    duration: 90,
    loop: true,
    keyframes: [
      { frame: 0, easing: 'linear', pose: BASE_POSE },
      { 
        frame: 20, 
        easing: 'easeOut', 
        pose: { 
          ...BASE_POSE, 
          headTilt: 15,
          rightArmAngle: -90, 
          rightForearmAngle: 60, 
          rightHandPose: 'fist',
        },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'normal' }
      },
      { frame: 45, easing: 'easeInOut', pose: { ...BASE_POSE, headTilt: 20, rightArmAngle: -90, rightForearmAngle: 60, rightHandPose: 'fist' }, expression: { eyebrows: 'raised', mouth: 'normal' } },
      { frame: 70, easing: 'easeInOut', pose: { ...BASE_POSE, headTilt: 10, rightArmAngle: -90, rightForearmAngle: 60, rightHandPose: 'fist' }, expression: { eyebrows: 'raised', mouth: 'normal' } },
      { frame: 90, easing: 'easeIn', pose: BASE_POSE },
    ],
  },
  
  confused: {
    name: 'confused',
    duration: 60,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeOut', 
        pose: { ...BASE_POSE, headTilt: -15 },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' }
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, headTilt: 15 },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' }
      },
      { 
        frame: 60, 
        easing: 'easeIn', 
        pose: { ...BASE_POSE, headTilt: -15 },
        expression: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' }
      },
    ],
  },
  
  love: {
    name: 'love',
    duration: 60,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -5, headTilt: 10 },
        expression: { eyes: 'happy', mouth: 'smile', sparkles: true, blush: 0.3 }
      },
      { 
        frame: 30, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -10, headTilt: -10 },
        expression: { eyes: 'happy', mouth: 'smile', sparkles: true, blush: 0.5 }
      },
      { 
        frame: 60, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -5, headTilt: 10 },
        expression: { eyes: 'happy', mouth: 'smile', sparkles: true, blush: 0.3 }
      },
    ],
  },
  
  angry: {
    name: 'angry',
    duration: 40,
    loop: true,
    keyframes: [
      { 
        frame: 0, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -10, headTilt: -5 },
        expression: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true }
      },
      { 
        frame: 20, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -15, headTilt: 5 },
        expression: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true }
      },
      { 
        frame: 40, 
        easing: 'easeInOut', 
        pose: { ...BASE_POSE, spineCurve: -10, headTilt: -5 },
        expression: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true }
      },
    ],
  },
  
  // Add remaining animations with default implementations
  fall: { name: 'fall', duration: 30, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: { ...BASE_POSE, spineCurve: 30 }, expression: { eyes: 'big', mouth: 'open' } }] },
  land: { name: 'land', duration: 20, loop: false, keyframes: [{ frame: 0, easing: 'easeOutBounce', pose: { ...BASE_POSE, leftKneeAngle: 45, rightKneeAngle: 45 } }, { frame: 20, easing: 'linear', pose: BASE_POSE }] },
  climb: { name: 'climb', duration: 30, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, leftArmAngle: -60, rightArmAngle: 60, leftLegAngle: 30, rightLegAngle: -30 } }] },
  swim: { name: 'swim', duration: 30, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 10, leftArmAngle: 45, rightArmAngle: -45, leftLegAngle: 20, rightLegAngle: -20 } }] },
  crawl: { name: 'crawl', duration: 30, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 45, leftArmAngle: 30, rightArmAngle: -30, leftKneeAngle: 30, rightKneeAngle: 30 } }] },
  sneak: { name: 'sneak', duration: 40, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 20, leftKneeAngle: 30, rightKneeAngle: 30 } }] },
  lie: { name: 'lie', duration: 30, loop: false, keyframes: [{ frame: 0, easing: 'easeOut', pose: { ...BASE_POSE, spineCurve: 90, leftArmAngle: 45, rightArmAngle: -45 } }] },
  grab: { name: 'grab', duration: 20, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 10, easing: 'easeOut', pose: { ...BASE_POSE, rightArmAngle: -90, rightForearmAngle: -30, rightHandPose: 'grab' } }] },
  throw: { name: 'throw', duration: 25, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: { ...BASE_POSE, rightArmAngle: -120, rightForearmAngle: 60 } }, { frame: 15, easing: 'easeOut', pose: { ...BASE_POSE, rightArmAngle: 30, rightForearmAngle: -30 } }] },
  catch: { name: 'catch', duration: 20, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 10, easing: 'easeOut', pose: { ...BASE_POSE, leftArmAngle: -60, rightArmAngle: 60, leftHandPose: 'grab', rightHandPose: 'grab' } }] },
  kick: { name: 'kick', duration: 20, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 8, easing: 'easeIn', pose: { ...BASE_POSE, rightLegAngle: -45 } }, { frame: 15, easing: 'easeOut', pose: { ...BASE_POSE, rightLegAngle: 45, rightKneeAngle: 30 } }] },
  punch: { name: 'punch', duration: 15, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 5, easing: 'easeIn', pose: { ...BASE_POSE, rightArmAngle: -120 } }, { frame: 10, easing: 'easeOut', pose: { ...BASE_POSE, rightArmAngle: 60, rightForearmAngle: 0, rightHandPose: 'fist' } }] },
  dance: { name: 'dance', duration: 40, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, leftArmAngle: 60, rightArmAngle: -60, leftLegAngle: 15, rightLegAngle: -15 } }, { frame: 20, easing: 'easeInOut', pose: { ...BASE_POSE, leftArmAngle: -60, rightArmAngle: 60, leftLegAngle: -15, rightLegAngle: 15 } }] },
  listen: { name: 'listen', duration: 60, loop: true, keyframes: [{ frame: 0, easing: 'linear', pose: { ...BASE_POSE, headTilt: 5 }, expression: { eyes: 'normal', mouth: 'normal' } }] },
  scream: { name: 'scream', duration: 30, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 10, easing: 'easeOut', pose: { ...BASE_POSE, spineCurve: -15, leftArmAngle: 60, rightArmAngle: -60 }, expression: { eyes: 'big', mouth: 'open' } }] },
  whisper: { name: 'whisper', duration: 40, loop: true, keyframes: [{ frame: 0, easing: 'linear', pose: { ...BASE_POSE, headTilt: 15, rightArmAngle: -90, rightForearmAngle: 30 }, expression: { eyes: 'normal', mouth: 'normal' } }] },
  shout: { name: 'shout', duration: 30, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 10, easing: 'easeOut', pose: { ...BASE_POSE, spineCurve: -10, leftArmAngle: 45, rightArmAngle: -45 }, expression: { eyes: 'normal', mouth: 'open' } }] },
  argue: { name: 'argue', duration: 20, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, leftArmAngle: 30, rightArmAngle: -30 }, expression: { eyes: 'angry', mouth: 'open' } }, { frame: 10, easing: 'easeInOut', pose: { ...BASE_POSE, leftArmAngle: 45, rightArmAngle: -45 }, expression: { eyes: 'angry', mouth: 'open' } }] },
  hug: { name: 'hug', duration: 40, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 15, easing: 'easeOut', pose: { ...BASE_POSE, leftArmAngle: -90, rightArmAngle: 90, leftHandPose: 'grab', rightHandPose: 'grab' }, expression: { eyes: 'happy', mouth: 'smile' } }] },
  high_five: { name: 'high_five', duration: 30, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 15, easing: 'easeOutBack', pose: { ...BASE_POSE, leftArmAngle: -120, leftHandPose: 'open' }, expression: { eyes: 'happy', mouth: 'smile' } }] },
  scared: { name: 'scared', duration: 40, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 10, leftArmAngle: 45, rightArmAngle: -45 }, expression: { eyes: 'big', mouth: 'open', sweat: true } }] },
  disgusted: { name: 'disgusted', duration: 40, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 15, easing: 'easeOut', pose: { ...BASE_POSE, spineCurve: 10, headTilt: -10 }, expression: { eyes: 'small', mouth: 'frown' } }] },
  heartbreak: { name: 'heartbreak', duration: 60, loop: false, keyframes: [{ frame: 0, easing: 'linear', pose: BASE_POSE }, { frame: 20, easing: 'easeOut', pose: { ...BASE_POSE, spineCurve: 30, leftArmAngle: 30, rightArmAngle: -30 }, expression: { eyes: 'closed', mouth: 'frown', tears: true } }] },
  rage: { name: 'rage', duration: 30, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: -20 }, expression: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true } }, { frame: 15, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: -25, leftArmAngle: 45, rightArmAngle: -45 }, expression: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true } }] },
  nervous: { name: 'nervous', duration: 30, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 5 }, expression: { eyes: 'small', mouth: 'frown', sweat: true } }] },
  sleepy: { name: 'sleepy', duration: 60, loop: true, keyframes: [{ frame: 0, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 15, headTilt: 10 }, expression: { eyes: 'closed', mouth: 'normal' } }, { frame: 30, easing: 'easeInOut', pose: { ...BASE_POSE, spineCurve: 20, headTilt: 15 }, expression: { eyes: 'closed', mouth: 'normal' } }] },
};

// ============================================================================
// ANIMATION PLAYER
// ============================================================================

export class ProAnimationPlayer {
  private currentAnimation: ProAnimation | null = null;
  private currentFrame: number = 0;
  private isPlaying: boolean = false;
  private speed: number = 1;
  private pose: CharacterPose;
  private expression: Partial<ExpressionKeyframe>;
  
  constructor() {
    this.pose = { ...BASE_POSE };
    this.expression = {};
  }
  
  /**
   * Play an animation
   */
  play(type: AnimationType): void {
    const definition = ANIMATION_LIBRARY[type];
    if (!definition) return;
    
    this.currentAnimation = {
      id: type,
      name: type,
      type,
      keyframes: definition.keyframes.map((kf, i) => ({
        ...kf,
        frame: definition.keyframes[i]?.frame ?? i * (definition.duration / definition.keyframes.length),
      })),
      duration: definition.duration,
      loop: definition.loop,
      blendMode: 'override',
    };
    
    this.currentFrame = 0;
    this.isPlaying = true;
  }
  
  /**
   * Stop animation
   */
  stop(): void {
    this.isPlaying = false;
    this.currentAnimation = null;
    this.currentFrame = 0;
    this.pose = { ...BASE_POSE };
    this.expression = {};
  }
  
  /**
   * Update animation by one frame
   */
  update(): void {
    if (!this.isPlaying || !this.currentAnimation) return;
    
    this.currentFrame += this.speed;
    
    // Check for loop or end
    if (this.currentFrame >= this.currentAnimation.duration) {
      if (this.currentAnimation.loop) {
        this.currentFrame = this.currentFrame % this.currentAnimation.duration;
      } else {
        this.currentFrame = this.currentAnimation.duration - 1;
        this.isPlaying = false;
      }
    }
    
    // Interpolate keyframes
    this.interpolateKeyframes();
  }
  
  /**
   * Interpolate between keyframes
   */
  private interpolateKeyframes(): void {
    if (!this.currentAnimation) return;
    
    const keyframes = this.currentAnimation.keyframes;
    if (keyframes.length === 0) return;
    
    // Find surrounding keyframes
    let prevKf = keyframes[0];
    let nextKf = keyframes[0];
    
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (this.currentFrame >= keyframes[i].frame && this.currentFrame < keyframes[i + 1].frame) {
        prevKf = keyframes[i];
        nextKf = keyframes[i + 1];
        break;
      }
    }
    
    // Calculate progress
    const duration = nextKf.frame - prevKf.frame;
    const progress = duration > 0 ? (this.currentFrame - prevKf.frame) / duration : 0;
    
    // Apply easing
    const easingFn = Easing[nextKf.easing] || Easing.linear;
    const easedProgress = easingFn(progress);
    
    // Interpolate pose
    if (prevKf.pose && nextKf.pose) {
      for (const key of Object.keys(BASE_POSE) as (keyof CharacterPose)[]) {
        const prevVal = prevKf.pose[key] ?? this.pose[key];
        const nextVal = nextKf.pose[key] ?? this.pose[key];
        if (typeof prevVal === 'number' && typeof nextVal === 'number') {
          (this.pose as Record<string, number>)[key] = lerp(prevVal, nextVal, easedProgress);
        }
      }
    }
    
    // Interpolate expression
    if (prevKf.expression || nextKf.expression) {
      const prevExp = prevKf.expression || {};
      const nextExp = nextKf.expression || {};
      this.expression = {
        eyes: nextExp.eyes || prevExp.eyes,
        eyebrows: nextExp.eyebrows || prevExp.eyebrows,
        mouth: nextExp.mouth || prevExp.mouth,
        blush: lerp(prevExp.blush || 0, nextExp.blush || 0, easedProgress),
        sweat: nextExp.sweat || prevExp.sweat,
        tears: nextExp.tears || prevExp.tears,
        veins: nextExp.veins || prevExp.veins,
        sparkles: nextExp.sparkles || prevExp.sparkles,
      };
    }
  }
  
  /**
   * Get current pose
   */
  getPose(): CharacterPose {
    return { ...this.pose };
  }
  
  /**
   * Get current expression
   */
  getExpression(): Partial<ExpressionKeyframe> {
    return { ...this.expression };
  }
  
  /**
   * Get animation progress (0-1)
   */
  getProgress(): number {
    if (!this.currentAnimation) return 0;
    return this.currentFrame / this.currentAnimation.duration;
  }
  
  /**
   * Check if animation is playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  /**
   * Set animation speed
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }
}

// Utility function
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
