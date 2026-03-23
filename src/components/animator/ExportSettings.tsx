'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useAnimatorStore, videoExporter } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Video, 
  Settings,
  Loader2,
  CheckCircle,
  FileVideo
} from 'lucide-react';

export function ExportSettings() {
  const { 
    parsedStory, 
    exportConfig, 
    updateExportConfig, 
    isExporting, 
    exportProgress 
  } = useAnimatorStore();

  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'complete' | 'error'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resolutions = videoExporter.getAvailableResolutions();
  const supportedFormats = videoExporter.getSupportedFormats();

  const handleExport = useCallback(async () => {
    if (!parsedStory || !canvasRef.current) return;

    setExportStatus('exporting');

    try {
      // Create a temporary canvas for rendering
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportConfig.resolution.width;
      exportCanvas.height = exportConfig.resolution.height;
      const ctx = exportCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      // Start recording
      await videoExporter.startRecording(exportCanvas, (progress) => {
        setExportStatus(progress.status === 'complete' ? 'complete' : 'exporting');
      });

      // Render a preview frame for the export
      // In a full implementation, this would render all frames
      const gradient = ctx.createLinearGradient(0, 0, 0, exportCanvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#228B22');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

      // Stop recording and download
      const blob = await videoExporter.stopRecording();
      videoExporter.downloadBlob(blob, `animation_${Date.now()}.webm`);

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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="w-5 h-5" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Quick Export Buttons */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Export</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('mp4')}
              className="flex-col h-auto py-2"
            >
              <FileVideo className="w-5 h-5 mb-1" />
              <span className="text-xs">MP4</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('webm')}
              className="flex-col h-auto py-2"
            >
              <Video className="w-5 h-5 mb-1" />
              <span className="text-xs">WebM</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!parsedStory || exportStatus === 'exporting'}
              onClick={() => quickExport('gif')}
              className="flex-col h-auto py-2"
            >
              <Video className="w-5 h-5 mb-1" />
              <span className="text-xs">GIF</span>
            </Button>
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <Label className="text-sm text-muted-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </Label>

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

          {/* Frame Rate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm">Frame Rate</Label>
              <span className="text-sm text-muted-foreground">{exportConfig.fps} FPS</span>
            </div>
            <Slider
              value={[exportConfig.fps]}
              min={12}
              max={60}
              step={6}
              onValueChange={([fps]) => updateExportConfig({ fps })}
            />
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

          {/* Format */}
          <div className="space-y-2">
            <Label className="text-sm">Format</Label>
            <Select
              value={exportConfig.format}
              onValueChange={(format) => updateExportConfig({ format: format as 'mp4' | 'webm' | 'gif' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webm">WebM (VP9)</SelectItem>
                <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                <SelectItem value="gif">GIF</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-auto pt-4 border-t">
          <Button
            className="w-full"
            disabled={!parsedStory || exportStatus === 'exporting'}
            onClick={handleExport}
          >
            {exportStatus === 'exporting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : exportStatus === 'complete' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Video
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {exportStatus === 'exporting' && (
            <Progress value={exportProgress} className="mt-2 h-2" />
          )}

          {!parsedStory && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Parse a story to enable export
            </p>
          )}
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
