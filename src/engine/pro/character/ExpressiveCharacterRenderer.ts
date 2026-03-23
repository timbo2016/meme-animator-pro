/**
 * Expressive Character Renderer
 * Professional-quality character rendering with emotions, accessories, and smooth animations
 */

import { 
  ProCharacter, 
  CharacterPose, 
  MoodType, 
  HandPose,
  Transform,
  ExpressionKeyframe
} from './types';

// Character rendering configuration
const RENDER_CONFIG = {
  // Base dimensions for a character
  baseWidth: 120,
  baseHeight: 280,
  headRadius: 45,
  neckLength: 20,
  torsoLength: 80,
  armLength: 70,
  forearmLength: 60,
  handRadius: 12,
  legLength: 80,
  shinLength: 75,
  footLength: 30,
  // Line widths
  outlineWidth: 3,
  detailWidth: 2,
};

// Mood to expression mapping
const MOOD_EXPRESSIONS: Record<MoodType, Partial<ExpressionKeyframe>> = {
  neutral: { eyes: 'normal', eyebrows: 'normal', mouth: 'normal' },
  happy: { eyes: 'happy', eyebrows: 'raised', mouth: 'smile' },
  sad: { eyes: 'small', eyebrows: 'normal', mouth: 'frown', tears: true },
  angry: { eyes: 'angry', eyebrows: 'angry', mouth: 'frown', veins: true },
  surprised: { eyes: 'big', eyebrows: 'raised', mouth: 'open' },
  scared: { eyes: 'big', eyebrows: 'raised', mouth: 'open', sweat: true },
  disgusted: { eyes: 'small', eyebrows: 'normal', mouth: 'frown' },
  confused: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' },
  excited: { eyes: 'big', eyebrows: 'raised', mouth: 'laugh', sparkles: true },
  embarrassed: { eyes: 'small', eyebrows: 'normal', mouth: 'frown', blush: 0.6 },
  proud: { eyes: 'normal', eyebrows: 'raised', mouth: 'smirk' },
  nervous: { eyes: 'small', eyebrows: 'normal', mouth: 'frown', sweat: true },
  thinking: { eyes: 'normal', eyebrows: 'raised', mouth: 'normal' },
  love: { eyes: 'happy', eyebrows: 'normal', mouth: 'smile', sparkles: true, blush: 0.4 },
  sleepy: { eyes: 'closed', eyebrows: 'normal', mouth: 'normal' },
};

export class ExpressiveCharacterRenderer {
  private ctx: CanvasRenderingContext2D;
  private character: ProCharacter;
  
  constructor(ctx: CanvasRenderingContext2D, character: ProCharacter) {
    this.ctx = ctx;
    this.character = character;
  }

  /**
   * Render the character with current pose and mood
   */
  render(): void {
    const { ctx, character } = this;
    const { transform, pose, mood, outfit, hair, face, skinTone } = character;
    
    ctx.save();
    
    // Apply transform
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale * (transform.flipX ? -1 : 1), transform.scale * (transform.flipY ? -1 : 1));
    ctx.rotate((transform.rotation * Math.PI) / 180);
    
    // Get expression based on mood
    const expression = MOOD_EXPRESSIONS[mood] || MOOD_EXPRESSIONS.neutral;
    
    // Render order: back arm, back leg, body, front leg, front arm, head
    this.renderBackLeg(pose);
    this.renderBackArm(pose);
    this.renderBody(pose, skinTone, outfit);
    this.renderFrontLeg(pose);
    this.renderFrontArm(pose);
    this.renderHead(pose, expression, skinTone, hair, face);
    
    // Render accessories
    this.renderAccessories();
    
    // Render expression effects
    this.renderExpressionEffects(expression);
    
    ctx.restore();
  }

  /**
   * Render the head with face
   */
  private renderHead(
    pose: CharacterPose,
    expression: Partial<ExpressionKeyframe>,
    skinTone: string,
    hair: ProCharacter['hair'],
    face: ProCharacter['face']
  ): void {
    const { ctx } = this;
    const headY = -RENDER_CONFIG.torsoLength - RENDER_CONFIG.neckLength;
    
    ctx.save();
    ctx.translate(0, headY);
    ctx.rotate((pose.headTilt * Math.PI) / 180);
    
    // Head shape
    ctx.beginPath();
    ctx.ellipse(0, 0, RENDER_CONFIG.headRadius, RENDER_CONFIG.headRadius * 1.1, 0, 0, Math.PI * 2);
    ctx.fillStyle = skinTone;
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.outlineWidth;
    ctx.stroke();
    
    // Hair
    this.renderHair(hair);
    
    // Face features
    this.renderFace(expression, face);
    
    ctx.restore();
  }

  /**
   * Render hair
   */
  private renderHair(hair: ProCharacter['hair']): void {
    const { ctx } = this;
    
    ctx.fillStyle = hair.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.detailWidth;
    
    switch (hair.style) {
      case 'spiky':
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 12, -RENDER_CONFIG.headRadius);
          ctx.lineTo(i * 10, -RENDER_CONFIG.headRadius - 25 - Math.random() * 10);
          ctx.lineTo(i * 12 + 8, -RENDER_CONFIG.headRadius);
          ctx.fill();
          ctx.stroke();
        }
        break;
        
      case 'curly':
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * RENDER_CONFIG.headRadius * 0.8;
          const y = Math.sin(angle) * RENDER_CONFIG.headRadius * 0.8;
          ctx.beginPath();
          ctx.arc(x, y, 15, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'ponytail':
        // Main hair
        ctx.beginPath();
        ctx.ellipse(0, -RENDER_CONFIG.headRadius + 10, RENDER_CONFIG.headRadius + 5, RENDER_CONFIG.headRadius * 0.6, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        // Ponytail
        ctx.beginPath();
        ctx.moveTo(0, -RENDER_CONFIG.headRadius);
        ctx.quadraticCurveTo(30, -RENDER_CONFIG.headRadius + 10, 25, 30);
        ctx.quadraticCurveTo(35, 50, 20, 60);
        ctx.lineTo(10, 40);
        ctx.quadraticCurveTo(15, 20, 0, -RENDER_CONFIG.headRadius);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'mohawk':
        ctx.beginPath();
        ctx.moveTo(-10, -RENDER_CONFIG.headRadius);
        ctx.lineTo(0, -RENDER_CONFIG.headRadius - 40);
        ctx.lineTo(10, -RENDER_CONFIG.headRadius);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'afro':
        ctx.beginPath();
        ctx.arc(0, -5, RENDER_CONFIG.headRadius + 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      default: // short
        ctx.beginPath();
        ctx.ellipse(0, -RENDER_CONFIG.headRadius + 10, RENDER_CONFIG.headRadius + 3, RENDER_CONFIG.headRadius * 0.4, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
    }
  }

  /**
   * Render face features
   */
  private renderFace(expression: Partial<ExpressionKeyframe>, face: ProCharacter['face']): void {
    const { ctx } = this;
    
    const eyeY = -8;
    const eyeSpacing = 15;
    
    // Eyes
    this.renderEye(-eyeSpacing, eyeY, expression.eyes || 'normal', face.eyeColor);
    this.renderEye(eyeSpacing, eyeY, expression.eyes || 'normal', face.eyeColor);
    
    // Eyebrows
    this.renderEyebrow(-eyeSpacing, eyeY - 15, expression.eyebrows || 'normal');
    this.renderEyebrow(eyeSpacing, eyeY - 15, expression.eyebrows || 'normal');
    
    // Mouth
    this.renderMouth(0, 15, expression.mouth || 'normal');
    
    // Blush
    if (expression.blush) {
      ctx.fillStyle = `rgba(255, 150, 150, ${expression.blush})`;
      ctx.beginPath();
      ctx.ellipse(-25, 8, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(25, 8, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Sweat drop
    if (expression.sweat) {
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.ellipse(40, -20, 5, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Tears
    if (expression.tears) {
      ctx.fillStyle = '#87CEEB';
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing - 3, eyeY + 10, 4, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Anger veins
    if (expression.veins) {
      ctx.strokeStyle = '#FF6B6B';
      ctx.lineWidth = 2;
      const veinX = 35;
      const veinY = -25;
      ctx.beginPath();
      ctx.moveTo(veinX, veinY);
      ctx.lineTo(veinX + 8, veinY + 5);
      ctx.lineTo(veinX + 3, veinY + 8);
      ctx.lineTo(veinX + 10, veinY + 12);
      ctx.stroke();
    }
    
    // Sparkles
    if (expression.sparkles) {
      ctx.fillStyle = '#FFD700';
      for (let i = 0; i < 3; i++) {
        const sparkleX = -40 + i * 25 + Math.sin(Date.now() / 200 + i) * 5;
        const sparkleY = -30 + Math.cos(Date.now() / 150 + i) * 5;
        this.drawStar(sparkleX, sparkleY, 5, 8, 4);
      }
    }
  }

  /**
   * Render an eye
   */
  private renderEye(x: number, y: number, style: string, color: string): void {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(x, y);
    
    switch (style) {
      case 'closed':
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
        
      case 'angry':
        // Angry eye shape
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = RENDER_CONFIG.detailWidth;
        ctx.stroke();
        // Pupil
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 2, 5, 0, Math.PI * 2);
        ctx.fill();
        // Angry brow
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(12, -4);
        ctx.stroke();
        break;
        
      case 'big':
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = RENDER_CONFIG.detailWidth;
        ctx.stroke();
        // Pupil
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 2, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 2, 4, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(3, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'small':
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = RENDER_CONFIG.detailWidth;
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'happy':
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 2, 10, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
        
      default: // normal
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = RENDER_CONFIG.detailWidth;
        ctx.stroke();
        // Iris
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 1, 6, 0, Math.PI * 2);
        ctx.fill();
        // Pupil
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 1, 3, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(3, -2, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Render an eyebrow
   */
  private renderEyebrow(x: number, y: number, style: string): void {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = style === 'thick' ? 4 : style === 'thin' ? 2 : 3;
    ctx.lineCap = 'round';
    
    switch (style) {
      case 'angry':
        ctx.beginPath();
        ctx.moveTo(-10, 5);
        ctx.lineTo(10, -5);
        ctx.stroke();
        break;
        
      case 'raised':
        ctx.beginPath();
        ctx.arc(0, -5, 10, 0.8 * Math.PI, 0.2 * Math.PI);
        ctx.stroke();
        break;
        
      default:
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Render mouth
   */
  private renderMouth(x: number, y: number, style: string): void {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#FF6B6B';
    ctx.lineWidth = RENDER_CONFIG.detailWidth;
    
    switch (style) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        break;
        
      case 'frown':
        ctx.beginPath();
        ctx.arc(0, 10, 12, 1.1 * Math.PI, 1.9 * Math.PI);
        ctx.stroke();
        break;
        
      case 'open':
        ctx.beginPath();
        ctx.ellipse(0, 3, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Tongue
        ctx.fillStyle = '#FF8080';
        ctx.beginPath();
        ctx.ellipse(0, 10, 5, 4, 0, 0, Math.PI);
        ctx.fill();
        break;
        
      case 'laugh':
        ctx.beginPath();
        ctx.ellipse(0, 5, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Tongue
        ctx.fillStyle = '#FF8080';
        ctx.beginPath();
        ctx.ellipse(0, 12, 6, 5, 0, 0, Math.PI);
        ctx.fill();
        break;
        
      case 'smirk':
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(5, -5);
        ctx.lineTo(12, 5);
        ctx.stroke();
        break;
        
      default:
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * Render the body/torso
   */
  private renderBody(pose: CharacterPose, skinTone: string, outfit: ProCharacter['outfit']): void {
    const { ctx } = this;
    
    ctx.save();
    
    // Apply spine curve
    ctx.rotate((pose.spineCurve * Math.PI) / 180);
    
    // Torso
    ctx.fillStyle = outfit.top.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.outlineWidth;
    
    // Draw torso shape
    ctx.beginPath();
    ctx.moveTo(-25, -RENDER_CONFIG.torsoLength);
    ctx.quadraticCurveTo(-30, -RENDER_CONFIG.torsoLength / 2, -25, 0);
    ctx.lineTo(25, 0);
    ctx.quadraticCurveTo(30, -RENDER_CONFIG.torsoLength / 2, 25, -RENDER_CONFIG.torsoLength);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw pants/skirt
    ctx.fillStyle = outfit.bottom.color;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-30, 15);
    ctx.lineTo(30, 15);
    ctx.lineTo(25, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw neck
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.moveTo(-8, -RENDER_CONFIG.torsoLength);
    ctx.lineTo(-8, -RENDER_CONFIG.torsoLength - RENDER_CONFIG.neckLength);
    ctx.lineTo(8, -RENDER_CONFIG.torsoLength - RENDER_CONFIG.neckLength);
    ctx.lineTo(8, -RENDER_CONFIG.torsoLength);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * Render front arm
   */
  private renderFrontArm(pose: CharacterPose): void {
    this.renderArm(pose, true, pose.rightArmAngle, pose.rightForearmAngle);
  }

  /**
   * Render back arm
   */
  private renderBackArm(pose: CharacterPose): void {
    this.renderArm(pose, false, pose.leftArmAngle, pose.leftForearmAngle);
  }

  /**
   * Render an arm
   */
  private renderArm(pose: CharacterPose, isFront: boolean, armAngle: number, forearmAngle: number): void {
    const { ctx, character } = this;
    const offsetX = isFront ? 28 : -28;
    const startY = -RENDER_CONFIG.torsoLength + 15;
    
    // Darken back arm
    if (!isFront) {
      ctx.globalAlpha = 0.7;
    }
    
    ctx.save();
    ctx.translate(offsetX, startY);
    
    // Upper arm
    ctx.rotate((armAngle * Math.PI) / 180);
    ctx.fillStyle = character.outfit.top.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.outlineWidth;
    
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, RENDER_CONFIG.armLength, 8);
    ctx.fill();
    ctx.stroke();
    
    // Forearm
    ctx.translate(0, RENDER_CONFIG.armLength);
    ctx.rotate((forearmAngle * Math.PI) / 180);
    
    ctx.fillStyle = character.skinTone;
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, RENDER_CONFIG.forearmLength, 7);
    ctx.fill();
    ctx.stroke();
    
    // Hand
    const handPose = isFront ? pose.rightHandPose : pose.leftHandPose;
    this.renderHand(0, RENDER_CONFIG.forearmLength, handPose);
    
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * Render a hand
   */
  private renderHand(x: number, y: number, pose: HandPose): void {
    const { ctx, character } = this;
    
    ctx.save();
    ctx.translate(x, y);
    
    ctx.fillStyle = character.skinTone;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.detailWidth;
    
    switch (pose) {
      case 'fist':
        ctx.beginPath();
        ctx.roundRect(-10, 0, 20, 18, 5);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'point':
        ctx.beginPath();
        ctx.roundRect(-8, 0, 16, 12, 4);
        ctx.fill();
        ctx.stroke();
        // Pointing finger
        ctx.beginPath();
        ctx.roundRect(2, -20, 6, 25, 3);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'thumbs_up':
        ctx.beginPath();
        ctx.roundRect(-10, 0, 20, 15, 5);
        ctx.fill();
        ctx.stroke();
        // Thumb
        ctx.beginPath();
        ctx.roundRect(-15, -15, 8, 18, 4);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'peace':
        // Palm
        ctx.beginPath();
        ctx.roundRect(-8, 0, 16, 12, 4);
        ctx.fill();
        ctx.stroke();
        // Two fingers
        ctx.beginPath();
        ctx.roundRect(-5, -20, 5, 22, 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(2, -20, 5, 22, 2);
        ctx.fill();
        ctx.stroke();
        break;
        
      default: // open
        ctx.beginPath();
        ctx.arc(0, 8, RENDER_CONFIG.handRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Fingers
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.roundRect(i * 5 - 2, -5, 4, 12, 2);
          ctx.fill();
          ctx.stroke();
        }
    }
    
    ctx.restore();
  }

  /**
   * Render front leg
   */
  private renderFrontLeg(pose: CharacterPose): void {
    this.renderLeg(pose, true, pose.rightLegAngle, pose.rightKneeAngle, pose.rightFootAngle);
  }

  /**
   * Render back leg
   */
  private renderBackLeg(pose: CharacterPose): void {
    this.renderLeg(pose, false, pose.leftLegAngle, pose.leftKneeAngle, pose.leftFootAngle);
  }

  /**
   * Render a leg
   */
  private renderLeg(pose: CharacterPose, isFront: boolean, legAngle: number, kneeAngle: number, footAngle: number): void {
    const { ctx, character } = this;
    const offsetX = isFront ? 15 : -15;
    
    // Darken back leg
    if (!isFront) {
      ctx.globalAlpha = 0.7;
    }
    
    ctx.save();
    ctx.translate(offsetX, 15);
    
    // Upper leg
    ctx.rotate((legAngle * Math.PI) / 180);
    ctx.fillStyle = character.outfit.bottom.color;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = RENDER_CONFIG.outlineWidth;
    
    ctx.beginPath();
    ctx.roundRect(-10, 0, 20, RENDER_CONFIG.legLength, 10);
    ctx.fill();
    ctx.stroke();
    
    // Lower leg
    ctx.translate(0, RENDER_CONFIG.legLength);
    ctx.rotate((kneeAngle * Math.PI) / 180);
    
    ctx.fillStyle = character.skinTone;
    ctx.beginPath();
    ctx.roundRect(-9, 0, 18, RENDER_CONFIG.shinLength, 9);
    ctx.fill();
    ctx.stroke();
    
    // Foot
    ctx.translate(0, RENDER_CONFIG.shinLength);
    ctx.rotate((footAngle * Math.PI) / 180);
    
    ctx.fillStyle = character.outfit.shoes.color;
    ctx.beginPath();
    ctx.roundRect(-8, 0, 20, 12, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * Render accessories
   */
  private renderAccessories(): void {
    const { ctx, character } = this;
    
    for (const accessory of character.accessories) {
      ctx.save();
      
      switch (accessory.type) {
        case 'glasses':
          // Draw glasses
          ctx.strokeStyle = accessory.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-22, -12, 18, 14, 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.roundRect(4, -12, 18, 14, 3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-4, -5);
          ctx.lineTo(4, -5);
          ctx.stroke();
          break;
          
        case 'hat':
          ctx.translate(0, -RENDER_CONFIG.headRadius - 20);
          ctx.fillStyle = accessory.color;
          ctx.beginPath();
          ctx.ellipse(0, 15, 40, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.roundRect(-25, -20, 50, 35, 5);
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'earrings':
          ctx.fillStyle = accessory.color;
          const earringY = 10;
          ctx.beginPath();
          ctx.arc(-RENDER_CONFIG.headRadius - 3, earringY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(RENDER_CONFIG.headRadius + 3, earringY, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      ctx.restore();
    }
  }

  /**
   * Render expression effects (particles, etc.)
   */
  private renderExpressionEffects(expression: Partial<ExpressionKeyframe>): void {
    const { ctx } = this;
    
    // Emotional particles
    if (expression.sparkles) {
      ctx.fillStyle = '#FFD700';
      const time = Date.now() / 1000;
      for (let i = 0; i < 5; i++) {
        const angle = time * 2 + i * Math.PI * 0.4;
        const radius = 50 + Math.sin(time * 3 + i) * 10;
        const x = Math.cos(angle) * radius;
        const y = -RENDER_CONFIG.torsoLength + Math.sin(angle) * 30;
        this.drawStar(x, y, 4, 6, 3);
      }
    }
    
    if (expression.veins) {
      // Pulsing anger cross
      const pulse = 1 + Math.sin(Date.now() / 100) * 0.2;
      ctx.save();
      ctx.translate(40, -RENDER_CONFIG.torsoLength - 30);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-5, -5);
      ctx.lineTo(5, 5);
      ctx.moveTo(5, -5);
      ctx.lineTo(-5, 5);
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Draw a star shape
   */
  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Export factory function
export function createCharacterRenderer(ctx: CanvasRenderingContext2D, character: ProCharacter): ExpressiveCharacterRenderer {
  return new ExpressiveCharacterRenderer(ctx, character);
}
