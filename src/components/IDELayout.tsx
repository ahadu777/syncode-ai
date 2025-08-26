
import React, { useState } from 'react';
import { FileExplorer } from './FileExplorer';
import { EditorArea } from './EditorArea';
import { Terminal } from './Terminal';
import { AIAssistant } from './AIAssistant';
import { StatusBar } from './StatusBar';
import { Sidebar, Menu, Code, Bot, Terminal as TerminalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const IDELayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'terminal' | 'ai' | null>('terminal');
  const [openFiles, setOpenFiles] = useState([
    { name: 'welcome.js', content: '// Welcome to your new IDE!\nconsole.log("Hello, World!");', language: 'javascript' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  const togglePanel = (panel: 'terminal' | 'ai') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <div className="ide-layout">
      {/* Top Bar */}
      <div className="h-12 bg-ide-sidebar border-b border-border flex items-center px-4 gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar}
          className="p-2"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">WebIDE</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant={activePanel === 'terminal' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('terminal')}
            className="p-2"
          >
            <TerminalIcon className="w-4 h-4" />
          </Button>
          <Button
            variant={activePanel === 'ai' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('ai')}
            className="p-2"
          >
            <Bot className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 overflow-hidden`}>
          <FileExplorer 
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            activeFileIndex={activeFileIndex}
            setActiveFileIndex={setActiveFileIndex}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <EditorArea 
            openFiles={openFiles}
            setOpenFiles={setOpenFiles}
            activeFileIndex={activeFileIndex}
            setActiveFileIndex={setActiveFileIndex}
          />

          {/* Bottom Panel */}
          {activePanel && (
            <div className="h-80 border-t border-border">
              {activePanel === 'terminal' && <Terminal />}
              {activePanel === 'ai' && <AIAssistant />}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar 
        activeFile={openFiles[activeFileIndex]?.name}
        linesCount={openFiles[activeFileIndex]?.content.split('\n').length || 0}
      />
    </div>
  );
};
