import React from 'react';
import {
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Layers,
  PhoneCall,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MasterDataConfig = () => {
  const { masterData } = useApp();

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Master Data & Workflow Configuration Module
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Centralized configuration for customer types, enquiry channels, machine routes, payment rules, and approval matrices
          </p>
        </div>
      </div>

      {/* Grid of Masters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer Types */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Customer Type Master
          </h3>
          <div className="space-y-1.5 pt-1">
            {masterData.customer_types?.map(ct => (
              <div key={ct} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold">{ct}</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enquiry Sources */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Enquiry Source Master
          </h3>
          <div className="space-y-1.5 pt-1">
            {masterData.enquiry_sources?.map(src => (
              <div key={src} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold">{src}</span>
                <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">Channel</span>
              </div>
            ))}
          </div>
        </div>

        {/* Production Processes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Production Process Master
          </h3>
          <div className="space-y-1.5 pt-1">
            {masterData.production_processes?.map(proc => (
              <div key={proc} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold">{proc}</span>
                <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">Workcenter</span>
              </div>
            ))}
          </div>
        </div>

        {/* Artwork Types */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Artwork Type Master
          </h3>
          <div className="space-y-1.5 pt-1">
            {masterData.artwork_types?.map(art => (
              <div key={art} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-[11px]">{art}</span>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">Prepress</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Modes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Delivery Mode Master
          </h3>
          <div className="space-y-1.5 pt-1">
            {masterData.delivery_modes?.map(dm => (
              <div key={dm} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold">{dm}</span>
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">Dispatch</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Rules & Control Gates */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <h3 className="font-bold text-xs uppercase text-slate-800 font-mono border-b border-slate-100 pb-1">
            Payment & Gate Policy
          </h3>
          <div className="space-y-1.5 pt-1 text-[11px] font-mono text-slate-700">
            <div className="flex justify-between p-1 bg-slate-50 rounded">
              <span>Mandatory Booking Advance:</span>
              <b>{masterData.payment_rules?.default_advance_percent}% Gate</b>
            </div>
            <div className="flex justify-between p-1 bg-slate-50 rounded">
              <span>Delivery Release Gate:</span>
              <b>{masterData.payment_rules?.full_payment_gate_percent}% or Credit</b>
            </div>
            <div className="flex justify-between p-1 bg-slate-50 rounded">
              <span>Credit Bill Allowed For:</span>
              <b>Corporate & Reseller</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
