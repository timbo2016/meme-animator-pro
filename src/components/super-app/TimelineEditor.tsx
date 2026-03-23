'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useAnimatorStore } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Volume2,
  VolumeX,
  Sparkles,
  Type,
  ZoomIn,
  ZoomOut,
  Copy,
  Scissors,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Keyframe {
  frame: number;
  type: 'animation' | 'effect' | 'text' | 'audio';
  data: unknown;
}

export function TimelineEditor() {
  const {
    isPlaying,
    currentFrame,
    totalFrames,
    fps,
    tracks,
    selectedClipId,
    setCurrentFrame,
    play,
    pause,
    stop,
    selectClip,
    removeClip,
    addClip,
  } = useAnimatorStore();

  const [timelineZoom, setTimelineZoom] = useState(1);
  const [copiedClip, setCopiedClip] = useState<any>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [showKeyframes, setShowKeyframes] = useState(true);
  
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const frameDuration = 1000 / fps;
    lastTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastTimeRef.current;
      
      if (elapsed >= frameDuration) {
        lastTimeRef.current = timestamp - (elapsed % frameDuration);
        setCurrentFrame(currentFrame + 1);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentFrame, fps, setCurrentFrame]);

  // Reset frame when reaching end
  useEffect(() => {
    if (currentFrame >= totalFrames) {
      setCurrentFrame(0);
    }
  }, [currentFrame, totalFrames, setCurrentFrame]);

  const formatTime = (frames: number) => {
    const seconds = Math.floor(frames / fps);
    const remainingFrames = frames % fps;
    return `${seconds}:${remainingFrames.toString().padStart(2, '0')}`;
  };

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'animation': return <Layers className="w-3 h-3" />;
      case 'audio': return <Volume2 className="w-3 h-3" />;
      case 'effects': return <Sparkles className="w-3 h-3" />;
      case 'text': return <Type className="w-3 h-3" />;
      default: return <Layers className="w-3 h-3" />;
    }
  };

  // Generate time markers based on zoom
  const generateTimeMarkers = useCallback((): number[] => {
    const markers: number[] = [];
    const secondsTotal = Math.ceil(totalFrames / fps);
    const interval = timelineZoom < 0.5 ? 5 : timelineZoom < 1 ? 2 : 1;
    
    for (let i = 0; i <= secondsTotal; i += interval) {
      markers.push(i);
    }
    return markers;
  }, [totalFrames, fps, timelineZoom]);

  const timeMarkers = generateTimeMarkers();

  // Calculate pixels per frame based on zoom
  const pixelsPerFrame = 2 * timelineZoom;
  const timelineWidth = totalFrames * pixelsPerFrame;

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.floor((x / timelineWidth) * totalFrames);
    setCurrentFrame(Math.max(0, Math.min(frame, totalFrames)));
  }, [totalFrames, setCurrentFrame, timelineWidth]);

  const handlePlayheadDrag = useCallback((e: React.MouseEvent) => {
    if (!isDraggingPlayhead || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    const frame = Math.floor((x / timelineWidth) * totalFrames);
    setCurrentFrame(Math.max(0, Math.min(frame, totalFrames)));
  }, [isDraggingPlayhead, totalFrames, setCurrentFrame, timelineWidth]);

  // Copy/Paste/Duplicate functions
  const handleCopyClip = useCallback(() => {
    const clip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);
    if (clip) {
      setCopiedClip({ ...clip });
    }
  }, [selectedClipId, tracks]);

  const handlePasteClip = useCallback(() => {
    if (!copiedClip) return;
    
    const track = tracks.find(t => t.type === copiedClip.data?.type || t.type === 'animation');
    if (track) {
      addClip(track.id, {
        ...copiedClip,
        id: undefined,
        startFrame: currentFrame,
      });
    }
  }, [copiedClip, tracks, currentFrame, addClip]);

  const handleDuplicateClip = useCallback(() => {
    const clip = tracks.flatMap(t => t.clips).find(c => c.id === selectedClipId);
    if (clip) {
      const track = tracks.find(t => t.id === clip.trackId);
      if (track) {
        addClip(track.id, {
          ...clip,
          startFrame: clip.startFrame + clip.duration,
        });
      }
    }
  }, [selectedClipId, tracks, addClip]);

  const handleDeleteClip = useCallback(() => {
    if (selectedClipId) {
      removeClip(selectedClipId);
    }
  }, [selectedClipId, removeClip]);

  return (
    <div className="bg-gray-900/90 border-t border-purple-500/30 backdrop-blur-sm">
      {/* Playback Controls */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-800">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={stop}
        >
          <Square className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={() => setCurrentFrame(Math.max(0, currentFrame - fps))}
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button
          size="icon"
          className={cn(
            "h-10 w-10 rounded-full",
            isPlaying 
              ? "bg-pink-600 hover:bg-pink-700" 
              : "bg-purple-600 hover:bg-purple-700"
          )}
          onClick={() => isPlaying ? pause() : play()}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white"
          onClick={() => setCurrentFrame(Math.min(totalFrames, currentFrame + fps))}
        >
          <SkipForward className="w-4 h-4" />
        </Button>

        <div className="flex-1 mx-4">
          <Slider
            value={[currentFrame]}
            min={0}
            max={totalFrames}
            step={1}
            onValueChange={(value) => setCurrentFrame(value[0])}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Badge variant="outline" className="bg-gray-800 border-gray-700">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </Badge>
          <Badge variant="outline" className="bg-gray-800 border-gray-700">
            {fps} FPS
          </Badge>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-gray-800/50 rounded">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white"
            onClick={() => setTimelineZoom(Math.max(0.25, timelineZoom - 0.25))}
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs text-gray-300 w-12 text-center">{Math.round(timelineZoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white"
            onClick={() => setTimelineZoom(Math.min(4, timelineZoom + 0.25))}
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
        </div>

        {/* Frame rate controls */}
        <div className="flex items-center gap-1 ml-2">
          {[12, 24, 30, 60].map((rate) => (
            <Button
              key={rate}
              variant={fps === rate ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-2 text-xs",
                fps === rate 
                  ? "bg-purple-600 text-white" 
                  : "text-gray-400 hover:text-white"
              )}
              onClick={() => useAnimatorStore.getState().setFps(rate)}
            >
              {rate}
            </Button>
          ))}
        </div>
      </div>

      {/* Clip Editing Tools */}
      <div className="flex items-center gap-1 p-1 border-b border-gray-800 bg-gray-800/30">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-400 hover:text-white"
          onClick={handleCopyClip}
          disabled={!selectedClipId}
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-400 hover:text-white"
          onClick={handlePasteClip}
          disabled={!copiedClip}
        >
          Paste
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-400 hover:text-white"
          onClick={handleDuplicateClip}
          disabled={!selectedClipId}
        >
          Duplicate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-gray-400 hover:text-red-400"
          onClick={handleDeleteClip}
          disabled={!selectedClipId}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Delete
        </Button>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 px-2 text-xs", showKeyframes ? "text-purple-400" : "text-gray-400")}
          onClick={() => setShowKeyframes(!showKeyframes)}
        >
          Keyframes
        </Button>
      </div>

      {/* Timeline Tracks */}
      <div className="flex">
        {/* Track Labels */}
        <div className="w-[140px] flex-shrink-0 border-r border-gray-800">
          {/* Time ruler label */}
          <div className="h-8 border-b border-gray-800 flex items-center px-2 justify-between">
            <span className="text-xs text-gray-500">Tracks</span>
            <span className="text-[10px] text-gray-600">{totalFrames} frames</span>
          </div>
          
          {/* Track label rows */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="h-12 border-b border-gray-800 flex items-center gap-2 px-2"
            >
              <GripVertical className="w-3 h-3 text-gray-600 cursor-grab" />
              <span style={{ color: track.color }} className="flex items-center gap-1">
                {getTrackIcon(track.type)}
              </span>
              <span className="text-xs text-gray-300 truncate flex-1">{track.name}</span>
              <button
                className="text-gray-500 hover:text-white"
                onClick={() => {
                  useAnimatorStore.setState({
                    tracks: tracks.map(t => 
                      t.id === track.id ? { ...t, muted: !t.muted } : t
                    )
                  });
                }}
              >
                {track.muted ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Timeline Content */}
        <ScrollArea className="flex-1" ref={timelineRef}>
          <div 
            className="relative"
            style={{ minWidth: `${timelineWidth}px`, width: `${Math.max(timelineWidth, 800)}px` }}
          >
            {/* Time Ruler */}
            <div 
              className="h-8 border-b border-gray-800 relative bg-gray-900"
            >
              {timeMarkers.map((second) => (
                <div
                  key={second}
                  className="absolute top-0 h-full flex flex-col justify-between py-1"
                  style={{ left: `${(second * fps / totalFrames) * 100}%` }}
                >
                  <span className="text-[10px] text-gray-500">{second}s</span>
                  <div className="w-px h-2 bg-gray-700" />
                </div>
              ))}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-8 bottom-0 w-0.5 bg-red-500 z-20 cursor-ew-resize"
              style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
              onMouseDown={() => setIsDraggingPlayhead(true)}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-sm rotate-45 cursor-ew-resize" />
            </div>

            {/* Track Rows */}
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-12 border-b border-gray-800 relative"
                onClick={handleTimelineClick}
                onMouseMove={handlePlayheadDrag}
                onMouseUp={() => setIsDraggingPlayhead(false)}
                onMouseLeave={() => setIsDraggingPlayhead(false)}
              >
                {/* Grid lines */}
                {timeMarkers.map((second) => (
                  <div
                    key={second}
                    className="absolute top-0 bottom-0 w-px bg-gray-800"
                    style={{ left: `${(second * fps / totalFrames) * 100}%` }}
                  />
                ))}
                
                {/* Clips */}
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={cn(
                      "absolute top-1 bottom-1 rounded px-2 cursor-pointer flex items-center text-[10px] text-white truncate border-2",
                      selectedClipId === clip.id 
                        ? "ring-2 ring-white border-white" 
                        : "border-transparent hover:border-gray-500"
                    )}
                    style={{
                      left: `${(clip.startFrame / totalFrames) * 100}%`,
                      width: `${Math.max((clip.duration / totalFrames) * 100, 1)}%`,
                      backgroundColor: clip.color || track.color,
                      minWidth: '30px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectClip(clip.id);
                    }}
                  >
                    <span className="truncate">{clip.label}</span>
                  </div>
                ))}

                {/* Keyframe markers */}
                {showKeyframes && track.type === 'animation' && (
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270].map((frame) => (
                      <div
                        key={frame}
                        className="absolute w-2 h-2 bg-yellow-500 rounded-sm rotate-45 pointer-events-auto cursor-pointer hover:bg-yellow-400"
                        style={{ left: `calc(${(frame / totalFrames) * 100}% - 4px)` }}
                        title={`Keyframe at frame ${frame}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Frame-by-frame controls */}
      <div className="flex items-center gap-2 p-2 border-t border-gray-800">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-400"
            onClick={() => setCurrentFrame(currentFrame - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="text-xs text-gray-500 mx-2">Frame {currentFrame}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-gray-400"
            onClick={() => setCurrentFrame(currentFrame + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* Onion skinning toggle */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 text-xs",
            useAnimatorStore.getState().showOnionSkin 
              ? "text-purple-400" 
              : "text-gray-400"
          )}
          onClick={() => useAnimatorStore.getState().toggleOnionSkin()}
        >
          <Layers className="w-3 h-3 mr-1" />
          Onion Skin
        </Button>

        {/* Duration control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Duration:</span>
          <input
            type="number"
            value={totalFrames}
            onChange={(e) => useAnimatorStore.getState().setTotalFrames(parseInt(e.target.value) || 300)}
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
            min={30}
            max={1800}
          />
          <span className="text-xs text-gray-500">frames</span>
        </div>
      </div>
    </div>
  );
}
