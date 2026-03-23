'use client';

import React, { useCallback } from 'react';
import { useAnimatorStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  BookOpen,
  Wand2
} from 'lucide-react';

const SAMPLE_STORIES = [
  {
    title: 'Simple Walk',
    text: `John enters from the left. He walks to the center. John waves his hand and says "Hello there!". Then he sits on a chair.`,
  },
  {
    title: 'Meeting Scene',
    text: `Sarah is standing in the center. Mike enters from the right. Mike walks toward Sarah. They both wave. Sarah says "Welcome!" Mike sits on the chair.`,
  },
  {
    title: 'Action Scene',
    text: `Tom runs from left to right. He jumps in the air. Tom lands and walks to a chair. He sits down tiredly.`,
  },
];

export function StoryEditor() {
  const { storyText, setStoryText, parseStory, parsedStory, characters } = useAnimatorStore();

  const handleParse = useCallback(() => {
    parseStory();
  }, [parseStory]);

  const handleLoadSample = useCallback((text: string) => {
    setStoryText(text);
  }, [setStoryText]);

  const characterCount = characters.size;
  const sceneCount = parsedStory?.scenes.length || 0;
  const hasContent = storyText.trim().length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Story Editor
          </CardTitle>
          <Button 
            onClick={handleParse} 
            disabled={!hasContent}
            size="sm"
            className="gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Parse Story
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <Textarea
          placeholder="Write your story here...&#10;&#10;Example:&#10;John enters from the left. He walks to the center and waves. Then he sits on a chair."
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
          className="flex-1 min-h-[200px] resize-none font-mono text-sm"
        />
        
        {/* Stats */}
        {parsedStory && (
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <BookOpen className="w-3 h-3" />
              {sceneCount} {sceneCount === 1 ? 'Scene' : 'Scenes'}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              {characterCount} {characterCount === 1 ? 'Character' : 'Characters'}
            </Badge>
          </div>
        )}

        {/* Sample Stories */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">Sample Stories:</p>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2 pr-4">
              {SAMPLE_STORIES.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => handleLoadSample(sample.text)}
                >
                  <div>
                    <div className="font-medium">{sample.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                      {sample.text.substring(0, 60)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
