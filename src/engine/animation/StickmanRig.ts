// Stickman Rig System - Joint-based skeletal animation for stickman characters

import { Joint, StickmanPose, StickmanState, Position, EasingType } from '@/lib/types';

// Default pose constants
const DEFAULT_POSE: Record<string, Partial<Joint>> = {
  head: { x: 0, y: -60, rotation: 0, length: 20 },
  neck: { x: 0, y: -40, rotation: 0, length: 10 },
  spine: { x: 0, y: 0, rotation: 0, length: 40 },
  hip: { x: 0, y: 40, rotation: 0, length: 10 },
  // Left arm
  leftShoulder: { x: -5, y: -35, rotation: 0, length: 5 },
  leftUpperArm: { x: -20, y: -30, rotation: -30, length: 25 },
  leftForearm: { x: -35, y: -15, rotation: -20, length: 25 },
  leftHand: { x: -45, y: -5, rotation: 0, length: 10 },
  // Right arm
  rightShoulder: { x: 5, y: -35, rotation: 0, length: 5 },
  rightUpperArm: { x: 20, y: -30, rotation: 30, length: 25 },
  rightForearm: { x: 35, y: -15, rotation: 20, length: 25 },
  rightHand: { x: 45, y: -5, rotation: 0, length: 10 },
  // Left leg
  leftUpperLeg: { x: -10, y: 50, rotation: 0, length: 30 },
  leftLowerLeg: { x: -10, y: 80, rotation: 0, length: 30 },
  leftFoot: { x: -15, y: 110, rotation: 0, length: 15 },
  // Right leg
  rightUpperLeg: { x: 10, y: 50, rotation: 0, length: 30 },
  rightLowerLeg: { x: 10, y: 80, rotation: 0, length: 30 },
  rightFoot: { x: 15, y: 110, rotation: 0, length: 15 },
};

// Joint hierarchy (parent-child relationships)
const JOINT_HIERARCHY: Record<string, { parent: string | null; children: string[] }> = {
  spine: { parent: null, children: ['neck', 'hip', 'leftShoulder', 'rightShoulder'] },
  neck: { parent: 'spine', children: ['head'] },
  head: { parent: 'neck', children: [] },
  hip: { parent: 'spine', children: ['leftUpperLeg', 'rightUpperLeg'] },
  leftShoulder: { parent: 'spine', children: ['leftUpperArm'] },
  leftUpperArm: { parent: 'leftShoulder', children: ['leftForearm'] },
  leftForearm: { parent: 'leftUpperArm', children: ['leftHand'] },
  leftHand: { parent: 'leftForearm', children: [] },
  rightShoulder: { parent: 'spine', children: ['rightUpperArm'] },
  rightUpperArm: { parent: 'rightShoulder', children: ['rightForearm'] },
  rightForearm: { parent: 'rightUpperArm', children: ['rightHand'] },
  rightHand: { parent: 'rightForearm', children: [] },
  leftUpperLeg: { parent: 'hip', children: ['leftLowerLeg'] },
  leftLowerLeg: { parent: 'leftUpperLeg', children: ['leftFoot'] },
  leftFoot: { parent: 'leftLowerLeg', children: [] },
  rightUpperLeg: { parent: 'hip', children: ['rightLowerLeg'] },
  rightLowerLeg: { parent: 'rightUpperLeg', children: ['rightFoot'] },
  rightFoot: { parent: 'rightLowerLeg', children: [] },
};

export class StickmanRig {
  private joints: Map<string, Joint>;
  private scale: number;
  private position: Position;

  constructor(scale: number = 1, position: Position = { x: 0, y: 0 }) {
    this.joints = new Map();
    this.scale = scale;
    this.position = position;
    this.initializeJoints();
  }

  /**
   * Initialize joints with default pose
   */
  private initializeJoints(): void {
    for (const [name, defaults] of Object.entries(DEFAULT_POSE)) {
      const hierarchy = JOINT_HIERARCHY[name];
      const joint: Joint = {
        id: name,
        name,
        x: (defaults.x ?? 0) * this.scale,
        y: (defaults.y ?? 0) * this.scale,
        rotation: defaults.rotation ?? 0,
        parent: hierarchy?.parent ?? null,
        children: hierarchy?.children ?? [],
        length: (defaults.length ?? 20) * this.scale,
      };
      this.joints.set(name, joint);
    }
  }

  /**
   * Get a joint by name
   */
  getJoint(name: string): Joint | undefined {
    return this.joints.get(name);
  }

  /**
   * Get all joints
   */
  getAllJoints(): Joint[] {
    return Array.from(this.joints.values());
  }

  /**
   * Set joint rotation
   */
  setJointRotation(name: string, rotation: number): void {
    const joint = this.joints.get(name);
    if (joint) {
      joint.rotation = rotation;
      this.propagateRotation(name);
    }
  }

  /**
   * Set joint position
   */
  setJointPosition(name: string, x: number, y: number): void {
    const joint = this.joints.get(name);
    if (joint) {
      joint.x = x;
      joint.y = y;
    }
  }

  /**
   * Propagate rotation changes to child joints
   */
  private propagateRotation(jointName: string): void {
    const joint = this.joints.get(jointName);
    if (!joint) return;

    for (const childName of joint.children) {
      const child = this.joints.get(childName);
      if (child) {
        // Child joints maintain their relative rotation
        this.propagateRotation(childName);
      }
    }
  }

  /**
   * Get the current pose as a serializable object
   */
  getPose(): StickmanPose {
    const jointsCopy = new Map<string, Joint>();
    this.joints.forEach((joint, name) => {
      jointsCopy.set(name, { ...joint });
    });
    return {
      joints: jointsCopy,
      scale: this.scale,
    };
  }

  /**
   * Apply a pose to the rig
   */
  applyPose(pose: StickmanPose): void {
    pose.joints.forEach((joint, name) => {
      const currentJoint = this.joints.get(name);
      if (currentJoint) {
        currentJoint.x = joint.x;
        currentJoint.y = joint.y;
        currentJoint.rotation = joint.rotation;
      }
    });
  }

  /**
   * Interpolate between two poses
   */
  static interpolate(
    poseA: StickmanPose,
    poseB: StickmanPose,
    t: number,
    easing: EasingType = 'linear'
  ): StickmanPose {
    const easedT = applyEasing(t, easing);
    const interpolatedJoints = new Map<string, Joint>();

    poseA.joints.forEach((jointA, name) => {
      const jointB = poseB.joints.get(name);
      if (jointB) {
        interpolatedJoints.set(name, {
          ...jointA,
          x: lerp(jointA.x, jointB.x, easedT),
          y: lerp(jointA.y, jointB.y, easedT),
          rotation: lerp(jointA.rotation, jointB.rotation, easedT),
        });
      }
    });

    return {
      joints: interpolatedJoints,
      scale: lerp(poseA.scale, poseB.scale, easedT),
    };
  }

  /**
   * Clone this rig
   */
  clone(): StickmanRig {
    const newRig = new StickmanRig(this.scale, { ...this.position });
    this.joints.forEach((joint, name) => {
      newRig.joints.set(name, { ...joint });
    });
    return newRig;
  }

  /**
   * Scale the entire rig
   */
  setScale(scale: number): void {
    const ratio = scale / this.scale;
    this.scale = scale;
    this.joints.forEach((joint) => {
      joint.x *= ratio;
      joint.y *= ratio;
      joint.length *= ratio;
    });
  }

  /**
   * Get the world position of a joint
   */
  getWorldPosition(jointName: string): Position {
    const joint = this.joints.get(jointName);
    if (!joint) return { x: 0, y: 0 };

    // For root joints, return position relative to rig position
    if (!joint.parent) {
      return {
        x: this.position.x + joint.x,
        y: this.position.y + joint.y,
      };
    }

    // Calculate world position by traversing parent hierarchy
    const parentPos = this.getWorldPosition(joint.parent);
    const angle = this.getAccumulatedRotation(jointName);
    const rad = (angle * Math.PI) / 180;

    return {
      x: parentPos.x + Math.sin(rad) * joint.length,
      y: parentPos.y + Math.cos(rad) * joint.length,
    };
  }

  /**
   * Get accumulated rotation from root to joint
   */
  private getAccumulatedRotation(jointName: string): number {
    const joint = this.joints.get(jointName);
    if (!joint) return 0;

    if (!joint.parent) {
      return joint.rotation;
    }

    const parentRotation = this.getAccumulatedRotation(joint.parent);
    return parentRotation + joint.rotation;
  }

  /**
   * Get rig position
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Set rig position
   */
  setPosition(pos: Position): void {
    this.position = { ...pos };
  }
}

// Utility functions
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'bounce':
      if (t < 1 / 2.75) {
        return 7.5625 * t * t;
      } else if (t < 2 / 2.75) {
        const t2 = t - 1.5 / 2.75;
        return 7.5625 * t2 * t2 + 0.75;
      } else if (t < 2.5 / 2.75) {
        const t2 = t - 2.25 / 2.75;
        return 7.5625 * t2 * t2 + 0.9375;
      } else {
        const t2 = t - 2.625 / 2.75;
        return 7.5625 * t2 * t2 + 0.984375;
      }
    default:
      return t;
  }
}

export { lerp, applyEasing };
