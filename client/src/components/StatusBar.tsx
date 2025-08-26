
import React from 'react';
import { GitBranch, Wifi, Zap, AlertCircle } from 'lucide-react';

interface StatusBarProps {
  activeFile?: string;
  linesCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeFile, linesCount }) => {
  return (
    <div className="ide-status-bar">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
        {activeFile && (
          <div className="flex items-center gap-2">
            <span>{activeFile}</span>
            <span className="text-muted-foreground">•</span>
            <span>{linesCount} lines</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-accent">
          <Zap className="w-3 h-3" />
          <span>AI Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <span>TypeScript React</span>
        </div>
      </div>
    </div>
  );
};
