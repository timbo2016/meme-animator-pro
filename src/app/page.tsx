'use client';

import React from 'react';
import { StoryEditor } from '@/components/animator/StoryEditor';
import { CanvasPreview } from '@/components/animator/CanvasPreview';
import { Timeline } from '@/components/animator/Timeline';
import { ExportSettings } from '@/components/animator/ExportSettings';
import { CharacterPanel } from '@/components/animator/CharacterPanel';
import { Separator } from '@/components/ui/separator';
import { 
  Clapperboard,
  Github,
  Info
} from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function Home() {
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
                <h1 className="text-xl font-bold tracking-tight">Stickman Story Animator</h1>
                <p className="text-xs text-muted-foreground">
                  Transform stories into animated videos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                <span>Write a story, parse it, and export as video</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full min-h-[600px]">
          {/* Left Panel - Story Editor */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <StoryEditor />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center Panel - Preview & Timeline */}
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              {/* Canvas Preview */}
              <ResizablePanel defaultSize={70} minSize={40}>
                <CanvasPreview />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Timeline */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <Timeline />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Characters & Export */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <ResizablePanelGroup direction="vertical">
              {/* Character Panel */}
              <ResizablePanel defaultSize={50}>
                <CharacterPanel />
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Export Settings */}
              <ResizablePanel defaultSize={50}>
                <ExportSettings />
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
              <span>Stickman Story Animator v1.0</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Phase 1 MVP</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by Canvas API & FFmpeg</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
