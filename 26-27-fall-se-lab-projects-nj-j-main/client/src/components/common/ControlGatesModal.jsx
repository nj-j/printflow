import React from 'react';
import { ShieldCheck, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ControlGatesModal = () => {
  const { isControlGatesModalOpen, setIsControlGatesModalOpen, controlGates, setActiveTab } = useApp();

  if (!isControlGatesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#002b41] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight">8 End-to-End Workflow Control Gates</h2>
              <p className="text-[10px] text-slate-300 font-mono">Functional Governance Baseline from Specification Document</p>
            </div>
          </div>
          <button
            onClick={() => setIsControlGatesModalOpen(false)}
            className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gates List */}
        <div className="p-5 max-h-[75vh] overflow-y-auto divide-y divide-slate-100 space-y-3">
          {controlGates.map((gate) => (
            <div key={gate.gate_id} className="pt-3 first:pt-0 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                0{gate.gate_id}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs">{gate.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={11} /> {gate.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{gate.rule}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Responsible Module:</span>
                  <span className="text-[10px] font-semibold text-blue-600 font-mono">{gate.module}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span>All 8 control gates validated and active across production terminals.</span>
          <button
            onClick={() => setIsControlGatesModalOpen(false)}
            className="px-4 py-1.5 bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold rounded-lg text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
