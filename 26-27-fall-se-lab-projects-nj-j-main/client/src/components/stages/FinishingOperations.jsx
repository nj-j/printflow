import React, { useState } from 'react';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  AlertTriangle,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinishingOperations = () => {
  const { finishingOps, updateFinishingOp, setActiveTab } = useApp();

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Finishing Operations Module
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Cutting, folding, lamination, binding, punching, and subcontract finishing tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('qc_packing')}
            className="px-3 py-1.5 bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold rounded-lg text-xs shadow-xs transition"
          >
            Handoff to QC & Packing
          </button>
        </div>
      </div>

      {/* Gate 6 Banner */}
      <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <span><b>[Gate 6 Enforced]:</b> Finishing stages must complete quality defect inspection before dispatch readiness and delivery challan issuance.</span>
        </div>
        <span className="font-mono text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-bold">Gate 6 Active</span>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="font-bold text-xs text-slate-800 uppercase font-mono">Active Finishing Batches</span>
          <span className="text-[11px] font-mono text-slate-500">{finishingOps.length} Operations Configured</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5">Job Ticket</th>
                <th className="p-2.5">Activity Type</th>
                <th className="p-2.5">Workcenter / Machine</th>
                <th className="p-2.5">Operator</th>
                <th className="p-2.5 text-right">Planned Qty</th>
                <th className="p-2.5 text-right">Completed Qty</th>
                <th className="p-2.5 text-right">Wastage</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {finishingOps.map(op => (
                <tr key={op.id} className="hover:bg-slate-50 transition">
                  <td className="p-2.5 font-mono font-bold text-slate-900">{op.job_ticket_number}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{op.activity_type}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">{op.workcenter}</td>
                  <td className="p-2.5 text-slate-600">{op.operator_name}</td>
                  <td className="p-2.5 text-right font-mono">{op.planned_qty.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700">{op.completed_qty.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono text-rose-600 font-bold">{op.wastage_qty}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      op.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : op.status === 'In-Progress'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    {op.status !== 'Completed' ? (
                      <button
                        onClick={() => {
                          updateFinishingOp(op.id, { status: 'Completed', completed_qty: op.planned_qty });
                          alert(`Finishing for ${op.job_ticket_number} marked completed.`);
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-xs transition"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">Passed QC Gate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
