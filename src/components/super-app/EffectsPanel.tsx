'use client';

import React, { useState } from 'react';
import { useAnimatorStore } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  Camera,
  Sparkles,
  Move,
  ZoomIn,
  Sun,
  Wind,
  Heart,
  Star,
  Bomb,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalEffectType } from '@/engine/pro/types';

interface EffectButton {
  id: GlobalEffectType;
  name: string;
  emoji: string;
  icon?: React.ReactNode;
  color: string;
}

const CAMERA_EFFECTS: EffectButton[] = [
  { id: 'shake', name: 'Camera Shake', emoji: '📹', color: 'from-red-500 to-orange-500' },
  { id: 'zoom_punch', name: 'Zoom Punch', emoji: '🔍', color: 'from-blue-500 to-cyan-500' },
  { id: 'flash', name: 'Flash', emoji: '⚡', color: 'from-yellow-400 to-white' },
];

const IMPACT_EFFECTS: EffectButton[] = [
  { id: 'impact', name: 'Impact', emoji: '💥', color: 'from-orange-500 to-red-600' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', color: 'from-yellow-300 to-pink-400' },
  { id: 'hearts', name: 'Hearts', emoji: '💕', color: 'from-pink-400 to-red-400' },
  { id: 'speed_lines', name: 'Speed Lines', emoji: '💨', color: 'from-gray-400 to-blue-400' },
];

export function EffectsPanel() {
  const { triggerEffect, activeEffects, currentFrame } = useAnimatorStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    camera: true,
    impact: true,
    settings: true,
  });

  const [effectIntensity, setEffectIntensity] = useState(50);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleEffectClick = (effect: EffectButton) => {
    triggerEffect(effect.id);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Camera Effects */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('camera')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Camera Effects
          </span>
          {expandedSections.camera ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.camera && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_EFFECTS.map((effect) => (
                <Button
                  key={effect.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1 border-gray-700 hover:border-purple-500 bg-gradient-to-br opacity-90 hover:opacity-100"
                  style={{ 
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  } as React.CSSProperties}
                  onClick={() => handleEffectClick(effect)}
                >
                  <span className="text-2xl">{effect.emoji}</span>
                  <span className="text-xs text-gray-300">{effect.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Impact Effects */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('impact')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Impact Effects
          </span>
          {expandedSections.impact ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.impact && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              {IMPACT_EFFECTS.map((effect) => (
                <Button
                  key={effect.id}
                  variant="outline"
                  className="h-auto py-3 flex flex-col items-center gap-1 border-gray-700 hover:border-purple-500"
                  onClick={() => handleEffectClick(effect)}
                >
                  <span className="text-2xl">{effect.emoji}</span>
                  <span className="text-xs text-gray-300">{effect.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Effect Settings */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('settings')}
        >
          <span className="text-sm font-medium text-gray-200">Effect Settings</span>
          {expandedSections.settings ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.settings && (
          <div className="p-3 pt-0 space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Intensity: {effectIntensity}%
              </label>
              <Slider
                value={[effectIntensity]}
                min={0}
                max={100}
                onValueChange={(value) => setEffectIntensity(value[0])}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Duration</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={0.5}
                  step={0.1}
                  min={0.1}
                  max={3}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                />
                <span className="text-xs text-gray-500">sec</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Effects */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Active Effects</h4>
          <ScrollArea className="h-[120px]">
            {activeEffects.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                Click an effect to add it
              </p>
            ) : (
              <div className="space-y-1">
                {activeEffects.map((effect, index) => (
                  <div
                    key={`${effect.type}-${index}`}
                    className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Frame {effect.frame}
                      </Badge>
                      <span className="text-xs text-gray-300">{effect.type}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                      onClick={() => {
                        useAnimatorStore.setState({
                          activeEffects: activeEffects.filter((_, i) => i !== index)
                        });
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="p-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-500">
          💡 Tip: Combine effects for dramatic impact! Try Shake + Flash + Impact together.
        </p>
      </div>
    </div>
  );
}
