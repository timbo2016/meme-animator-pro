'use client';

import React from 'react';
import { useAnimatorStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  User,
  Activity,
  MessageCircle,
  Clock
} from 'lucide-react';
import { ActionType } from '@/lib/types';

export function CharacterPanel() {
  const { parsedStory, characters, currentFrame } = useAnimatorStore();

  if (!parsedStory) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Characters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[150px]">
          <p className="text-muted-foreground text-sm">No characters yet</p>
        </CardContent>
      </Card>
    );
  }

  const getCharacterColor = (id: string): string => {
    const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    const index = Math.abs(id.charCodeAt(0)) % colors.length;
    return colors[index];
  };

  const getCurrentAction = (characterId: string): ActionType | null => {
    for (const scene of parsedStory.scenes) {
      for (const action of scene.actions) {
        if (
          action.characterId === characterId &&
          currentFrame >= action.startTime &&
          currentFrame <= action.startTime + action.duration
        ) {
          return action.type;
        }
      }
    }
    return null;
  };

  const getCharacterActions = (characterId: string) => {
    return parsedStory.scenes.flatMap(scene =>
      scene.actions.filter(action => action.characterId === characterId)
    );
  };

  const getCharacterDialogue = (characterId: string) => {
    return parsedStory.scenes.flatMap(scene =>
      scene.dialogue.filter(d => d.characterId === characterId)
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Characters
          <Badge variant="secondary" className="ml-auto">
            {characters.size}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3">
            {Array.from(parsedStory.scenes[0]?.characters || []).map((character) => {
              const state = characters.get(character.id);
              const currentAction = getCurrentAction(character.id);
              const actions = getCharacterActions(character.id);
              const dialogues = getCharacterDialogue(character.id);

              return (
                <div
                  key={character.id}
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={getCharacterColor(character.id)}>
                        {character.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{character.name}</span>
                        {currentAction && (
                          <Badge variant="outline" className="text-xs">
                            {currentAction}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {actions.length} actions
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {dialogues.length} lines
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action List */}
                  {actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Actions:</div>
                      <div className="flex flex-wrap gap-1">
                        {actions.slice(0, 5).map((action, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {action.type}
                          </Badge>
                        ))}
                        {actions.length > 5 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{actions.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Character State */}
                  {state && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Frame {currentFrame} | 
                          {state.facingRight ? ' Facing Right' : ' Facing Left'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
