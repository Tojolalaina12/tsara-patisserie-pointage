import React from 'react';
import { Clock, Zap, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { initStorage } from '../utils/storage';

interface DemoToolbarProps {
  simulatedTimeStr: string;
  onSetSimulatedTime: (time: string) => void;
  onResetData: () => void;
}

export const DemoToolbar: React.FC<DemoToolbarProps> = ({
  simulatedTimeStr,
  onSetSimulatedTime,
  onResetData
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 text-white backdrop-blur-md px-3 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2 max-w-full text-xs">
      <div className="flex items-center gap-1.5 shrink-0 text-amber-300 font-bold border-r border-slate-700 pr-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">Testeur Temps :</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onSetSimulatedTime('08:00')}
          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
            simulatedTimeStr === '08:00' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          08:00
        </button>

        {/* Highlight 13:00 for the user's explicit requirement */}
        <button
          onClick={() => onSetSimulatedTime('13:00')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
            simulatedTimeStr === '13:00'
              ? 'bg-amber-400 text-slate-900 shadow-md ring-2 ring-amber-300'
              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/30'
          }`}
          title="Tester le rappel de 13h00 (Nettoyage de vitrine)"
        >
          ✨ 13:00 (Vitrine)
        </button>

        <button
          onClick={() => onSetSimulatedTime('16:30')}
          className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
            simulatedTimeStr === '16:30' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          16:30
        </button>
      </div>

      <div className="border-l border-slate-700 pl-2 ml-1">
        <button
          onClick={onResetData}
          title="Réinitialiser les données démo"
          className="p-1.5 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
