/**
 * Meme Effects System
 * Professional effects for viral animated shorts
 */

import { MemeEffectType, GlobalEffectType, TextOverlay, TextStyle, TextAnimation } from '../types';

// ============================================================================
// TEXT OVERLAY RENDERER
// ============================================================================

export interface TextRenderOptions {
  text: string;
  x: number;
  y: number;
  style: TextStyle;
  animation: TextAnimation;
  progress: number; // 0-1 through the animation
}

export class TextOverlayRenderer {
  private ctx: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * Render a text overlay with animation
   */
  render(options: TextRenderOptions): void {
    const { ctx } = this;
    const { text, x, y, style, animation, progress } = options;
    
    ctx.save();
    
    // Apply animation transformations
    const animState = this.getAnimationState(animation, progress);
    ctx.translate(x + animState.offsetX, y + animState.offsetY);
    ctx.scale(animState.scale, animState.scale);
    ctx.globalAlpha = animState.opacity;
    ctx.rotate((animState.rotation * Math.PI) / 180);
    
    // Set font
    const fontWeight = style.bold ? 'bold' : 'normal';
    const fontStyle = style.italic ? 'italic' : 'normal';
    ctx.font = `${fontStyle} ${fontWeight} ${style.size}px ${style.font || 'Arial, sans-serif'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text with effects
    this.drawTextWithEffects(text, style);
    
    ctx.restore();
  }
  
  /**
   * Get animation state for current progress
   */
  private getAnimationState(animation: TextAnimation, progress: number): {
    offsetX: number;
    offsetY: number;
    scale: number;
    opacity: number;
    rotation: number;
  } {
    switch (animation.type) {
      case 'fade':
        return {
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          opacity: progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1,
          rotation: 0,
        };
        
      case 'slide':
        return {
          offsetX: (1 - Math.min(progress * 3, 1)) * 200 - 100,
          offsetY: 0,
          scale: 1,
          opacity: Math.min(progress * 3, 1),
          rotation: 0,
        };
        
      case 'bounce':
        const bounceT = progress < 0.5 ? progress * 2 : 2 - progress * 2;
        return {
          offsetX: 0,
          offsetY: -Math.abs(Math.sin(bounceT * Math.PI * 2)) * 30,
          scale: 1 + Math.sin(progress * Math.PI) * 0.1,
          opacity: 1,
          rotation: 0,
        };
        
      case 'pop':
        const popScale = progress < 0.3 
          ? this.easeOutBack(progress / 0.3) 
          : 1 + Math.sin((progress - 0.3) / 0.7 * Math.PI * 4) * 0.05;
        return {
          offsetX: 0,
          offsetY: 0,
          scale: popScale,
          opacity: progress < 0.1 ? progress * 10 : 1,
          rotation: 0,
        };
        
      case 'typewriter':
        // Handled in drawTextWithEffects
        return {
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
        };
        
      default:
        return {
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          opacity: 1,
          rotation: 0,
        };
    }
  }
  
  /**
   * Draw text with outline and shadow effects
   */
  private drawTextWithEffects(text: string, style: TextStyle): void {
    const { ctx } = this;
    
    // Typewriter effect
    let displayText = text;
    if (style) {
      const typewriterProgress = 1; // Full text by default
      displayText = text.substring(0, Math.ceil(text.length * typewriterProgress));
    }
    
    // Shadow
    if (style.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
    }
    
    // Outline
    if (style.outline) {
      ctx.strokeStyle = style.outline;
      ctx.lineWidth = style.size / 8;
      ctx.lineJoin = 'round';
      ctx.strokeText(displayText, 0, 0);
    }
    
    // Fill
    ctx.fillStyle = style.color;
    ctx.fillText(displayText, 0, 0);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  
  /**
   * Easing function for pop animation
   */
  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}

// ============================================================================
// CAMERA EFFECTS
// ============================================================================

export interface CameraEffectState {
  shake: { x: number; y: number };
  zoom: number;
  rotation: number;
  flash: number;
  speedLines: number;
}

export class CameraEffectsRenderer {
  private ctx: CanvasRenderingContext2D;
  private shakeDecay: number = 0.9;
  private currentShake: { x: number; y: number; intensity: number } = { x: 0, y: 0, intensity: 0 };
  private currentZoom: number = 1;
  private flashIntensity: number = 0;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * Apply shake effect
   */
  shake(intensity: number): void {
    this.currentShake.intensity = Math.max(this.currentShake.intensity, intensity);
  }
  
  /**
   * Apply zoom punch effect
   */
  zoomPunch(intensity: number): void {
    this.currentZoom = 1 + intensity;
  }
  
  /**
   * Apply flash effect
   */
  flash(intensity: number = 1): void {
    this.flashIntensity = intensity;
  }
  
  /**
   * Update effects (decay over time)
   */
  update(): void {
    // Decay shake
    if (this.currentShake.intensity > 0.1) {
      this.currentShake.x = (Math.random() - 0.5) * this.currentShake.intensity * 2;
      this.currentShake.y = (Math.random() - 0.5) * this.currentShake.intensity * 2;
      this.currentShake.intensity *= this.shakeDecay;
    } else {
      this.currentShake = { x: 0, y: 0, intensity: 0 };
    }
    
    // Decay zoom
    this.currentZoom = this.currentZoom + (1 - this.currentZoom) * 0.1;
    
    // Decay flash
    this.flashIntensity *= 0.85;
  }
  
  /**
   * Get current camera transform
   */
  getTransform(): CameraEffectState {
    return {
      shake: { x: this.currentShake.x, y: this.currentShake.y },
      zoom: this.currentZoom,
      rotation: 0,
      flash: this.flashIntensity,
      speedLines: 0,
    };
  }
  
  /**
   * Apply camera transform to context
   */
  applyTransform(canvasWidth: number, canvasHeight: number): void {
    const { ctx } = this;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    ctx.translate(centerX + this.currentShake.x, centerY + this.currentShake.y);
    ctx.scale(this.currentZoom, this.currentZoom);
    ctx.translate(-centerX, -centerY);
  }
  
  /**
   * Render flash overlay
   */
  renderFlash(width: number, height: number): void {
    if (this.flashIntensity > 0.01) {
      const { ctx } = this;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}

// ============================================================================
// IMPACT EFFECTS
// ============================================================================

export interface ImpactEffect {
  type: 'star' | 'spark' | 'circle' | 'line' | 'text';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  lifetime: number; // 0-1
}

export class ImpactEffectsRenderer {
  private ctx: CanvasRenderingContext2D;
  private effects: ImpactEffect[] = [];
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  /**
   * Add impact effect
   */
  addImpact(type: GlobalEffectType, x: number, y: number, intensity: number = 1): void {
    const { ctx } = this;
    
    switch (type) {
      case 'impact':
        // Add expanding circles
        for (let i = 0; i < 3; i++) {
          this.effects.push({
            type: 'circle',
            x, y,
            size: 20 + i * 30,
            rotation: 0,
            color: '#FFF',
            lifetime: 1,
          });
        }
        // Add sparks
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          this.effects.push({
            type: 'spark',
            x: x + Math.cos(angle) * 50,
            y: y + Math.sin(angle) * 50,
            size: 20 * intensity,
            rotation: angle,
            color: '#FFD700',
            lifetime: 1,
          });
        }
        break;
        
      case 'sparkles':
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 40;
          this.effects.push({
            type: 'star',
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            size: 8 + Math.random() * 12,
            rotation: Math.random() * 360,
            color: '#FFD700',
            lifetime: 1,
          });
        }
        break;
        
      case 'hearts':
        for (let i = 0; i < 5; i++) {
          this.effects.push({
            type: 'text',
            x: x + (Math.random() - 0.5) * 60,
            y: y - Math.random() * 40,
            size: 20 + Math.random() * 20,
            rotation: Math.random() * 30 - 15,
            color: '#FF69B4',
            lifetime: 1,
          });
        }
        break;
        
      case 'speed_lines':
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI - Math.PI / 2; // Upward bias
          this.effects.push({
            type: 'line',
            x: x + (Math.random() - 0.5) * 100,
            y: y + Math.random() * 50,
            size: 30 + Math.random() * 50,
            rotation: angle,
            color: '#FFF',
            lifetime: 1,
          });
        }
        break;
    }
  }
  
  /**
   * Update all effects
   */
  update(): void {
    // Update and remove dead effects
    this.effects = this.effects.filter(effect => {
      effect.lifetime -= 0.05;
      effect.size *= 1.02; // Slight expansion
      return effect.lifetime > 0;
    });
  }
  
  /**
   * Render all effects
   */
  render(): void {
    const { ctx } = this;
    
    for (const effect of this.effects) {
      ctx.save();
      ctx.translate(effect.x, effect.y);
      ctx.rotate(effect.rotation);
      ctx.globalAlpha = effect.lifetime;
      ctx.fillStyle = effect.color;
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 3;
      
      switch (effect.type) {
        case 'star':
          this.drawStar(0, 0, 4, effect.size, effect.size / 2);
          break;
          
        case 'spark':
          ctx.beginPath();
          ctx.moveTo(-effect.size / 2, 0);
          ctx.lineTo(effect.size / 2, 0);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -effect.size / 2);
          ctx.lineTo(0, effect.size / 2);
          ctx.stroke();
          break;
          
        case 'circle':
          ctx.strokeStyle = effect.color;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, effect.size, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'line':
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(effect.size, 0);
          ctx.stroke();
          break;
          
        case 'text':
          ctx.font = `${effect.size}px Arial`;
          ctx.fillText('❤', 0, 0);
          break;
      }
      
      ctx.restore();
    }
  }
  
  /**
   * Draw a star shape
   */
  private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    const { ctx } = this;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * Clear all effects
   */
  clear(): void {
    this.effects = [];
  }
}

// ============================================================================
// MEME SOUND CUES
// ============================================================================

export interface MemeSoundCue {
  type: MemeEffectType;
  frame: number;
  duration: number;
  played: boolean;
}

export const MEME_SOUNDS: Record<MemeEffectType, { name: string; duration: number }> = {
  bruh: { name: 'Bruh Sound Effect', duration: 30 },
  oof: { name: 'Oof Sound', duration: 20 },
  yeet: { name: 'Yeet Sound', duration: 15 },
  bonk: { name: 'Bonk Sound', duration: 10 },
  stonks: { name: 'Stonks Sound', duration: 25 },
  sad_violin: { name: 'Sad Violin', duration: 60 },
  dramatic: { name: 'Dramatic Effect', duration: 40 },
  vine_boom: { name: 'Vine Boom', duration: 25 },
  air_horn: { name: 'Air Horn', duration: 20 },
  record_scratch: { name: 'Record Scratch', duration: 15 },
  womp_womp: { name: 'Womp Womp', duration: 30 },
  fbi_open_up: { name: 'FBI Open Up', duration: 50 },
};

// ============================================================================
// COMBINED EFFECTS MANAGER
// ============================================================================

export class EffectsManager {
  private textRenderer: TextOverlayRenderer;
  private cameraEffects: CameraEffectsRenderer;
  private impactEffects: ImpactEffectsRenderer;
  private activeTexts: Map<string, { overlay: TextOverlay; startTime: number }> = new Map();
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.textRenderer = new TextOverlayRenderer(ctx);
    this.cameraEffects = new CameraEffectsRenderer(ctx);
    this.impactEffects = new ImpactEffectsRenderer(ctx);
  }
  
  /**
   * Add text overlay
   */
  addText(overlay: TextOverlay): void {
    this.activeTexts.set(overlay.id, {
      overlay,
      startTime: Date.now(),
    });
  }
  
  /**
   * Remove text overlay
   */
  removeText(id: string): void {
    this.activeTexts.delete(id);
  }
  
  /**
   * Trigger camera shake
   */
  shake(intensity: number = 10): void {
    this.cameraEffects.shake(intensity);
  }
  
  /**
   * Trigger zoom punch
   */
  zoomPunch(intensity: number = 0.2): void {
    this.cameraEffects.zoomPunch(intensity);
  }
  
  /**
   * Trigger flash
   */
  flash(intensity: number = 1): void {
    this.cameraEffects.flash(intensity);
  }
  
  /**
   * Trigger impact effect
   */
  impact(type: GlobalEffectType, x: number, y: number): void {
    this.impactEffects.addImpact(type, x, y);
  }
  
  /**
   * Update all effects
   */
  update(): void {
    this.cameraEffects.update();
    this.impactEffects.update();
    
    // Remove expired texts
    const now = Date.now();
    for (const [id, { overlay, startTime }] of this.activeTexts) {
      const elapsed = (now - startTime) / 1000; // seconds
      if (elapsed > overlay.timing.end) {
        this.activeTexts.delete(id);
      }
    }
  }
  
  /**
   * Render all effects
   */
  render(canvasWidth: number, canvasHeight: number): void {
    // Render impact effects
    this.impactEffects.render();
    
    // Render flash
    this.cameraEffects.renderFlash(canvasWidth, canvasHeight);
    
    // Render text overlays
    const now = Date.now();
    for (const { overlay, startTime } of this.activeTexts.values()) {
      const elapsed = (now - startTime) / 1000;
      const duration = overlay.timing.end - overlay.timing.start;
      const progress = Math.max(0, Math.min(1, (elapsed - overlay.timing.start) / duration));
      
      this.textRenderer.render({
        text: overlay.text,
        x: overlay.position.x,
        y: overlay.position.y,
        style: overlay.style,
        animation: overlay.animation,
        progress,
      });
    }
  }
  
  /**
   * Get camera transform state
   */
  getCameraState(): CameraEffectState {
    return this.cameraEffects.getTransform();
  }
  
  /**
   * Apply camera transform
   */
  applyCameraTransform(width: number, height: number): void {
    this.cameraEffects.applyTransform(width, height);
  }
  
  /**
   * Clear all effects
   */
  clear(): void {
    this.activeTexts.clear();
    this.impactEffects.clear();
  }
}
