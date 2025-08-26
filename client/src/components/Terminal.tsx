import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TerminalOutput {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
  timestamp?: Date;
}

interface TerminalProps {
  onFileSystemChange?: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onFileSystemChange }) => {
  const [output, setOutput] = useState<TerminalOutput[]>([
    { type: 'output', content: 'WebIDE Terminal v1.0.0', timestamp: new Date() },
    { type: 'output', content: 'Type commands to interact with the file system.', timestamp: new Date() },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalTheme, setTerminalTheme] = useState('dark');
  const [currentPath, setCurrentPath] = useState('/workspace');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addOutput = (type: TerminalOutput['type'], content: string) => {
    setOutput(prev => [...prev, { type, content, timestamp: new Date() }]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const cmd = command.trim();
    addOutput('input', `$ ${cmd}`);
    setIsRunning(true);

    try {
      // Handle built-in commands first
      if (cmd === 'clear') {
        setOutput([
          { type: 'output', content: 'WebIDE Terminal v1.0.0', timestamp: new Date() },
          { type: 'output', content: 'Type commands to interact with the file system.', timestamp: new Date() },
        ]);
        setIsRunning(false);
        return;
      }

      if (cmd === 'pwd') {
        addOutput('output', currentPath);
        setIsRunning(false);
        return;
      }

      if (cmd.startsWith('cd ')) {
        const newPath = cmd.substring(3).trim();
        if (newPath) {
          try {
            const response = await fetch('/api/files', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok) {
              const data = await response.json();
              setCurrentPath(newPath);
              addOutput('success', `Changed directory to: ${newPath}`);
              if (onFileSystemChange) onFileSystemChange();
            } else {
              addOutput('error', `cd: no such file or directory: ${newPath}`);
            }
          } catch (error) {
            addOutput('error', `cd: ${newPath}: No such file or directory`);
          }
        } else {
          addOutput('error', 'cd: missing operand');
        }
        setIsRunning(false);
        return;
      }

      if (cmd === 'ls' || cmd.startsWith('ls ')) {
        try {
          const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
          const data = await response.json();
          
          if (response.ok) {
            const fileList = data.files.map((file: any) => {
              const indicator = file.type === 'directory' ? '/' : '';
              return `${file.name}${indicator}`;
            }).join('  ');
            
            addOutput('output', fileList || 'Empty directory');
          } else {
            addOutput('error', data.error || 'Failed to list directory');
          }
        } catch (error) {
          addOutput('error', 'Failed to list directory');
        }
        setIsRunning(false);
        return;
      }

      if (cmd.startsWith('mkdir ')) {
        const dirName = cmd.substring(6).trim();
        if (dirName) {
          try {
            const response = await fetch('/api/files/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `${currentPath}/${dirName}`,
                type: 'directory'
              })
            });
            
            if (response.ok) {
              addOutput('success', `Directory created: ${dirName}`);
              if (onFileSystemChange) onFileSystemChange();
            } else {
              const data = await response.json();
              addOutput('error', data.error || 'Failed to create directory');
            }
          } catch (error) {
            addOutput('error', 'Failed to create directory');
          }
        } else {
          addOutput('error', 'mkdir: missing operand');
        }
        setIsRunning(false);
        return;
      }

      if (cmd.startsWith('touch ')) {
        const fileName = cmd.substring(6).trim();
        if (fileName) {
          try {
            const response = await fetch('/api/files/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `${currentPath}/${fileName}`,
                type: 'file',
                content: ''
              })
            });
            
            if (response.ok) {
              addOutput('success', `File created: ${fileName}`);
              if (onFileSystemChange) onFileSystemChange();
            } else {
              const data = await response.json();
              addOutput('error', data.error || 'Failed to create file');
            }
          } catch (error) {
            addOutput('error', 'Failed to create file');
          }
        } else {
          addOutput('error', 'touch: missing file operand');
        }
        setIsRunning(false);
        return;
      }

      if (cmd.startsWith('cat ')) {
        const fileName = cmd.substring(4).trim();
        if (fileName) {
          try {
            const response = await fetch(`/api/files/content?path=${encodeURIComponent(`${currentPath}/${fileName}`)}`);
            
            if (response.ok) {
              const data = await response.json();
              addOutput('output', data.content);
            } else {
              const data = await response.json();
              addOutput('error', data.error || 'Failed to read file');
            }
          } catch (error) {
            addOutput('error', 'Failed to read file');
          }
        } else {
          addOutput('error', 'cat: missing file operand');
        }
        setIsRunning(false);
        return;
      }

      if (cmd.startsWith('rm ')) {
        const fileName = cmd.substring(3).trim();
        if (fileName) {
          try {
            const response = await fetch('/api/files', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                path: `${currentPath}/${fileName}`
              })
            });
            
            if (response.ok) {
              addOutput('success', `Removed: ${fileName}`);
              if (onFileSystemChange) onFileSystemChange();
            } else {
              const data = await response.json();
              addOutput('error', data.error || 'Failed to remove file');
            }
          } catch (error) {
            addOutput('error', 'Failed to remove file');
          }
        } else {
          addOutput('error', 'rm: missing operand');
        }
        setIsRunning(false);
        return;
      }

      if (cmd === 'help') {
        addOutput('output', `Available commands:
  ls              - List files and directories
  cd <path>       - Change directory
  pwd             - Print working directory
  mkdir <name>    - Create directory
  touch <name>    - Create empty file
  cat <file>      - Display file contents
  rm <file>       - Remove file/directory
  clear           - Clear terminal
  help            - Show this help
  
  Any other command will be executed as a shell command.`);
        setIsRunning(false);
        return;
      }

      // Execute other commands via backend
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          cwd: currentPath
        })
      });

      const result = await response.json();
      
      if (result.stdout) {
        addOutput('output', result.stdout);
      }
      
      if (result.stderr) {
        addOutput('error', result.stderr);
      }
      
      if (result.exitCode !== 0 && !result.stdout && !result.stderr) {
        addOutput('error', `Command exited with code ${result.exitCode}`);
      }

      // Update current path if command might have changed it
      if (cmd.includes('cd') || cmd.includes('mkdir') || cmd.includes('rm')) {
        if (onFileSystemChange) onFileSystemChange();
      }

    } catch (error) {
      addOutput('error', 'Failed to execute command');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(currentInput);
    setCurrentInput('');
  };

  const clearTerminal = () => {
    setOutput([
      { type: 'output', content: 'WebIDE Terminal v1.0.0', timestamp: new Date() },
      { type: 'output', content: 'Type commands to interact with the file system.', timestamp: new Date() },
    ]);
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
          <span className="text-xs text-muted-foreground">{currentPath}</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Terminal Settings */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <Settings className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Terminal Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={terminalTheme} onValueChange={setTerminalTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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
        className={`flex-1 p-3 overflow-y-auto font-mono text-sm ${
          terminalTheme === 'dark' ? 'bg-background' : 'bg-muted/20'
        }`}
      >
        {output.map((line, index) => (
          <div
            key={index}
            className={`mb-1 ${
              line.type === 'input' 
                ? 'text-primary' 
                : line.type === 'error' 
                  ? 'text-destructive' 
                  : line.type === 'success'
                    ? 'text-accent'
                    : 'text-foreground'
            }`}
          >
            <pre className="whitespace-pre-wrap font-mono">{line.content}</pre>
          </div>
        ))}
        {isRunning && (
          <div className="text-muted-foreground animate-pulse">
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
            placeholder="Enter command... (type 'help' for available commands)"
            className="font-mono text-sm border-none bg-transparent p-0 focus-visible:ring-0"
            autoFocus
            disabled={isRunning}
          />
        </form>
      </div>
    </div>
  );
};