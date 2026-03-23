// Animation Controller - Manages animation playback, blending, and state

import { Animation, StickmanPose, Position, ActionType, EasingType } from '@/lib/types';
import { StickmanRig, lerp, applyEasing } from './StickmanRig';
import { createAnimation, getAnimationDuration, isAnimationLooping } from './AnimationLibrary';

export interface CharacterAnimationState {
  rig: StickmanRig;
  position: Position;
  velocity: Position;
  facingRight: boolean;
  currentAnimation: Animation | null;
  animationFrame: number;
  animationProgress: number;
  targetPosition: Position | null;
  isMoving: boolean;
}

export interface AnimationTransition {
  from: ActionType | null;
  to: ActionType;
  blendDuration: number;
  blendProgress: number;
}

export class AnimationController {
  private characters: Map<string, CharacterAnimationState>;
  private transitions: Map<string, AnimationTransition>;
  private frameCount: number;

  constructor() {
    this.characters = new Map();
    this.transitions = new Map();
    this.frameCount = 0;
  }

  /**
   * Add a character to the controller
   */
  addCharacter(id: string, position: Position = { x: 400, y: 400 }): void {
    const state: CharacterAnimationState = {
      rig: new StickmanRig(1, position),
      position: { ...position },
      velocity: { x: 0, y: 0 },
      facingRight: true,
      currentAnimation: null,
      animationFrame: 0,
      animationProgress: 0,
      targetPosition: null,
      isMoving: false,
    };

    this.characters.set(id, state);
    this.playAnimation(id, 'idle');
  }

  /**
   * Remove a character
   */
  removeCharacter(id: string): void {
    this.characters.delete(id);
    this.transitions.delete(id);
  }

  /**
   * Get character state
   */
  getCharacter(id: string): CharacterAnimationState | undefined {
    return this.characters.get(id);
  }

  /**
   * Get all character IDs
   */
  getCharacterIds(): string[] {
    return Array.from(this.characters.keys());
  }

  /**
   * Play an animation on a character
   */
  playAnimation(id: string, type: ActionType, blend: boolean = true): void {
    const state = this.characters.get(id);
    if (!state) return;

    const newAnimation = createAnimation(type);

    if (blend && state.currentAnimation) {
      // Start transition
      this.transitions.set(id, {
        from: state.currentAnimation.name as ActionType,
        to: type,
        blendDuration: 10, // 10 frames for blending
        blendProgress: 0,
      });
    }

    state.currentAnimation = newAnimation;
    state.animationFrame = 0;
    state.animationProgress = 0;
  }

  /**
   * Move character to a position
   */
  moveTo(id: string, target: Position, speed: number = 3): void {
    const state = this.characters.get(id);
    if (!state) return;

    state.targetPosition = target;
    state.isMoving = true;

    // Determine facing direction
    if (target.x > state.position.x) {
      state.facingRight = true;
    } else if (target.x < state.position.x) {
      state.facingRight = false;
    }

    // Calculate velocity
    const dx = target.x - state.position.x;
    const dy = target.y - state.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      state.velocity = {
        x: (dx / dist) * speed,
        y: (dy / dist) * speed,
      };
    }

    // Play walk animation
    if (state.currentAnimation?.name !== 'walk') {
      this.playAnimation(id, 'walk');
    }
  }

  /**
   * Make character face a direction
   */
  faceDirection(id: string, facingRight: boolean): void {
    const state = this.characters.get(id);
    if (state) {
      state.facingRight = facingRight;
    }
  }

  /**
   * Update all character animations for one frame
   */
  update(): void {
    this.frameCount++;

    for (const [id, state] of this.characters) {
      // Update position if moving
      if (state.isMoving && state.targetPosition) {
        state.position.x += state.velocity.x;
        state.position.y += state.velocity.y;

        // Check if reached target
        const dx = state.targetPosition.x - state.position.x;
        const dy = state.targetPosition.y - state.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          state.position = { ...state.targetPosition };
          state.targetPosition = null;
          state.velocity = { x: 0, y: 0 };
          state.isMoving = false;
          this.playAnimation(id, 'idle');
        }

        state.rig.setPosition(state.position);
      }

      // Update animation
      if (state.currentAnimation) {
        state.animationProgress += 1;

        // Check for animation end
        if (state.animationProgress >= state.currentAnimation.totalDuration) {
          if (state.currentAnimation.loop) {
            state.animationProgress = 0;
            state.animationFrame = 0;
          } else {
            // Non-looping animation complete, switch to idle
            if (!state.isMoving) {
              this.playAnimation(id, 'idle');
            }
          }
        }

        // Update current frame index
        let frameStart = 0;
        for (let i = 0; i < state.currentAnimation.frames.length; i++) {
          const frame = state.currentAnimation.frames[i];
          if (state.animationProgress < frameStart + frame.duration) {
            state.animationFrame = i;
            break;
          }
          frameStart += frame.duration;
        }
      }

      // Apply animation pose
      this.applyAnimationPose(id);

      // Update blend transitions
      this.updateTransition(id);
    }
  }

  /**
   * Apply the current animation pose to the rig
   */
  private applyAnimationPose(id: string): void {
    const state = this.characters.get(id);
    if (!state || !state.currentAnimation) return;

    const animation = state.currentAnimation;
    const frames = animation.frames;

    // Find current frame and next frame
    let frameStart = 0;
    let currentFrameIndex = 0;
    let localProgress = 0;

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (state.animationProgress < frameStart + frame.duration) {
        currentFrameIndex = i;
        localProgress = (state.animationProgress - frameStart) / frame.duration;
        break;
      }
      frameStart += frame.duration;
    }

    const currentFrame = frames[currentFrameIndex];
    const nextFrame = frames[(currentFrameIndex + 1) % frames.length];

    // Interpolate between frames
    const easedProgress = applyEasing(localProgress, currentFrame.easing);

    for (const [jointName, joint] of currentFrame.joints) {
      const nextJoint = nextFrame.joints.get(jointName);
      if (nextJoint) {
        const rotation = lerp(joint.rotation, nextJoint.rotation, easedProgress);
        state.rig.setJointRotation(jointName, rotation);
      }
    }
  }

  /**
   * Update blend transitions
   */
  private updateTransition(id: string): void {
    const transition = this.transitions.get(id);
    if (!transition) return;

    transition.blendProgress += 1;

    if (transition.blendProgress >= transition.blendDuration) {
      this.transitions.delete(id);
    }
  }

  /**
   * Get the current pose for a character
   */
  getPose(id: string): StickmanPose | null {
    const state = this.characters.get(id);
    if (!state) return null;

    return state.rig.getPose();
  }

  /**
   * Set character position directly
   */
  setPosition(id: string, position: Position): void {
    const state = this.characters.get(id);
    if (state) {
      state.position = { ...position };
      state.rig.setPosition(position);
    }
  }

  /**
   * Get current frame count
   */
  getFrameCount(): number {
    return this.frameCount;
  }

  /**
   * Reset the controller
   */
  reset(): void {
    this.characters.clear();
    this.transitions.clear();
    this.frameCount = 0;
  }
}

// Singleton instance for global use
export const animationController = new AnimationController();
