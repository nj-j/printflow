import React, { useState } from 'react';
import {
  Star,
  RefreshCw,
  Clock,
  Calendar,
  Crosshair,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Monitor,
  Printer,
  Truck,
  IndianRupee,
  Search,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OwnerViewDashboard = () => {
  const { setActiveTab } = useApp();
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'red', 'scan', 'weekly'
  const [selectedBranch, setSelectedBranch] = useState('Main Branch');
  const [showAskWhyModal, setShowAskWhyModal] = useState(false);

  const getStatusDot = (status) => {
    switch (status) {
      case 'success':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block" title="On Track"></span>;
      case 'warning':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 inline-block" title="Attention Required"></span>;
      case 'danger':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 inline-block animate-pulse" title="Action Needed"></span>;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0 inline-block"></span>;
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Top Owner Header Bar (Exact Page 10) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#002b41] flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-xs font-mono">MIS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Master Dashboard - Owner View</h1>
              <Star size={14} className="text-amber-400 fill-amber-400 cursor-pointer" />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">One page. One glance. Complete control.</p>
          </div>
        </div>

        {/* Date Range & Branch Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
            <Calendar size={13} className="text-slate-400" />
            <span>19 May 2025 - 25 May 2025</span>
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option>Main Branch</option>
            <option>Plant #01 - Ramamurthy Nagar</option>
            <option>Plant #02 - Byrathi</option>
                  <option>Plant #03 - Kalkere</option>
          </select>

          <button
            onClick={() => setFilterMode('all')}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Summary Bar & Quick Review Modes */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'all' ? 'bg-slate-100 border-slate-400 font-bold' : 'bg-slate-50 border-slate-200'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-bold uppercase text-[10px]">On Track:</span>
            <span className="font-bold text-slate-900">27 Metrics</span>
          </div>

          <div
            onClick={() => setFilterMode('warning')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'warning' ? 'bg-amber-50 border-amber-400 font-bold' : 'bg-slate-50 border-slate-200'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-700 font-bold uppercase text-[10px]">Attention:</span>
            <span className="font-bold text-slate-900">11 Metrics</span>
          </div>

          <div
            onClick={() => setFilterMode('red')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'red' ? 'bg-rose-50 border-rose-400 font-bold ring-1 ring-rose-400' : 'bg-slate-50 border-slate-200'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-rose-700 font-bold uppercase text-[10px]">Action Needed:</span>
            <span className="font-bold text-slate-900">8 Metrics</span>
          </div>
        </div>

        {/* Quick Review Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode('scan')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${filterMode === 'scan' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
          >
            <Clock size={13} className={filterMode === 'scan' ? 'text-white' : 'text-slate-500'} />
            <span>Daily Scan <span className="text-[10px] opacity-75">(10-15 min)</span></span>
          </button>

          <button
            onClick={() => setFilterMode('weekly')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${filterMode === 'weekly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
          >
            <Calendar size={13} className={filterMode === 'weekly' ? 'text-white' : 'text-slate-500'} />
            <span>Weekly Deep Review <span className="text-[10px] opacity-75">(30-45 min)</span></span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'red' ? 'all' : 'red')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${filterMode === 'red' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
          >
            <Crosshair size={13} />
            <span>Focus on Red</span>
          </button>

          <button
            onClick={() => setShowAskWhyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
          >
            <HelpCircle size={13} className="text-slate-500" />
            <span>Ask Why</span>
          </button>
        </div>
      </div>

      {/* 5 Department Dashboard Cards (Exact Page 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Order Desk Dashboard */}
        <div className={`bg-white rounded-xl border ${filterMode === 'red' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Users size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">1. ORDER DESK DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Order Desk Lead</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-amber-300 font-bold">
              Stage 01
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                Daily Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">New enquiries</td>
                    <td className="py-1 text-center font-mono text-slate-500">10</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">12</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Quotes sent</td>
                    <td className="py-1 text-center font-mono text-slate-500">8</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">9</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr className={filterMode === 'red' ? 'bg-amber-50/50' : ''}>
                    <td className="py-1">Orders confirmed</td>
                    <td className="py-1 text-center font-mono text-slate-500">5</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">4</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Pending enquiries &gt;24 hrs</td>
                    <td className="py-1 text-center font-mono text-rose-600">0</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700">2</td>
                    <td className="py-1 text-right">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Customer complaints</td>
                    <td className="py-1 text-center font-mono text-slate-500">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">0</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Conversion trend</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&gt;= 20%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">18%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Missed follow-up</td>
                    <td className="py-1 text-center font-mono text-rose-600 w-16">0</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700 w-16">3</td>
                    <td className="py-1 text-right w-6">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Repeat customers</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">Increase</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">-</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('enquiry')}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Prepress Dashboard */}
        <div className={`bg-white rounded-xl border ${filterMode === 'red' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-4 py-2.5 bg-cyan-500/10 border-b border-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
                <Monitor size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">2. PREPRESS DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Prepress Lead</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-cyan-300 font-bold">
              Stage 05
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                Daily Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Files received</td>
                    <td className="py-1 text-center font-mono text-slate-500">15</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">17</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Files processed</td>
                    <td className="py-1 text-center font-mono text-slate-500">15</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">14</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Files pending</td>
                    <td className="py-1 text-center font-mono text-slate-500">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">3</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Errors / reworks identified</td>
                    <td className="py-1 text-center font-mono text-rose-600">0</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700">1</td>
                    <td className="py-1 text-right">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Urgent jobs handled</td>
                    <td className="py-1 text-center font-mono text-slate-500">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">1</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Error rate</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&lt;= 2%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">1.8%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Avg processing time</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">2 hrs</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">2.5 hrs</td>
                    <td className="py-1 text-right w-6">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Rework source identified</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">-</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">Yes</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('prepress')}
                className="text-cyan-700 hover:text-cyan-900 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Production Dashboard */}
        <div className={`bg-white rounded-xl border ${filterMode === 'red' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Printer size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">3. PRODUCTION DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Production Supervisor</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-emerald-300 font-bold">
              Stage 07
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                Daily Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Jobs scheduled</td>
                    <td className="py-1 text-center font-mono text-slate-500">20</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">22</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Jobs completed</td>
                    <td className="py-1 text-center font-mono text-slate-500">18</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">16</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Delayed jobs</td>
                    <td className="py-1 text-center font-mono text-rose-600">0</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700">2</td>
                    <td className="py-1 text-right">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Machine downtime</td>
                    <td className="py-1 text-center font-mono text-slate-500">&lt;= 2%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">1.5%</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Labour utilisation</td>
                    <td className="py-1 text-center font-mono text-slate-500">&gt;= 75%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">72%</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">On-time production %</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&gt;= 90%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">88%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Output vs capacity</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&gt;= 95%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">96%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Quality reworks %</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&lt;= 2%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">1.2%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('press_terminal')}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Dispatch Dashboard */}
        <div className={`bg-white rounded-xl border ${filterMode === 'red' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-4 py-2.5 bg-orange-500/10 border-b border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                <Truck size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">4. DISPATCH DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Dispatch In-charge</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-orange-300 font-bold">
              Stage 14
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                Daily Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Jobs ready for dispatch</td>
                    <td className="py-1 text-center font-mono text-slate-500">8</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">9</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Jobs dispatched</td>
                    <td className="py-1 text-center font-mono text-slate-500">8</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">7</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Pending dispatch</td>
                    <td className="py-1 text-center font-mono text-slate-500">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">2</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Delivery delays</td>
                    <td className="py-1 text-center font-mono text-rose-600">0</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700">1</td>
                    <td className="py-1 text-right">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Wrong deliveries</td>
                    <td className="py-1 text-center font-mono text-slate-500">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">0</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">On-time delivery %</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&gt;= 95%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">93%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Delivery complaints</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">0</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">1</td>
                    <td className="py-1 text-right w-6">{getStatusDot('warning')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Damage / loss %</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-16">&lt;= 1%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">0.5%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('dispatch')}
                className="text-orange-700 hover:text-orange-900 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Accounts Dashboard */}
        <div className={`bg-white rounded-xl border ${filterMode === 'red' ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
          <div className="px-4 py-2.5 bg-blue-600/10 border-b border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <IndianRupee size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">5. ACCOUNTS DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Accountant</span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-blue-300 font-bold">
              Stage 13
            </span>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5">
                Daily Metrics (Quick Check)
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-20">Target / Expected</th>
                    <th className="pb-1 text-center font-normal w-20">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-1">Payment received</td>
                    <td className="py-1 text-center font-mono text-slate-500">Amount</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">₹ 3.00 L</td>
                    <td className="py-1 text-right">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Pending collection</td>
                    <td className="py-1 text-center font-mono text-slate-500">List</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900">₹ 4.35 L</td>
                    <td className="py-1 text-right">{getStatusDot('warning')}</td>
                  </tr>
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Urgent follow-ups</td>
                    <td className="py-1 text-center font-mono text-rose-600">Highlight</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700">2</td>
                    <td className="py-1 text-right">{getStatusDot('danger')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr className="bg-rose-50/70 font-semibold text-rose-900">
                    <td className="py-1 text-rose-800">Outstanding &gt;30 days</td>
                    <td className="py-1 text-center font-mono text-rose-600 w-24">&lt;= ₹ 2.00 L</td>
                    <td className="py-1 text-center font-mono font-bold text-rose-700 w-24">₹ 2.75 L</td>
                    <td className="py-1 text-right w-6">{getStatusDot('danger')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Cash flow status</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-24">Positive</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-24">Positive</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Bank reconciliation</td>
                    <td className="py-1 text-center font-mono text-slate-500 w-24">100%</td>
                    <td className="py-1 text-center font-mono font-bold text-slate-900 w-24">100%</td>
                    <td className="py-1 text-right w-6">{getStatusDot('success')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('billing')}
                className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1 transition"
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Why Interactive Root Cause Modal */}
      {showAskWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-300 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <HelpCircle size={18} />
                <span>Executive RCA: 'Ask Why' Root Cause Diagnosis</span>
              </div>
              <button
                onClick={() => setShowAskWhyModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5">
                <div className="font-bold text-rose-900 text-xs">Critical Exception 1: Delayed Jobs (2 Jobs Behind Schedule)</div>
                <div className="text-[11px] text-rose-800">
                  • <b>Why #1:</b> Ryobi 660 had make-ready delay on 4-color job.<br/>
                  • <b>Why #2:</b> CTP plate #3 had pinhole oxidation requiring re-burn.<br/>
                  • <b>Countermeasure:</b> Chemical temperature sensor recalibrated; plate backup made.
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                <div className="font-bold text-amber-900 text-xs">Critical Exception 2: Outstanding &gt;30 Days (₹ 2.75 L vs ₹ 2.00 L Target)</div>
                <div className="text-[11px] text-amber-800">
                  • <b>Why:</b> Horizon EduTech publishing textbook run credit period elapsed.<br/>
                  • <b>Countermeasure:</b> Dispatch hold active on Job #JT-2026-003 until accounts clearing.
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowAskWhyModal(false)}
                className="bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold text-xs px-4 py-1.5 rounded-lg"
              >
                Close RCA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
