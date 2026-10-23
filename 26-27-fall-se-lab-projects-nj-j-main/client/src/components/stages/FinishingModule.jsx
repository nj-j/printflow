import React from 'react';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinishingOperations } from './FinishingOperations';

export const FinishingModule = () => {
  const {
    finishingOps = [],
    setActiveTab
  } = useApp();

  const activeFinishingCount = finishingOps.filter(f => f.status !== 'Completed').length;

  return (
    <div className="space-y-3">
      {/* Module Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              05
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Finishing & Bindery</h1>
                <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeFinishingCount > 0 ? `${activeFinishingCount} Active Operations` : `${finishingOps.length} Operations`}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Cutting, lamination, folding, die-punching & book binding terminal</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('qc')}
            className="px-3 py-1.5 bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
            title="Proceed to Quality Control Stage"
          >
            <span>Handoff to QC</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Render Active View */}
      <div>
        <FinishingOperations />
      </div>
    </div>
  );
};
