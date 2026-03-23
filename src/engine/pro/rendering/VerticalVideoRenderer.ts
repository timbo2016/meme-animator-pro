/**
 * Vertical Video Renderer
 * Professional 9:16 format renderer for YouTube Shorts, TikTok, Reels
 */

import { ProCharacter, ProScene, RenderSettings, PRESET_RESOLUTIONS, ExportProgress } from '../types';
import { ExpressiveCharacterRenderer } from '../character/ExpressiveCharacterRenderer';
import { ProAnimationPlayer } from '../animation/ProAnimationPlayer';
import { EffectsManager, TextOverlay, CameraEffectState } from '../effects/EffectsManager';

// Default render settings for vertical video
const DEFAULT_SETTINGS: RenderSettings = {
  resolution: PRESET_RESOLUTIONS.shorts,
  fps: 30,
  quality: 'final',
  format: 'mp4',
  aspectRatio: '9:16',
};

// Background gradients
const BACKGROUND_PRESETS: Record<string, { colors: string[]; direction: number }> = {
  default: { colors: ['#87CEEB', '#E0F7FA'], direction: 180 },
  sunset: { colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'], direction: 180 },
  night: { colors: ['#1a1a2e', '#16213e', '#0f3460'], direction: 180 },
  forest: { colors: ['#134E5E', '#71B280'], direction: 180 },
  warm: { colors: ['#F093FB', '#F5576C'], direction: 180 },
  cool: { colors: ['#667eea', '#764ba2'], direction: 180 },
  office: { colors: ['#E8E8E8', '#F5F5F5'], direction: 180 },
  outdoor: { colors: ['#56CCF2', '#2F80ED'], direction: 180 },
};

export interface CharacterInstance {
  character: ProCharacter;
  renderer: ExpressiveCharacterRenderer;
  animationPlayer: ProAnimationPlayer;
  position: { x: number; y: number };
  facingRight: boolean;
}

export class VerticalVideoRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private settings: RenderSettings;
  private characters: Map<string, CharacterInstance> = new Map();
  private effectsManager: EffectsManager | null = null;
  private currentScene: ProScene | null = null;
  private currentFrame: number = 0;
  private isRendering: boolean = false;
  private frameBuffer: ImageData[] = [];
  
  constructor(settings: Partial<RenderSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }
  
  /**
   * Initialize renderer with canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.effectsManager = new EffectsManager(this.ctx!);
    
    // Set canvas size
    canvas.width = this.settings.resolution.width;
    canvas.height = this.settings.resolution.height;
  }
  
  /**
   * Add a character to the scene
   */
  addCharacter(character: ProCharacter, x?: number, y?: number): void {
    if (!this.ctx) return;
    
    const renderer = new ExpressiveCharacterRenderer(this.ctx, character);
    const animationPlayer = new ProAnimationPlayer();
    
    // Default position (center bottom for vertical video)
    const posX = x ?? this.settings.resolution.width / 2;
    const posY = y ?? this.settings.resolution.height - 200;
    
    this.characters.set(character.id, {
      character,
      renderer,
      animationPlayer,
      position: { x: posX, y: posY },
      facingRight: true,
    });
  }
  
  /**
   * Remove a character
   */
  removeCharacter(id: string): void {
    this.characters.delete(id);
  }
  
  /**
   * Play animation on character
   */
  playAnimation(characterId: string, animationType: string): void {
    const instance = this.characters.get(characterId);
    if (instance) {
      instance.animationPlayer.play(animationType as any);
    }
  }
  
  /**
   * Move character to position (with optional animation)
   */
  moveCharacter(characterId: string, x: number, y: number, animate: boolean = true): void {
    const instance = this.characters.get(characterId);
    if (instance) {
      instance.position = { x, y };
      // Update facing direction
      if (x < instance.position.x) {
        instance.facingRight = false;
      } else if (x > instance.position.x) {
        instance.facingRight = true;
      }
    }
  }
  
  /**
   * Set character mood
   */
  setCharacterMood(characterId: string, mood: string): void {
    const instance = this.characters.get(characterId);
    if (instance) {
      instance.character.mood = mood as any;
    }
  }
  
  /**
   * Set background
   */
  setBackground(preset: string): void {
    // Background is rendered in renderFrame method
  }
  
  /**
   * Add text overlay
   */
  addText(overlay: TextOverlay): void {
    this.effectsManager?.addText(overlay);
  }
  
  /**
   * Trigger effect
   */
  triggerEffect(type: string, x?: number, y?: number): void {
    if (!this.effectsManager) return;
    
    const effectX = x ?? this.settings.resolution.width / 2;
    const effectY = y ?? this.settings.resolution.height / 2;
    
    switch (type) {
      case 'shake':
        this.effectsManager.shake(15);
        break;
      case 'zoom':
        this.effectsManager.zoomPunch(0.3);
        break;
      case 'flash':
        this.effectsManager.flash(0.8);
        break;
      case 'impact':
        this.effectsManager.impact('impact', effectX, effectY);
        break;
      case 'sparkles':
        this.effectsManager.impact('sparkles', effectX, effectY);
        break;
      case 'speed_lines':
        this.effectsManager.impact('speed_lines', effectX, effectY);
        break;
    }
  }
  
  /**
   * Update all animations and effects
   */
  update(): void {
    // Update all character animations
    for (const instance of this.characters.values()) {
      instance.animationPlayer.update();
      
      // Apply animation pose to character
      const pose = instance.animationPlayer.getPose();
      instance.character.pose = pose;
      
      // Apply expression
      const expression = instance.animationPlayer.getExpression();
      if (expression.eyes) instance.character.face.eyeStyle = expression.eyes as any;
    }
    
    // Update effects
    this.effectsManager?.update();
    
    this.currentFrame++;
  }
  
  /**
   * Render current frame
   */
  renderFrame(): void {
    if (!this.ctx || !this.canvas) return;
    
    const { width, height } = this.settings.resolution;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);
    
    // Apply camera effects transform
    this.ctx.save();
    this.effectsManager?.applyCameraTransform(width, height);
    
    // Draw background
    this.drawBackground('default');
    
    // Draw ground/floor line
    this.drawGround();
    
    // Draw scene objects
    this.drawSceneObjects();
    
    // Draw characters (sorted by Y position for proper layering)
    const sortedCharacters = Array.from(this.characters.values())
      .sort((a, b) => a.position.y - b.position.y);
    
    for (const instance of sortedCharacters) {
      // Update character transform
      instance.character.transform = {
        x: instance.position.x,
        y: instance.position.y,
        scale: 1,
        rotation: 0,
        flipX: !instance.facingRight,
        flipY: false,
      };
      
      instance.renderer.render();
    }
    
    this.ctx.restore();
    
    // Render effects (text overlays, etc.)
    this.effectsManager?.render(width, height);
    
    // Draw frame counter (for debugging)
    this.drawDebugInfo();
  }
  
  /**
   * Draw background gradient
   */
  private drawBackground(preset: string): void {
    if (!this.ctx || !this.canvas) return;
    
    const { width, height } = this.settings.resolution;
    const bgPreset = BACKGROUND_PRESETS[preset] || BACKGROUND_PRESETS.default;
    
    const gradient = this.ctx.createLinearGradient(
      0, 0, 0, height
    );
    
    bgPreset.colors.forEach((color, index) => {
      gradient.addColorStop(index / (bgPreset.colors.length - 1), color);
    });
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, height);
  }
  
  /**
   * Draw ground/floor
   */
  private drawGround(): void {
    if (!this.ctx) return;
    
    const { width, height } = this.settings.resolution;
    const groundY = height - 100;
    
    // Ground shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, groundY, width, height - groundY);
    
    // Ground line
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, groundY);
    this.ctx.lineTo(width, groundY);
    this.ctx.stroke();
  }
  
  /**
   * Draw scene objects (furniture, props, etc.)
   */
  private drawSceneObjects(): void {
    if (!this.ctx || !this.currentScene) return;
    
    for (const obj of this.currentScene.objects) {
      this.ctx.save();
      this.ctx.translate(obj.transform.x, obj.transform.y);
      this.ctx.scale(obj.transform.scale, obj.transform.scale);
      this.ctx.rotate((obj.transform.rotation * Math.PI) / 180);
      
      // Draw object based on type
      this.drawObject(obj.type, obj.properties);
      
      this.ctx.restore();
    }
  }
  
  /**
   * Draw a specific object type
   */
  private drawObject(type: string, properties: Record<string, unknown>): void {
    if (!this.ctx) return;
    
    const color = (properties.color as string) || '#8B4513';
    
    switch (type) {
      case 'chair':
        // Chair back
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-30, -80, 60, 15);
        this.ctx.fillRect(-30, -80, 12, 90);
        this.ctx.fillRect(18, -80, 12, 90);
        // Seat
        this.ctx.fillRect(-35, 10, 70, 15);
        // Legs
        this.ctx.fillRect(-30, 25, 10, 40);
        this.ctx.fillRect(20, 25, 10, 40);
        break;
        
      case 'table':
        this.ctx.fillStyle = color;
        // Table top
        this.ctx.fillRect(-80, -15, 160, 20);
        // Legs
        this.ctx.fillRect(-70, 5, 15, 80);
        this.ctx.fillRect(55, 5, 15, 80);
        break;
        
      case 'phone':
        this.ctx.fillStyle = '#333';
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(-20, -40, 40, 80, 8);
        this.ctx.fill();
        this.ctx.stroke();
        // Screen
        this.ctx.fillStyle = '#4488FF';
        this.ctx.fillRect(-16, -32, 32, 60);
        break;
    }
  }
  
  /**
   * Draw debug info
   */
  private drawDebugInfo(): void {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(10, 10, 120, 50);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`Frame: ${this.currentFrame}`, 20, 30);
    this.ctx.fillText(`FPS: ${this.settings.fps}`, 20, 50);
  }
  
  /**
   * Capture current frame to buffer
   */
  captureFrame(): ImageData | null {
    if (!this.ctx || !this.canvas) return null;
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Get canvas as data URL
   */
  getDataURL(): string {
    if (!this.canvas) return '';
    return this.canvas.toDataURL('image/png');
  }
  
  /**
   * Get canvas as blob
   */
  async getBlob(): Promise<Blob | null> {
    if (!this.canvas) return null;
    
    return new Promise((resolve) => {
      this.canvas!.toBlob((blob) => resolve(blob), 'image/png');
    });
  }
  
  /**
   * Render all frames for export
   */
  async renderAllFrames(
    scene: ProScene,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ImageData[]> {
    this.currentScene = scene;
    this.frameBuffer = [];
    this.isRendering = true;
    
    const totalFrames = Math.ceil(scene.duration);
    
    for (let frame = 0; frame < totalFrames; frame++) {
      this.currentFrame = frame;
      this.update();
      this.renderFrame();
      
      const frameData = this.captureFrame();
      if (frameData) {
        this.frameBuffer.push(frameData);
      }
      
      onProgress?.({
        stage: 'rendering',
        currentFrame: frame,
        totalFrames,
        percentage: Math.round((frame / totalFrames) * 100),
        estimatedTimeRemaining: 0,
      });
      
      // Yield to prevent blocking
      if (frame % 10 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }
    
    this.isRendering = false;
    
    onProgress?.({
      stage: 'complete',
      currentFrame: totalFrames,
      totalFrames,
      percentage: 100,
      estimatedTimeRemaining: 0,
    });
    
    return this.frameBuffer;
  }
  
  /**
   * Get current frame number
   */
  getCurrentFrame(): number {
    return this.currentFrame;
  }
  
  /**
   * Get settings
   */
  getSettings(): RenderSettings {
    return { ...this.settings };
  }
  
  /**
   * Clear renderer
   */
  clear(): void {
    this.characters.clear();
    this.effectsManager?.clear();
    this.frameBuffer = [];
    this.currentFrame = 0;
    this.currentScene = null;
  }
}
