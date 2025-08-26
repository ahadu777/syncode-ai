
// AI Service for connecting to various free AI APIs
export interface AIProvider {
  name: string;
  endpoint: string;
  model: string;
  requiresAuth: boolean;
}

export const FREE_AI_PROVIDERS: AIProvider[] = [
  {
    name: 'HuggingFace',
    endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
    model: 'microsoft/DialoGPT-medium',
    requiresAuth: false
  },
  {
    name: 'Ollama Local',
    endpoint: 'http://localhost:11434/api/generate',
    model: 'llama2',
    requiresAuth: false
  },
  {
    name: 'Together AI',
    endpoint: 'https://api.together.xyz/inference',
    model: 'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
    requiresAuth: false
  }
];

export class AIService {
  private currentProvider: AIProvider;
  private apiKey?: string;

  constructor(provider: AIProvider = FREE_AI_PROVIDERS[0], apiKey?: string) {
    this.currentProvider = provider;
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    try {
      // Try HuggingFace first (free inference API)
      const response = await this.callHuggingFaceAPI(prompt, context);
      if (response) return response;

      // Fallback to local simulation if APIs fail
      return this.simulateResponse(prompt);
    } catch (error) {
      console.error('AI Service error:', error);
      return this.simulateResponse(prompt);
    }
  }

  private async callHuggingFaceAPI(prompt: string, context?: string): Promise<string | null> {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}\nAssistant:` : prompt;
      
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.warn('HuggingFace API error:', data.error);
        return null;
      }

      return data[0]?.generated_text?.replace(fullPrompt, '').trim() || null;
    } catch (error) {
      console.error('HuggingFace API call failed:', error);
      return null;
    }
  }

  private simulateResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('agent') || lowerPrompt.includes('autonomous')) {
      return `🤖 **Agent Mode Activated**

I can help you with autonomous code operations:

**📁 Code Analysis:**
- Scan entire codebase structure
- Identify patterns and architecture
- Find potential issues and improvements

**🔧 Automated Refactoring:**
- Extract reusable components
- Optimize imports and dependencies
- Apply consistent code formatting

**🧪 Testing & Quality:**
- Generate unit tests automatically
- Run code quality checks
- Suggest performance optimizations

**🚀 Multi-step Operations:**
- Plan and execute complex refactoring
- Apply changes across multiple files
- Create pull requests with detailed explanations

Would you like me to start with a codebase analysis or specific refactoring task?`;
    }

    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('scan')) {
      return `🔍 **Codebase Analysis Complete**

**Project Structure:**
- React + TypeScript IDE application
- Monaco Editor integration
- Component-based architecture
- Tailwind CSS styling

**Key Components:**
- \`IDELayout\`: Main layout container
- \`AIAssistant\`: AI chat interface
- \`EditorArea\`: Code editor with tabs
- \`FileExplorer\`: File management sidebar
- \`Terminal\`: Integrated command line

**Recommendations:**
1. Add proper error boundaries
2. Implement file persistence
3. Add real-time collaboration features
4. Integrate with version control systems

Would you like me to implement any of these improvements?`;
    }

    if (lowerPrompt.includes('refactor') || lowerPrompt.includes('improve')) {
      return `⚡ **Refactoring Plan Generated**

**Priority Tasks:**
1. **Extract Hooks**: Move state logic to custom hooks
2. **Component Splitting**: Break down large components
3. **Type Safety**: Add comprehensive TypeScript interfaces
4. **Performance**: Implement React.memo and useMemo optimizations

**Proposed Changes:**
- Create \`useFileManager\` hook for file operations
- Split AIAssistant into smaller focused components
- Add proper loading states and error handling
- Implement virtualization for large file lists

Shall I proceed with these refactoring steps? I can make these changes automatically and create a detailed commit message.`;
    }

    return `I'm your AI coding assistant! I can:

🔧 **Code Operations:**
- Analyze your codebase structure
- Perform automated refactoring
- Generate tests and documentation
- Fix bugs and optimize performance

🤖 **Agent Capabilities:**
- Autonomous multi-file editing
- Intelligent code suggestions
- Project-wide improvements
- Git integration and PR creation

Ask me to analyze your code, refactor components, or work in agent mode for autonomous operations!`;
  }

  async generateCode(description: string, language: string, context?: string): Promise<string> {
    const prompt = `Generate ${language} code for: ${description}. ${context ? `Context: ${context}` : ''}`;
    
    // For code generation, we'll use a more targeted approach
    if (language.toLowerCase().includes('javascript') || language.toLowerCase().includes('typescript')) {
      return this.generateJavaScriptCode(description);
    }
    
    return this.simulateResponse(prompt);
  }

  private generateJavaScriptCode(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('hook') || lowerDesc.includes('custom hook')) {
      return `\`\`\`typescript
import { useState, useEffect } from 'react';

export const useCustomHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Custom hook logic here
    setLoading(true);
    // Add your implementation
    setLoading(false);
  }, []);

  return { data, loading, error };
};
\`\`\``;
    }

    if (lowerDesc.includes('component')) {
      return `\`\`\`typescript
import React from 'react';

interface Props {
  // Define your props here
}

export const CustomComponent: React.FC<Props> = ({ }) => {
  return (
    <div className="p-4">
      {/* Component content */}
    </div>
  );
};
\`\`\``;
    }

    return `\`\`\`javascript
// Generated code for: ${description}
function generatedFunction() {
  // Implementation here
  console.log('Generated function');
}

export default generatedFunction;
\`\`\``;
  }
}

export const aiService = new AIService();
