
import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Terminal = () => {
  const [output, setOutput] = useState<Array<{ type: 'input' | 'output' | 'error'; content: string }>>([
    { type: 'output', content: 'WebIDE Terminal v1.0.0' },
    { type: 'output', content: 'Type "help" for available commands.' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setOutput(prev => [...prev, { type: 'input', content: `$ ${command}` }]);
    setIsRunning(true);

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500));

    let result = '';
    let resultType: 'output' | 'error' = 'output';

    switch (command.toLowerCase().trim()) {
      case 'help':
        result = `Available commands:
  help     - Show this help message
  ls       - List files in current directory
  pwd      - Show current directory
  clear    - Clear terminal
  echo <text> - Echo text back
  node -v  - Show Node.js version
  npm -v   - Show npm version
  git status - Show git status`;
        break;
      case 'ls':
        result = 'src/  package.json  README.md  node_modules/';
        break;
      case 'pwd':
        result = '/workspace/my-project';
        break;
      case 'clear':
        setOutput([]);
        setIsRunning(false);
        return;
      case 'node -v':
        result = 'v18.17.0';
        break;
      case 'npm -v':
        result = '9.6.7';
        break;
      case 'git status':
        result = `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes)

        modified:   src/index.js

no changes added to commit (use "git add" and/or "git commit -a")`;
        break;
      default:
        if (command.startsWith('echo ')) {
          result = command.substring(5);
        } else {
          result = `Command not found: ${command}`;
          resultType = 'error';
        }
        break;
    }

    setOutput(prev => [...prev, { type: resultType, content: result }]);
    setIsRunning(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  const stopExecution = () => {
    setIsRunning(false);
  };

  return (
    <div className="ide-terminal h-full flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={stopExecution}
              className="h-6 w-6 p-0"
            >
              <Square className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={outputRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-sm"
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={`mb-1 ${
              line.type === 'input' 
                ? 'text-primary' 
                : line.type === 'error' 
                  ? 'text-destructive' 
                  : 'text-foreground'
            }`}
          >
            <pre className="whitespace-pre-wrap font-mono">{line.content}</pre>
          </div>
        ))}
        {isRunning && (
          <div className="text-ai-thinking animate-pulse">
            Running command...
          </div>
        )}
      </div>

      {/* Terminal Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-primary font-mono text-sm">$</span>
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Enter command..."
            className="font-mono text-sm border-none bg-transparent p-0 focus-visible:ring-0"
            autoFocus
            disabled={isRunning}
          />
        </form>
      </div>
    </div>
  );
};
