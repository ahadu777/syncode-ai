
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Code, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      content: 'Hello! I\'m your AI coding assistant. I can help you with code review, debugging, refactoring, and generating new functions. What would you like to work on?',
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

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Simple response simulation based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
      return `I'd be happy to help you debug that issue! Here are some common debugging strategies:

1. **Check the console** for error messages
2. **Add console.log statements** to trace execution
3. **Verify variable types** and values
4. **Look for typos** in variable names
5. **Check async/await** usage for promises

Could you share the specific error message or code snippet you're having trouble with?`;
    }
    
    if (lowerMessage.includes('refactor') || lowerMessage.includes('improve') || lowerMessage.includes('optimize')) {
      return `Great idea to refactor! Here's my approach to code improvement:

**🔍 Analysis Steps:**
- Identify code smells and repetition
- Look for performance bottlenecks
- Check for proper separation of concerns
- Ensure consistent naming conventions

**⚡ Common Improvements:**
- Extract reusable functions
- Use modern JavaScript features (ES6+)
- Implement proper error handling
- Add TypeScript for better type safety

Would you like me to review a specific function or file?`;
    }
    
    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      return `Testing is crucial for maintainable code! Here's what I recommend:

**🧪 Testing Strategy:**
- Unit tests for individual functions
- Integration tests for component interactions
- End-to-end tests for user workflows

**Popular Testing Tools:**
- Jest for unit testing
- React Testing Library for React components
- Cypress for E2E testing

Would you like me to help write tests for a specific function?`;
    }
    
    if (lowerMessage.includes('function') || lowerMessage.includes('generate') || lowerMessage.includes('create')) {
      return `I can help generate functions! Here's an example utility function:

\`\`\`javascript
// Debounce function for performance optimization
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Usage example:
const debouncedSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);
\`\`\`

What kind of function would you like me to help you create?`;
    }
    
    return `I understand you're asking about: "${userMessage}"

As your AI coding assistant, I can help with:

🔧 **Code Review & Debugging**
- Find and fix bugs
- Suggest improvements
- Performance optimization

📝 **Code Generation**
- Write new functions
- Create boilerplate code
- Generate documentation

🧪 **Testing & Quality**
- Write unit tests
- Code quality analysis
- Best practices guidance

Feel free to paste code snippets or ask specific questions about your project!`;
  };

  const sendMessage = async () => {
    if (!currentInput.trim() || isThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsThinking(true);

    try {
      const response = await simulateAIResponse(currentInput);
      
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
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md mt-2 mb-2 overflow-x-auto"><code class="font-mono text-sm">$2</code></pre>');
  };

  const quickActions = [
    { icon: Code, label: 'Review Code', prompt: 'Can you review my code for improvements?' },
    { icon: Zap, label: 'Debug Issue', prompt: 'Help me debug an error in my code' },
    { icon: FileText, label: 'Generate Function', prompt: 'Generate a utility function for me' },
    { icon: Sparkles, label: 'Optimize', prompt: 'How can I optimize this code for better performance?' }
  ];

  return (
    <div className="ai-panel h-full flex flex-col">
      {/* AI Assistant Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-ai-accent" />
          <span className="text-sm font-medium">AI Assistant</span>
          <div className="px-2 py-1 bg-ai-accent/10 text-ai-accent text-xs rounded-full">
            Beta
          </div>
        </div>
        {isThinking && (
          <div className="flex items-center gap-2 text-ai-thinking text-xs">
            <div className="animate-pulse">●</div>
            Thinking...
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-border">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-auto p-2 flex flex-col items-center gap-1 text-xs"
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
                    Analyzing your request...
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
            placeholder="Ask me anything about your code..."
            className="flex-1"
            disabled={isThinking}
          />
          <Button
            type="submit"
            size="sm"
            className="px-3"
            disabled={!currentInput.trim() || isThinking}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
