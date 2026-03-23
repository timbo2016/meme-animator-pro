'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles,
  Wand2,
  MessageSquare,
  Mic,
  Loader2,
  ChevronRight,
  Lightbulb,
  Zap,
  Volume2,
  Play,
  AlertCircle,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  text: string;
  type: 'animation' | 'effect' | 'timing' | 'audio';
}

const SMART_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Add a shake effect when the punchline hits', type: 'effect' },
  { id: '2', text: 'Character should look surprised before the reveal', type: 'animation' },
  { id: '3', text: 'Perfect spot for a "bruh" sound effect', type: 'audio' },
  { id: '4', text: 'Extend this pause by 0.5s for better comedic timing', type: 'timing' },
  { id: '5', text: 'Add speed lines during the action sequence', type: 'effect' },
  { id: '6', text: 'Character expression should change to embarrassed', type: 'animation' },
];

const VOICE_OPTIONS = [
  { id: 'male-deep', name: 'Deep Male', gender: 'male' },
  { id: 'male-casual', name: 'Casual Male', gender: 'male' },
  { id: 'female-soft', name: 'Soft Female', gender: 'female' },
  { id: 'female-energetic', name: 'Energetic Female', gender: 'female' },
  { id: 'child', name: 'Child Voice', gender: 'child' },
];

export function AIFeatures() {
  const [storyText, setStoryText] = useState('');
  const [animationPrompt, setAnimationPrompt] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('male-casual');
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'story' | 'animation' | 'tts'>('story');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStoryParse = async () => {
    if (!storyText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/story-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: storyText }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Dispatch event for main app to handle
        window.dispatchEvent(new CustomEvent('storyParsed', { 
          detail: data.data 
        }));
        setSuccess('Story parsed! Check the timeline for generated content.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to parse story');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnimation = async () => {
    if (!animationPrompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/story-parser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story: animationPrompt }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.suggestedAnimations) {
        // Dispatch event for main app to handle
        window.dispatchEvent(new CustomEvent('animationGenerated', { 
          detail: data.data.suggestedAnimations 
        }));
        setSuccess('Animation generated! Check the timeline.');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to generate animation');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTTS = async () => {
    if (!ttsText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: ttsText,
          voice: selectedVoice,
          speed: ttsSpeed,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.audio) {
        // Create audio element and play
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audio.play();
        
        // Dispatch event for timeline
        window.dispatchEvent(new CustomEvent('ttsGenerated', { 
          detail: { 
            text: ttsText,
            voice: selectedVoice,
            audio: data.audio,
          } 
        }));
        setSuccess('TTS generated and playing!');
        setTimeout(() => setSuccess(null), 3000);
      } else if (data.useBrowserTTS || data.fallback) {
        // Use browser TTS as fallback
        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.rate = ttsSpeed;
        speechSynthesis.speak(utterance);
        setSuccess('Playing via browser TTS');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'TTS generation failed');
      }
    } catch (e: any) {
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(ttsText);
      utterance.rate = ttsSpeed;
      speechSynthesis.speak(utterance);
      setSuccess('Using browser TTS');
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Apply suggestion
    window.dispatchEvent(new CustomEvent('applySuggestion', { 
      detail: suggestion 
    }));
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'animation': return '🎭';
      case 'effect': return '✨';
      case 'audio': return '🔊';
      case 'timing': return '⏱️';
      default: return '💡';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'animation': return 'border-purple-500/50 text-purple-300';
      case 'effect': return 'border-pink-500/50 text-pink-300';
      case 'audio': return 'border-blue-500/50 text-blue-300';
      case 'timing': return 'border-yellow-500/50 text-yellow-300';
      default: return 'border-gray-500/50 text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI Features
        </h3>
        <p className="text-xs text-gray-500 mt-1">Powered by advanced AI</p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mx-3 mt-2 p-2 bg-red-900/50 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      {success && (
        <div className="mx-3 mt-2 p-2 bg-green-900/50 border border-green-500/50 rounded-lg flex items-center gap-2 text-xs text-green-200">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* AI Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'story', label: 'Story', icon: <MessageSquare className="w-3 h-3" /> },
          { id: 'animation', label: 'Animate', icon: <Wand2 className="w-3 h-3" /> },
          { id: 'tts', label: 'TTS', icon: <Mic className="w-3 h-3" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 text-xs",
              activeTab === tab.id
                ? "text-purple-400 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-300"
            )}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'story' && (
          <div className="p-3 h-full flex flex-col">
            <label className="text-xs text-gray-400 mb-2">
              Describe your meme story
            </label>
            <Textarea
              placeholder="e.g., 'When your code finally works but you don't know why... Character looks confused at laptop, then excited, then worried'"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white resize-none min-h-[100px]"
            />
            <Button
              className="mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleStoryParse}
              disabled={isGenerating || !storyText.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing Story...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Story Parser
                </>
              )}
            </Button>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="p-3 h-full flex flex-col">
            <label className="text-xs text-gray-400 mb-2">
              Describe the animation
            </label>
            <Textarea
              placeholder="e.g., 'Character does a dramatic facepalm and slowly shakes their head'"
              value={animationPrompt}
              onChange={(e) => setAnimationPrompt(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white resize-none min-h-[100px]"
            />
            <Button
              className="mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={handleGenerateAnimation}
              disabled={isGenerating || !animationPrompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Animation
                </>
              )}
            </Button>
          </div>
        )}

        {activeTab === 'tts' && (
          <div className="p-3 h-full flex flex-col">
            <label className="text-xs text-gray-400 mb-2">
              Text to Speech
            </label>
            <Textarea
              placeholder="Enter text for voice synthesis..."
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-700 text-white resize-none min-h-[80px]"
            />
            
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Voice</label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {VOICE_OPTIONS.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id} className="text-xs">
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Speed</label>
                <Select value={ttsSpeed.toString()} onValueChange={(v) => setTtsSpeed(parseFloat(v))}>
                  <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="0.75" className="text-xs">0.75x</SelectItem>
                    <SelectItem value="1" className="text-xs">1x</SelectItem>
                    <SelectItem value="1.25" className="text-xs">1.25x</SelectItem>
                    <SelectItem value="1.5" className="text-xs">1.5x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="mt-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              onClick={handleGenerateTTS}
              disabled={isGenerating || !ttsText.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Generate Voice
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      <div className="border-t border-gray-800">
        <div className="p-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Smart Suggestions
          </h4>
          <ScrollArea className="h-[120px]">
            <div className="space-y-1">
              {SMART_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className={cn(
                    "w-full flex items-center gap-2 p-2 rounded text-left text-xs border hover:bg-gray-800/50",
                    getSuggestionColor(suggestion.type)
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span>{getSuggestionIcon(suggestion.type)}</span>
                  <span className="flex-1">{suggestion.text}</span>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* AI Status */}
      <div className="p-2 border-t border-gray-800 flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] text-gray-500">AI Ready</span>
      </div>
    </div>
  );
}
