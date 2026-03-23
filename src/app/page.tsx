'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAnimatorStore, ANIMATION_PRESETS, BACKGROUND_PRESETS } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Film,
  Save,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Layers,
  Users,
  Smile,
  Sparkles,
  Wand2,
  Volume2,
  Type,
  Palette,
  Settings,
  ChevronDown,
  Plus,
  Trash2,
  Move,
  RotateCcw,
  Eye,
  EyeOff,
  MoreHorizontal,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Hand,
  Square,
  Circle,
  MousePointer,
  Play,
} from 'lucide-react';

// Import components
import { TimelineEditor } from '@/components/super-app/TimelineEditor';
import { DrawingTools } from '@/components/super-app/DrawingTools';
import { EffectsPanel } from '@/components/super-app/EffectsPanel';
import { AudioPanel } from '@/components/super-app/AudioPanel';
import { AIFeatures } from '@/components/super-app/AIFeatures';
import { ExportPanel } from '@/components/super-app/ExportPanel';
import { TemplatesPanel } from '@/components/super-app/TemplatesPanel';
import { TransitionsPanel } from '@/components/super-app/TransitionsPanel';
import { ProjectManager } from '@/components/super-app/ProjectManager';

// Import engine
import { VerticalVideoRenderer } from '@/engine/pro/rendering/VerticalVideoRenderer';
import { ProCharacter, MoodType, PRESET_RESOLUTIONS } from '@/engine/pro/types';
import { cn } from '@/lib/utils';

// Mood icons mapping
const MOOD_ICONS: Record<MoodType, string> = {
  neutral: '😐',
  happy: '😊',
  sad: '😢',
  angry: '😠',
  surprised: '😲',
  scared: '😱',
  disgusted: '🤢',
  confused: '😕',
  excited: '🤩',
  embarrassed: '😳',
  proud: '😎',
  nervous: '😰',
  thinking: '🤔',
  love: '😍',
  sleepy: '😴',
};

export default function SuperAppPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<VerticalVideoRenderer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    projectName,
    isPlaying,
    currentFrame,
    fps,
    selectedCharacterId,
    selectedAnimation,
    selectedMood,
    background,
    zoom,
    showGrid,
    showOnionSkin,
    characters,
    tracks,
    setProjectName,
    play,
    pause,
    stop,
    setCurrentFrame,
    setZoom,
    toggleGrid,
    toggleOnionSkin,
    selectCharacter,
    setSelectedAnimation,
    setSelectedMood,
    setBackground,
    addCharacter,
    removeCharacter,
    addClip,
    triggerEffect,
    setLeftPanelTab,
    setRightPanelTab,
    leftPanelTab,
    rightPanelTab,
  } = useAnimatorStore();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cursorMode, setCursorMode] = useState<'select' | 'pan' | 'draw'>('select');
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  // Get resolution based on export config
  const resolution = useAnimatorStore.getState().exportConfig.resolution;
  const res = PRESET_RESOLUTIONS[resolution] || PRESET_RESOLUTIONS.shorts;

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const renderer = new VerticalVideoRenderer({
      resolution: res,
      fps,
      quality: 'final',
      format: 'mp4',
      aspectRatio: '9:16',
    });
    
    renderer.initialize(canvasRef.current);
    rendererRef.current = renderer;
    
    // Add sample characters
    characters.forEach((preset) => {
      renderer.addCharacter(preset.character, res.width / 2, res.height - 300);
    });
    
    renderer.renderFrame();
    
    return () => {
      renderer.clear();
    };
  }, []);

  // Update renderer when characters change
  useEffect(() => {
    if (!rendererRef.current) return;
    
    // Clear and re-add characters
    rendererRef.current.clear();
    characters.forEach((preset) => {
      rendererRef.current?.addCharacter(preset.character, res.width / 2, res.height - 300);
    });
    rendererRef.current.renderFrame();
  }, [characters, res]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      if (!rendererRef.current || !isPlaying) return;
      
      rendererRef.current.update();
      rendererRef.current.renderFrame();
      
      requestAnimationFrame(animate);
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Event listeners for custom events
  useEffect(() => {
    const handleApplyTemplate = (e: CustomEvent) => {
      console.log('Apply template:', e.detail);
      // Apply template data
    };

    const handleQuickMeme = (e: CustomEvent) => {
      const { animation, mood } = e.detail;
      handlePlayAnimation(animation);
      handleSetMood(mood as MoodType);
    };

    const handleLoadProject = (e: CustomEvent) => {
      console.log('Load project:', e.detail);
      // Load project data
    };

    const handleStoryParsed = (e: CustomEvent) => {
      console.log('Story parsed:', e.detail);
      // Apply parsed story data
    };

    window.addEventListener('applyTemplate', handleApplyTemplate as EventListener);
    window.addEventListener('quickMeme', handleQuickMeme as EventListener);
    window.addEventListener('loadProject', handleLoadProject as EventListener);
    window.addEventListener('storyParsed', handleStoryParsed as EventListener);

    return () => {
      window.removeEventListener('applyTemplate', handleApplyTemplate as EventListener);
      window.removeEventListener('quickMeme', handleQuickMeme as EventListener);
      window.removeEventListener('loadProject', handleLoadProject as EventListener);
      window.removeEventListener('storyParsed', handleStoryParsed as EventListener);
    };
  }, []);

  // Handle animation selection
  const handlePlayAnimation = useCallback((animationType: string) => {
    if (!rendererRef.current || !selectedCharacterId) return;
    
    rendererRef.current.playAnimation(selectedCharacterId, animationType);
    setSelectedAnimation(animationType);
    
    // Add clip to timeline
    const track = tracks.find(t => t.type === 'animation');
    if (track) {
      addClip(track.id, {
        trackId: track.id,
        startFrame: currentFrame,
        duration: 30,
        label: animationType,
        color: '#8B5CF6',
        data: { characterId: selectedCharacterId, animation: animationType },
      });
    }
    
    if (!isPlaying) {
      play();
    }
  }, [selectedCharacterId, currentFrame, tracks, isPlaying, addClip, play, setSelectedAnimation]);

  // Handle mood selection
  const handleSetMood = useCallback((mood: MoodType) => {
    if (!rendererRef.current || !selectedCharacterId) return;
    
    rendererRef.current.setCharacterMood(selectedCharacterId, mood);
    setSelectedMood(mood);
    rendererRef.current.renderFrame();
  }, [selectedCharacterId, setSelectedMood]);

  // Handle background change
  const handleBackgroundChange = useCallback((bgId: string) => {
    const bgPreset = BACKGROUND_PRESETS.find(b => b.id === bgId);
    if (bgPreset) {
      setBackground({ type: 'gradient', value: bgPreset.colors, blur: 0, dim: 0 });
    }
  }, [setBackground]);

  // Handle effect trigger
  const handleTriggerEffect = useCallback((effectType: string) => {
    if (!rendererRef.current) return;
    rendererRef.current.triggerEffect(effectType);
    triggerEffect(effectType as any);
  }, [triggerEffect]);

  // Add new character
  const handleAddCharacter = useCallback(() => {
    const newId = `char-${Date.now()}`;
    const newCharacter: ProCharacter = {
      id: newId,
      name: `Character ${characters.length + 1}`,
      bodyType: 'average',
      height: 1,
      skinTone: '#FFD5B8',
      hair: { style: 'short', color: '#3D2314', length: 'short' },
      face: { eyeStyle: 'normal', eyeColor: '#4A90D9', eyebrowStyle: 'normal', mouthStyle: 'normal' },
      outfit: { top: { type: 'tshirt', color: '#6B7280', pattern: 'solid' }, bottom: { type: 'jeans', color: '#374151', pattern: 'solid' }, shoes: { type: 'sneakers', color: '#FFF', pattern: 'solid' } },
      accessories: [],
      transform: { x: res.width / 2, y: res.height - 300, scale: 1, rotation: 0, flipX: false, flipY: false },
      pose: { headTilt: 0, headTurn: 0, spineCurve: 0, leftArmAngle: 15, leftForearmAngle: 10, rightArmAngle: -15, rightForearmAngle: -10, leftHandPose: 'open', rightHandPose: 'open', leftLegAngle: 0, leftKneeAngle: 0, rightLegAngle: 0, rightKneeAngle: 0, leftFootAngle: 0, rightFootAngle: 0 },
      mood: 'neutral',
      currentAnimation: null,
      animationTime: 0,
    };
    
    addCharacter({ id: newId, name: newCharacter.name, character: newCharacter });
    
    if (rendererRef.current) {
      rendererRef.current.addCharacter(newCharacter, res.width / 2, res.height - 300);
      rendererRef.current.renderFrame();
    }
  }, [characters.length, addCharacter, res]);

  // Canvas drag handlers for character positioning
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (cursorMode !== 'select' || !selectedCharacterId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Scale to canvas coordinates
    const canvasX = (x / rect.width) * res.width;
    const canvasY = (y / rect.height) * res.height;
    
    setIsDragging(true);
    setDragOffset({ x: canvasX, y: canvasY });
  }, [cursorMode, selectedCharacterId, zoom, res]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedCharacterId || !rendererRef.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Scale to canvas coordinates
    const canvasX = (x / rect.width) * res.width;
    const canvasY = (y / rect.height) * res.height;
    
    // Update character position
    rendererRef.current.moveCharacter(selectedCharacterId, canvasX, canvasY, false);
    rendererRef.current.renderFrame();
  }, [isDragging, selectedCharacterId, zoom, res]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo & Project Name */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Meme Animator Pro</h1>
                <p className="text-[10px] text-purple-300">Super App</p>
              </div>
            </div>
            
            <Separator orientation="vertical" className="h-8 bg-gray-700" />
            
            <div className="flex items-center gap-2">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-48 h-8 bg-gray-800/50 border-gray-700 text-white text-sm"
              />
              <Badge variant="outline" className="border-gray-700 text-gray-400">
                Auto-saved
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cursor Mode */}
            <div className="flex items-center gap-1 mr-2 px-1 py-1 bg-gray-800/50 rounded">
              {[
                { id: 'select', icon: <MousePointer className="w-4 h-4" />, title: 'Select & Move' },
                { id: 'pan', icon: <Hand className="w-4 h-4" />, title: 'Pan Canvas' },
                { id: 'draw', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>, title: 'Draw' },
              ].map((mode) => (
                <Button
                  key={mode.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-7 w-7",
                    cursorMode === mode.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => setCursorMode(mode.id as typeof cursorMode)}
                  title={mode.title}
                >
                  {mode.icon}
                </Button>
              ))}
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center gap-1 mr-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-gray-800/50 rounded">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setZoom(zoom - 0.1)}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-gray-300 w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setZoom(zoom + 0.1)}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setZoom(1)}
              >
                <Maximize className="w-3 h-3" />
              </Button>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant={showGrid ? "default" : "ghost"}
                size="icon"
                className={cn("h-8 w-8", showGrid ? "bg-purple-600" : "text-gray-400 hover:text-white")}
                onClick={toggleGrid}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={showOnionSkin ? "default" : "ghost"}
                size="icon"
                className={cn("h-8 w-8", showOnionSkin ? "bg-purple-600" : "text-gray-400 hover:text-white")}
                onClick={toggleOnionSkin}
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            {/* Save/Export */}
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white"
              onClick={() => setShowNewProjectDialog(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-[280px] flex-shrink-0 border-r border-purple-500/30 bg-gray-900/50 backdrop-blur-sm flex flex-col">
          <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 h-9 bg-gray-800/50">
              <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-purple-600">
                <Wand2 className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="characters" className="text-xs data-[state=active]:bg-purple-600">
                <Users className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="animations" className="text-xs data-[state=active]:bg-purple-600">
                <Sparkles className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="expressions" className="text-xs data-[state=active]:bg-purple-600">
                <Smile className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tools" className="flex-1 overflow-hidden m-0">
              <DrawingTools />
            </TabsContent>
            
            <TabsContent value="characters" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-200">Characters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-purple-400 hover:text-purple-300"
                    onClick={handleAddCharacter}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {characters.map((preset) => (
                      <div
                        key={preset.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer border",
                          selectedCharacterId === preset.id
                            ? "bg-purple-600/30 border-purple-500"
                            : "bg-gray-800/50 border-transparent hover:border-gray-700"
                        )}
                        onClick={() => selectCharacter(preset.id)}
                      >
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                          {MOOD_ICONS[preset.character.mood]}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-200">{preset.name}</p>
                          <p className="text-xs text-gray-500">{preset.character.currentAnimation || 'Idle'}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCharacter(preset.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="animations" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="text-sm font-medium text-gray-200">Animations</h3>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {['basic', 'movement', 'social', 'emotion', 'meme', 'action'].map((category) => (
                      <div key={category} className="mb-3">
                        <h4 className="text-xs text-gray-500 px-2 mb-1 capitalize">{category}</h4>
                        <div className="grid grid-cols-2 gap-1">
                          {ANIMATION_PRESETS.filter(a => a.category === category).map((anim) => (
                            <Button
                              key={anim.id}
                              variant="outline"
                              size="sm"
                              className={cn(
                                "justify-start text-xs h-8",
                                anim.category === 'meme'
                                  ? "border-pink-500/50 text-pink-300 hover:bg-pink-900/30"
                                  : "border-gray-700 text-gray-300 hover:bg-gray-800"
                              )}
                              onClick={() => handlePlayAnimation(anim.id)}
                            >
                              {anim.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
            
            <TabsContent value="expressions" className="flex-1 overflow-hidden m-0">
              <div className="h-full flex flex-col">
                <div className="p-3 border-b border-gray-800">
                  <h3 className="text-sm font-medium text-gray-200">Expressions</h3>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 grid grid-cols-3 gap-1">
                    {Object.entries(MOOD_ICONS).map(([mood, icon]) => (
                      <Button
                        key={mood}
                        variant={selectedMood === mood ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "flex-col h-auto py-2",
                          selectedMood === mood
                            ? "bg-pink-600 text-white"
                            : "border-gray-700 text-gray-300"
                        )}
                        onClick={() => handleSetMood(mood as MoodType)}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="text-[10px] capitalize">{mood}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center p-4 overflow-auto"
            style={{ cursor: cursorMode === 'pan' ? 'grab' : cursorMode === 'draw' ? 'crosshair' : 'default' }}
          >
            <div 
              className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
              style={{
                width: `${Math.min(400, 400 * zoom)}px`,
                aspectRatio: '9/16',
              }}
            >
              {/* Main Canvas */}
              <canvas
                ref={canvasRef}
                width={res.width}
                height={res.height}
                className="w-full h-full object-contain"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              
              {/* Drawing Canvas Overlay */}
              <canvas
                ref={drawingCanvasRef}
                width={res.width}
                height={res.height}
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ opacity: 0.5 }}
              />
              
              {/* Onion Skin Layer */}
              {showOnionSkin && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-red-500/10 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-green-500/10 mix-blend-multiply" />
                </div>
              )}
              
              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}
              
              {/* Canvas Info */}
              <div className="absolute top-2 left-2 bg-black/60 rounded px-2 py-1 text-[10px] text-white">
                {res.width}×{res.height} | {fps} FPS | Frame {currentFrame}
              </div>
              
              {/* Character Position Indicator */}
              {selectedCharacterId && (
                <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-1 text-[10px] text-white flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  Drag to move
                </div>
              )}
            </div>
          </div>
          
          {/* Timeline */}
          <div className="flex-shrink-0">
            <TimelineEditor />
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] flex-shrink-0 border-l border-purple-500/30 bg-gray-900/50 backdrop-blur-sm flex flex-col">
          <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-6 h-9 bg-gray-800/50">
              <TabsTrigger value="effects" className="text-xs data-[state=active]:bg-purple-600 p-1" title="Effects">
                <Sparkles className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs data-[state=active]:bg-purple-600 p-1" title="Text">
                <Type className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="audio" className="text-xs data-[state=active]:bg-purple-600 p-1" title="Audio">
                <Volume2 className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="background" className="text-xs data-[state=active]:bg-purple-600 p-1" title="Background">
                <Palette className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs data-[state=active]:bg-purple-600 p-1" title="Templates">
                <Layers className="w-3 h-3" />
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-purple-600 p-1" title="AI">
                <Wand2 className="w-3 h-3" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="effects" className="flex-1 overflow-hidden m-0">
              <EffectsPanel />
            </TabsContent>
            
            <TabsContent value="text" className="flex-1 overflow-hidden m-0">
              <TextOverlayPanel />
            </TabsContent>
            
            <TabsContent value="audio" className="flex-1 overflow-hidden m-0">
              <AudioPanel />
            </TabsContent>
            
            <TabsContent value="background" className="flex-1 overflow-hidden m-0">
              <BackgroundPanel />
            </TabsContent>
            
            <TabsContent value="templates" className="flex-1 overflow-hidden m-0">
              <TemplatesPanel />
            </TabsContent>
            
            <TabsContent value="ai" className="flex-1 overflow-hidden m-0">
              <AIFeatures />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Export Animation</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure export settings and download your animation
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            <ExportPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Save your animation project
            </DialogDescription>
          </DialogHeader>
          <ProjectManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Text Overlay Panel Component
function TextOverlayPanel() {
  const { textOverlays, addTextOverlay, removeTextOverlay, selectTextOverlay, selectedTextId } = useAnimatorStore();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [animation, setAnimation] = useState('pop');

  const handleAddText = () => {
    if (!text.trim()) return;
    
    addTextOverlay({
      id: `text-${Date.now()}`,
      text,
      position: { x: 540, y: 200 },
      style: {
        font: 'Arial Black',
        size: fontSize,
        color: fontColor,
        outline: '#000',
        shadow: true,
        bold: true,
        italic: false,
      },
      animation: { type: animation as any, duration: 0.5 },
      timing: { start: 0, end: 3 },
    });
    
    setText('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200">Text Overlay</h3>
      </div>
      
      <div className="p-3 space-y-3">
        <Textarea
          placeholder="Enter meme text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white min-h-[60px]"
        />
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Size</label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value) || 48)}
              className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
              min={12}
              max={200}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Color</label>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-full h-7 bg-transparent border border-gray-700 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">Animation</label>
          <div className="grid grid-cols-5 gap-1">
            {['none', 'pop', 'fade', 'slide', 'bounce'].map((anim) => (
              <Button
                key={anim}
                variant={animation === anim ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs h-7",
                  animation === anim ? "bg-purple-600" : "border-gray-700 text-gray-300"
                )}
                onClick={() => setAnimation(anim)}
              >
                {anim}
              </Button>
            ))}
          </div>
        </div>

        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleAddText}>
          <Plus className="w-4 h-4 mr-2" />
          Add Text
        </Button>
      </div>

      <Separator className="bg-gray-800" />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {textOverlays.map((overlay) => (
              <div
                key={overlay.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded cursor-pointer border",
                  selectedTextId === overlay.id
                    ? "bg-purple-600/30 border-purple-500"
                    : "bg-gray-800/50 border-transparent hover:border-gray-700"
                )}
                onClick={() => selectTextOverlay(overlay.id)}
              >
                <Type className="w-4 h-4 text-gray-400" />
                <span className="flex-1 text-xs text-gray-300 truncate">{overlay.text}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTextOverlay(overlay.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {textOverlays.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No text overlays yet</p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Background Panel Component
function BackgroundPanel() {
  const { background, setBackground } = useAnimatorStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackground({ type: 'image', value: reader.result as string, blur: 0, dim: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200">Background</h3>
      </div>
      
      <div className="p-3 space-y-3">
        {/* Type Selector */}
        <div className="grid grid-cols-3 gap-1">
          {['solid', 'gradient', 'image'].map((type) => (
            <Button
              key={type}
              variant={background.type === type ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs h-8 capitalize",
                background.type === type ? "bg-purple-600" : "border-gray-700 text-gray-300"
              )}
            >
              {type}
            </Button>
          ))}
        </div>

        {/* Gradient Presets */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Presets</label>
          <div className="grid grid-cols-4 gap-2">
            {BACKGROUND_PRESETS.map((bg) => (
              <button
                key={bg.id}
                className={cn(
                  "w-full aspect-square rounded-lg border-2 transition-all hover:scale-105",
                  background.type === 'gradient' && 
                  JSON.stringify(background.value) === JSON.stringify(bg.colors)
                    ? "border-purple-500"
                    : "border-gray-700"
                )}
                style={{
                  background: bg.colors.length > 1
                    ? `linear-gradient(180deg, ${bg.colors.join(', ')})`
                    : bg.colors[0],
                }}
                onClick={() => setBackground({ type: 'gradient', value: bg.colors, blur: 0, dim: 0 })}
                title={bg.name}
              />
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Custom Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={Array.isArray(background.value) ? background.value[0] : background.type === 'solid' ? background.value as string : '#87CEEB'}
              onChange={(e) => setBackground({ type: 'solid', value: e.target.value, blur: 0, dim: 0 })}
              className="w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Upload Image</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full border-gray-700 text-gray-300">
              <Palette className="w-4 h-4 mr-2" />
              Choose Image
            </Button>
          </div>
        </div>

        {/* Blur */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Blur: {background.blur}px</label>
          <input
            type="range"
            min={0}
            max={20}
            value={background.blur}
            onChange={(e) => setBackground({ ...background, blur: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Dim */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Dim: {background.dim}%</label>
          <input
            type="range"
            min={0}
            max={80}
            value={background.dim}
            onChange={(e) => setBackground({ ...background, dim: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
