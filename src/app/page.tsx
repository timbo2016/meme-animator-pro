'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAnimatorStore, animationController, soundSystem, videoExporter } from '@/lib/meme-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Download,
  Wand2,
  Volume2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Clapperboard,
  FileText,
  Camera,
  Info
} from 'lucide-react';
import { 
  CameraEffect,
  EXPRESSION_MAP,
  CharacterState,
  EmotionType,
  AnimationFrame
} from '@/engine/types';

// ==================== DRAWING FUNCTIONS (Outside component to avoid hoisting issues) ====================

function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  emotion: EmotionType,
  isTalking: boolean
) {
  const expression = EXPRESSION_MAP[emotion] || EXPRESSION_MAP.neutral;
  
  ctx.fillStyle = '#000000';
  const eyeY = -5;
  const eyeSpacing = 12;

  // Eyes
  switch (expression.eyes) {
    case 'dots':
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'wide':
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 10, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'closed':
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY + 3, 8, Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(eyeSpacing, eyeY + 3, 8, Math.PI, 2 * Math.PI);
      ctx.stroke();
      break;
    case 'angry':
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 6, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 4, 0, Math.PI * 2);
      ctx.fill();
  }

  // Mouth
  const mouthY = 15;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = '#000000';
  ctx.lineWidth = 4;

  if (isTalking) {
    const mouthOpen = Math.abs(Math.sin(Date.now() / 80)) * 10 + 5;
    ctx.beginPath();
    ctx.ellipse(0, mouthY, 10, mouthOpen, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    switch (expression.mouth) {
      case 'smile':
        ctx.beginPath();
        ctx.arc(0, mouthY - 5, 12, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();
        break;
      case 'frown':
        ctx.beginPath();
        ctx.arc(0, mouthY + 15, 12, 1.2 * Math.PI, 1.8 * Math.PI);
        ctx.stroke();
        break;
      case 'open':
      case 'scream':
        ctx.beginPath();
        ctx.ellipse(0, mouthY, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'smirk':
        ctx.beginPath();
        ctx.moveTo(-8, mouthY);
        ctx.quadraticCurveTo(5, mouthY + 5, 12, mouthY - 5);
        ctx.stroke();
        break;
      default:
        ctx.beginPath();
        ctx.moveTo(-10, mouthY);
        ctx.lineTo(10, mouthY);
        ctx.stroke();
    }
  }

  // Eyebrows
  if (expression.eyebrows) {
    const eyebrowY = -18;
    ctx.lineWidth = 3;
    switch (expression.eyebrows) {
      case 'raised':
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 8, eyebrowY - 5);
        ctx.lineTo(-eyeSpacing + 8, eyebrowY - 5);
        ctx.moveTo(eyeSpacing - 8, eyebrowY - 5);
        ctx.lineTo(eyeSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        break;
      case 'angry':
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 8, eyebrowY - 5);
        ctx.lineTo(-eyeSpacing + 8, eyebrowY + 5);
        ctx.moveTo(eyeSpacing - 8, eyebrowY + 5);
        ctx.lineTo(eyeSpacing + 8, eyebrowY - 5);
        ctx.stroke();
        break;
      case 'worried':
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 8, eyebrowY + 3);
        ctx.lineTo(-eyeSpacing + 8, eyebrowY - 5);
        ctx.moveTo(eyeSpacing - 8, eyebrowY - 5);
        ctx.lineTo(eyeSpacing + 8, eyebrowY + 3);
        ctx.stroke();
        break;
    }
  }
}

function drawStickman(
  ctx: CanvasRenderingContext2D,
  state: CharacterState,
  animationFrame: AnimationFrame | null,
  id: string
) {
  const { position, facingRight, emotion, scale, squash, stretch, rotation, opacity, isTalking } = state;
  
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(position.x, position.y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(facingRight ? scale * squash : -scale * squash, scale * stretch);

  // Animation frame offsets
  let headOffset = { x: 0, y: 0 };
  let leftArm = [-25, -10];
  let rightArm = [25, -10];
  let leftLeg = [-15, 40];
  let rightLeg = [15, 40];
  let bodyLean = 0;

  if (animationFrame) {
    headOffset = animationFrame.headOffset || headOffset;
    leftArm = animationFrame.leftArm || leftArm;
    rightArm = animationFrame.rightArm || rightArm;
    leftLeg = animationFrame.leftLeg || leftLeg;
    rightLeg = animationFrame.rightLeg || rightLeg;
    bodyLean = animationFrame.bodyLean || bodyLean;
  }

  // Draw style
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.save();
  ctx.rotate((bodyLean * Math.PI) / 180);

  // Body
  ctx.beginPath();
  ctx.moveTo(0, -80);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Head
  const headY = -80 - 40 + headOffset.y;
  ctx.beginPath();
  ctx.arc(headOffset.x, headY, 40, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE4C4';
  ctx.fill();
  ctx.stroke();

  // Face
  drawFace(ctx, headOffset.x, headY, emotion, isTalking);

  // Arms
  const armStartY = -60;
  ctx.beginPath();
  ctx.moveTo(0, armStartY);
  ctx.lineTo(leftArm[0], armStartY + leftArm[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, armStartY);
  ctx.lineTo(rightArm[0], armStartY + rightArm[1]);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(leftLeg[0], leftLeg[1]);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(rightLeg[0], rightLeg[1]);
  ctx.stroke();

  ctx.restore();

  // Character name
  ctx.fillStyle = '#333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(id.charAt(0).toUpperCase() + id.slice(1), 0, 100);

  ctx.restore();
}

function drawDialogueBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: { x: number; y: number },
) {
  const x = position.x;
  const y = position.y - 200;

  ctx.font = 'bold 28px Arial';
  const textWidth = ctx.measureText(text).width;
  const bubbleWidth = Math.max(textWidth + 40, 100);
  const bubbleHeight = 50;

  // Bubble
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 10);
  ctx.fill();
  ctx.stroke();

  // Pointer
  ctx.beginPath();
  ctx.moveTo(x, y + bubbleHeight / 2);
  ctx.lineTo(x - 15, y + bubbleHeight / 2 + 20);
  ctx.lineTo(x + 15, y + bubbleHeight / 2);
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// ==================== CANVAS PREVIEW COMPONENT ====================

function CanvasPreview() {
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
    cameraState,
    play,
    pause,
    stop,
    setCurrentFrame,
    updateAnimation,
  } = useAnimatorStore();

  const [canvasSize] = useState({ width: 720, height: 1280 }); // Vertical 9:16

  // Render current frame
  const renderCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.translate(cameraState.pan.x, cameraState.pan.y);
    ctx.scale(cameraState.zoom, cameraState.zoom);
    ctx.rotate((cameraState.rotation * Math.PI) / 180);
    ctx.translate(-centerX, -centerY);

    // Draw each character
    characters.forEach((state, id) => {
      // Get animation frame
      const animFrame = animationController.update(id, 16);
      drawStickman(ctx, state, animFrame, id);
    });

    // Draw dialogue bubbles
    if (parsedStory) {
      let frameAccumulator = 0;
      for (const scene of parsedStory.scenes) {
        if (currentFrame >= frameAccumulator && currentFrame < frameAccumulator + scene.duration) {
          const relativeFrame = currentFrame - frameAccumulator;
          scene.dialogue.forEach(dialogue => {
            if (relativeFrame >= dialogue.startTime && relativeFrame < dialogue.startTime + dialogue.duration) {
              const charState = characters.get(dialogue.characterId);
              if (charState) {
                drawDialogueBubble(ctx, dialogue.text, charState.position);
              }
            }
          });
          break;
        }
        frameAccumulator += scene.duration;
      }
    }

    ctx.restore();
  }, [parsedStory, characters, currentFrame, cameraState]);

  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      isAnimatingRef.current = true;
      
      const animate = (timestamp: number) => {
        if (!isAnimatingRef.current) return;

        const elapsed = timestamp - lastTimeRef.current;
        const frameTime = 1000 / fps;

        if (elapsed >= frameTime) {
          lastTimeRef.current = timestamp - (elapsed % frameTime);
          
          updateAnimation();
          
          const store = useAnimatorStore.getState();
          
          if (store.currentFrame >= store.totalFrames - 1) {
            store.setCurrentFrame(0);
          } else {
            store.setCurrentFrame(store.currentFrame + 1);
          }
          
          renderCurrentFrame();
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      isAnimatingRef.current = false;
    }

    return () => {
      isAnimatingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, fps, updateAnimation, renderCurrentFrame]);

  // Render on frame change (manual stepping)
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
    <Card className="h-full flex flex-col bg-black">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-white">
            <Camera className="w-5 h-5" />
            Preview (9:16 Vertical)
          </CardTitle>
          <div className="text-sm text-white/70">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Canvas Container */}
        <div className="relative flex-1 flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden min-h-[400px]">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="max-h-full max-w-full object-contain"
            style={{ maxHeight: '500px' }}
          />
          
          {!parsedStory && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white/50">
                <Clapperboard className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg">Enter a story and click Generate</p>
                <p className="text-sm mt-1">to create your meme animation</p>
              </div>
            </div>
          )}
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 px-2">
          <Button
            variant="outline"
            size="icon"
            onClick={stop}
            disabled={!parsedStory}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            disabled={!parsedStory || isPlaying}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={isPlaying ? pause : play}
            disabled={!parsedStory}
            className="bg-primary hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentFrame(Math.min(totalFrames, currentFrame + 1))}
            disabled={!parsedStory || isPlaying}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
              className="w-full"
            />
          </div>

          <div className="text-sm text-white/70 w-16 text-right">
            {fps} FPS
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== STORY INPUT COMPONENT ====================

function StoryInput() {
  const { storyText, setStoryText, parseStory, parsedStory, characters } = useAnimatorStore();
  const [soundEnabled] = useState(true);

  const sampleStories = [
    { name: 'Kid Steals Food', key: 'kid_steals_food' },
    { name: 'Man Slips Banana', key: 'man_slips_banana' },
    { name: 'Teacher Calls Name', key: 'teacher_calls_name' },
  ];

  const handleGenerate = useCallback(() => {
    parseStory();
    if (soundEnabled) {
      soundSystem.initialize();
    }
  }, [parseStory, soundEnabled]);

  const loadSample = useCallback((key: string) => {
    const samples: Record<string, string> = {
      kid_steals_food: 'Kid sneaks to the fridge. Kid opens the door slowly. Kid reaches for food. Mom appears behind. Dramatic zoom. Kid looks shocked. Mom smiles evil grin.',
      man_slips_banana: 'Man walks happily down the street. Man sees something on the ground. Man slips on a banana peel. Man falls dramatically. Man lies on ground sad.',
      teacher_calls_name: 'Teacher looks at the class. Teacher opens the attendance book. Teacher calls a random name. Student freezes in shock. Everyone looks at student. Student sweats nervously.',
    };
    setStoryText(samples[key] || '');
  }, [setStoryText]);

  const characterCount = characters.size;
  const sceneCount = parsedStory?.scenes.length || 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Story Input
          </CardTitle>
          <Button onClick={handleGenerate} disabled={!storyText.trim()} className="gap-2">
            <Wand2 className="w-4 h-4" />
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Textarea
          placeholder="Write your meme story here...&#10;&#10;Example:&#10;John walks in. He sees something shocking. He freezes. Then he screams dramatically."
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          className="flex-1 min-h-[200px] resize-none font-mono text-sm"
        />
        
        {/* Stats */}
        {parsedStory && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              {sceneCount} {sceneCount === 1 ? 'Scene' : 'Scenes'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              {characterCount} {characterCount === 1 ? 'Character' : 'Characters'}
            </Badge>
          </div>
        )}

        {/* Sample Stories */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Quick Start Templates:</p>
          <div className="space-y-2">
            {sampleStories.map((sample) => (
              <Button
                key={sample.key}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => loadSample(sample.key)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {sample.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== TIMELINE COMPONENT ====================

function Timeline() {
  const { 
    parsedStory, 
    currentFrame, 
    totalFrames,
  } = useAnimatorStore();

  if (!parsedStory) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[80px]">
          <p className="text-muted-foreground text-sm">Generate a story to view timeline</p>
        </CardContent>
      </Card>
    );
  }

  const getSceneColor = (type: string): string => {
    const colors: Record<string, string> = {
      setup: 'bg-blue-500',
      buildup: 'bg-yellow-500',
      tension: 'bg-orange-500',
      punchline: 'bg-red-500',
      reaction: 'bg-green-500',
      aftermath: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getBeatType = (description: string): string => {
    const lower = description.toLowerCase();
    if (lower.includes('shock') || lower.includes('punchline') || lower.includes('caught')) return 'punchline';
    if (lower.includes('dramatic') || lower.includes('zoom')) return 'tension';
    if (lower.includes('sad') || lower.includes('happy') || lower.includes('lies')) return 'reaction';
    return 'setup';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            Timeline
          </CardTitle>
          <Badge variant="outline">
            Frame {currentFrame} / {totalFrames}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="relative h-8 bg-muted/30 rounded">
            {/* Scene blocks */}
            <div className="flex h-full">
              {parsedStory.scenes.map((scene) => {
                const width = (scene.duration / totalFrames) * 100;
                return (
                  <div
                    key={scene.id}
                    className={`h-full text-xs text-white flex items-center justify-center px-2 border-r border-white/20 ${getSceneColor(getBeatType(scene.description))}`}
                    style={{ width: `${width}%`, minWidth: '40px' }}
                    title={scene.description}
                  >
                    <span className="truncate text-[10px]">
                      {scene.description.substring(0, 15)}...
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
            />
          </div>
        </ScrollArea>
        
        {/* Legend */}
        <div className="flex gap-3 mt-2 flex-wrap">
          {['setup', 'tension', 'punchline', 'reaction'].map(type => (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${getSceneColor(type)}`} />
              <span className="text-xs capitalize">{type}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== CAMERA CONTROLS COMPONENT ====================

function CameraControls() {
  const { 
    cameraState, 
    setCameraZoom, 
    setCameraEffect, 
    resetCamera,
    playSound 
  } = useAnimatorStore();

  const cameraEffects: { name: string; effect: CameraEffect; icon: React.ReactNode }[] = [
    { name: 'Zoom In', effect: 'zoom_in', icon: <ZoomIn className="w-4 h-4" /> },
    { name: 'Zoom Out', effect: 'zoom_out', icon: <ZoomOut className="w-4 h-4" /> },
    { name: 'Shake', effect: 'shake', icon: <Volume2 className="w-4 h-4" /> },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5" />
          Camera Effects
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Current Zoom */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">Zoom Level</Label>
            <span className="text-sm text-muted-foreground">{cameraState.zoom.toFixed(1)}x</span>
          </div>
          <Slider
            value={[cameraState.zoom * 100]}
            min={50}
            max={300}
            step={10}
            onValueChange={([value]) => setCameraZoom(value / 100)}
          />
        </div>

        {/* Quick Effects */}
        <div className="space-y-2">
          <Label className="text-sm">Quick Effects</Label>
          <div className="grid grid-cols-3 gap-2">
            {cameraEffects.map(({ name, effect, icon }) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                onClick={() => {
                  setCameraEffect(effect);
                  if (effect === 'shake') playSound('boom');
                }}
                className="flex-col h-auto py-2"
              >
                {icon}
                <span className="text-xs mt-1">{name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <Button variant="outline" onClick={resetCamera} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Camera
        </Button>
      </CardContent>
    </Card>
  );
}

// ==================== EXPORT PANEL COMPONENT ====================

function ExportPanel() {
  const { 
    parsedStory, 
    exportConfig, 
    updateExportConfig, 
    isExporting, 
    exportProgress 
  } = useAnimatorStore();
  
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'complete' | 'error'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleExport = useCallback(async () => {
    if (!parsedStory) return;
    
    setExportStatus('exporting');
    
    // Create export canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportConfig.resolution.width;
    exportCanvas.height = exportConfig.resolution.height;
    const ctx = exportCanvas.getContext('2d');
    
    if (!ctx) {
      setExportStatus('error');
      return;
    }

    // Draw a preview frame
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Add watermark text
    ctx.fillStyle = '#CCCCCC';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Meme Animation', exportCanvas.width / 2, exportCanvas.height / 2);

    // Start recording
    try {
      await videoExporter.startRecording(exportCanvas);
      
      // Simulate recording duration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const blob = await videoExporter.stopRecording();
      videoExporter.downloadBlob(blob, `meme_animation_${Date.now()}.webm`);
      
      setExportStatus('complete');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    }
  }, [parsedStory, exportConfig]);

  const quickExport = useCallback(async (format: 'mp4' | 'webm' | 'gif') => {
    updateExportConfig({ format });
    await handleExport();
  }, [updateExportConfig, handleExport]);

  const resolutions = videoExporter.getAvailableResolutions();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5" />
          Export Video
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Export */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Export</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('webm')}
              className="flex-col h-auto py-2"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-xs">WebM</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('mp4')}
              className="flex-col h-auto py-2"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-xs">MP4</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('gif')}
              className="flex-col h-auto py-2"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-xs">GIF</span>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Resolution */}
        <div className="space-y-2">
          <Label className="text-sm">Resolution</Label>
          <Select
            value={Object.entries(resolutions).find(
              ([, res]) => res.width === exportConfig.resolution.width
            )?.[0] || '720p'}
            onValueChange={(value) => {
              const res = resolutions[value];
              if (res) updateExportConfig({ resolution: res });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(resolutions).map(([name, res]) => (
                <SelectItem key={name} value={name}>
                  {name} ({res.width}x{res.height})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm">Quality</Label>
            <span className="text-sm text-muted-foreground">{exportConfig.quality}%</span>
          </div>
          <Slider
            value={[exportConfig.quality]}
            min={10}
            max={100}
            step={10}
            onValueChange={([quality]) => updateExportConfig({ quality })}
          />
        </div>

        {/* Export Button */}
        <div className="mt-auto pt-4 border-t">
          <Button
            className="w-full"
            disabled={!parsedStory || exportStatus === 'exporting'}
            onClick={handleExport}
          >
            {exportStatus === 'exporting' ? (
              <>Exporting...</>
            ) : exportStatus === 'complete' ? (
              <>Downloaded!</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Video
              </>
            )}
          </Button>

          {exportStatus === 'exporting' && (
            <Progress value={exportProgress} className="mt-2 h-2" />
          )}

          {!parsedStory && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Generate a story to enable export
            </p>
          )}
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}

// ==================== MAIN PAGE COMPONENT ====================

export default function MemeAnimatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Clapperboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Stickman Meme Animator</h1>
                <p className="text-xs text-muted-foreground">
                  Rico-Style Engine | Vertical 9:16 | YouTube Shorts Ready
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Write a story, generate, and export your meme animation!</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full min-h-[600px]">
          {/* Left Panel - Story Input */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <StoryInput />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - Preview & Timeline */}
          <ResizablePanel defaultSize={55}>
            <ResizablePanelGroup direction="vertical">
              {/* Canvas Preview */}
              <ResizablePanel defaultSize={75} minSize={50}>
                <CanvasPreview />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Timeline */}
              <ResizablePanel defaultSize={25} minSize={15}>
                <Timeline />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Camera & Export */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <ResizablePanelGroup direction="vertical">
              {/* Camera Controls */}
              <ResizablePanel defaultSize={50}>
                <CameraControls />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Export Panel */}
              <ResizablePanel defaultSize={50}>
                <ExportPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Stickman Meme Animator v2.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Rico-Style Engine</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Canvas API | WebM Export | 24 FPS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
