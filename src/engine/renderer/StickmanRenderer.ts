// Stickman Meme Animator - Stickman Renderer
// Sketch-style stickman rendering for meme animations

import { 
  Character, 
  CharacterState, 
  EmotionType, 
  ExpressionDef,
  EXPRESSION_MAP,
  Position,
  AnimationFrame
} from '../types';

// ==================== RENDERER CONFIG ====================

interface RendererConfig {
  strokeWidth: number;
  headRadius: number;
  bodyLength: number;
  limbLength: number;
  roughness: number; // Sketch-style roughness
}

const DEFAULT_CONFIG: RendererConfig = {
  strokeWidth: 8,
  headRadius: 40,
  bodyLength: 80,
  limbLength: 60,
  roughness: 2,
};

// ==================== STICKMAN RENDERER ====================

export class StickmanRenderer {
  private config: RendererConfig;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvas: HTMLCanvasElement | null = null;

  constructor(config: Partial<RendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Initialize renderer with canvas
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  // Main render function
  render(
    characters: Map<string, { state: CharacterState; animationFrame?: AnimationFrame }>,
    cameraTransform?: { zoom: number; pan: Position; rotation: number }
  ): void {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const canvas = this.canvas;

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    if (cameraTransform) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(cameraTransform.zoom, cameraTransform.zoom);
      ctx.rotate((cameraTransform.rotation * Math.PI) / 180);
      ctx.translate(-centerX + cameraTransform.pan.x, -centerY + cameraTransform.pan.y);
    }

    // Draw each character
    characters.forEach((charState, id) => {
      this.drawStickman(ctx, charState.state, charState.animationFrame, id);
    });

    ctx.restore();
  }

  // Draw a single stickman
  private drawStickman(
    ctx: CanvasRenderingContext2D,
    state: CharacterState,
    animationFrame?: AnimationFrame,
    id?: string
  ): void {
    const { position, facingRight, emotion, scale, squash, stretch, rotation, opacity } = state;
    
    ctx.save();
    
    // Apply transforms
    ctx.globalAlpha = opacity;
    ctx.translate(position.x, position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      facingRight ? scale * squash : -scale * squash,
      scale * stretch
    );

    // Apply animation frame offsets
    let headOffset = { x: 0, y: 0 };
    let leftArm = [-25, -10];
    let rightArm = [25, -10];
    let leftLeg = [-15, 40];
    let rightLeg = [15, 40];
    let bodyLean = 0;

    if (animationFrame) {
      headOffset = animationFrame.headOffset;
      leftArm = animationFrame.leftArm;
      rightArm = animationFrame.rightArm;
      leftLeg = animationFrame.leftLeg;
      rightLeg = animationFrame.rightLeg;
      bodyLean = animationFrame.bodyLean;
    }

    // Draw style - thick black strokes, rough look
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = this.config.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Apply body lean
    ctx.save();
    ctx.rotate((bodyLean * Math.PI) / 180);

    // Draw body (spine)
    this.drawRoughLine(ctx, 0, -this.config.bodyLength, 0, 0);

    // Draw head
    const headY = -this.config.bodyLength - this.config.headRadius + headOffset.y;
    this.drawRoughCircle(ctx, headOffset.x, headY, this.config.headRadius);

    // Draw face
    this.drawFace(ctx, headOffset.x, headY, emotion);

    // Draw arms
    const armStartY = -this.config.bodyLength + 20;
    this.drawRoughLine(ctx, 0, armStartY, leftArm[0], armStartY + leftArm[1]);
    this.drawRoughLine(ctx, 0, armStartY, rightArm[0], armStartY + rightArm[1]);

    // Draw legs
    this.drawRoughLine(ctx, 0, 0, leftLeg[0], leftLeg[1]);
    this.drawRoughLine(ctx, 0, 0, rightLeg[0], rightLeg[1]);

    ctx.restore(); // Body lean

    // Draw character name
    if (id) {
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        id.charAt(0).toUpperCase() + id.slice(1),
        0,
        this.config.limbLength + 40
      );
    }

    ctx.restore();
  }

  // Draw rough/sketch-style line
  private drawRoughLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): void {
    ctx.beginPath();
    
    // Add slight roughness
    const roughness = this.config.roughness;
    
    ctx.moveTo(
      x1 + (Math.random() - 0.5) * roughness,
      y1 + (Math.random() - 0.5) * roughness
    );
    
    // Maybe add a wobble in the middle for longer lines
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (length > 30) {
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * roughness * 2;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * roughness * 2;
      ctx.quadraticCurveTo(midX, midY, x2, y2);
    } else {
      ctx.lineTo(
        x2 + (Math.random() - 0.5) * roughness,
        y2 + (Math.random() - 0.5) * roughness
      );
    }
    
    ctx.stroke();
  }

  // Draw rough/sketch-style circle
  private drawRoughCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number
  ): void {
    const roughness = this.config.roughness;
    
    ctx.beginPath();
    
    // Draw slightly imperfect circle
    for (let i = 0; i <= 360; i += 10) {
      const angle = (i * Math.PI) / 180;
      const r = radius + (Math.random() - 0.5) * roughness;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Fill with skin tone
    ctx.fillStyle = '#FFE4C4';
    ctx.fill();
  }

  // Draw face expression
  private drawFace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    emotion: EmotionType
  ): void {
    const expression = EXPRESSION_MAP[emotion] || EXPRESSION_MAP.neutral;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Draw eyes based on expression
    this.drawEyes(ctx, expression);
    
    // Draw mouth based on expression
    this.drawMouth(ctx, expression);
    
    // Draw eyebrows if defined
    if (expression.eyebrows) {
      this.drawEyebrows(ctx, expression);
    }
    
    ctx.restore();
  }

  // Draw eyes
  private drawEyes(ctx: CanvasRenderingContext2D, expression: ExpressionDef): void {
    ctx.fillStyle = '#000000';
    const eyeY = -5;
    const eyeSpacing = 12;
    
    switch (expression.eyes) {
      case 'dots':
        // Simple dot eyes
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'wide':
        // Wide shocked eyes
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 10, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 10, 0, Math.PI * 2);
        ctx.stroke();
        // Small pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'angry':
        // Angry eyes with pupils
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2);
        ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'closed':
        // Closed happy eyes (curved lines)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY + 3, 8, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY + 3, 8, Math.PI, 2 * Math.PI);
        ctx.stroke();
        break;
      
      case 'x_eyes':
        // X eyes (dead/knocked out)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        // Left X
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 6, eyeY - 6);
        ctx.lineTo(-eyeSpacing + 6, eyeY + 6);
        ctx.moveTo(-eyeSpacing + 6, eyeY - 6);
        ctx.lineTo(-eyeSpacing - 6, eyeY + 6);
        ctx.stroke();
        // Right X
        ctx.beginPath();
        ctx.moveTo(eyeSpacing - 6, eyeY - 6);
        ctx.lineTo(eyeSpacing + 6, eyeY + 6);
        ctx.moveTo(eyeSpacing + 6, eyeY - 6);
        ctx.lineTo(eyeSpacing - 6, eyeY + 6);
        ctx.stroke();
        break;
      
      case 'swirl':
        // Swirl eyes (dizzy)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        // Simplified swirl
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeY, 7, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(eyeSpacing, eyeY, 7, 0, Math.PI * 1.5);
        ctx.stroke();
        break;
    }
  }

  // Draw mouth
  private drawMouth(ctx: CanvasRenderingContext2D, expression: ExpressionDef): void {
    const mouthY = 15;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 4;
    
    switch (expression.mouth) {
      case 'flat':
        // Flat line mouth
        ctx.beginPath();
        ctx.moveTo(-10, mouthY);
        ctx.lineTo(10, mouthY);
        ctx.stroke();
        break;
      
      case 'smile':
        // Happy smile
        ctx.beginPath();
        ctx.arc(0, mouthY - 5, 12, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        break;
      
      case 'frown':
        // Sad frown
        ctx.beginPath();
        ctx.arc(0, mouthY + 15, 12, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
        break;
      
      case 'open':
        // Open mouth (surprised)
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'scream':
        // Big scream mouth
        ctx.beginPath();
        ctx.ellipse(0, mouthY + 5, 12, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'smirk':
        // Smug smirk
        ctx.beginPath();
        ctx.moveTo(-8, mouthY);
        ctx.quadraticCurveTo(5, mouthY + 5, 12, mouthY - 5);
        ctx.stroke();
        break;
      
      case 'o_shape':
        // O mouth (surprised)
        ctx.beginPath();
        ctx.arc(0, mouthY, 8, 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }

  // Draw eyebrows
  private drawEyebrows(ctx: CanvasRenderingContext2D, expression: ExpressionDef): void {
    const eyebrowY = -18;
    const eyebrowSpacing = 12;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    switch (expression.eyebrows) {
      case 'raised':
        // Raised eyebrows (surprised)
        ctx.beginPath();
        ctx.moveTo(-eyebrowSpacing - 8, eyebrowY - 5);
        ctx.lineTo(-eyebrowSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyebrowSpacing - 8, eyebrowY - 5);
        ctx.lineTo(eyebrowSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        break;
      
      case 'angry':
        // Angry eyebrows
        ctx.beginPath();
        ctx.moveTo(-eyebrowSpacing - 8, eyebrowY - 5);
        ctx.lineTo(-eyebrowSpacing + 8, eyebrowY + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyebrowSpacing - 8, eyebrowY + 5);
        ctx.lineTo(eyebrowSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        break;
      
      case 'worried':
        // Worried eyebrows
        ctx.beginPath();
        ctx.moveTo(-eyebrowSpacing - 8, eyebrowY + 3);
        ctx.lineTo(-eyebrowSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eyebrowSpacing - 8, eyebrowY - 5);
        ctx.lineTo(eyebrowSpacing + 8, eyebrowY + 3);
        ctx.stroke();
        break;
    }
  }

  // Draw dialogue bubble
  drawDialogue(
    ctx: CanvasRenderingContext2D,
    text: string,
    position: Position,
    facingRight: boolean = true
  ): void {
    ctx.save();
    
    const x = position.x;
    const y = position.y - 150;
    
    // Calculate bubble size
    ctx.font = 'bold 28px Arial';
    const textWidth = ctx.measureText(text).width;
    const bubbleWidth = Math.max(textWidth + 40, 100);
    const bubbleHeight = 50;
    
    // Draw bubble background
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);
    ctx.fill();
    ctx.stroke();
    
    // Draw pointer
    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    const pointerX = facingRight ? x - 20 : x + 20;
    ctx.moveTo(pointerX, y + bubbleHeight / 2);
    ctx.lineTo(x, y + bubbleHeight / 2 + 20);
    ctx.lineTo(facingRight ? x + 20 : x - 20, y + bubbleHeight / 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    
    ctx.restore();
  }

  // Draw background elements
  drawBackground(ctx: CanvasRenderingContext2D, type: string, canvas: HTMLCanvasElement): void {
    ctx.save();
    
    switch (type) {
      case 'classroom':
        this.drawClassroomBackground(ctx, canvas);
        break;
      case 'street':
        this.drawStreetBackground(ctx, canvas);
        break;
      case 'kitchen':
        this.drawKitchenBackground(ctx, canvas);
        break;
      default:
        // Simple white background (already filled)
        break;
    }
    
    ctx.restore();
  }

  private drawClassroomBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Draw chalkboard
    ctx.fillStyle = '#2F4F2F';
    ctx.fillRect(100, 200, canvas.width - 200, 400);
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(100, 200, canvas.width - 200, 400);
    
    // Draw floor
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, canvas.height - 400, canvas.width, 400);
  }

  private drawStreetBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Draw sky
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    // Draw road
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    
    // Draw road lines
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.setLineDash([40, 30]);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.8);
    ctx.lineTo(canvas.width, canvas.height * 0.8);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  private drawKitchenBackground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    // Draw wall
    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    
    // Draw floor
    ctx.fillStyle = '#D2691E';
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
    
    // Draw fridge
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(canvas.width - 300, 300, 200, 500);
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 4;
    ctx.strokeRect(canvas.width - 300, 300, 200, 500);
    ctx.strokeRect(canvas.width - 300, 300, 200, 250); // Fridge door line
  }

  // Clear canvas
  clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Export singleton
export const stickmanRenderer = new StickmanRenderer();
