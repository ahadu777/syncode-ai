import React, { useState, useEffect } from 'react';
import { File, Folder, FolderOpen, Plus, RefreshCw, Upload, Download, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileItem[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  openFiles: Array<{ name: string; content: string; language: string; path?: string }>;
  setOpenFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; content: string; language: string; path?: string }>>>;
  activeFileIndex: number;
  setActiveFileIndex: React.Dispatch<React.SetStateAction<number>>;
  refreshTrigger?: number;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  openFiles,
  setOpenFiles,
  activeFileIndex,
  setActiveFileIndex,
  refreshTrigger
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [creatingType, setCreatingType] = useState<'file' | 'directory'>('file');
  const [currentPath, setCurrentPath] = useState('/workspace');
  const [isLoading, setIsLoading] = useState(false);

  // File language detection
  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'xml': 'xml',
      'md': 'markdown',
      'txt': 'plaintext',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql',
      'php': 'php',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  // Load files from backend
  const loadFiles = async (path: string = '/workspace') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        const fileItems: FileItem[] = data.files.map((file: any) => ({
          name: file.name,
          type: file.type,
          path: file.path,
          language: file.type === 'file' ? getLanguageFromExtension(file.name) : undefined
        }));
        setFiles(fileItems);
        setCurrentPath(data.currentPath || path);
      } else {
        console.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load files on mount and when refresh is triggered
  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const openFile = async (file: FileItem) => {
    if (file.type === 'file') {
      try {
        // Check if file is already open
        const existingIndex = openFiles.findIndex(f => f.path === file.path);
        if (existingIndex >= 0) {
          setActiveFileIndex(existingIndex);
          return;
        }

        // Load file content from backend
        const response = await fetch(`/api/files/content?path=${encodeURIComponent(file.path)}`);
        if (response.ok) {
          const data = await response.json();
          const newFile = {
            name: file.name,
            content: data.content,
            language: file.language || 'plaintext',
            path: file.path
          };
          setOpenFiles([...openFiles, newFile]);
          setActiveFileIndex(openFiles.length);
        } else {
          console.error('Failed to load file content');
        }
      } catch (error) {
        console.error('Error opening file:', error);
      }
    } else if (file.type === 'directory') {
      toggleFolder(file.path);
    }
  };

  const createNewItem = async () => {
    if (!newItemName.trim()) return;

    try {
      const response = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${currentPath}/${newItemName}`,
          type: creatingType,
          content: creatingType === 'file' ? '' : undefined
        })
      });

      if (response.ok) {
        await loadFiles(currentPath);
        setIsCreating(false);
        setNewItemName('');
      } else {
        console.error('Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const deleteItem = async (item: FileItem) => {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
      try {
        const response = await fetch('/api/files', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: item.path })
        });

        if (response.ok) {
          await loadFiles(currentPath);
          // Remove from open files if it was open
          const openFileIndex = openFiles.findIndex(f => f.path === item.path);
          if (openFileIndex >= 0) {
            const newOpenFiles = openFiles.filter((_, i) => i !== openFileIndex);
            setOpenFiles(newOpenFiles);
            if (activeFileIndex >= openFileIndex) {
              setActiveFileIndex(Math.max(0, activeFileIndex - 1));
            }
          }
        } else {
          console.error('Failed to delete item');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const renderFileTree = (items: FileItem[], depth: number = 0) => {
    return items.map((item, index) => (
      <div key={`${item.path}-${index}`} className="select-none">
        <div
          className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 cursor-pointer group"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => openFile(item)}
        >
          {item.type === 'directory' ? (
            expandedFolders.has(item.path) ? (
              <FolderOpen className="w-4 h-4 text-primary" />
            ) : (
              <Folder className="w-4 h-4 text-primary" />
            )
          ) : (
            <File className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm flex-1 truncate">{item.name}</span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => deleteItem(item)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {item.type === 'directory' && expandedFolders.has(item.path) && item.children && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="ide-file-explorer h-full flex flex-col border-r border-border">
      {/* File Explorer Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4" />
          <span className="text-sm font-medium">Explorer</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadFiles(currentPath)}
            className="h-6 w-6 p-0"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={creatingType === 'file' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCreatingType('file')}
                    >
                      File
                    </Button>
                    <Button
                      variant={creatingType === 'directory' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCreatingType('directory')}
                    >
                      Folder
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="item-name">Name</Label>
                  <Input
                    id="item-name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={`Enter ${creatingType} name...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createNewItem();
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createNewItem} className="flex-1">
                    Create
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsCreating(false);
                    setNewItemName('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Path */}
      <div className="px-3 py-2 border-b border-border bg-muted/20">
        <span className="text-xs text-muted-foreground">{currentPath}</span>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
            Loading files...
          </div>
        ) : files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No files found
          </div>
        )}
      </div>
    </div>
  );
};