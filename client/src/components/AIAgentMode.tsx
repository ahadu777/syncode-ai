
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Play, Pause, CheckCircle, AlertCircle, Code, FileText, GitBranch, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiService } from '@/services/aiService';

interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: string;
  timestamp: Date;
}

interface AgentMode {
  isActive: boolean;
  currentTask?: AgentTask;
  taskQueue: AgentTask[];
  completedTasks: AgentTask[];
}

export const AIAgentMode = () => {
  const [agentMode, setAgentMode] = useState<AgentMode>({
    isActive: false,
    taskQueue: [],
    completedTasks: []
  });
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [activityLog]);

  const addToLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const startAgentMode = async () => {
    setAgentMode(prev => ({ ...prev, isActive: true }));
    addToLog('🤖 Agent Mode activated');
    
    // Create initial analysis task
    const analysisTask: AgentTask = {
      id: 'analysis-' + Date.now(),
      title: 'Codebase Analysis',
      description: 'Analyzing project structure and identifying improvement opportunities',
      status: 'running',
      timestamp: new Date()
    };

    setAgentMode(prev => ({ 
      ...prev, 
      currentTask: analysisTask,
      taskQueue: []
    }));

    addToLog('📊 Starting codebase analysis...');
    
    // Simulate analysis
    setTimeout(async () => {
      const analysisResult = await aiService.generateResponse('analyze codebase structure');
      
      const completedTask = {
        ...analysisTask,
        status: 'completed' as const,
        result: analysisResult
      };

      setAgentMode(prev => ({
        ...prev,
        currentTask: undefined,
        completedTasks: [completedTask, ...prev.completedTasks]
      }));

      addToLog('✅ Codebase analysis completed');
      addToLog('🔍 Found 12 components, 3 services, 1 hook');
      addToLog('💡 Identified 5 improvement opportunities');

      // Queue up improvement tasks
      const improvementTasks: AgentTask[] = [
        {
          id: 'extract-hooks-' + Date.now(),
          title: 'Extract Custom Hooks',
          description: 'Extract reusable state logic into custom hooks',
          status: 'pending',
          timestamp: new Date()
        },
        {
          id: 'optimize-components-' + (Date.now() + 1),
          title: 'Component Optimization',
          description: 'Apply React.memo and performance optimizations',
          status: 'pending',
          timestamp: new Date()
        },
        {
          id: 'add-tests-' + (Date.now() + 2),
          title: 'Generate Unit Tests',
          description: 'Create comprehensive test coverage',
          status: 'pending',
          timestamp: new Date()
        }
      ];

      setAgentMode(prev => ({
        ...prev,
        taskQueue: improvementTasks
      }));

      addToLog('📋 Queued 3 improvement tasks');
    }, 3000);
  };

  const stopAgentMode = () => {
    setAgentMode({
      isActive: false,
      taskQueue: [],
      completedTasks: []
    });
    addToLog('⏹️ Agent Mode deactivated');
  };

  const executeNextTask = async () => {
    if (agentMode.taskQueue.length === 0) return;

    const nextTask = agentMode.taskQueue[0];
    const remainingTasks = agentMode.taskQueue.slice(1);

    setAgentMode(prev => ({
      ...prev,
      currentTask: { ...nextTask, status: 'running' },
      taskQueue: remainingTasks
    }));

    addToLog(`🚀 Executing: ${nextTask.title}`);

    // Simulate task execution
    setTimeout(async () => {
      const result = await aiService.generateResponse(`execute task: ${nextTask.description}`);
      
      const completedTask = {
        ...nextTask,
        status: 'completed' as const,
        result
      };

      setAgentMode(prev => ({
        ...prev,
        currentTask: undefined,
        completedTasks: [completedTask, ...prev.completedTasks]
      }));

      addToLog(`✅ Completed: ${nextTask.title}`);
    }, 2000 + Math.random() * 3000);
  };

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'running':
        return <div className="animate-spin w-4 h-4 border-2 border-ai-accent border-t-transparent rounded-full" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-muted rounded-full" />;
    }
  };

  const quickAgentTasks = [
    { icon: Code, label: 'Refactor Code', task: 'refactor codebase for better maintainability' },
    { icon: FileText, label: 'Generate Docs', task: 'generate comprehensive documentation' },
    { icon: GitBranch, label: 'Create Tests', task: 'create unit tests for all components' },
    { icon: Zap, label: 'Optimize Performance', task: 'optimize application performance' }
  ];

  return (
    <div className="ai-agent-panel h-full flex flex-col">
      {/* Agent Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-accent" />
          <span className="text-sm font-medium">AI Agent Mode</span>
          {agentMode.isActive && (
            <div className="px-2 py-1 bg-ai-accent/20 text-ai-accent text-xs rounded-full pulse-glow">
              Active
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!agentMode.isActive ? (
            <Button
              size="sm"
              onClick={startAgentMode}
              className="bg-ai-accent hover:bg-ai-accent/90"
            >
              <Play className="w-3 h-3 mr-1" />
              Start Agent
            </Button>
          ) : (
            <>
              {agentMode.taskQueue.length > 0 && !agentMode.currentTask && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={executeNextTask}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Next Task
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={stopAgentMode}
              >
                <Pause className="w-3 h-3 mr-1" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Agent Tasks */}
      {!agentMode.isActive && (
        <div className="p-3 border-b border-border">
          <div className="text-xs text-muted-foreground mb-2">Quick Agent Tasks:</div>
          <div className="grid grid-cols-2 gap-2">
            {quickAgentTasks.map((task, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="h-auto p-2 flex flex-col items-center gap-1 text-xs"
                onClick={() => {
                  startAgentMode();
                  // Add specific task to queue
                }}
              >
                <task.icon className="w-4 h-4" />
                <span>{task.label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Current Task */}
      {agentMode.currentTask && (
        <div className="p-3 border-b border-border bg-ai-accent/5">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(agentMode.currentTask.status)}
            <span className="text-sm font-medium">Current Task</span>
          </div>
          <div className="text-sm text-foreground">{agentMode.currentTask.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{agentMode.currentTask.description}</div>
        </div>
      )}

      {/* Task Queue */}
      {agentMode.taskQueue.length > 0 && (
        <div className="p-3 border-b border-border">
          <div className="text-xs text-muted-foreground mb-2">Pending Tasks ({agentMode.taskQueue.length}):</div>
          <div className="space-y-2">
            {agentMode.taskQueue.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                {getStatusIcon(task.status)}
                <span className="text-muted-foreground">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div className="flex-1 flex flex-col">
        <div className="p-3 border-b border-border">
          <span className="text-xs text-muted-foreground">Activity Log</span>
        </div>
        <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
          <div className="space-y-1">
            {activityLog.map((log, index) => (
              <div key={index} className="text-xs font-mono text-muted-foreground">
                {log}
              </div>
            ))}
            {activityLog.length === 0 && (
              <div className="text-xs text-muted-foreground italic">
                No activity yet. Start the agent to begin autonomous operations.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Completed Tasks Summary */}
      {agentMode.completedTasks.length > 0 && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">
            Completed: {agentMode.completedTasks.length} tasks
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500">All tasks executed successfully</span>
          </div>
        </div>
      )}
    </div>
  );
};
