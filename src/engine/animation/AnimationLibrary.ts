// Animation Library - Predefined animations for stickman characters

import { Animation, AnimationFrame, StickmanPose, EasingType, ActionType } from '@/lib/types';
import { StickmanRig } from './StickmanRig';

// Animation keyframes for different actions
// Each keyframe defines joint rotations relative to default pose
interface KeyframeData {
  duration: number;
  easing: EasingType;
  joints: Record<string, { rotation: number; offsetY?: number }>;
}

// Walking animation keyframes
const WALK_KEYFRAMES: KeyframeData[] = [
  {
    duration: 15,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -45 },
      leftForearm: { rotation: -10 },
      rightUpperArm: { rotation: 45 },
      rightForearm: { rotation: 10 },
      leftUpperLeg: { rotation: 30 },
      leftLowerLeg: { rotation: 0 },
      rightUpperLeg: { rotation: -30 },
      rightLowerLeg: { rotation: 45 },
    },
  },
  {
    duration: 15,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: 45 },
      leftForearm: { rotation: 10 },
      rightUpperArm: { rotation: -45 },
      rightForearm: { rotation: -10 },
      leftUpperLeg: { rotation: -30 },
      leftLowerLeg: { rotation: 45 },
      rightUpperLeg: { rotation: 30 },
      rightLowerLeg: { rotation: 0 },
    },
  },
];

// Running animation keyframes
const RUN_KEYFRAMES: KeyframeData[] = [
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -60 },
      leftForearm: { rotation: -30 },
      rightUpperArm: { rotation: 60 },
      rightForearm: { rotation: 30 },
      leftUpperLeg: { rotation: 45 },
      leftLowerLeg: { rotation: 60 },
      rightUpperLeg: { rotation: -45 },
      rightLowerLeg: { rotation: 0 },
      spine: { rotation: -10 },
    },
  },
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: 60 },
      leftForearm: { rotation: 30 },
      rightUpperArm: { rotation: -60 },
      rightForearm: { rotation: -30 },
      leftUpperLeg: { rotation: -45 },
      leftLowerLeg: { rotation: 0 },
      rightUpperLeg: { rotation: 45 },
      rightLowerLeg: { rotation: 60 },
      spine: { rotation: 10 },
    },
  },
];

// Sitting animation keyframes
const SIT_KEYFRAMES: KeyframeData[] = [
  {
    duration: 30,
    easing: 'easeOut',
    joints: {
      leftUpperLeg: { rotation: 90 },
      leftLowerLeg: { rotation: -90 },
      rightUpperLeg: { rotation: 90 },
      rightLowerLeg: { rotation: -90 },
      spine: { rotation: 5 },
    },
  },
  {
    duration: 60,
    easing: 'linear',
    joints: {
      leftUpperLeg: { rotation: 90 },
      leftLowerLeg: { rotation: -90 },
      rightUpperLeg: { rotation: 90 },
      rightLowerLeg: { rotation: -90 },
      spine: { rotation: 0 },
    },
  },
];

// Jumping animation keyframes
const JUMP_KEYFRAMES: KeyframeData[] = [
  {
    duration: 10,
    easing: 'easeIn',
    joints: {
      leftUpperLeg: { rotation: 30 },
      leftLowerLeg: { rotation: 60 },
      rightUpperLeg: { rotation: 30 },
      rightLowerLeg: { rotation: 60 },
      leftUpperArm: { rotation: -45 },
      rightUpperArm: { rotation: -45 },
      spine: { rotation: -5 },
    },
  },
  {
    duration: 15,
    easing: 'easeOut',
    joints: {
      leftUpperLeg: { rotation: -20 },
      leftLowerLeg: { rotation: -10 },
      rightUpperLeg: { rotation: -20 },
      rightLowerLeg: { rotation: -10 },
      leftUpperArm: { rotation: -120 },
      rightUpperArm: { rotation: -120 },
      spine: { rotation: 5 },
    },
  },
  {
    duration: 10,
    easing: 'easeIn',
    joints: {
      leftUpperLeg: { rotation: 20 },
      leftLowerLeg: { rotation: 30 },
      rightUpperLeg: { rotation: 20 },
      rightLowerLeg: { rotation: 30 },
      leftUpperArm: { rotation: -30 },
      rightUpperArm: { rotation: -30 },
      spine: { rotation: -5 },
    },
  },
];

// Idle animation keyframes (subtle breathing)
const IDLE_KEYFRAMES: KeyframeData[] = [
  {
    duration: 30,
    easing: 'easeInOut',
    joints: {
      spine: { rotation: 0 },
      head: { rotation: 0 },
    },
  },
  {
    duration: 30,
    easing: 'easeInOut',
    joints: {
      spine: { rotation: 1 },
      head: { rotation: -1 },
    },
  },
  {
    duration: 30,
    easing: 'easeInOut',
    joints: {
      spine: { rotation: 0 },
      head: { rotation: 0 },
    },
  },
  {
    duration: 30,
    easing: 'easeInOut',
    joints: {
      spine: { rotation: -1 },
      head: { rotation: 1 },
    },
  },
];

// Talking animation keyframes
const TALK_KEYFRAMES: KeyframeData[] = [
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -35 },
      leftForearm: { rotation: -20 },
      rightUpperArm: { rotation: -35 },
      rightForearm: { rotation: -20 },
    },
  },
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -40 },
      leftForearm: { rotation: -25 },
      rightUpperArm: { rotation: -30 },
      rightForearm: { rotation: -15 },
    },
  },
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -30 },
      leftForearm: { rotation: -15 },
      rightUpperArm: { rotation: -40 },
      rightForearm: { rotation: -25 },
    },
  },
  {
    duration: 8,
    easing: 'easeInOut',
    joints: {
      leftUpperArm: { rotation: -35 },
      leftForearm: { rotation: -20 },
      rightUpperArm: { rotation: -35 },
      rightForearm: { rotation: -20 },
    },
  },
];

// Waving animation keyframes
const WAVE_KEYFRAMES: KeyframeData[] = [
  {
    duration: 10,
    easing: 'easeOut',
    joints: {
      rightUpperArm: { rotation: -150 },
      rightForearm: { rotation: -30 },
    },
  },
  {
    duration: 10,
    easing: 'easeInOut',
    joints: {
      rightUpperArm: { rotation: -150 },
      rightForearm: { rotation: -60 },
    },
  },
  {
    duration: 10,
    easing: 'easeInOut',
    joints: {
      rightUpperArm: { rotation: -150 },
      rightForearm: { rotation: 0 },
    },
  },
  {
    duration: 10,
    easing: 'easeInOut',
    joints: {
      rightUpperArm: { rotation: -150 },
      rightForearm: { rotation: -30 },
    },
  },
];

// Pointing animation keyframes
const POINT_KEYFRAMES: KeyframeData[] = [
  {
    duration: 15,
    easing: 'easeOut',
    joints: {
      rightUpperArm: { rotation: -90 },
      rightForearm: { rotation: -45 },
    },
  },
  {
    duration: 45,
    easing: 'linear',
    joints: {
      rightUpperArm: { rotation: -90 },
      rightForearm: { rotation: -45 },
    },
  },
];

// Standing up animation keyframes
const STAND_KEYFRAMES: KeyframeData[] = [
  {
    duration: 30,
    easing: 'easeOut',
    joints: {
      leftUpperLeg: { rotation: 0 },
      leftLowerLeg: { rotation: 0 },
      rightUpperLeg: { rotation: 0 },
      rightLowerLeg: { rotation: 0 },
      spine: { rotation: 0 },
    },
  },
];

// Animation library mapping
const ANIMATION_LIBRARY: Record<ActionType, { keyframes: KeyframeData[]; loop: boolean }> = {
  walk: { keyframes: WALK_KEYFRAMES, loop: true },
  run: { keyframes: RUN_KEYFRAMES, loop: true },
  sit: { keyframes: SIT_KEYFRAMES, loop: false },
  stand: { keyframes: STAND_KEYFRAMES, loop: false },
  jump: { keyframes: JUMP_KEYFRAMES, loop: false },
  talk: { keyframes: TALK_KEYFRAMES, loop: true },
  turn: { keyframes: IDLE_KEYFRAMES, loop: false },
  wave: { keyframes: WAVE_KEYFRAMES, loop: false },
  point: { keyframes: POINT_KEYFRAMES, loop: false },
  pick_up: { keyframes: IDLE_KEYFRAMES, loop: false },
  idle: { keyframes: IDLE_KEYFRAMES, loop: true },
  enter: { keyframes: WALK_KEYFRAMES, loop: true },
  exit: { keyframes: WALK_KEYFRAMES, loop: true },
};

/**
 * Create an animation from keyframe data
 */
export function createAnimation(type: ActionType): Animation {
  const data = ANIMATION_LIBRARY[type];
  if (!data) {
    return createAnimation('idle');
  }

  const frames: AnimationFrame[] = [];
  let totalDuration = 0;

  for (const keyframe of data.keyframes) {
    const rig = new StickmanRig(1, { x: 0, y: 0 });
    const joints = new Map<string, ReturnType<typeof rig.getJoint>>();

    // Apply keyframe rotations
    for (const [jointName, values] of Object.entries(keyframe.joints)) {
      const joint = rig.getJoint(jointName);
      if (joint) {
        joints.set(jointName, {
          ...joint,
          rotation: values.rotation,
        });
      }
    }

    // Copy remaining joints
    rig.getAllJoints().forEach((joint) => {
      if (!joints.has(joint.name)) {
        joints.set(joint.name, { ...joint });
      }
    });

    frames.push({
      joints,
      duration: keyframe.duration,
      easing: keyframe.easing,
    });

    totalDuration += keyframe.duration;
  }

  return {
    name: type,
    frames,
    loop: data.loop,
    totalDuration,
  };
}

/**
 * Get animation duration in frames
 */
export function getAnimationDuration(type: ActionType): number {
  const data = ANIMATION_LIBRARY[type];
  if (!data) return 60;

  return data.keyframes.reduce((sum, kf) => sum + kf.duration, 0);
}

/**
 * Get all available animation types
 */
export function getAvailableAnimations(): ActionType[] {
  return Object.keys(ANIMATION_LIBRARY) as ActionType[];
}

/**
 * Check if animation loops
 */
export function isAnimationLooping(type: ActionType): boolean {
  return ANIMATION_LIBRARY[type]?.loop ?? false;
}
