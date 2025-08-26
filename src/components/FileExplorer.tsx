
import React, { useState } from 'react';
import { File, Folder, FolderOpen, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
  content?: string;
  language?: string;
}

interface FileExplorerProps {
  openFiles: Array<{ name: string; content: string; language: string }>;
  setOpenFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; content: string; language: string }>>>;
  activeFileIndex: number;
  setActiveFileIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  openFiles,
  setOpenFiles,
  activeFileIndex,
  setActiveFileIndex
}) => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'index.js', type: 'file', content: 'console.log("Hello from src!");', language: 'javascript' },
        { name: 'styles.css', type: 'file', content: 'body { margin: 0; }', language: 'css' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'App.jsx', type: 'file', content: 'import React from "react";\n\nfunction App() {\n  return <div>Hello React!</div>;\n}\n\nexport default App;', language: 'javascript' }
          ]
        }
      ]
    },
    { name: 'package.json', type: 'file', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}', language: 'json' },
    { name: 'README.md', type: 'file', content: '# My Project\n\nWelcome to my awesome project!', language: 'markdown' }
  ]);
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [creatingType, setCreatingType] = useState<'file' | 'folder'>('file');

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const openFile = (file: FileItem, path: string) => {
    if (file.type === 'file' && file.content !== undefined) {
      const existingIndex = openFiles.findIndex(f => f.name === file.name);
      if (existingIndex >= 0) {
        setActiveFileIndex(existingIndex);
      } else {
        const newFile = {
          name: file.name,
          content: file.content,
          language: file.language || 'plaintext'
        };
        setOpenFiles([...openFiles, newFile]);
        setActiveFileIndex(openFiles.length);
      }
    }
  };

  const createNewItem = () => {
    if (newItemName.trim()) {
      const newItem: FileItem = {
        name: newItemName,
        type: creatingType,
        content: creatingType === 'file' ? '' : undefined,
        language: creatingType === 'file' ? getLanguageFromExtension(newItemName) : undefined
      };
      
      setFiles([...files, newItem]);
      setIsCreating(false);
      setNewItemName('');
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'md': 'markdown',
      'json': 'json'
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const renderFileTree = (items: FileItem[], path = '', level = 0) => {
    return items.map((item, index) => {
      const currentPath = path ? `${path}/${item.name}` : item.name;
      const isExpanded = expandedFolders.has(currentPath);
      
      return (
        <div key={currentPath}>
          <div
            className={`file-explorer-item ${item.type === 'folder' ? 'file-explorer-folder' : 'file-explorer-file'}`}
            style={{ paddingLeft: `${(level + 1) * 16}px` }}
            onClick={() => {
              if (item.type === 'folder') {
                toggleFolder(currentPath);
              } else {
                openFile(item, currentPath);
              }
            }}
          >
            {item.type === 'folder' ? (
              isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
            ) : (
              <File className="w-4 h-4" />
            )}
            <span>{item.name}</span>
          </div>
          
          {item.type === 'folder' && isExpanded && item.children && (
            <div className="fade-in">
              {renderFileTree(item.children, currentPath, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="ide-sidebar h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Explorer</h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                setCreatingType('file');
                setIsCreating(true);
              }}
            >
              <Plus className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {isCreating && (
          <div className="mb-3">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`New ${creatingType} name...`}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewItem();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewItemName('');
                }
              }}
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {renderFileTree(files)}
      </div>
    </div>
  );
};
