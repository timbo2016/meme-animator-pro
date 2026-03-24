'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
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
  Info,
  Loader2
} from 'lucide-react';

// Import engine types and utilities
import { 
  Character, 
  EmotionType, 
  ActionType,
  CameraState,
  ExportFormat,
  RENDER_CONFIG 
} from '@/engine/core/types';
import { 
  createDefaultRig, 
  setArmAngles, 
  setLegAngles,
  Easing 
} from '@/engine/core/RigSystem';
import { parseStoryToAnimation, ParsedStory } from '@/engine/core/StoryParser';
import { CameraController } from '@/engine/core/CameraEngine';
import { VideoEncoder, videoEncoder } from '@/engine/core/VideoEncoder';

// ==================== STICKMAN DRAWING ====================

const EXPRESSIONS = {
  neutral: { eyes: 'dots', mouth: 'flat' },
  happy: { eyes: 'closed', mouth: 'smile' },
  sad: { eyes: 'dots', mouth: 'frown' },
  angry: { eyes: 'angry', mouth: 'frown' },
  shocked: { eyes: 'wide', mouth: 'open' },
  scared: { eyes: 'wide', mouth: 'scream' },
  confused: { eyes: 'dots', mouth: 'flat' },
  evil_grin: { eyes: 'angry', mouth: 'smirk' },
  smug: { eyes: 'closed', mouth: 'smirk' },
};

function drawFace(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  emotion: EmotionType,
  isTalking: boolean
) {
  const expr = EXPRESSIONS[emotion] || EXPRESSIONS.neutral;
  
  ctx.fillStyle = '#000000';
  const eyeY = -5;
  const eyeSpacing = 10;
  
  // Eyes
  switch (expr.eyes) {
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
    switch (expr.mouth) {
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
}

function drawStickman(
  ctx: CanvasRenderingContext2D,
  character: Character,
  frame: number,
  camera: CameraState
) {
  const { rig, position, emotion, facingRight, color } = character;
  
  ctx.save();
  ctx.translate(position.x, position.y);
  if (!facingRight) ctx.scale(-1, 1);
  ctx.scale(camera.zoom, camera.zoom);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  
  // Animation offsets based on frame
  const walkCycle = Math.sin(frame / 6) * 0.3;
  const leftArmAngle = Math.PI / 4 + walkCycle;
  const rightArmAngle = Math.PI / 4 - walkCycle;
  const leftLegAngle = Math.PI / 6 + walkCycle * 0.5;
  const rightLegAngle = Math.PI / 6 - walkCycle * 0.5;
  
  // Body
  ctx.beginPath();
  ctx.moveTo(0, -80);
  ctx.lineTo(0, 0);
  ctx.stroke();
  
  // Head
  const headY = -80 - 35;
  ctx.beginPath();
  ctx.arc(0, headY, 35, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE4C4';
  ctx.fill();
  ctx.stroke();
  
  // Face
  drawFace(ctx, 0, headY, emotion, character.state === 'talking');
  
  // Arms
  const armStartY = -60;
  const armLength = 50;
  
  // Left arm
  ctx.beginPath();
  ctx.moveTo(0, armStartY);
  ctx.lineTo(Math.cos(leftArmAngle) * armLength, armStartY + Math.sin(leftArmAngle) * armLength);
  ctx.stroke();
  
  // Right arm
  ctx.beginPath();
  ctx.moveTo(0, armStartY);
  ctx.lineTo(Math.cos(rightArmAngle) * armLength, armStartY + Math.sin(rightArmAngle) * armLength);
  ctx.stroke();
  
  // Legs
  const legLength = 60;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(leftLegAngle - Math.PI/2) * legLength, Math.sin(leftLegAngle - Math.PI/2) * legLength);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(rightLegAngle - Math.PI/2) * legLength, Math.sin(rightLegAngle - Math.PI/2) * legLength);
  ctx.stroke();
  
  // Name
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(character.name, 0, 110);
  
  ctx.restore();
}

function drawDialogue(
  ctx: CanvasRenderingContext2D,
  text: string,
  position: { x: number; y: number }
) {
  const x = position.x;
  const y = position.y - 180;
  
  ctx.font = 'bold 24px Arial';
  const textWidth = ctx.measureText(text).width;
  const bubbleWidth = Math.max(textWidth + 30, 80);
  const bubbleHeight = 45;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  ctx.roundRect(x - bubbleWidth / 2, y - bubbleHeight / 2, bubbleWidth, bubbleHeight, 8);
  ctx.fill();
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x - 8, y + bubbleHeight / 2);
  ctx.lineTo(x, y + bubbleHeight / 2 + 15);
  ctx.lineTo(x + 8, y + bubbleHeight / 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// ==================== CANVAS PREVIEW ====================

function CanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [fps] = useState(24);
  const [parsedStory, setParsedStory] = useState<ParsedStory | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [camera, setCamera] = useState<CameraState>({ zoom: 1, panX: 0, panY: 0, rotation: 0, shake: 0 });
  const [canvasSize] = useState({ width: 720, height: 1280 });
  const [currentDialogue, setCurrentDialogue] = useState<{ text: string; position: { x: number; y: number } } | null>(null);
  
  // Render frame
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    // Clear
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Apply camera
    ctx.save();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.translate(camera.panX, camera.panY);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-centerX, -centerY);
    
    // Draw characters
    characters.forEach(char => {
      drawStickman(ctx, char, currentFrame, camera);
    });
    
    ctx.restore();
    
    // Draw dialogue
    if (currentDialogue) {
      drawDialogue(ctx, currentDialogue.text, currentDialogue.position);
    }
  }, [characters, camera, currentFrame, currentDialogue]);
  
  // Animation loop
  useEffect(() => {
    if (isPlaying) {
      const animate = (timestamp: number) => {
        const elapsed = timestamp - lastTimeRef.current;
        const frameTime = 1000 / fps;
        
        if (elapsed >= frameTime) {
          lastTimeRef.current = timestamp - (elapsed % frameTime);
          
          setCurrentFrame(prev => {
            if (prev >= totalFrames - 1) return 0;
            return prev + 1;
          });
          
          renderFrame();
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, fps, totalFrames, renderFrame]);
  
  // Render on changes
  useEffect(() => {
    renderFrame();
  }, [renderFrame]);
  
  // Playback controls
  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const stop = () => {
    setIsPlaying(false);
    setCurrentFrame(0);
  };
  
  // Expose methods for parent
  useEffect(() => {
    (window as any).__animationControls = {
      setParsedStory: (story: ParsedStory) => {
        setParsedStory(story);
        setCharacters(story.characters);
        setTotalFrames(story.totalFrames);
        setCurrentFrame(0);
      },
      getCanvas: () => canvasRef.current,
      getCharacters: () => characters,
      setCharacters: setCharacters,
      setCamera: setCamera,
      setCurrentDialogue: setCurrentDialogue,
      getCurrentFrame: () => currentFrame,
      setCurrentFrame,
      play,
      pause,
      stop,
      isPlaying: () => isPlaying,
    };
    
    return () => {
      delete (window as any).__animationControls;
    };
  }, [characters, currentFrame, isPlaying]);
  
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
            Preview (9:16)
          </CardTitle>
          <div className="text-sm text-white/70">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
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
        
        {/* Controls */}
        <div className="flex items-center gap-2 px-2">
          <Button variant="outline" size="icon" onClick={stop} disabled={!parsedStory}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Square className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="icon" 
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            disabled={!parsedStory || isPlaying}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button size="icon" onClick={isPlaying ? pause : play} disabled={!parsedStory}
            className="bg-primary hover:bg-primary/90">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </Button>
          
          <Button variant="outline" size="icon"
            onClick={() => setCurrentFrame(Math.min(totalFrames, currentFrame + 1))}
            disabled={!parsedStory || isPlaying}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 mx-2">
            <Slider value={[currentFrame]} min={0} max={totalFrames || 100} step={1}
              onValueChange={([v]) => setCurrentFrame(v)} disabled={!parsedStory || isPlaying} />
          </div>
          
          <div className="text-sm text-white/70 w-16 text-right">{fps} FPS</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== STORY INPUT ====================

function StoryInput() {
  const [storyText, setStoryText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const samples = [
    { name: 'Man Slips', text: 'Man walks happily down the street. Man slips on a banana peel. Man falls dramatically. Man lies on ground sad.' },
    { name: 'Teacher Slaps', text: 'Teacher stands in classroom. Teacher looks at student. Teacher slaps student suddenly. Student is shocked.' },
    { name: 'Shock Freeze', text: 'Guy walks in. Guy sees something shocking. Guy freezes in shock. Guy screams dramatically.' },
  ];
  
  const generate = useCallback(() => {
    if (!storyText.trim()) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const parsed = parseStoryToAnimation(storyText);
      
      // Update characters with animation state
      parsed.characters.forEach(char => {
        char.state = 'idle';
        char.emotion = 'neutral';
      });
      
      const controls = (window as any).__animationControls;
      if (controls) {
        controls.setParsedStory(parsed);
      }
      
      setIsGenerating(false);
    }, 500);
  }, [storyText]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Story Input
          </CardTitle>
          <Button onClick={generate} disabled={!storyText.trim() || isGenerating} className="gap-2">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Textarea
          placeholder="Write your meme story...&#10;&#10;Example: John walks in. He sees something shocking. He freezes."
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          className="flex-1 min-h-[200px] resize-none font-mono text-sm"
        />
        
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Quick Start:</p>
          <div className="space-y-2">
            {samples.map((s, i) => (
              <Button key={i} variant="outline" size="sm" className="w-full justify-start text-left"
                onClick={() => setStoryText(s.text)}>
                <Sparkles className="w-4 h-4 mr-2" />
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== TIMELINE ====================

function Timeline() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [scenes, setScenes] = useState<any[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const c = (window as any).__animationControls;
      if (c) {
        setCurrentFrame(c.getCurrentFrame?.() || 0);
        setTotalFrames((prev) => {
          const newTotal = c.getTotalFrames?.() || 0;
          return newTotal > 0 ? newTotal : prev;
        });
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timeline</CardTitle>
          <Badge variant="outline">Frame {currentFrame} / {totalFrames}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-8 bg-muted/30 rounded">
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
            style={{ left: `${totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== CAMERA CONTROLS ====================

function CameraControls() {
  const [zoom, setZoom] = useState(1);
  
  const applyZoom = (value: number) => {
    setZoom(value);
    const controls = (window as any).__animationControls;
    if (controls) {
      controls.setCamera({ zoom: value, panX: 0, panY: 0, rotation: 0, shake: 0 });
    }
  };
  
  const shake = () => {
    const controls = (window as any).__animationControls;
    if (controls) {
      controls.setCamera({ zoom, panX: 0, panY: 0, rotation: 0, shake: 15 });
      setTimeout(() => {
        controls.setCamera({ zoom, panX: 0, panY: 0, rotation: 0, shake: 0 });
      }, 300);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5" />
          Camera
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Zoom</Label>
            <span className="text-sm text-muted-foreground">{zoom.toFixed(1)}x</span>
          </div>
          <Slider value={[zoom * 100]} min={50} max={300} step={10}
            onValueChange={([v]) => applyZoom(v / 100)} />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => applyZoom(2)} className="flex-col h-auto py-2">
            <ZoomIn className="w-4 h-4" />
            <span className="text-xs">Zoom In</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => applyZoom(1)} className="flex-col h-auto py-2">
            <ZoomOut className="w-4 h-4" />
            <span className="text-xs">Reset</span>
          </Button>
          <Button variant="outline" size="sm" onClick={shake} className="flex-col h-auto py-2">
            <Volume2 className="w-4 h-4" />
            <span className="text-xs">Shake</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== EXPORT PANEL ====================

function ExportPanel() {
  const [format, setFormat] = useState<ExportFormat>('webm');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleExport = useCallback(async () => {
    const controls = (window as any).__animationControls;
    if (!controls) return;
    
    const canvas = controls.getCanvas?.();
    if (!canvas) return;
    
    setIsExporting(true);
    setProgress(0);
    
    try {
      // Use MediaRecorder for video export
      const stream = canvas.captureStream(24);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meme_animation_${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        
        setIsExporting(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 2000);
      };
      
      recorder.start(100);
      
      // Record for duration
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      recorder.stop();
      
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  }, [format]);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormat('webm')}
            className={`flex-col h-auto py-2 ${format === 'webm' ? 'border-primary' : ''}`}>
            <Download className="w-4 h-4 mb-1" />
            <span className="text-xs">WebM</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFormat('mp4')}
            className={`flex-col h-auto py-2 ${format === 'mp4' ? 'border-primary' : ''}`}>
            <Download className="w-4 h-4 mb-1" />
            <span className="text-xs">MP4</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFormat('gif')}
            className={`flex-col h-auto py-2 ${format === 'gif' ? 'border-primary' : ''}`}>
            <Download className="w-4 h-4 mb-1" />
            <span className="text-xs">GIF</span>
          </Button>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Label>Resolution</Label>
          <Select defaultValue="720p">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p (720x1280)</SelectItem>
              <SelectItem value="1080p">1080p (1080x1920)</SelectItem>
              <SelectItem value="480p">480p (480x854)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-auto pt-4 border-t">
          <Button className="w-full" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Video
              </>
            )}
          </Button>
          
          {progress > 0 && <Progress value={progress} className="mt-2 h-2" />}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN PAGE ====================

export default function MemeAnimatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Clapperboard className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Stickman Meme Animator</h1>
                <p className="text-xs text-muted-foreground">Rico-Style Engine | 9:16 Vertical | YouTube Shorts</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              <span>Write story → Generate → Export</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full min-h-[600px]">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <StoryInput />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={55}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={75} minSize={50}>
                <CanvasPreview />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={25} minSize={15}>
                <Timeline />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={50}>
                <CameraControls />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50}>
                <ExportPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      
      <footer className="border-t bg-card py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rico-Style Animation Engine v2.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Canvas API | WebM Export | 24 FPS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
