import React, { useState, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot, Download, Eye, EyeOff } from 'lucide-react';

// Register language
SyntaxHighlighter.registerLanguage('javascript', js);

interface OutputViewerProps {
  code: string;
  isLoading: boolean;
}

const PERFORMANCE_THRESHOLD_CHARS = 20000; // Switch to raw text mode if larger than this to prevent browser freeze

const OutputViewer: React.FC<OutputViewerProps> = ({ code, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [forceHighlight, setForceHighlight] = useState(false);
  const [isLargeFile, setIsLargeFile] = useState(false);

  useEffect(() => {
    setIsLargeFile(code.length > PERFORMANCE_THRESHOLD_CHARS);
    // Reset force highlight when code changes
    setForceHighlight(false);
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migrated-output.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 relative">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
           <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-slate-200">ESM Output</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
           <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-700 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
           </div>
           <p className="text-slate-400 animate-pulse text-sm font-medium">Analyzing logic structure...</p>
           <p className="text-slate-600 text-xs">Processing large datasets requires deep reasoning.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!code) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-2">
          <Bot className="w-12 h-12 opacity-20" />
          <span className="text-sm">Ready to convert legacy code.</span>
        </div>
      );
    }

    // Performance Mode: Render raw textarea for massive files
    if (isLargeFile && !forceHighlight) {
      return (
        <div className="w-full h-full relative">
          <textarea 
            readOnly 
            value={code} 
            className="w-full h-full bg-[#0d1117] text-[#d4d4d4] p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed custom-scrollbar"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800/90 border border-slate-700 text-slate-300 px-4 py-2 rounded-full text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
             <span>Performance Mode Active ({code.length.toLocaleString()} chars)</span>
             <button 
                onClick={() => setForceHighlight(true)}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
             >
               Render Syntax (May Lag)
             </button>
          </div>
        </div>
      );
    }

    // Syntax Highlight Mode
    return (
      <SyntaxHighlighter
        language="javascript"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1.5rem',
          height: '100%',
          fontSize: '0.875rem',
          lineHeight: '1.6',
          background: '#0d1117',
        }}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shadow-black/50 relative group">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">ESM Output</span>
          {code && (
            <span className="text-xs text-slate-500 border-l border-slate-700 pl-2 ml-1">
              {code.split('\n').length.toLocaleString()} lines
            </span>
          )}
        </div>
        
        {code && (
          <div className="flex items-center gap-2">
            {isLargeFile && (
               <button
                  onClick={() => setForceHighlight(!forceHighlight)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
                  title={forceHighlight ? "Disable Syntax Highlighting (Faster)" : "Enable Syntax Highlighting"}
               >
                  {forceHighlight ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-xs font-medium text-slate-200 transition-all border border-slate-600"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save .js</span>
            </button>
            
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-xs font-medium text-indigo-300 border border-indigo-500/30 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputViewer;