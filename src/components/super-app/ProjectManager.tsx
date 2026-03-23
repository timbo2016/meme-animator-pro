'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAnimatorStore } from '@/hooks/useAnimator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Clock,
  FileJson,
  HardDrive,
  Cloud,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavedProject {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProjectManager() {
  const {
    projectName,
    characters,
    tracks,
    textOverlays,
    background,
    exportConfig,
    setProjectName,
  } = useAnimatorStore();

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveDescription, setSaveDescription] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load projects from localStorage and database
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // Try to load from database
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setSavedProjects(data.projects || []);
      } else {
        // Fallback to localStorage
        const localProjects = localStorage.getItem('animator-projects');
        if (localProjects) {
          setSavedProjects(JSON.parse(localProjects));
        }
      }
    } catch (error) {
      // Fallback to localStorage
      const localProjects = localStorage.getItem('animator-projects');
      if (localProjects) {
        setSavedProjects(JSON.parse(localProjects));
      }
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const projectData = {
        name: projectName,
        description: saveDescription,
        characters,
        tracks,
        textOverlays,
        background,
        exportConfig,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage
      const existingProjects = JSON.parse(localStorage.getItem('animator-projects') || '[]');
      const newProject = {
        id: `project-${Date.now()}`,
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Check if project with same name exists
      const existingIndex = existingProjects.findIndex((p: SavedProject) => p.name === projectName);
      if (existingIndex >= 0) {
        existingProjects[existingIndex] = { ...existingProjects[existingIndex], ...projectData, updatedAt: new Date().toISOString() };
      } else {
        existingProjects.unshift(newProject);
      }
      
      localStorage.setItem('animator-projects', JSON.stringify(existingProjects));

      // Try to save to database
      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existingIndex >= 0 ? existingProjects[existingIndex].id : undefined,
            name: projectName,
            description: saveDescription,
            data: projectData,
          }),
        });
      } catch (e) {
        console.log('Database save failed, using localStorage only');
      }

      await loadProjects();
      setShowSaveDialog(false);
      showNotification('success', 'Project saved successfully!');
    } catch (error: any) {
      showNotification('error', `Failed to save: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoad = async (project: SavedProject) => {
    setIsLoading(true);
    try {
      // Try to load from database first
      let projectData = null;
      
      try {
        const response = await fetch(`/api/projects/${project.id}`);
        if (response.ok) {
          const data = await response.json();
          projectData = typeof data.project.data === 'string' 
            ? JSON.parse(data.project.data) 
            : data.project.data;
        }
      } catch (e) {
        // Fallback to localStorage
        const localProjects = JSON.parse(localStorage.getItem('animator-projects') || '[]');
        projectData = localProjects.find((p: SavedProject) => p.id === project.id);
      }

      if (projectData) {
        // Dispatch event for main app to handle
        window.dispatchEvent(new CustomEvent('loadProject', { 
          detail: projectData 
        }));
        
        setShowLoadDialog(false);
        showNotification('success', 'Project loaded successfully!');
      }
    } catch (error: any) {
      showNotification('error', `Failed to load: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      // Delete from localStorage
      const localProjects = JSON.parse(localStorage.getItem('animator-projects') || '[]');
      const filtered = localProjects.filter((p: SavedProject) => p.id !== projectId);
      localStorage.setItem('animator-projects', JSON.stringify(filtered));

      // Try to delete from database
      try {
        await fetch('/api/projects', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: projectId }),
        });
      } catch (e) {
        console.log('Database delete failed');
      }

      await loadProjects();
      showNotification('success', 'Project deleted');
    } catch (error: any) {
      showNotification('error', `Failed to delete: ${error.message}`);
    }
  };

  const handleExportJSON = () => {
    const projectData = {
      name: projectName,
      characters,
      tracks,
      textOverlays,
      background,
      exportConfig,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Project exported as JSON');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const projectData = JSON.parse(event.target?.result as string);
        
        // Dispatch event for main app to handle
        window.dispatchEvent(new CustomEvent('loadProject', { 
          detail: projectData 
        }));
        
        showNotification('success', 'Project imported successfully!');
      } catch (error) {
        showNotification('error', 'Invalid project file');
      }
    };
    reader.readAsText(file);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Notification */}
      {notification && (
        <div className={cn(
          "absolute top-2 right-2 z-50 px-3 py-2 rounded-lg flex items-center gap-2 text-sm",
          notification.type === 'success' 
            ? "bg-green-900/90 text-green-200" 
            : "bg-red-900/90 text-red-200"
        )}>
          {notification.type === 'success' ? (
            <Check className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-purple-400" />
          Project Manager
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Save, load, and manage projects</p>
      </div>

      {/* Actions */}
      <div className="p-3 border-b border-gray-800 grid grid-cols-2 gap-2">
        <Button
          className="bg-purple-600 hover:bg-purple-700 h-9"
          onClick={() => setShowSaveDialog(true)}
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          variant="outline"
          className="border-gray-700 text-gray-300 h-9"
          onClick={() => setShowLoadDialog(true)}
        >
          <FolderOpen className="w-3 h-3 mr-1" />
          Load
        </Button>
        <Button
          variant="outline"
          className="border-gray-700 text-gray-300 h-9"
          onClick={handleExportJSON}
        >
          <Download className="w-3 h-3 mr-1" />
          Export
        </Button>
        <div className="relative">
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button
            variant="outline"
            className="border-gray-700 text-gray-300 h-9 w-full"
          >
            <Upload className="w-3 h-3 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Recent Projects
          </h4>
          <ScrollArea className="h-[calc(100vh-350px)]">
            {savedProjects.length === 0 ? (
              <div className="text-center py-8">
                <FileJson className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-gray-500">No saved projects yet</p>
                <p className="text-[10px] text-gray-600 mt-1">Save your first project to see it here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedProjects.slice(0, 10).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-3 p-2 rounded-lg border border-gray-700 hover:border-purple-500 bg-gray-800/30 cursor-pointer"
                    onClick={() => handleLoad(project)}
                  >
                    <div className="w-10 h-10 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt="" className="w-full h-full object-cover rounded" />
                      ) : (
                        <FileJson className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{project.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {formatDate(project.updatedAt || project.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Storage Info */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {savedProjects.length} projects
          </span>
          <Badge variant="outline" className="text-[10px] border-gray-600">
            <Cloud className="w-2 h-2 mr-1" />
            Local Storage
          </Badge>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Save your animation project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Meme"
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Description (optional)</label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="What's this project about?"
                className="bg-gray-800 border-gray-700 min-h-[60px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={handleSave}
              disabled={isLoading || !projectName.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a project to load
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 p-1">
              {savedProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:border-purple-500 bg-gray-800/30 cursor-pointer"
                  onClick={() => handleLoad(project)}
                >
                  <div className="w-12 h-12 bg-gray-700 rounded flex-shrink-0 flex items-center justify-center">
                    <FileJson className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200">{project.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(project.updatedAt || project.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
