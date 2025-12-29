import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import OutputViewer from './components/OutputViewer';
import { ArrowRight, AlertCircle, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { convertCode } from './services/geminiService';
import { ConversionStatus } from './types';

function App() {
  // We don't keep strict state synchronization for the input code to avoid lag.
  // Instead, we use a ref to hold the current value and only read it when needed.
  const inputCodeRef = useRef<string>('');
  
  const [outputCode, setOutputCode] = useState<string>('');
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  // Function to pass to CodeEditor so it can update our ref without triggering re-renders
  const handleEditorChange = useCallback((val: string) => {
    inputCodeRef.current = val;
  }, []);

  const handleEditorGetValue = useCallback(() => {
    return inputCodeRef.current;
  }, []);

  const handleConvert = useCallback(async () => {
    const codeToConvert = inputCodeRef.current;
    
    if (!codeToConvert.trim()) {
      setError("Please input some code or upload a file first.");
      return;
    }
    
    setStatus(ConversionStatus.LOADING);
    setError(null);
    setOutputCode(''); 

    try {
      const result = await convertCode(codeToConvert);
      // Clean up markdown fences if present
      const cleanResult = result
        .replace(/^```javascript\n/gm, '')
        .replace(/^```js\n/gm, '')
        .replace(/^```\n?/gm, '')
        .replace(/```$/gm, '');
        
      setOutputCode(cleanResult);
      setStatus(ConversionStatus.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please check your API limits or network.');
      setStatus(ConversionStatus.ERROR);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-indigo-500/30">
      <Header />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Info Banners */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-800/30 flex items-start gap-3 backdrop-blur-sm">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200/80 space-y-1">
              <p className="font-semibold text-blue-200">Strict Logic Retention</p>
              <p>Variables (<code className="text-blue-300">DinzBotz</code>, <code className="text-blue-300">conn</code>) and logic flow are preserved 1:1. Only imports/exports are transformed.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-indigo-900/10 border border-indigo-800/30 flex items-start gap-3 backdrop-blur-sm">
            <Cpu className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-200/80 space-y-1">
              <p className="font-semibold text-indigo-200">High Performance Engine</p>
              <p>Optimized for 45,000+ lines. Use "Load File" for massive datasets to bypass clipboard limits.</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
          
          {/* Left Panel: Input */}
          <div className="flex flex-col gap-4 h-full">
            <div className="flex-1">
              <CodeEditor 
                getValue={handleEditorGetValue} 
                setValue={handleEditorChange} 
                disabled={status === ConversionStatus.LOADING}
              />
            </div>
            
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-xl border border-slate-800 shadow-lg backdrop-blur-md">
               <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></div>
                  System Ready
               </div>
               <button
                onClick={handleConvert}
                disabled={status === ConversionStatus.LOADING}
                className={`
                  group flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-xl
                  ${status === ConversionStatus.LOADING 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-900/20 border border-indigo-500/50 hover:border-indigo-400 hover:scale-[1.02] active:scale-[0.98]'
                  }
                `}
              >
                {status === ConversionStatus.LOADING ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  <>
                    Convert to ESM
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="h-full flex flex-col gap-4">
             <div className="flex-1 relative">
                {error && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm rounded-xl p-4">
                    <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-8 rounded-2xl max-w-lg text-center shadow-2xl ring-1 ring-red-500/20">
                      <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">Conversion Interrupted</h3>
                      <p className="text-sm opacity-80 leading-relaxed mb-6">{error}</p>
                      <button 
                        onClick={() => setStatus(ConversionStatus.IDLE)}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-red-900/20"
                      >
                        Dismiss & Retry
                      </button>
                    </div>
                  </div>
                )}
                <OutputViewer code={outputCode} isLoading={status === ConversionStatus.LOADING} />
             </div>
             
             {/* Status Footer */}
             <div className="h-[76px] flex items-center justify-between px-6 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-md">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Operation Status</span>
                  <span className={`text-sm font-medium flex items-center gap-2 ${status === ConversionStatus.SUCCESS ? 'text-emerald-400' : status === ConversionStatus.ERROR ? 'text-red-400' : 'text-slate-300'}`}>
                     {status === ConversionStatus.IDLE && "Waiting for input"}
                     {status === ConversionStatus.LOADING && "Gemini 3 Pro is thinking..."}
                     {status === ConversionStatus.SUCCESS && "Migration Complete"}
                     {status === ConversionStatus.ERROR && "Error Encountered"}
                  </span>
                </div>
                
                {status === ConversionStatus.SUCCESS && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>Header Injected</span>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default App;