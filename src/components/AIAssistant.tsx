
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Code, FileText, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { aiService } from '@/services/aiService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI coding assistant powered by free AI models. I can help you with code review, debugging, refactoring, and autonomous agent operations. What would you like to work on?',
      timestamp: new Date()
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!currentInput.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = currentInput;
    setCurrentInput('');
    setIsThinking(true);

    try {
      // Use the actual AI service
      const response = await aiService.generateResponse(userInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. The AI service might be temporarily unavailable. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md mt-2 mb-2 overflow-x-auto"><code class="font-mono text-sm">$2</code></pre>')
      .replace(/🤖|🔧|📝|🧪|🚀|⚡|🔍|💡|📋|✅|⏹️/g, '<span class="text-lg">$&</span>');
  };

  const quickActions = [
    { 
      icon: Code, 
      label: 'Code Review', 
      prompt: 'Please review my current code and suggest improvements'
    },
    { 
      icon: Zap, 
      label: 'Debug Issue', 
      prompt: 'Help me debug an error in my code'
    },
    { 
      icon: FileText, 
      label: 'Generate Code', 
      prompt: 'Generate a utility function for me'
    },
    { 
      icon: Sparkles, 
      label: 'Agent Mode', 
      prompt: 'Start autonomous agent mode to analyze and improve my codebase'
    }
  ];

  const aiProviderStatus = () => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Connected to HuggingFace API</span>
    </div>
  );

  return (
    <div className="ai-panel h-full flex flex-col">
      {/* AI Assistant Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-accent" />
          <span className="text-sm font-medium">AI Assistant</span>
          <div className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
            Free AI
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isThinking && (
            <div className="flex items-center gap-2 text-ai-thinking text-xs">
              <div className="animate-pulse">●</div>
              Processing...
            </div>
          )}
          <Button variant="ghost" size="sm" className="p-1">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* AI Provider Status */}
      <div className="px-3 py-2 border-b border-border">
        {aiProviderStatus()}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-auto p-2 flex flex-col items-center gap-1 text-xs hover:bg-ai-accent/10"
              onClick={() => setCurrentInput(action.prompt)}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message ${message.type} ${message.type === 'user' ? 'ml-8' : 'mr-8'}`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'assistant' && (
                  <div className="w-6 h-6 bg-ai-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-ai-accent" />
                  </div>
                )}
                <div className="flex-1">
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="ai-message assistant mr-8">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-ai-accent/10 rounded-full flex items-center justify-center flex-shrink-0 pulse-glow">
                  <Bot className="w-3 h-3 text-ai-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-ai-thinking ai-thinking">
                    Connecting to AI model...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Ask me anything or request autonomous agent operations..."
            className="flex-1"
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="sm"
            className="px-3 bg-ai-accent hover:bg-ai-accent/90"
            disabled={!currentInput.trim() || isThinking}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
