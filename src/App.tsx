import React, { useState } from 'react';
import BB84Simulation from './components/BB84Simulation';
import EncryptionDemo from './components/EncryptionDemo';
import History from './components/History';
import { Shield, LockKeyhole, Database } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'simulation' | 'encryption' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('simulation');
  const [aesKey, setAesKey] = useState<string>('');

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500 font-mono flex flex-col border-8 border-slate-900 selection:bg-emerald-900 selection:text-emerald-100 overflow-x-hidden p-6 box-border">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 border-b border-emerald-900/50 pb-4">
        <div></div>
        
        <nav className="flex gap-4 text-xs items-center font-bold">
          <button
            onClick={() => setActiveTab('simulation')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 transition-all rounded-sm",
              activeTab === 'simulation' 
                ? "bg-slate-900 border border-emerald-900/50 text-emerald-500 border-b-emerald-500" 
                : "text-emerald-800 hover:text-emerald-500 hover:bg-slate-900/50 border border-transparent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", activeTab === 'simulation' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-emerald-900")}></span>
            GIAO THỨC BB84
          </button>
          <button
            onClick={() => setActiveTab('encryption')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 transition-all rounded-sm",
              activeTab === 'encryption' 
                ? "bg-slate-900 border border-emerald-900/50 text-emerald-500 border-b-emerald-500" 
                : "text-emerald-800 hover:text-emerald-500 hover:bg-slate-900/50 border border-transparent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", activeTab === 'encryption' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-emerald-900")}></span>
            MÃ HÓA AES
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex items-center gap-2 px-3 py-1 transition-all rounded-sm",
              activeTab === 'history' 
                ? "bg-slate-900 border border-emerald-900/50 text-emerald-500 border-b-emerald-500" 
                : "text-emerald-800 hover:text-emerald-500 hover:bg-slate-900/50 border border-transparent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", activeTab === 'history' ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-emerald-900")}></span>
            LỊCH SỬ CHẠY
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative flex-grow flex flex-col">
        <div className="relative z-10 flex flex-col flex-grow">
          <div className={cn("animate-in fade-in duration-300 flex flex-col flex-grow", activeTab === 'simulation' ? 'flex' : 'hidden')}>
            <BB84Simulation onSimulationComplete={setAesKey} />
          </div>
          
          <div className={cn("animate-in fade-in duration-300 flex flex-col flex-grow", activeTab === 'encryption' ? 'flex' : 'hidden')}>
            <EncryptionDemo aesKey={aesKey} />
          </div>

          <div className={cn("animate-in fade-in duration-300 flex flex-col flex-grow", activeTab === 'history' ? 'flex' : 'hidden')}>
            <History />
          </div>
        </div>
      </main>
    </div>
  );
}
