// Scene Manager - Handles scenes, backgrounds, objects, and camera

import {
  Scene,
  SceneObject,
  Background,
  CameraState,
  Position,
  ObjectType,
  ParsedScene,
  Character,
  GradientDefinition,
} from '@/lib/types';

// Predefined background colors
const BACKGROUND_PRESETS: Record<string, Background> = {
  default: {
    type: 'color',
    value: '#87CEEB', // Sky blue
  },
  indoor: {
    type: 'color',
    value: '#F5F5DC', // Beige
  },
  outdoor: {
    type: 'gradient',
    value: {
      type: 'linear',
      colors: ['#87CEEB', '#98FB98'], // Sky to grass
      direction: 180,
    } as GradientDefinition,
  },
  night: {
    type: 'color',
    value: '#1a1a2e',
  },
  sunset: {
    type: 'gradient',
    value: {
      type: 'linear',
      colors: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
      direction: 180,
    } as GradientDefinition,
  },
};

// Object definitions with default properties
const OBJECT_DEFAULTS: Record<ObjectType, Partial<SceneObject>> = {
  chair: { scale: 0.8, properties: { color: '#8B4513', legs: 4 } },
  table: { scale: 1, properties: { color: '#8B4513', shape: 'rectangle' } },
  door: { scale: 1.2, properties: { color: '#654321', isOpen: false } },
  window: { scale: 1, properties: { color: '#87CEEB', frame: '#8B4513' } },
  tree: { scale: 1.5, properties: { trunkColor: '#8B4513', leafColor: '#228B22' } },
  house: { scale: 2, properties: { wallColor: '#DEB887', roofColor: '#8B4513' } },
  car: { scale: 1.2, properties: { bodyColor: '#FF6347', wheelColor: '#333333' } },
};

export class SceneManager {
  private scenes: Map<string, Scene>;
  private currentSceneId: string | null;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number = 800, canvasHeight: number = 600) {
    this.scenes = new Map();
    this.currentSceneId = null;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  /**
   * Create a new scene
   */
  createScene(id: string, background: string = 'default'): Scene {
    const scene: Scene = {
      id,
      background: BACKGROUND_PRESETS[background] || BACKGROUND_PRESETS.default,
      objects: [],
      characters: new Map(),
      camera: {
        x: 0,
        y: 0,
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
    };

    this.scenes.set(id, scene);
    return scene;
  }

  /**
   * Get a scene by ID
   */
  getScene(id: string): Scene | undefined {
    return this.scenes.get(id);
  }

  /**
   * Set the current scene
   */
  setCurrentScene(id: string): void {
    if (this.scenes.has(id)) {
      this.currentSceneId = id;
    }
  }

  /**
   * Get the current scene
   */
  getCurrentScene(): Scene | undefined {
    if (!this.currentSceneId) return undefined;
    return this.scenes.get(this.currentSceneId);
  }

  /**
   * Add an object to a scene
   */
  addObject(sceneId: string, type: ObjectType, position: Position): SceneObject | null {
    const scene = this.scenes.get(sceneId);
    if (!scene) return null;

    const defaults = OBJECT_DEFAULTS[type] || {};
    const object: SceneObject = {
      id: `${type}_${Date.now()}`,
      type,
      position: { ...position },
      scale: defaults.scale || 1,
      rotation: 0,
      properties: { ...(defaults.properties || {}) },
    };

    scene.objects.push(object);
    return object;
  }

  /**
   * Remove an object from a scene
   */
  removeObject(sceneId: string, objectId: string): boolean {
    const scene = this.scenes.get(sceneId);
    if (!scene) return false;

    const index = scene.objects.findIndex((obj) => obj.id === objectId);
    if (index !== -1) {
      scene.objects.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Set scene background
   */
  setBackground(sceneId: string, background: Background): void {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.background = background;
    }
  }

  /**
   * Set scene background by preset name
   */
  setBackgroundPreset(sceneId: string, presetName: string): void {
    const scene = this.scenes.get(sceneId);
    if (scene && BACKGROUND_PRESETS[presetName]) {
      scene.background = BACKGROUND_PRESETS[presetName];
    }
  }

  /**
   * Update camera position
   */
  updateCamera(sceneId: string, camera: Partial<CameraState>): void {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.camera = { ...scene.camera, ...camera };
    }
  }

  /**
   * Pan camera to a position
   */
  panCamera(sceneId: string, target: Position, duration: number = 60): void {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.camera.pan = { ...target };
    }
  }

  /**
   * Zoom camera
   */
  zoomCamera(sceneId: string, zoom: number): void {
    const scene = this.scenes.get(sceneId);
    if (scene) {
      scene.camera.zoom = Math.max(0.5, Math.min(3, zoom));
    }
  }

  /**
   * Create scenes from parsed story data
   */
  createFromParsedScenes(parsedScenes: ParsedScene[]): void {
    for (const parsedScene of parsedScenes) {
      const sceneId = `scene_${parsedScene.id}`;
      const scene = this.createScene(sceneId, parsedScene.background);

      // Add characters to scene
      for (const character of parsedScene.characters) {
        // Characters will be managed by AnimationController
        // Just track them here for scene data
      }

      // Set scene duration
      (scene as ParsedScene).duration = parsedScene.duration;
    }

    // Set first scene as current
    if (parsedScenes.length > 0) {
      this.setCurrentScene(`scene_${parsedScenes[0].id}`);
    }
  }

  /**
   * Get all scene IDs
   */
  getSceneIds(): string[] {
    return Array.from(this.scenes.keys());
  }

  /**
   * Get canvas dimensions
   */
  getCanvasDimensions(): { width: number; height: number } {
    return { width: this.canvasWidth, height: this.canvasHeight };
  }

  /**
   * Set canvas dimensions
   */
  setCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Convert screen position to world position (accounting for camera)
   */
  screenToWorld(sceneId: string, screenPos: Position): Position {
    const scene = this.scenes.get(sceneId);
    if (!scene) return screenPos;

    return {
      x: (screenPos.x - this.canvasWidth / 2) / scene.camera.zoom + scene.camera.x,
      y: (screenPos.y - this.canvasHeight / 2) / scene.camera.zoom + scene.camera.y,
    };
  }

  /**
   * Convert world position to screen position
   */
  worldToScreen(sceneId: string, worldPos: Position): Position {
    const scene = this.scenes.get(sceneId);
    if (!scene) return worldPos;

    return {
      x: (worldPos.x - scene.camera.x) * scene.camera.zoom + this.canvasWidth / 2,
      y: (worldPos.y - scene.camera.y) * scene.camera.zoom + this.canvasHeight / 2,
    };
  }

  /**
   * Clear all scenes
   */
  clear(): void {
    this.scenes.clear();
    this.currentSceneId = null;
  }
}

// Object rendering functions
export function drawObject(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  ctx.save();
  ctx.translate(object.position.x, object.position.y);
  ctx.rotate((object.rotation * Math.PI) / 180);
  ctx.scale(object.scale, object.scale);

  switch (object.type) {
    case 'chair':
      drawChair(ctx, object);
      break;
    case 'table':
      drawTable(ctx, object);
      break;
    case 'door':
      drawDoor(ctx, object);
      break;
    case 'window':
      drawWindow(ctx, object);
      break;
    case 'tree':
      drawTree(ctx, object);
      break;
    case 'house':
      drawHouse(ctx, object);
      break;
    case 'car':
      drawCar(ctx, object);
      break;
  }

  ctx.restore();
}

function drawChair(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const color = (object.properties.color as string) || '#8B4513';
  
  // Seat
  ctx.fillStyle = color;
  ctx.fillRect(-20, -10, 40, 8);
  
  // Backrest
  ctx.fillRect(-20, -50, 8, 45);
  
  // Legs
  ctx.fillRect(-18, -5, 4, 30);
  ctx.fillRect(14, -5, 4, 30);
}

function drawTable(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const color = (object.properties.color as string) || '#8B4513';
  
  // Table top
  ctx.fillStyle = color;
  ctx.fillRect(-50, -10, 100, 10);
  
  // Legs
  ctx.fillRect(-45, -5, 8, 50);
  ctx.fillRect(37, -5, 8, 50);
}

function drawDoor(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const color = (object.properties.color as string) || '#654321';
  
  // Door frame
  ctx.fillStyle = color;
  ctx.fillRect(-25, -80, 50, 80);
  
  // Door panel
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(-22, -77, 44, 74);
  
  // Door handle
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(15, -40, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawWindow(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const frameColor = (object.properties.frame as string) || '#8B4513';
  const glassColor = (object.properties.color as string) || '#87CEEB';
  
  // Frame
  ctx.fillStyle = frameColor;
  ctx.fillRect(-40, -50, 80, 60);
  
  // Glass
  ctx.fillStyle = glassColor;
  ctx.fillRect(-35, -45, 32, 50);
  ctx.fillRect(3, -45, 32, 50);
}

function drawTree(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const trunkColor = (object.properties.trunkColor as string) || '#8B4513';
  const leafColor = (object.properties.leafColor as string) || '#228B22';
  
  // Trunk
  ctx.fillStyle = trunkColor;
  ctx.fillRect(-10, -40, 20, 60);
  
  // Leaves (simple circle)
  ctx.fillStyle = leafColor;
  ctx.beginPath();
  ctx.arc(0, -70, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const wallColor = (object.properties.wallColor as string) || '#DEB887';
  const roofColor = (object.properties.roofColor as string) || '#8B4513';
  
  // Wall
  ctx.fillStyle = wallColor;
  ctx.fillRect(-60, -80, 120, 80);
  
  // Roof
  ctx.fillStyle = roofColor;
  ctx.beginPath();
  ctx.moveTo(-70, -80);
  ctx.lineTo(0, -130);
  ctx.lineTo(70, -80);
  ctx.closePath();
  ctx.fill();
  
  // Door
  ctx.fillStyle = '#654321';
  ctx.fillRect(-15, -50, 30, 50);
  
  // Windows
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(-50, -60, 25, 25);
  ctx.fillRect(25, -60, 25, 25);
}

function drawCar(ctx: CanvasRenderingContext2D, object: SceneObject): void {
  const bodyColor = (object.properties.bodyColor as string) || '#FF6347';
  const wheelColor = (object.properties.wheelColor as string) || '#333333';
  
  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-40, -25, 80, 25);
  ctx.fillRect(-25, -45, 50, 20);
  
  // Windows
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(-22, -42, 20, 15);
  ctx.fillRect(2, -42, 20, 15);
  
  // Wheels
  ctx.fillStyle = wheelColor;
  ctx.beginPath();
  ctx.arc(-25, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(25, 0, 12, 0, Math.PI * 2);
  ctx.fill();
}

// Singleton instance
export const sceneManager = new SceneManager();
