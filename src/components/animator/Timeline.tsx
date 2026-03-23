'use client';

import React from 'react';
import { useAnimatorStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export function Timeline() {
  const { 
    parsedStory, 
    scenes, 
    currentSceneIndex, 
    currentFrame, 
    totalFrames,
    setCurrentScene,
    setCurrentFrame,
  } = useAnimatorStore();

  const formatTime = (frames: number) => {
    const seconds = Math.floor(frames / 30);
    return `${seconds}s`;
  };

  const getActionColor = (type: string): string => {
    const colors: Record<string, string> = {
      walk: 'bg-blue-500',
      run: 'bg-red-500',
      sit: 'bg-yellow-500',
      stand: 'bg-green-500',
      jump: 'bg-purple-500',
      talk: 'bg-pink-500',
      wave: 'bg-cyan-500',
      point: 'bg-orange-500',
      idle: 'bg-gray-500',
      enter: 'bg-indigo-500',
      exit: 'bg-rose-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  if (!parsedStory) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[100px]">
          <p className="text-muted-foreground text-sm">Parse a story to view timeline</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Timeline
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Frame {currentFrame} / {totalFrames}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Scene Navigation */}
        {scenes.length > 1 && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b">
            <ChevronLeft 
              className="w-4 h-4 cursor-pointer hover:text-primary"
              onClick={() => setCurrentScene(Math.max(0, currentSceneIndex - 1))}
            />
            <span className="text-sm">
              Scene {currentSceneIndex + 1} of {scenes.length}
            </span>
            <ChevronRight 
              className="w-4 h-4 cursor-pointer hover:text-primary"
              onClick={() => setCurrentScene(Math.min(scenes.length - 1, currentSceneIndex + 1))}
            />
          </div>
        )}

        {/* Timeline Tracks */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="space-y-2 pb-4">
            {/* Time Ruler */}
            <div className="flex h-6 items-end border-b border-muted">
              {Array.from({ length: Math.ceil(totalFrames / 30) + 1 }, (_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[120px] text-xs text-muted-foreground border-l border-muted pl-1"
                >
                  {i}s
                </div>
              ))}
            </div>

            {/* Character Tracks */}
            {Array.from(parsedStory.scenes[0]?.characters || []).map((character) => {
              const characterActions = parsedStory.scenes.flatMap(scene =>
                scene.actions.filter(action => action.characterId === character.id)
              );

              return (
                <div key={character.id} className="flex items-center gap-2">
                  {/* Character Label */}
                  <div className="w-[80px] flex-shrink-0 text-sm font-medium truncate">
                    {character.name}
                  </div>

                  {/* Action Blocks */}
                  <div className="flex-1 relative h-8 bg-muted/30 rounded">
                    {characterActions.map((action, index) => {
                      const left = (action.startTime / totalFrames) * 100;
                      const width = (action.duration / totalFrames) * 100;

                      return (
                        <div
                          key={`${action.characterId}-${index}`}
                          className={`absolute top-1 h-6 rounded text-xs text-white flex items-center px-2 ${getActionColor(action.type)}`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 2)}%`,
                            minWidth: '30px',
                          }}
                        >
                          <span className="truncate">{action.type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Dialogue Track */}
            {parsedStory.scenes.some(s => s.dialogue.length > 0) && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <div className="w-[80px] flex-shrink-0 text-sm font-medium">
                  Dialogue
                </div>
                <div className="flex-1 relative h-8 bg-muted/30 rounded">
                  {parsedStory.scenes.flatMap((scene, sceneIndex) =>
                    scene.dialogue.map((dialogue, dialogueIndex) => {
                      const left = (dialogue.startTime / totalFrames) * 100;
                      const width = (dialogue.duration / totalFrames) * 100;

                      return (
                        <div
                          key={`dialogue-${sceneIndex}-${dialogueIndex}`}
                          className="absolute top-1 h-6 rounded text-xs bg-emerald-500 text-white flex items-center px-2"
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 2)}%`,
                            minWidth: '40px',
                          }}
                        >
                          <span className="truncate text-[10px]">
                            "{dialogue.text.substring(0, 15)}..."
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Playhead */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
              style={{ left: `${(currentFrame / totalFrames) * 100}%` }}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Actions Legend */}
        <div className="flex gap-2 flex-wrap mt-3 pt-3 border-t">
          {['walk', 'sit', 'talk', 'wave', 'jump'].map(action => (
            <div key={action} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${getActionColor(action)}`} />
              <span className="text-xs capitalize">{action}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
