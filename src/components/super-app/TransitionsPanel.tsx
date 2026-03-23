'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Circle,
  Layers,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transition {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const TRANSITIONS: Transition[] = [
  { id: 'fade', name: 'Fade', icon: <Circle className="w-4 h-4" />, description: 'Smooth fade to black' },
  { id: 'slide-left', name: 'Slide Left', icon: <ArrowLeft className="w-4 h-4" />, description: 'Slide to the left' },
  { id: 'slide-right', name: 'Slide Right', icon: <ArrowRight className="w-4 h-4" />, description: 'Slide to the right' },
  { id: 'slide-up', name: 'Slide Up', icon: <ArrowUp className="w-4 h-4" />, description: 'Slide upward' },
  { id: 'slide-down', name: 'Slide Down', icon: <ArrowDown className="w-4 h-4" />, description: 'Slide downward' },
  { id: 'zoom', name: 'Zoom', icon: <Maximize2 className="w-4 h-4" />, description: 'Zoom in/out transition' },
  { id: 'wipe', name: 'Wipe', icon: <Layers className="w-4 h-4" />, description: 'Wipe effect' },
  { id: 'dissolve', name: 'Dissolve', icon: <Zap className="w-4 h-4" />, description: 'Dissolve effect' },
];

export function TransitionsPanel() {
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [duration, setDuration] = useState(0.5);
  const [easing, setEasing] = useState('easeInOut');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    transitions: true,
    settings: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleApplyTransition = (transitionId: string) => {
    setSelectedTransition(transitionId);
    
    // Dispatch event for the main app to handle
    window.dispatchEvent(new CustomEvent('applyTransition', {
      detail: {
        type: transitionId,
        duration,
        easing,
      }
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200">Scene Transitions</h3>
        <p className="text-xs text-gray-500 mt-0.5">Add transitions between scenes</p>
      </div>

      {/* Transitions Grid */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('transitions')}
        >
          <span className="text-sm font-medium text-gray-200">Transitions</span>
          {expandedSections.transitions ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.transitions && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {TRANSITIONS.map((transition) => (
                <Button
                  key={transition.id}
                  variant="outline"
                  className={cn(
                    "h-auto py-3 flex flex-col items-center gap-1 border-gray-700",
                    selectedTransition === transition.id
                      ? "border-purple-500 bg-purple-900/30"
                      : "hover:border-purple-500"
                  )}
                  onClick={() => handleApplyTransition(transition.id)}
                >
                  <span className="text-purple-400">{transition.icon}</span>
                  <span className="text-xs text-gray-300">{transition.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('settings')}
        >
          <span className="text-sm font-medium text-gray-200">Settings</span>
          {expandedSections.settings ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.settings && (
          <div className="p-3 pt-0 space-y-4">
            {/* Duration */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Duration: {duration.toFixed(1)}s
              </label>
              <Slider
                value={[duration * 10]}
                min={1}
                max={30}
                step={1}
                onValueChange={(value) => setDuration(value[0] / 10)}
                className="w-full"
              />
            </div>

            {/* Easing */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Easing</label>
              <select
                value={easing}
                onChange={(e) => setEasing(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white"
              >
                <option value="linear">Linear</option>
                <option value="easeIn">Ease In</option>
                <option value="easeOut">Ease Out</option>
                <option value="easeInOut">Ease In Out</option>
                <option value="bounce">Bounce</option>
                <option value="elastic">Elastic</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="flex-1 p-3">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Preview</h4>
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
          {/* Simulated preview */}
          <div className="absolute inset-0 flex items-center justify-center">
            {selectedTransition ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-600/30 flex items-center justify-center">
                  {TRANSITIONS.find(t => t.id === selectedTransition)?.icon}
                </div>
                <p className="text-xs text-gray-400">
                  {TRANSITIONS.find(t => t.id === selectedTransition)?.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  {duration}s • {easing}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Select a transition</p>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-500">
          💡 Transitions are applied between scenes or at the current frame position.
        </p>
      </div>
    </div>
  );
}
