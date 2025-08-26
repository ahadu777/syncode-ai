
import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Trash2, Github, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export const Terminal = () => {
  const [output, setOutput] = useState<Array<{ type: 'input' | 'output' | 'error' | 'success'; content: string }>>([
    { type: 'output', content: 'WebIDE Terminal v1.0.0 - GitHub Integration Enabled' },
    { type: 'output', content: 'Type "help" for available commands or "git help" for Git commands.' },
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalTheme, setTerminalTheme] = useState('dark');
  const [githubToken, setGithubToken] = useState('');
  const [currentRepo, setCurrentRepo] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [isConnected, setIsConnected] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const connectToGithub = () => {
    if (githubToken && currentRepo) {
      setIsConnected(true);
      setOutput(prev => [...prev, 
        { type: 'success', content: `✓ Connected to GitHub repository: ${currentRepo}` },
        { type: 'output', content: `Current branch: ${currentBranch}` }
      ]);
    }
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setOutput(prev => [...prev, { type: 'input', content: `$ ${command}` }]);
    setIsRunning(true);

    // Simulate command execution
    await new Promise(resolve => setTimeout(resolve, 500));

    let result = '';
    let resultType: 'output' | 'error' | 'success' = 'output';

    const cmd = command.toLowerCase().trim();
    const args = command.trim().split(' ');

    // Git commands
    if (cmd.startsWith('git ')) {
      if (!isConnected && !['git help', 'git config', 'git init'].includes(cmd)) {
        result = 'Error: Not connected to GitHub. Use terminal settings to connect first.';
        resultType = 'error';
      } else {
        switch (cmd) {
          case 'git help':
            result = `Git commands available:
  git status       - Show repository status
  git branch       - List branches
  git checkout <branch> - Switch branch
  git pull         - Pull latest changes
  git push         - Push changes to remote
  git add .        - Stage all changes
  git commit -m "message" - Commit changes
  git log          - Show commit history
  git clone <url>  - Clone repository
  git init         - Initialize new repository`;
            break;
          case 'git status':
            result = `On branch ${currentBranch}
Your branch is up to date with 'origin/${currentBranch}'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git checkout -- <file>..." to discard changes)

        modified:   src/components/Terminal.tsx
        modified:   src/components/IDELayout.tsx

no changes added to commit (use "git add" and/or "git commit -a")`;
            break;
          case 'git branch':
            result = `* ${currentBranch}
  develop
  feature/terminal-integration`;
            break;
          case 'git pull':
            result = `From github.com:${currentRepo}
 * branch            ${currentBranch}     -> FETCH_HEAD
Already up to date.`;
            resultType = 'success';
            break;
          case 'git push':
            result = `Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
To github.com:${currentRepo}.git
   abc1234..def5678  ${currentBranch} -> ${currentBranch}`;
            resultType = 'success';
            break;
          case 'git add .':
            result = 'Changes staged for commit.';
            resultType = 'success';
            break;
          case 'git log':
            result = `commit def5678901234567890123456789012345678901
Author: Developer <dev@example.com>
Date:   ${new Date().toLocaleString()}

    Enhanced terminal with GitHub integration

commit abc1234567890123456789012345678901234567
Author: Developer <dev@example.com>
Date:   ${new Date(Date.now() - 86400000).toLocaleString()}

    Initial terminal implementation`;
            break;
          default:
            if (cmd.startsWith('git checkout ')) {
              const branch = args[2];
              if (branch) {
                setCurrentBranch(branch);
                result = `Switched to branch '${branch}'`;
                resultType = 'success';
              } else {
                result = 'Error: Branch name required';
                resultType = 'error';
              }
            } else if (cmd.startsWith('git commit -m ')) {
              const message = command.substring(14).replace(/"/g, '');
              result = `[${currentBranch} def5678] ${message}
 2 files changed, 45 insertions(+), 2 deletions(-)`;
              resultType = 'success';
            } else {
              result = `git: '${args[1]}' is not a git command. See 'git help'.`;
              resultType = 'error';
            }
            break;
        }
      }
    }
    // Regular terminal commands
    else {
      switch (cmd) {
        case 'help':
          result = `Available commands:
  help     - Show this help message
  ls       - List files in current directory
  pwd      - Show current directory
  clear    - Clear terminal
  echo <text> - Echo text back
  node -v  - Show Node.js version
  npm -v   - Show npm version
  git <command> - Git commands (use 'git help' for details)
  github status - Show GitHub connection status`;
          break;
        case 'ls':
          result = 'src/  package.json  README.md  node_modules/  .git/';
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
        case 'github status':
          if (isConnected) {
            result = `✓ Connected to GitHub
Repository: ${currentRepo}
Current Branch: ${currentBranch}
Status: Active`;
            resultType = 'success';
          } else {
            result = '✗ Not connected to GitHub. Use terminal settings to connect.';
            resultType = 'error';
          }
          break;
        default:
          if (cmd.startsWith('echo ')) {
            result = command.substring(5);
          } else {
            result = `Command not found: ${command}. Type 'help' for available commands.`;
            resultType = 'error';
          }
          break;
      }
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
    setOutput([
      { type: 'output', content: 'WebIDE Terminal v1.0.0 - GitHub Integration Enabled' },
      { type: 'output', content: 'Type "help" for available commands or "git help" for Git commands.' },
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
          {isConnected && (
            <div className="flex items-center gap-1 px-2 py-1 bg-success/20 text-success text-xs rounded-full">
              <Github className="w-3 h-3" />
              <span>Connected</span>
            </div>
          )}
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
                <div>
                  <Label htmlFor="github-token">GitHub Token (Optional)</Label>
                  <Input
                    id="github-token"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="repo">Repository</Label>
                  <Input
                    id="repo"
                    placeholder="username/repository"
                    value={currentRepo}
                    onChange={(e) => setCurrentRepo(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="branch">Default Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={currentBranch}
                    onChange={(e) => setCurrentBranch(e.target.value)}
                  />
                </div>
                <Button onClick={connectToGithub} className="w-full">
                  <Github className="w-4 h-4 mr-2" />
                  Connect to GitHub
                </Button>
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
                    ? 'text-success'
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
            placeholder="Enter command... (try 'git help' for Git commands)"
            className="font-mono text-sm border-none bg-transparent p-0 focus-visible:ring-0"
            autoFocus
            disabled={isRunning}
          />
        </form>
      </div>
    </div>
  );
};
