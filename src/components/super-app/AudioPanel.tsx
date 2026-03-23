'use client';

import React, { useState } from 'react';
import { useAnimatorStore, SOUND_EFFECTS } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2,
  VolumeX,
  Music,
  Mic,
  Play,
  Pause,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AudioWaveform,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Background music tracks
const MUSIC_TRACKS = [
  { id: 'upbeat', name: 'Upbeat Pop', duration: '2:30', genre: 'Pop' },
  { id: 'chill', name: 'Chill Vibes', duration: '3:15', genre: 'Lo-Fi' },
  { id: 'epic', name: 'Epic Orchestra', duration: '2:45', genre: 'Cinematic' },
  { id: 'funny', name: 'Funny Bone', duration: '1:45', genre: 'Comedy' },
  { id: 'suspense', name: 'Suspense', duration: '2:00', genre: 'Drama' },
];

// Voice options for TTS
const VOICE_OPTIONS = [
  { id: 'male-1', name: 'Deep Male', gender: 'male' },
  { id: 'male-2', name: 'Casual Male', gender: 'male' },
  { id: 'female-1', name: 'Soft Female', gender: 'female' },
  { id: 'female-2', name: 'Energetic Female', gender: 'female' },
  { id: 'child', name: 'Child Voice', gender: 'child' },
];

export function AudioPanel() {
  const {
    musicVolume,
    sfxVolume,
    voiceVolume,
    selectedSoundEffect,
    setMusicVolume,
    setSfxVolume,
    setVoiceVolume,
    playSoundEffect,
  } = useAnimatorStore();

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sfx: true,
    music: true,
    voice: true,
    mixer: true,
  });

  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePlaySound = (id: string) => {
    setPlayingSound(id);
    playSoundEffect(id);
    // Simulate sound duration
    setTimeout(() => setPlayingSound(null), 500);
  };

  const soundCategories = [...new Set(SOUND_EFFECTS.map(s => s.category))];

  return (
    <div className="h-full flex flex-col">
      {/* Sound Effects */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('sfx')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Sound Effects
          </span>
          {expandedSections.sfx ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.sfx && (
          <div className="p-3 pt-0">
            <ScrollArea className="h-[200px]">
              {soundCategories.map((category) => (
                <div key={category} className="mb-3">
                  <h5 className="text-xs text-gray-500 mb-1 capitalize">{category}</h5>
                  <div className="grid grid-cols-2 gap-1">
                    {SOUND_EFFECTS.filter(s => s.category === category).map((sound) => (
                      <Button
                        key={sound.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-auto py-2 flex items-center gap-1 text-xs border-gray-700",
                          playingSound === sound.id 
                            ? "bg-purple-600 border-purple-500" 
                            : "hover:border-purple-500"
                        )}
                        onClick={() => handlePlaySound(sound.id)}
                      >
                        <span>{sound.emoji}</span>
                        <span className="truncate">{sound.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Background Music */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('music')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Music className="w-4 h-4" />
            Background Music
          </span>
          {expandedSections.music ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.music && (
          <div className="p-3 pt-0">
            <ScrollArea className="h-[150px]">
              <div className="space-y-1">
                {MUSIC_TRACKS.map((track) => (
                  <div
                    key={track.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded cursor-pointer",
                      selectedMusic === track.id
                        ? "bg-purple-600/30 border border-purple-500"
                        : "bg-gray-800/50 border border-transparent hover:border-gray-700"
                    )}
                    onClick={() => setSelectedMusic(track.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedMusic === track.id) {
                          setIsPlayingMusic(!isPlayingMusic);
                        } else {
                          setSelectedMusic(track.id);
                          setIsPlayingMusic(true);
                        }
                      }}
                    >
                      {selectedMusic === track.id && isPlayingMusic ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className="text-xs text-gray-200">{track.name}</p>
                      <p className="text-[10px] text-gray-500">{track.genre} • {track.duration}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-purple-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMusic(track.id);
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Voice/TTS */}
      <div className="border-b border-gray-800">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('voice')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice / TTS
          </span>
          {expandedSections.voice ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.voice && (
          <div className="p-3 pt-0 space-y-3">
            <textarea
              placeholder="Enter text for text-to-speech..."
              className="w-full h-16 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white resize-none"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Voice</label>
                <select className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white">
                  {VOICE_OPTIONS.map((voice) => (
                    <option key={voice.id} value={voice.id}>{voice.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Speed</label>
                <select className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white">
                  <option value="0.75">0.75x</option>
                  <option value="1" selected>1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                </select>
              </div>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm">
              <Mic className="w-3 h-3 mr-1" />
              Generate TTS
            </Button>
          </div>
        )}
      </div>

      {/* Audio Mixer */}
      <div className="flex-1 overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50"
          onClick={() => toggleSection('mixer')}
        >
          <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <AudioWaveform className="w-4 h-4" />
            Audio Mixer
          </span>
          {expandedSections.mixer ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {expandedSections.mixer && (
          <div className="p-3 pt-0 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Music</label>
                <span className="text-xs text-gray-500">{musicVolume}%</span>
              </div>
              <Slider
                value={[musicVolume]}
                min={0}
                max={100}
                onValueChange={(value) => setMusicVolume(value[0])}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Sound Effects</label>
                <span className="text-xs text-gray-500">{sfxVolume}%</span>
              </div>
              <Slider
                value={[sfxVolume]}
                min={0}
                max={100}
                onValueChange={(value) => setSfxVolume(value[0])}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-400">Voice</label>
                <span className="text-xs text-gray-500">{voiceVolume}%</span>
              </div>
              <Slider
                value={[voiceVolume]}
                min={0}
                max={100}
                onValueChange={(value) => setVoiceVolume(value[0])}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Audio Waveform Preview */}
      <div className="p-3 border-t border-gray-800">
        <div className="h-10 bg-gray-800 rounded flex items-center justify-center overflow-hidden">
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
                style={{
                  height: `${Math.random() * 100}%`,
                  animation: 'waveform 0.5s ease-in-out infinite',
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
