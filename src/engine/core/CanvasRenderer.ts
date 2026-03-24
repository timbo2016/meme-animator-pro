// Rico-Style Stickman Animation Engine
// Canvas Renderer - Frame Rendering System

import { 
  StickmanRig, 
  Character, 
  Scene, 
  CameraState,
  EmotionType,
  Position,
  Dialogue,
  RENDER_CONFIG 
} from './types';
import { CameraController } from './CameraEngine';
import { Easing } from './RigSystem';

// ==================== RENDERER CLASS ====================

export class CanvasRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private width: number = 720;
  private height: number = 1280;
  
  // Animation state
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  
  // Visual settings
  private strokeWidth: number = 8;
  private roughness: number = 2;
  
  constructor() {}
  
  // Initialize with canvas
  initialize(canvas: HTMLCanvasElement, width?: number, height?: number): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    if (width && height) {
      this.width = width;
      this.height = height;
    }
    
    if (this.ctx) {
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }
  
  // Resize canvas
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }
  
  // ==================== MAIN RENDER ====================
  
  render(
    characters: Character[],
    cameraState: CameraState,
    background: string = '#FFFFFF',
    dialogue?: Dialogue[]
  ): void {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    
    // Clear canvas
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Apply camera transform
    ctx.save();
    this.applyCamera(ctx, cameraState);
    
    // Draw characters
    characters.forEach(char => {
      this.drawCharacter(ctx, char);
    });
    
    ctx.restore();
    
    // Draw dialogue (after camera transform is reset)
    if (dialogue) {
      dialogue.forEach(d => this.drawDialogue(ctx, d, characters));
    }
  }
  
  // ==================== CAMERA ====================
  
  private applyCamera(ctx: CanvasRenderingContext2D, state: CameraState): void {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Apply shake
    const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 2 : 0;
    const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 2 : 0;
    
    ctx.translate(centerX + shakeX, centerY + shakeY);
    ctx.scale(state.zoom, state.zoom);
    ctx.rotate(state.rotation);
    ctx.translate(-centerX + state.panX, -centerY + state.panY);
  }
  
  // ==================== CHARACTER DRAWING ====================
  
  private drawCharacter(ctx: CanvasRenderingContext2D, character: Character): void {
    const { rig, color, opacity, facingRight, emotion } = character;
    
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Translate to character position
    ctx.translate(rig.position.x, rig.position.y);
    
    // Flip if facing left
    if (!facingRight) {
      ctx.scale(-1, 1);
    }
    
    // Apply character scale
    ctx.scale(rig.scale, rig.scale);
    
    // Set stroke style
    ctx.strokeStyle = color;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw body parts
    this.drawBody(ctx, rig);
    this.drawHead(ctx, rig, emotion);
    this.drawLimbs(ctx, rig);
    this.drawFace(ctx, rig, emotion, character.state);
    
    // Draw name below
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(character.name, 0, 120);
    
    ctx.restore();
  }
  
  private drawBody(ctx: CanvasRenderingContext2D, rig: StickmanRig): void {
    const { body, rotation } = rig;
    
    ctx.save();
    ctx.rotate(rotation);
    
    // Apply roughness for sketch effect
    const offsetX = (Math.random() - 0.5) * this.roughness;
    const offsetY = (Math.random() - 0.5) * this.roughness;
    
    ctx.beginPath();
    ctx.moveTo(body.topX - rig.position.x + offsetX, body.topY - rig.position.y + offsetY);
    ctx.lineTo(body.bottomX - rig.position.x + offsetX, body.bottomY - rig.position.y + offsetY);
    ctx.stroke();
    
    ctx.restore();
  }
  
  private drawHead(ctx: CanvasRenderingContext2D, rig: StickmanRig, emotion: EmotionType): void {
    const { head } = rig;
    const headX = head.x - rig.position.x;
    const headY = head.y - rig.position.y;
    
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(head.rotation);
    ctx.scale(head.scale, head.scale);
    
    // Draw head circle with roughness
    ctx.beginPath();
    for (let i = 0; i <= 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const r = head.radius + (Math.random() - 0.5) * this.roughness;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    
    // Fill with skin tone
    ctx.fillStyle = '#FFE4C4';
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  private drawLimbs(ctx: CanvasRenderingContext2D, rig: StickmanRig): void {
    const { leftArm, rightArm, leftLeg, rightLeg, position } = rig;
    
    // Arms
    this.drawLimb(ctx, leftArm, position);
    this.drawLimb(ctx, rightArm, position);
    
    // Legs
    this.drawLimb(ctx, leftLeg, position);
    this.drawLimb(ctx, rightLeg, position);
  }
  
  private drawLimb(ctx: CanvasRenderingContext2D, limb: StickmanRig['leftArm'], position: Position): void {
    const startX = limb.startJoint.x - position.x;
    const startY = limb.startJoint.y - position.y;
    const endX = limb.endJoint.x - position.x;
    const endY = limb.endJoint.y - position.y;
    
    // Add roughness
    const offset = (Math.random() - 0.5) * this.roughness;
    
    ctx.beginPath();
    ctx.moveTo(startX + offset, startY + offset);
    ctx.lineTo(endX + offset, endY + offset);
    ctx.stroke();
  }
  
  // ==================== FACE DRAWING ====================
  
  private drawFace(ctx: CanvasRenderingContext2D, rig: StickmanRig, emotion: EmotionType, state: string): void {
    const { head, position } = rig;
    const headX = head.x - position.x;
    const headY = head.y - position.y;
    
    ctx.save();
    ctx.translate(headX, headY);
    ctx.rotate(head.rotation);
    
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    const isTalking = state === 'talking';
    
    // Eyes
    this.drawEyes(ctx, emotion, isTalking);
    
    // Mouth
    this.drawMouth(ctx, emotion, isTalking);
    
    // Eyebrows
    this.drawEyebrows(ctx, emotion);
    
    ctx.restore();
  }
  
  private drawEyes(ctx: CanvasRenderingContext2D, emotion: EmotionType, isTalking: boolean): void {
    const eyeY = -5;
    const eyeSpacing = 10;
    
    switch (emotion) {
      case 'happy':
      case 'smug':
        // Happy closed eyes (curved lines)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY + 2, 6, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY + 2, 6, Math.PI, 2 * Math.PI);
        ctx.stroke();
        break;
        
      case 'shocked':
      case 'scared':
        // Wide eyes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Small pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'angry':
        // Angry eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'evil_grin':
        // Evil eyes (slanted)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 5, 0, Math.PI * 2);
        ctx.fill();
        // Extra detail
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 8, eyeY - 5);
        ctx.lineTo(-eyeSpacing + 8, eyeY + 3);
        ctx.stroke();
        break;
        
      case 'sad':
        // Sad eyes (droopy)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY + 2, 4, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'confused':
        // One raised eyebrow look
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY - 2, 4, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY + 2, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      default:
        // Neutral dot eyes
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
    }
  }
  
  private drawMouth(ctx: CanvasRenderingContext2D, emotion: EmotionType, isTalking: boolean): void {
    const mouthY = 12;
    
    if (isTalking) {
      // Animated talking mouth
      const mouthOpen = Math.abs(Math.sin(Date.now() / 100)) * 6 + 3;
      ctx.beginPath();
      ctx.ellipse(0, mouthY, 8, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    
    switch (emotion) {
      case 'happy':
      case 'smug':
        // Big smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, mouthY - 3, 10, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        break;
        
      case 'evil_grin':
        // Evil smirk
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, mouthY);
        ctx.quadraticCurveTo(0, mouthY + 8, 12, mouthY - 5);
        ctx.stroke();
        break;
        
      case 'shocked':
      case 'scared':
        // O mouth
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, mouthY + 3, 7, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'sad':
        // Frown
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, mouthY + 15, 10, 1.15 * Math.PI, 1.85 * Math.PI);
        ctx.stroke();
        break;
        
      case 'angry':
        // Angry frown
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, mouthY + 5);
        ctx.lineTo(8, mouthY + 2);
        ctx.stroke();
        break;
        
      default:
        // Neutral line
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-8, mouthY);
        ctx.lineTo(8, mouthY);
        ctx.stroke();
    }
  }
  
  private drawEyebrows(ctx: CanvasRenderingContext2D, emotion: EmotionType): void {
    const browY = -15;
    const eyeSpacing = 10;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    switch (emotion) {
      case 'angry':
        // Angry eyebrows
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 8, browY - 5);
        ctx.lineTo(-eyeSpacing + 6, browY + 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyeSpacing - 6, browY + 3);
        ctx.lineTo(eyeSpacing + 8, browY - 5);
        ctx.stroke();
        break;
        
      case 'shocked':
      case 'scared':
        // Raised eyebrows
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 6, browY - 5);
        ctx.lineTo(-eyeSpacing + 6, browY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyeSpacing - 6, browY - 5);
        ctx.lineTo(eyeSpacing + 6, browY - 5);
        ctx.stroke();
        break;
        
      case 'sad':
        // Worried eyebrows
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 6, browY);
        ctx.lineTo(-eyeSpacing + 6, browY - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyeSpacing - 6, browY - 4);
        ctx.lineTo(eyeSpacing + 6, browY);
        ctx.stroke();
        break;
    }
  }
  
  // ==================== DIALOGUE DRAWING ====================
  
  private drawDialogue(ctx: CanvasRenderingContext2D, dialogue: Dialogue, characters: Character[]): void {
    const character = characters.find(c => c.id === dialogue.characterId);
    if (!character) return;
    
    const x = character.position.x;
    const y = character.position.y - 180;
    
    ctx.save();
    
    // Measure text
    ctx.font = 'bold 24px Arial';
    const textWidth = ctx.measureText(dialogue.text).width;
    const bubbleWidth = Math.max(textWidth + 30, 80);
    const bubbleHeight = 40;
    
    // Draw bubble
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(x - 8, y + bubbleHeight / 2);
    ctx.lineTo(x, y + bubbleHeight / 2 + 15);
    ctx.lineTo(x + 8, y + bubbleHeight / 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dialogue.text, x, y);
    
    ctx.restore();
  }
  
  // ==================== BACKGROUND ====================
  
  drawBackground(type: string): void {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    
    switch (type) {
      case 'classroom':
        this.drawClassroomBackground(ctx);
        break;
      case 'street':
        this.drawStreetBackground(ctx);
        break;
      case 'kitchen':
        this.drawKitchenBackground(ctx);
        break;
      default:
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  private drawClassroomBackground(ctx: CanvasRenderingContext2D): void {
    // Sky/wall
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Chalkboard
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(100, 200, this.width - 200, 400);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(100, 200, this.width - 200, 400);
    
    // Floor
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, this.height - 300, this.width, 300);
  }
  
  private drawStreetBackground(ctx: CanvasRenderingContext2D): void {
    // Sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, this.height * 0.5);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, this.width, this.height * 0.5);
    
    // Road
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, this.height * 0.5, this.width, this.height * 0.5);
    
    // Road markings
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, this.height * 0.7);
    ctx.lineTo(this.width, this.height * 0.7);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  private drawKitchenBackground(ctx: CanvasRenderingContext2D): void {
    // Wall
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(0, 0, this.width, this.height * 0.6);
    
    // Floor
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);
    
    // Fridge
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(this.width - 250, 200, 180, 450);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.width - 250, 200, 180, 450);
    ctx.strokeRect(this.width - 250, 200, 180, 220);
  }
  
  // ==================== FRAME CAPTURE ====================
  
  captureFrame(): string {
    if (!this.canvas) return '';
    return this.canvas.toDataURL('image/png');
  }
  
  captureFrameBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.canvas) {
        resolve(null);
        return;
      }
      this.canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }
  
  // ==================== UTILITIES ====================
  
  clear(): void {
    if (this.ctx) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
}

// Export singleton
export const canvasRenderer = new CanvasRenderer();
