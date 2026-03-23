'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAnimatorStore, animationController } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Eye
} from 'lucide-react';

// Draw scene objects (extracted outside component)
const drawSceneObjects = (
  ctx: CanvasRenderingContext2D, 
  canvas: HTMLCanvasElement,
  hasSitAction: boolean
) => {
  if (hasSitAction) {
    ctx.save();
    ctx.translate(500, canvas.height - 150);
    
    // Chair back
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-25, -60, 50, 10);
    ctx.fillRect(-25, -60, 10, 70);
    ctx.fillRect(15, -60, 10, 70);
    
    // Chair seat
    ctx.fillRect(-30, 10, 60, 10);
    
    // Chair legs
    ctx.fillRect(-25, 20, 8, 30);
    ctx.fillRect(17, 20, 8, 30);
    
    ctx.restore();
  }
};

// Draw dialogue bubbles
const drawDialogue = (
  ctx: CanvasRenderingContext2D, 
  characters: Map<string, { position: { x: number; y: number } }>,
  parsedStory: { scenes: { dialogue: { characterId: string; startTime: number; duration: number; text: string }[] }[] } | null,
  currentFrame: number
) => {
  if (!parsedStory) return;

  const currentScene = parsedStory.scenes[0];
  if (!currentScene) return;

  const currentDialogue = currentScene.dialogue.find(
    d => currentFrame >= d.startTime && currentFrame <= d.startTime + d.duration
  );

  if (currentDialogue) {
    const character = characters.get(currentDialogue.characterId);
    if (!character) return;

    const x = character.position.x;
    const y = character.position.y - 100;

    // Bubble background
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    const textWidth = ctx.measureText(currentDialogue.text).width + 20;
    const bubbleWidth = Math.max(textWidth, 60);
    
    ctx.beginPath();
    ctx.roundRect(x - bubbleWidth / 2, y - 20, bubbleWidth, 40, 10);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 20);
    ctx.lineTo(x, y + 35);
    ctx.lineTo(x + 10, y + 20);
    ctx.fill();
    ctx.stroke();

    // Text
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(currentDialogue.text, x, y + 5);
  }
};

// Draw a stickman character (extracted outside component)
const drawStickman = (
  ctx: CanvasRenderingContext2D,
  state: NonNullable<ReturnType<typeof animationController.getCharacter>>,
  id: string
) => {
  const { position, facingRight, currentAnimation } = state;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  
  if (!facingRight) {
    ctx.scale(-1, 1);
  }

  // Body color based on character
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];
  const colorIndex = Math.abs(id.charCodeAt(0)) % colors.length;
  ctx.strokeStyle = colors[colorIndex];
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Simple stickman drawing
  // Head
  ctx.beginPath();
  ctx.arc(0, -50, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE4C4';
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-6, -52, 3, 0, Math.PI * 2);
  ctx.arc(6, -52, 3, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  const isTalking = currentAnimation?.name === 'talk';
  ctx.beginPath();
  if (isTalking) {
    const mouthOpen = Math.abs(Math.sin(Date.now() / 80)) * 5 + 2;
    ctx.ellipse(0, -42, 6, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
  } else {
    ctx.arc(0, -44, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  // Body (spine)
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(-25, -10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(25, -10);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-15, 40);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(15, 40);
  ctx.stroke();

  // Animation-specific poses
  if (currentAnimation?.name === 'wave') {
    // Wave arm up
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(30, -45);
    ctx.stroke();
  } else if (currentAnimation?.name === 'sit') {
    // Sitting pose
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-30, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(25, 0);
    ctx.lineTo(30, 20);
    ctx.stroke();
  }

  ctx.restore();

  // Draw character name
  ctx.fillStyle = '#333';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(id.charAt(0).toUpperCase() + id.slice(1), position.x, position.y + 60);
};

export function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef(false);
  
  const {
    isPlaying,
    currentFrame,
    totalFrames,
    fps,
    parsedStory,
    characters,
    play,
    pause,
    stop,
    setCurrentFrame,
    stepForward,
    updateAnimation,
  } = useAnimatorStore();

  const [canvasSize] = useState({ width: 800, height: 450 });

  // Render current frame
  const renderCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.7, '#90EE90'); // Light green
    gradient.addColorStop(1, '#228B22'); // Forest green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    // Draw grass
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, canvas.height - 80);
      ctx.lineTo(i + 5, canvas.height - 90);
      ctx.stroke();
    }

    // Render characters
    characters.forEach((state, id) => {
      if (state) {
        drawStickman(ctx, state, id);
      }
    });

    // Check for sit action
    const hasSitAction = parsedStory?.scenes.some(scene => 
      scene.actions.some(action => action.type === 'sit')
    );

    // Draw scene objects (like chairs)
    drawSceneObjects(ctx, canvas, hasSitAction || false);

    // Draw dialogue if any
    drawDialogue(ctx, characters, parsedStory, currentFrame);

  }, [parsedStory, characters, currentFrame]);

  // Animation loop using ref pattern to avoid hoisting issues
  const runAnimationLoop = useCallback(() => {
    const animate = (timestamp: number) => {
      if (!isAnimatingRef.current) return;

      const elapsed = timestamp - lastTimeRef.current;
      const frameTime = 1000 / fps;

      if (elapsed >= frameTime) {
        lastTimeRef.current = timestamp - (elapsed % frameTime);
        
        // Update animation
        updateAnimation();
        
        // Increment frame
        stepForward();
        
        // Get current frame from store
        const store = useAnimatorStore.getState();
        
        // Render frame
        renderCurrentFrame();
        
        // Check if we should continue
        if (store.currentFrame >= totalFrames) {
          setCurrentFrame(0);
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [fps, updateAnimation, stepForward, renderCurrentFrame, setCurrentFrame, totalFrames]);

  // Start/stop animation loop
  useEffect(() => {
    if (isPlaying) {
      isAnimatingRef.current = true;
      runAnimationLoop();
    } else {
      isAnimatingRef.current = false;
    }

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, runAnimationLoop]);

  // Render when frame changes (for manual stepping)
  useEffect(() => {
    if (!isPlaying) {
      renderCurrentFrame();
    }
  }, [currentFrame, isPlaying, renderCurrentFrame]);

  // Initial render
  useEffect(() => {
    renderCurrentFrame();
  }, [parsedStory, renderCurrentFrame]);

  const formatTime = (frame: number) => {
    const seconds = Math.floor(frame / fps);
    const frames = frame % fps;
    return `${seconds}:${frames.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Preview
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Canvas Container */}
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-[300px]">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="w-full h-full object-contain"
          />
          
          {!parsedStory && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/80">
              <div className="text-center text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Parse a story to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={stop}
            disabled={!parsedStory}
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const store = useAnimatorStore.getState();
              setCurrentFrame(Math.max(0, store.currentFrame - 1));
            }}
            disabled={!parsedStory || isPlaying}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={isPlaying ? pause : play}
            disabled={!parsedStory}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const store = useAnimatorStore.getState();
              setCurrentFrame(Math.min(store.totalFrames, store.currentFrame + 1));
            }}
            disabled={!parsedStory || isPlaying}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex-1 mx-2">
            <Slider
              value={[currentFrame]}
              min={0}
              max={totalFrames || 100}
              step={1}
              onValueChange={([value]) => setCurrentFrame(value)}
              disabled={!parsedStory || isPlaying}
            />
          </div>

          <div className="text-sm text-muted-foreground w-16 text-right">
            {fps} FPS
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
