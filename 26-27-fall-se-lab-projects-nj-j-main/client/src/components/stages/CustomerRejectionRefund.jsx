import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  DollarSign,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerRejectionRefund = () => {
  const { customerRejections, updateCustomerRejection } = useApp();

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Customer Review, Rejection, Replacement & Refund Module
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Customer defect complaints, root cause investigation, replacement job cards, and refund approval workflow
          </p>
        </div>
      </div>

      {/* Rejections Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase font-mono">Logged Rejections & Exception Cases</span>
          <span className="text-[11px] font-mono text-slate-500">{customerRejections.length} Active Incidents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5">Rejection No</th>
                <th className="p-2.5">Job & Invoice</th>
                <th className="p-2.5">Customer</th>
                <th className="p-2.5">Reason & Evidence</th>
                <th className="p-2.5">Responsible Dept</th>
                <th className="p-2.5 text-center">Resolution</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {customerRejections.map(rej => (
                <tr key={rej.id} className="hover:bg-slate-50 transition">
                  <td className="p-2.5 font-mono font-bold text-rose-700">{rej.rejection_number}</td>
                  <td className="p-2.5">
                    <div className="font-mono font-bold text-slate-900">{rej.job_ticket_number}</div>
                    <div className="text-[10px] font-mono text-slate-400">{rej.invoice_number}</div>
                  </td>
                  <td className="p-2.5 font-semibold text-slate-800">{rej.customer_name}</td>
                  <td className="p-2.5 max-w-xs">
                    <div className="font-bold text-slate-900 text-[11px]">{rej.rejection_reason}</div>
                    <div className="text-[10px] text-slate-500 truncate">{rej.evidence_notes}</div>
                  </td>
                  <td className="p-2.5 text-[11px] text-slate-600 font-mono">{rej.responsible_department}</td>
                  <td className="p-2.5 text-center">
                    {rej.decision === 'Replace' ? (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                        Replacement: {rej.replacement_job_ticket}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[10px]">
                        Refund: ₹ {rej.refund_amount}
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      rej.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {rej.status}
                    </span>
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
