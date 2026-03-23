'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  Search,
  Star,
  Clock,
  Zap,
  Heart,
  Frown,
  Angry,
  Smile,
  Users,
  Plus,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  data: string | object;
  isUserCreated?: boolean;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  reaction: <Zap className="w-3 h-3" />,
  fail: <Frown className="w-3 h-3" />,
  happy: <Smile className="w-3 h-3" />,
  sad: <Heart className="w-3 h-3" />,
  angry: <Angry className="w-3 h-3" />,
  confused: <Star className="w-3 h-3" />,
  custom: <Users className="w-3 h-3" />,
};

const QUICK_MEMES = [
  { id: 'facepalm', name: 'Facepalm', emoji: '🤦', animation: 'facepalm', mood: 'embarrassed' },
  { id: 'shrug', name: 'Shrug', emoji: '🤷', animation: 'shrug', mood: 'confused' },
  { id: 'bruh', name: 'Bruh', emoji: '😐', animation: 'facepalm', mood: 'neutral' },
  { id: 'cry', name: 'Cry', emoji: '😭', animation: 'cry', mood: 'sad' },
  { id: 'laugh', name: 'LOL', emoji: '😂', animation: 'laugh', mood: 'happy' },
  { id: 'angry', name: 'Angry', emoji: '😠', animation: 'angry', mood: 'angry' },
  { id: 'surprised', name: 'Shook', emoji: '😱', animation: 'surprised', mood: 'surprised' },
  { id: 'savage', name: 'Savage', emoji: '😎', animation: 'savage', mood: 'proud' },
  { id: 'dance', name: 'Dance', emoji: '💃', animation: 'dance', mood: 'excited' },
  { id: 'love', name: 'In Love', emoji: '😍', animation: 'love', mood: 'love' },
  { id: 'thinking', name: 'Hmm', emoji: '🤔', animation: 'thinking', mood: 'thinking' },
  { id: 'micdrop', name: 'Mic Drop', emoji: '🎤', animation: 'mic_drop', mood: 'proud' },
];

export function TemplatesPanel() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [applyingTemplate, setApplyingTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleApplyTemplate = async (template: Template) => {
    setApplyingTemplate(template.id);
    try {
      const templateData = typeof template.data === 'string' ? JSON.parse(template.data) : template.data;
      
      // Dispatch custom event for the main app to handle
      window.dispatchEvent(new CustomEvent('applyTemplate', { 
        detail: templateData 
      }));
      
      // Simulate application time
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to apply template:', error);
    } finally {
      setApplyingTemplate(null);
    }
  };

  const handleQuickMeme = (meme: typeof QUICK_MEMES[0]) => {
    window.dispatchEvent(new CustomEvent('quickMeme', { 
      detail: meme 
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Template Store
        </h3>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-white h-8 text-sm"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-800">
        <ScrollArea className="w-full">
          <div className="flex p-2 gap-1">
            {categories.slice(0, 6).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 px-2 text-xs capitalize whitespace-nowrap",
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                )}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Quick Memes */}
      <div className="p-3 border-b border-gray-800">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Quick Memes</h4>
        <div className="grid grid-cols-4 gap-1">
          {QUICK_MEMES.map((meme) => (
            <Button
              key={meme.id}
              variant="outline"
              size="sm"
              className="h-auto py-2 flex flex-col items-center gap-1 border-gray-700 hover:border-purple-500 hover:bg-purple-900/20"
              onClick={() => handleQuickMeme(meme)}
            >
              <span className="text-lg">{meme.emoji}</span>
              <span className="text-[10px] text-gray-400">{meme.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Templates List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-2 rounded-lg border border-gray-700 hover:border-purple-500 bg-gray-800/30"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                    {template.thumbnail ? (
                      <img 
                        src={template.thumbnail} 
                        alt={template.name}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-2xl">
                        {CATEGORY_ICONS[template.category] ? '🎬' : '🎬'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm text-gray-200 truncate">{template.name}</h5>
                      {template.isUserCreated && (
                        <Badge variant="outline" className="text-[10px] border-gray-600">
                          <Users className="w-2 h-2 mr-1" />
                          Custom
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                      {template.description}
                    </p>
                    <Badge 
                      variant="outline" 
                      className="mt-1 text-[10px] border-gray-600 capitalize"
                    >
                      {template.category}
                    </Badge>
                  </div>

                  {/* Apply Button */}
                  <Button
                    size="sm"
                    className="h-7 px-2 text-xs bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleApplyTemplate(template)}
                    disabled={applyingTemplate === template.id}
                  >
                    {applyingTemplate === template.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 text-center">
        <span className="text-[10px] text-gray-500">
          {templates.length} templates available
        </span>
      </div>
    </div>
  );
}
