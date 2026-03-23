'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAnimatorStore, DrawingTool } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Pencil,
  Eraser,
  PaintBucket,
  Square,
  Circle,
  Minus,
  Type,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { id: 'brush', icon: <Pencil className="w-4 h-4" />, label: 'Brush' },
  { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
  { id: 'fill', icon: <PaintBucket className="w-4 h-4" />, label: 'Fill' },
  { id: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rect' },
  { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
  { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
  { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
];

// Color palette
const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#FF0000', '#FF6B6B', '#FFA500', '#FFD93D',
  '#00FF00', '#6BCB77', '#00FFFF', '#4D96FF', '#0000FF', '#9B59B6',
  '#FF00FF', '#FF69B4', '#8B4513', '#D2691E', '#808080', '#C0C0C0',
];

// Blend modes
const BLEND_MODES = [
  { id: 'normal', name: 'Normal' },
  { id: 'multiply', name: 'Multiply' },
  { id: 'screen', name: 'Screen' },
  { id: 'overlay', name: 'Overlay' },
  { id: 'darken', name: 'Darken' },
  { id: 'lighten', name: 'Lighten' },
  { id: 'color-dodge', name: 'Color Dodge' },
  { id: 'color-burn', name: 'Color Burn' },
];

export function DrawingTools() {
  const {
    drawingTool,
    brushSize,
    brushColor,
    layers,
    activeLayerId,
    drawingHistory,
    historyIndex,
    showOnionSkin,
    setDrawingTool,
    setBrushSize,
    setBrushColor,
    addLayer,
    removeLayer,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    toggleOnionSkin,
    undo,
    redo,
  } = useAnimatorStore();

  const [customColor, setCustomColor] = useState('#000000');
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [onionSkinFrames, setOnionSkinFrames] = useState(2);
  const [onionSkinOpacity, setOnionSkinOpacity] = useState(30);
  const [selectedBlendMode, setSelectedBlendMode] = useState('normal');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tools: true,
    colors: true,
    layers: true,
    onionSkin: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const moveLayerUp = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      useAnimatorStore.setState({ layers: newLayers });
    }
  };

  const moveLayerDown = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      useAnimatorStore.setState({ layers: newLayers });
    }
  };

  const updateLayerBlendMode = (id: string, blendMode: string) => {
    useAnimatorStore.setState({
      layers: layers.map(l => l.id === id ? { ...l, blendMode } : l)
    });
  };

  const updateLayerOpacity = (id: string, opacity: number) => {
    useAnimatorStore.setState({
      layers: layers.map(l => l.id === id ? { ...l, opacity } : l)
    });
  };

  const renameLayer = (id: string, name: string) => {
    useAnimatorStore.setState({
      layers: layers.map(l => l.id === id ? { ...l, name } : l)
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tools Section */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('tools')}
        >
          <span className="text-sm font-medium text-gray-200">Tools</span>
          {expandedSections.tools ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.tools && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-4 gap-2 mb-3">
              {TOOLS.map((tool) => (
                <Button
                  key={tool.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-full flex flex-col items-center gap-1 p-1",
                    drawingTool === tool.id
                      ? "bg-purple-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                  onClick={() => setDrawingTool(tool.id)}
                >
                  {tool.icon}
                  <span className="text-[10px]">{tool.label}</span>
                </Button>
              ))}
            </div>

            {/* Brush Size */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">
                Size: {brushSize}px
              </label>
              <Slider
                value={[brushSize]}
                min={1}
                max={50}
                step={1}
                onValueChange={(value) => setBrushSize(value[0])}
                className="w-full"
              />
            </div>

            {/* Brush Opacity */}
            <div className="mb-3">
              <label className="text-xs text-gray-400 mb-1 block">
                Opacity: {brushOpacity}%
              </label>
              <Slider
                value={[brushOpacity]}
                min={1}
                max={100}
                step={1}
                onValueChange={(value) => setBrushOpacity(value[0])}
                className="w-full"
              />
            </div>

            {/* Undo/Redo */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-700 text-gray-300"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="w-4 h-4 mr-1" />
                Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-700 text-gray-300"
                onClick={redo}
                disabled={historyIndex >= drawingHistory.length - 1}
              >
                <Redo className="w-4 h-4 mr-1" />
                Redo
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('colors')}
        >
          <span className="text-sm font-medium text-gray-200">Colors</span>
          {expandedSections.colors ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.colors && (
          <div className="p-3 pt-0">
            {/* Current Color Preview */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-10 h-10 rounded border border-gray-600"
                style={{ backgroundColor: brushColor }}
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setBrushColor(e.target.value);
                }}
                className="w-full h-8 bg-transparent border border-gray-700 rounded cursor-pointer"
              />
            </div>

            {/* Color Palette */}
            <div className="grid grid-cols-6 gap-1">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "w-full aspect-square rounded border-2 transition-transform hover:scale-110",
                    brushColor === color ? "border-white" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setBrushColor(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Onion Skinning Section */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('onionSkin')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Onion Skinning
          </span>
          {expandedSections.onionSkin ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.onionSkin && (
          <div className="p-3 pt-0 space-y-3">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="onion-toggle" className="text-xs text-gray-400">Enable Onion Skin</Label>
              <Switch
                id="onion-toggle"
                checked={showOnionSkin}
                onCheckedChange={toggleOnionSkin}
              />
            </div>

            {/* Frames to show */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Frames: {onionSkinFrames} before/after
              </label>
              <Slider
                value={[onionSkinFrames]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => setOnionSkinFrames(value[0])}
                className="w-full"
                disabled={!showOnionSkin}
              />
            </div>

            {/* Opacity */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Opacity: {onionSkinOpacity}%
              </label>
              <Slider
                value={[onionSkinOpacity]}
                min={10}
                max={80}
                step={5}
                onValueChange={(value) => setOnionSkinOpacity(value[0])}
                className="w-full"
                disabled={!showOnionSkin}
              />
            </div>

            {/* Color coding preview */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500 opacity-50" />
                <span className="text-gray-500">Previous</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500 opacity-50" />
                <span className="text-gray-500">Next</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layers Section */}
      <div className="flex-1 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('layers')}
        >
          <span className="text-sm font-medium text-gray-200">Layers</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                addLayer();
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {expandedSections.layers ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
        
        {expandedSections.layers && (
          <ScrollArea className="h-[calc(100%-48px)]">
            <div className="p-3 pt-0 space-y-2">
              {layers.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No layers</p>
              ) : (
                [...layers].reverse().map((layer, reversedIndex) => (
                  <div
                    key={layer.id}
                    className={cn(
                      "p-2 rounded cursor-pointer border",
                      activeLayerId === layer.id
                        ? "bg-purple-600/30 border-purple-500"
                        : "bg-gray-800/50 border-transparent hover:border-gray-700"
                    )}
                    onClick={() => selectLayer(layer.id)}
                  >
                    {/* Layer Header */}
                    <div className="flex items-center gap-2 mb-2">
                      {/* Visibility Toggle */}
                      <button
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                      >
                        {layer.visible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>

                      {/* Layer Preview */}
                      <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex-shrink-0" />

                      {/* Layer Name */}
                      <input
                        type="text"
                        value={layer.name}
                        onChange={(e) => renameLayer(layer.id, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-gray-300 border-none outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Lock Toggle */}
                      <button
                        className="text-gray-400 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(layer.id);
                        }}
                      >
                        {layer.locked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Layer Properties */}
                    {activeLayerId === layer.id && (
                      <div className="space-y-2 pl-10">
                        {/* Opacity */}
                        <div>
                          <label className="text-[10px] text-gray-500 mb-0.5 block">
                            Opacity: {Math.round(layer.opacity * 100)}%
                          </label>
                          <Slider
                            value={[layer.opacity * 100]}
                            min={0}
                            max={100}
                            step={5}
                            onValueChange={(value) => updateLayerOpacity(layer.id, value[0] / 100)}
                            className="w-full h-1"
                          />
                        </div>

                        {/* Blend Mode */}
                        <div>
                          <label className="text-[10px] text-gray-500 mb-0.5 block">Blend</label>
                          <select
                            value={layer.blendMode}
                            onChange={(e) => updateLayerBlendMode(layer.id, e.target.value)}
                            className="w-full px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-[10px] text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {BLEND_MODES.map((mode) => (
                              <option key={mode.id} value={mode.id}>{mode.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Layer Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            className="text-gray-400 hover:text-white p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerUp(layer.id);
                            }}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            className="text-gray-400 hover:text-white p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLayerDown(layer.id);
                            }}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <div className="flex-1" />
                          <button
                            className="text-gray-400 hover:text-red-400 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeLayer(layer.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Layer Count */}
      <div className="p-2 border-t border-gray-800 text-center">
        <span className="text-xs text-gray-500">
          {layers.length}/10 layers
        </span>
      </div>
    </div>
  );
}
