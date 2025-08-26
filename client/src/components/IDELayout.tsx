
import React, { useState } from 'react';
import { FileExplorer } from './FileExplorer';
import { EditorArea } from './EditorArea';
import { Terminal } from './Terminal';
import { AIAssistant } from './AIAssistant';
import { AIAgentMode } from './AIAgentMode';
import { StatusBar } from './StatusBar';
import { Sidebar, Menu, Code, Bot, Terminal as TerminalIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const IDELayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activePanel, setActivePanel] = useState<'terminal' | 'ai' | 'agent' | null>('terminal');
  const [openFiles, setOpenFiles] = useState<Array<{ name: string; content: string; language: string; path?: string }>>([
    { name: 'welcome.js', content: '// Welcome to your AI-powered IDE!\n// Now with free unlimited AI agents!\nconsole.log("Hello, AI World!");', language: 'javascript', path: '/workspace/welcome.js' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [fileExplorerRefresh, setFileExplorerRefresh] = useState(0);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  
  const togglePanel = (panel: 'terminal' | 'ai' | 'agent') => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleFileSystemChange = () => {
    setFileExplorerRefresh(prev => prev + 1);
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
          <div className="px-2 py-1 bg-ai-accent/20 text-ai-accent text-xs rounded-full">
            AI-Powered
          </div>
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
          <Button
            variant={activePanel === 'agent' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => togglePanel('agent')}
            className="p-2 relative"
          >
            <Zap className="w-4 h-4" />
            {activePanel === 'agent' && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-ai-accent rounded-full animate-pulse"></div>
            )}
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
            refreshTrigger={fileExplorerRefresh}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            <EditorArea 
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
              activeFileIndex={activeFileIndex}
              setActiveFileIndex={setActiveFileIndex}
            />

            {/* Bottom Panel */}
            {activePanel && activePanel !== 'ai' && (
              <div className="h-80 border-t border-border">
                {activePanel === 'terminal' && <Terminal onFileSystemChange={handleFileSystemChange} />}
                {activePanel === 'agent' && <AIAgentMode />}
              </div>
            )}
          </div>

          {/* Right Panel - AI Assistant */}
          {activePanel === 'ai' && (
            <div className="w-96 border-l border-border">
              <AIAssistant />
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
