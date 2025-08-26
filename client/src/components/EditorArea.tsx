
import React from 'react';
import Editor from '@monaco-editor/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorAreaProps {
  openFiles: Array<{ name: string; content: string; language: string }>;
  setOpenFiles: React.Dispatch<React.SetStateAction<Array<{ name: string; content: string; language: string }>>>;
  activeFileIndex: number;
  setActiveFileIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  openFiles,
  setOpenFiles,
  activeFileIndex,
  setActiveFileIndex
}) => {
  const closeFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFiles = openFiles.filter((_, i) => i !== index);
    setOpenFiles(newFiles);
    
    if (activeFileIndex >= index && activeFileIndex > 0) {
      setActiveFileIndex(activeFileIndex - 1);
    } else if (newFiles.length === 0) {
      setActiveFileIndex(-1);
    }
  };

  const updateFileContent = (value: string | undefined) => {
    if (value !== undefined && activeFileIndex >= 0) {
      const newFiles = [...openFiles];
      newFiles[activeFileIndex] = { ...newFiles[activeFileIndex], content: value };
      setOpenFiles(newFiles);
    }
  };

  const hslToHex = (hsl: string): string => {
    // Parse HSL values from string like "220 13% 55%"
    const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) return '#ffffff';
    
    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const getComputedColorHex = (cssVariable: string): string => {
    const root = document.documentElement;
    const computedValue = getComputedStyle(root).getPropertyValue(cssVariable).trim();
    return hslToHex(computedValue);
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    // Get computed color values and convert to hex
    const syntaxComment = getComputedColorHex('--syntax-comment');
    const syntaxKeyword = getComputedColorHex('--syntax-keyword');
    const syntaxString = getComputedColorHex('--syntax-string');
    const syntaxNumber = getComputedColorHex('--syntax-number');
    const syntaxFunction = getComputedColorHex('--syntax-function');

    // Configure Monaco Editor theme with hex color values
    monaco.editor.defineTheme('ide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: syntaxComment },
        { token: 'keyword', foreground: syntaxKeyword },
        { token: 'string', foreground: syntaxString },
        { token: 'number', foreground: syntaxNumber },
        { token: 'function', foreground: syntaxFunction },
      ],
      colors: {
        'editor.background': '#1a1d23',
        'editor.foreground': '#e1e4e8',
        'editorLineNumber.foreground': '#6a737d',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      }
    });

    monaco.editor.setTheme('ide-dark');

    // Configure editor options
    editor.updateOptions({
      fontFamily: 'Fira Code, Monaco, Menlo, monospace',
      fontSize: 14,
      lineHeight: 20,
      fontLigatures: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  return (
    <div className="flex-1 flex flex-col ide-editor-area">
      {/* Tabs */}
      {openFiles.length > 0 && (
        <div className="flex border-b border-border overflow-x-auto">
          {openFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className={`ide-tab ${index === activeFileIndex ? 'active' : ''} flex items-center gap-2 min-w-0`}
              onClick={() => setActiveFileIndex(index)}
            >
              <span className="truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive/20"
                onClick={(e) => closeFile(index, e)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        {openFiles.length > 0 && activeFileIndex >= 0 ? (
          <Editor
            value={openFiles[activeFileIndex]?.content}
            language={openFiles[activeFileIndex]?.language}
            onChange={updateFileContent}
            onMount={handleEditorDidMount}
            options={{
              theme: 'ide-dark',
              fontFamily: 'Fira Code, Monaco, Menlo, monospace',
              fontSize: 14,
              lineHeight: 20,
              fontLigatures: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-xl font-semibold mb-2">Welcome to WebIDE</h2>
              <p>Open a file from the explorer to start coding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
