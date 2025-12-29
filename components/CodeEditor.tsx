import React, { useRef, useState, useEffect } from 'react';
import { FileCode, XCircle, Upload, FileText } from 'lucide-react';

interface CodeEditorProps {
  // We use a ref to pull value instead of controlling it to avoid re-renders on every keystroke
  getValue: () => string; 
  setValue: (val: string) => void;
  disabled?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ getValue, setValue, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  // Sync internal ref when parent sets value externally (e.g. clear)
  useEffect(() => {
    if (textareaRef.current) {
       // Only update if actually different to prevent cursor jumping
       if (textareaRef.current.value !== getValue()) {
          textareaRef.current.value = getValue();
          updateStats();
       }
    }
  }, [getValue]);

  const updateStats = () => {
    if (textareaRef.current) {
      const val = textareaRef.current.value;
      setCharCount(val.length);
      setLineCount(val.split('\n').length);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (textareaRef.current) {
        textareaRef.current.value = content;
        setValue(content); // Update parent ref logic
        updateStats();
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (textareaRef.current) {
      textareaRef.current.value = '';
      setValue('');
      setFileName(null);
      updateStats();
    }
  };

  const handleManualInput = () => {
    if (textareaRef.current) {
      // We do NOT call setValue here to avoid re-rendering parent.
      // Parent pulls value only when "Convert" is clicked.
      // We only update local stats.
      updateStats();
      
      // If user types manually, clear filename binding
      if (fileName) setFileName(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 transition-all focus-within:ring-1 focus-within:ring-indigo-500/50">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <FileCode className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">CommonJS Input</span>
          </div>
          
          {fileName && (
             <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600 text-xs text-slate-300 truncate max-w-[150px]">
                <FileText className="w-3 h-3" />
                <span className="truncate">{fileName}</span>
             </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".js,.ts,.txt,.json"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-colors border border-slate-600"
            title="Upload File"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load File</span>
          </button>

          {(charCount > 0) && (
            <button 
              onClick={handleClear}
              className="text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Clear All"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative flex-1 group">
        <textarea
          ref={textareaRef}
          onChange={handleManualInput}
          disabled={disabled}
          placeholder="// Paste your legacy Node.js CJS code here...
// Or click 'Load File' to upload massive files (45k+ lines supported)."
          className="w-full h-full bg-[#0d1117] text-slate-300 p-4 resize-none focus:outline-none text-sm leading-relaxed font-mono custom-scrollbar"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        
        {/* Stats overlay */}
        <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800/50 backdrop-blur pointer-events-none">
           Lines: {lineCount.toLocaleString()} | Chars: {charCount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;