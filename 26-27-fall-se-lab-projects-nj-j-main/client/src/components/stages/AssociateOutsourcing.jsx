import React, { useState } from 'react';
import {
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  FileText,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AssociateOutsourcing = () => {
  const { associates, outsourceChallans, updateOutsourceChallan } = useApp();

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Associate & Outsourced Production Management
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Specialized outsourced operations (Spot UV, Gold Foiling, Hard-case binding) with challan handover tracking
          </p>
        </div>
      </div>

      {/* Associates Directory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {associates.map(asc => (
          <div key={asc.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 truncate">{asc.associate_name}</h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                {asc.rating} ★
              </span>
            </div>
            <div className="text-[11px] text-slate-600">Contact: <b>{asc.contact_person}</b> ({asc.phone})</div>
            <div className="text-[11px] text-slate-500">Location: {asc.location}</div>
            <div className="flex flex-wrap gap-1 pt-1">
              {asc.process_types.map(p => (
                <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[9px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Challan Handover Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase font-mono">External Job Issue Challans</span>
          <span className="text-[11px] font-mono text-slate-500">{outsourceChallans.length} Active Challans</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5">Challan No</th>
                <th className="p-2.5">Job Ticket</th>
                <th className="p-2.5">Associate Partner</th>
                <th className="p-2.5">Process Description</th>
                <th className="p-2.5 text-right">Sent Qty</th>
                <th className="p-2.5 text-right">Received Qty</th>
                <th className="p-2.5 text-right">Outsource Cost</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {outsourceChallans.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-2.5 font-mono font-bold text-blue-700">{c.challan_number}</td>
                  <td className="p-2.5 font-mono font-bold text-slate-900">{c.job_ticket_number}</td>
                  <td className="p-2.5 font-semibold text-slate-800">{c.associate_name}</td>
                  <td className="p-2.5 text-slate-600 text-[11px]">{c.process_description}</td>
                  <td className="p-2.5 text-right font-mono">{c.quantity_sent}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-700">{c.quantity_received}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹ {c.outsource_cost.toLocaleString()}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      c.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {c.status}
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
