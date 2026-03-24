// Rico-Style Stickman Animation Engine
// Stickman Rig System with Forward Kinematics

import { StickmanRig, Position, Joint, Limb, JOINT_CONSTRAINTS } from './types';

// ==================== DEFAULT RIG ====================

export function createDefaultRig(position: Position = { x: 540, y: 1200 }): StickmanRig {
  const bodyLength = 80;
  const armLength = 50;
  const legLength = 60;
  const headRadius = 35;
  
  const headY = position.y - bodyLength - headRadius;
  const shoulderY = position.y - bodyLength + 10;
  
  return {
    head: {
      x: position.x,
      y: headY,
      radius: headRadius,
      rotation: 0,
      scale: 1,
    },
    
    body: {
      topX: position.x,
      topY: shoulderY,
      bottomX: position.x,
      bottomY: position.y,
      length: bodyLength,
    },
    
    leftArm: {
      startJoint: { x: position.x - 5, y: shoulderY, rotation: 0 },
      endJoint: { x: position.x - 30, y: shoulderY + armLength, rotation: 0 },
      length: armLength,
      angle: Math.PI / 4, // 45 degrees down
    },
    
    rightArm: {
      startJoint: { x: position.x + 5, y: shoulderY, rotation: 0 },
      endJoint: { x: position.x + 30, y: shoulderY + armLength, rotation: 0 },
      length: armLength,
      angle: -Math.PI / 4,
    },
    
    leftLeg: {
      startJoint: { x: position.x - 10, y: position.y, rotation: 0 },
      endJoint: { x: position.x - 15, y: position.y + legLength, rotation: 0 },
      length: legLength,
      angle: Math.PI / 8,
    },
    
    rightLeg: {
      startJoint: { x: position.x + 10, y: position.y, rotation: 0 },
      endJoint: { x: position.x + 15, y: position.y + legLength, rotation: 0 },
      length: legLength,
      angle: -Math.PI / 8,
    },
    
    position,
    rotation: 0,
    scale: 1,
    facingRight: true,
  };
}

// ==================== FORWARD KINEMATICS ====================

export function calculateLimbEndPosition(
  startJoint: Joint,
  length: number,
  angle: number
): Position {
  return {
    x: startJoint.x + Math.cos(angle) * length,
    y: startJoint.y + Math.sin(angle) * length,
  };
}

export function setLimbAngle(limb: Limb, angle: number): Limb {
  const clampedAngle = Math.max(
    JOINT_CONSTRAINTS.arm.minAngle,
    Math.min(JOINT_CONSTRAINTS.arm.maxAngle, angle)
  );
  
  // Calculate end position based on angle
  const endPos = calculateLimbEndPosition(limb.startJoint, limb.length, clampedAngle);
  
  return {
    ...limb,
    angle: clampedAngle,
    endJoint: {
      ...limb.endJoint,
      x: endPos.x,
      y: endPos.y,
      rotation: clampedAngle,
    },
  };
}

export function setArmAngles(rig: StickmanRig, leftAngle: number, rightAngle: number): StickmanRig {
  return {
    ...rig,
    leftArm: setLimbAngle(rig.leftArm, leftAngle),
    rightArm: setLimbAngle(rig.rightArm, rightAngle),
  };
}

export function setLegAngles(rig: StickmanRig, leftAngle: number, rightAngle: number): StickmanRig {
  return {
    ...rig,
    leftLeg: setLimbAngle(rig.leftLeg, leftAngle),
    rightLeg: setLimbAngle(rig.rightLeg, rightAngle),
  };
}

export function setBodyLean(rig: StickmanRig, lean: number): StickmanRig {
  const clampedLean = Math.max(-JOINT_CONSTRAINTS.body.maxLean, 
    Math.min(JOINT_CONSTRAINTS.body.maxLean, lean));
  
  const topX = rig.position.x + Math.sin(clampedLean) * rig.body.length;
  
  return {
    ...rig,
    body: {
      ...rig.body,
      topX,
    },
    rotation: clampedLean,
  };
}

export function setHeadRotation(rig: StickmanRig, rotation: number): StickmanRig {
  const clampedRotation = Math.max(-JOINT_CONSTRAINTS.head.maxRotation,
    Math.min(JOINT_CONSTRAINTS.head.maxRotation, rotation));
  
  return {
    ...rig,
    head: {
      ...rig.head,
      rotation: clampedRotation,
    },
  };
}

export function setHeadScale(rig: StickmanRig, scale: number): StickmanRig {
  return {
    ...rig,
    head: {
      ...rig.head,
      scale: Math.max(0.5, Math.min(2, scale)),
    },
  };
}

// ==================== RIG TRANSFORMS ====================

export function translateRig(rig: StickmanRig, dx: number, dy: number): StickmanRig {
  const newPosition = {
    x: rig.position.x + dx,
    y: rig.position.y + dy,
  };
  
  return updateRigPosition(rig, newPosition);
}

export function updateRigPosition(rig: StickmanRig, newPosition: Position): StickmanRig {
  const dx = newPosition.x - rig.position.x;
  const dy = newPosition.y - rig.position.y;
  
  return {
    ...rig,
    position: newPosition,
    head: {
      ...rig.head,
      x: rig.head.x + dx,
      y: rig.head.y + dy,
    },
    body: {
      ...rig.body,
      topX: rig.body.topX + dx,
      topY: rig.body.topY + dy,
      bottomX: rig.body.bottomX + dx,
      bottomY: rig.body.bottomY + dy,
    },
    leftArm: translateLimb(rig.leftArm, dx, dy),
    rightArm: translateLimb(rig.rightArm, dx, dy),
    leftLeg: translateLimb(rig.leftLeg, dx, dy),
    rightLeg: translateLimb(rig.rightLeg, dx, dy),
  };
}

function translateLimb(limb: Limb, dx: number, dy: number): Limb {
  return {
    ...limb,
    startJoint: {
      ...limb.startJoint,
      x: limb.startJoint.x + dx,
      y: limb.startJoint.y + dy,
    },
    endJoint: {
      ...limb.endJoint,
      x: limb.endJoint.x + dx,
      y: limb.endJoint.y + dy,
    },
  };
}

export function flipRig(rig: StickmanRig): StickmanRig {
  const pivotX = rig.position.x;
  
  return {
    ...rig,
    facingRight: !rig.facingRight,
    head: {
      ...rig.head,
      x: pivotX - (rig.head.x - pivotX),
    },
    body: {
      ...rig.body,
      topX: pivotX - (rig.body.topX - pivotX),
    },
    // Swap arms when flipping
    leftArm: {
      ...mirrorLimb(rig.rightArm, pivotX),
      angle: -rig.rightArm.angle,
    },
    rightArm: {
      ...mirrorLimb(rig.leftArm, pivotX),
      angle: -rig.leftArm.angle,
    },
    leftLeg: {
      ...mirrorLimb(rig.rightLeg, pivotX),
      angle: -rig.rightLeg.angle,
    },
    rightLeg: {
      ...mirrorLimb(rig.leftLeg, pivotX),
      angle: -rig.leftLeg.angle,
    },
  };
}

function mirrorLimb(limb: Limb, pivotX: number): Limb {
  return {
    ...limb,
    startJoint: {
      ...limb.startJoint,
      x: pivotX - (limb.startJoint.x - pivotX),
    },
    endJoint: {
      ...limb.endJoint,
      x: pivotX - (limb.endJoint.x - pivotX),
    },
  };
}

// ==================== INTERPOLATION ====================

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpRigs(rigA: StickmanRig, rigB: StickmanRig, t: number): StickmanRig {
  return {
    position: {
      x: lerp(rigA.position.x, rigB.position.x, t),
      y: lerp(rigA.position.y, rigB.position.y, t),
    },
    rotation: lerp(rigA.rotation, rigB.rotation, t),
    scale: lerp(rigA.scale, rigB.scale, t),
    facingRight: rigA.facingRight,
    
    head: {
      x: lerp(rigA.head.x, rigB.head.x, t),
      y: lerp(rigA.head.y, rigB.head.y, t),
      radius: lerp(rigA.head.radius, rigB.head.radius, t),
      rotation: lerp(rigA.head.rotation, rigB.head.rotation, t),
      scale: lerp(rigA.head.scale, rigB.head.scale, t),
    },
    
    body: {
      topX: lerp(rigA.body.topX, rigB.body.topX, t),
      topY: lerp(rigA.body.topY, rigB.body.topY, t),
      bottomX: lerp(rigA.body.bottomX, rigB.body.bottomX, t),
      bottomY: lerp(rigA.body.bottomY, rigB.body.bottomY, t),
      length: lerp(rigA.body.length, rigB.body.length, t),
    },
    
    leftArm: lerpLimb(rigA.leftArm, rigB.leftArm, t),
    rightArm: lerpLimb(rigA.rightArm, rigB.rightArm, t),
    leftLeg: lerpLimb(rigA.leftLeg, rigB.leftLeg, t),
    rightLeg: lerpLimb(rigA.rightLeg, rigB.rightLeg, t),
  };
}

function lerpLimb(limbA: Limb, limbB: Limb, t: number): Limb {
  return {
    startJoint: {
      x: lerp(limbA.startJoint.x, limbB.startJoint.x, t),
      y: lerp(limbA.startJoint.y, limbB.startJoint.y, t),
      rotation: lerp(limbA.startJoint.rotation, limbB.startJoint.rotation, t),
    },
    endJoint: {
      x: lerp(limbA.endJoint.x, limbB.endJoint.x, t),
      y: lerp(limbA.endJoint.y, limbB.endJoint.y, t),
      rotation: lerp(limbA.endJoint.rotation, limbB.endJoint.rotation, t),
    },
    length: lerp(limbA.length, limbB.length, t),
    angle: lerp(limbA.angle, limbB.angle, t),
  };
}

// ==================== EASING FUNCTIONS ====================

export const Easing = {
  linear: (t: number) => t,
  
  easeIn: (t: number) => t * t,
  
  easeOut: (t: number) => t * (2 - t),
  
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  easeOutBounce: (t: number): number => {
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
  
  easeOutElastic: (t: number): number => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
  },
  
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  
  // Comedic timing ease - sudden start, gradual stop
  comedicIn: (t: number): number => {
    return t < 0.2 ? t * 5 : 1 - Math.pow(1 - t, 3);
  },
  
  // Snap - instant transition
  snap: (t: number, threshold: number = 0.5): number => {
    return t < threshold ? 0 : 1;
  },
};

// ==================== UTILITY ====================

export function cloneRig(rig: StickmanRig): StickmanRig {
  return JSON.parse(JSON.stringify(rig));
}

export function getRigBounds(rig: StickmanRig): { minX: number; maxX: number; minY: number; maxY: number } {
  const allX = [
    rig.head.x - rig.head.radius,
    rig.head.x + rig.head.radius,
    rig.body.topX,
    rig.body.bottomX,
    rig.leftArm.endJoint.x,
    rig.rightArm.endJoint.x,
    rig.leftLeg.endJoint.x,
    rig.rightLeg.endJoint.x,
  ];
  
  const allY = [
    rig.head.y - rig.head.radius,
    rig.body.topY,
    rig.body.bottomY,
    rig.leftArm.endJoint.y,
    rig.rightArm.endJoint.y,
    rig.leftLeg.endJoint.y,
    rig.rightLeg.endJoint.y,
  ];
  
  return {
    minX: Math.min(...allX),
    maxX: Math.max(...allX),
    minY: Math.min(...allY),
    maxY: Math.max(...allY),
  };
}
