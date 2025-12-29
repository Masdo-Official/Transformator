import React from 'react';
import { Terminal, ShieldCheck, Code2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30">
            <Terminal className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              CJS <span className="text-indigo-500">→</span> ESM <span className="text-slate-500 text-sm font-normal">Migrator</span>
            </h1>
            <p className="text-xs text-slate-400">Powered by Gemini 3 Pro</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Logic Preserved</span>
          </div>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span>Strict Syntax</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;