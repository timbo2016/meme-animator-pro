'use client';

import React, { useState } from 'react';
import { useAnimatorStore } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Download,
  Video,
  ImageIcon,
  Film,
  Settings,
  ChevronUp,
  ChevronDown,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const RESOLUTION_PRESETS = [
  { id: 'shorts', name: 'Shorts (9:16)', width: 1080, height: 1920, icon: '📱' },
  { id: 'square', name: 'Square (1:1)', width: 1080, height: 1080, icon: '⬜' },
  { id: 'youtube', name: 'YouTube (16:9)', width: 1920, height: 1080, icon: '🖥️' },
];

const FORMAT_OPTIONS = [
  { id: 'mp4', name: 'MP4 Video', icon: <Video className="w-4 h-4" />, description: 'Best for sharing' },
  { id: 'gif', name: 'GIF Animation', icon: <ImageIcon className="w-4 h-4" />, description: 'For memes & chats' },
  { id: 'png', name: 'PNG Sequence', icon: <Film className="w-4 h-4" />, description: 'For editing' },
];

const QUALITY_OPTIONS = [
  { id: 'draft', name: 'Draft', bitrate: '2 Mbps', size: '~5 MB' },
  { id: 'preview', name: 'Preview', bitrate: '5 Mbps', size: '~12 MB' },
  { id: 'final', name: 'Final', bitrate: '10 Mbps', size: '~25 MB' },
];

export function ExportPanel() {
  const {
    exportConfig,
    isExporting,
    exportProgress,
    totalFrames,
    setExportConfig,
    startExport,
  } = useAnimatorStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    resolution: true,
    format: true,
    quality: true,
    range: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExport = async () => {
    await startExport();
  };

  const getSelectedResolution = () => RESOLUTION_PRESETS.find(r => r.id === exportConfig.resolution) || RESOLUTION_PRESETS[0];
  const getSelectedFormat = () => FORMAT_OPTIONS.find(f => f.id === exportConfig.format) || FORMAT_OPTIONS[0];
  const getSelectedQuality = () => QUALITY_OPTIONS.find(q => q.id === exportConfig.quality) || QUALITY_OPTIONS[2];

  return (
    <div className="h-full flex flex-col">
      {/* Resolution */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('resolution')}
        >
          <span className="text-sm font-medium text-gray-200">Resolution</span>
          {expandedSections.resolution ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.resolution && (
          <div className="p-3 pt-0">
            <div className="grid grid-cols-1 gap-2">
              {RESOLUTION_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded border text-left",
                    exportConfig.resolution === preset.id
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-600"
                  )}
                  onClick={() => setExportConfig({ resolution: preset.id as typeof exportConfig.resolution })}
                >
                  <span className="text-lg">{preset.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-gray-200">{preset.name}</p>
                    <p className="text-[10px] text-gray-500">{preset.width}×{preset.height}</p>
                  </div>
                  {exportConfig.resolution === preset.id && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Format */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('format')}
        >
          <span className="text-sm font-medium text-gray-200">Format</span>
          {expandedSections.format ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.format && (
          <div className="p-3 pt-0">
            <div className="space-y-2">
              {FORMAT_OPTIONS.map((format) => (
                <button
                  key={format.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded border w-full text-left",
                    exportConfig.format === format.id
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-600"
                  )}
                  onClick={() => setExportConfig({ format: format.id as typeof exportConfig.format })}
                >
                  <div className={cn(
                    "p-2 rounded",
                    exportConfig.format === format.id ? "bg-purple-600" : "bg-gray-700"
                  )}>
                    {format.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-200">{format.name}</p>
                    <p className="text-[10px] text-gray-500">{format.description}</p>
                  </div>
                  {exportConfig.format === format.id && (
                    <Check className="w-4 h-4 text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quality */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('quality')}
        >
          <span className="text-sm font-medium text-gray-200">Quality</span>
          {expandedSections.quality ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.quality && (
          <div className="p-3 pt-0">
            <div className="space-y-2">
              {QUALITY_OPTIONS.map((quality) => (
                <button
                  key={quality.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded border w-full",
                    exportConfig.quality === quality.id
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-700 hover:border-gray-600"
                  )}
                  onClick={() => setExportConfig({ quality: quality.id as typeof exportConfig.quality })}
                >
                  <div>
                    <p className="text-xs text-gray-200">{quality.name}</p>
                    <p className="text-[10px] text-gray-500">{quality.bitrate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400">{quality.size}</p>
                    {exportConfig.quality === quality.id && (
                      <Check className="w-4 h-4 text-purple-400 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Frame Range */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('range')}
        >
          <span className="text-sm font-medium text-gray-200">Frame Range</span>
          {expandedSections.range ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.range && (
          <div className="p-3 pt-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">Start</label>
                <input
                  type="number"
                  value={exportConfig.frameRange.start}
                  onChange={(e) => setExportConfig({
                    frameRange: { ...exportConfig.frameRange, start: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                  min={0}
                  max={totalFrames}
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">End</label>
                <input
                  type="number"
                  value={exportConfig.frameRange.end}
                  onChange={(e) => setExportConfig({
                    frameRange: { ...exportConfig.frameRange, end: parseInt(e.target.value) || totalFrames }
                  })}
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                  min={0}
                  max={totalFrames}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              Total: {exportConfig.frameRange.end - exportConfig.frameRange.start} frames
              ({((exportConfig.frameRange.end - exportConfig.frameRange.start) / 30).toFixed(1)}s at 30fps)
            </p>
          </div>
        )}
      </div>

      {/* Export Preview */}
      <div className="flex-1 p-3">
        <div className="bg-gray-800 rounded-lg p-3">
          <h4 className="text-xs font-medium text-gray-300 mb-2">Export Summary</h4>
          <div className="space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span className="text-gray-200">{getSelectedResolution().name}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="text-gray-200">{getSelectedFormat().name}</span>
            </div>
            <div className="flex justify-between">
              <span>Quality:</span>
              <span className="text-gray-200">{getSelectedQuality().name}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Size:</span>
              <span className="text-gray-200">{getSelectedQuality().size}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-300">Exporting...</span>
            <span className="text-xs text-gray-500">{exportProgress}%</span>
          </div>
          <Progress value={exportProgress} className="h-2" />
        </div>
      )}

      {/* Export Button */}
      <div className="p-3 border-t border-gray-800">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {getSelectedFormat().name}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
