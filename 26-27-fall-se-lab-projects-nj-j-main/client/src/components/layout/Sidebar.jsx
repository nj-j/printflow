import React from 'react';
import {
  HelpCircle,
  Palette,
  Kanban,
  Printer,
  Scissors,
  ShieldCheck,
  Boxes,
  Truck,
  Receipt,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STAGES, normalizeStage } from '../../utils/stageConstants';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    jobOrders,
    activeBranch,
    setActiveBranch,
    issues = []
  } = useApp();

  const urgentJobsCount = jobOrders.filter(
    j => (j.priority === 'Urgent' || j.is_rush_order) && normalizeStage(j.current_stage) !== STAGES.COMPLETED
  ).length;
  const openIssuesCount = (issues || []).filter(i => !i.resolved).length;

  // The 10 Consolidated ERP Modules
  const modules = [
    { id: 'commercial', num: '01', label: 'Commercial Desk', icon: HelpCircle },
    { id: 'prepress', num: '02', label: 'Prepress Studio', icon: Palette },
    { id: 'planning', num: '03', label: 'Planning & Kanban', icon: Kanban, highlight: urgentJobsCount > 0 },
    { id: 'press_terminal', num: '04', label: 'Press Terminal (MES)', icon: Printer },
    { id: 'finishing', num: '05', label: 'Finishing & Bindery', icon: Scissors },
    { id: 'qc', num: '06', label: 'Quality Control (QC)', icon: ShieldCheck, highlight: openIssuesCount > 0 },
    { id: 'inventory', num: '07', label: 'Inventory & Stores', icon: Boxes },
    { id: 'dispatch', num: '08', label: 'Dispatch & Logistics', icon: Truck },
    { id: 'billing', num: '09', label: 'Finance & Billing', icon: Receipt },
    { id: 'admin_analytics', num: '10', label: 'Admin & Analytics', icon: BarChart3 },
  ];

  const isTabActive = (modId) => {
    if (activeTab === modId) return true;
    if (modId === 'commercial' && (activeTab === 'enquiry' || activeTab === 'costing' || activeTab === 'estimator' || activeTab === 'booking')) return true;
    if (modId === 'planning' && activeTab === 'production') return true;
    if (modId === 'finishing' && (activeTab === 'finishing' || activeTab === 'associates' || activeTab === 'finishing_qc')) return true;
    if (modId === 'qc' && (activeTab === 'qc' || activeTab === 'qc_packing' || activeTab === 'qc_inspection')) return true;
    if (modId === 'inventory' && activeTab === 'procurement') return true;
    if (modId === 'dispatch' && activeTab === 'rejections') return true;
    if (modId === 'admin_analytics' && (activeTab === 'owner_dashboard' || activeTab === 'dashboard' || activeTab === 'notifications' || activeTab === 'config')) return true;
    return false;
  };

  return (
    <aside className="w-56 bg-[#001523] text-slate-300 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 border-r border-slate-800 shrink-0 select-none shadow-md">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-800 bg-[#00101b]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white tracking-wide text-xs uppercase font-mono">
            Navigation
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-medium">Josco Production Rail</div>
      </div>

      {/* Scrollable Stage Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 text-xs font-medium custom-scrollbar">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = isTabActive(m.id);

          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-left group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <span
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {m.num}
                </span>
                <Icon size={15} className="shrink-0" />
                <span className="truncate text-xs">{m.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active Module"></span>
                )}
                {m.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Attention needed"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Plant Indicator */}
      <div className="p-3 border-t border-slate-800 bg-[#00101b] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          <span className="truncate font-mono">{activeBranch}</span>
        </div>
        <button
          onClick={() => setActiveBranch(prev => {
            if (prev.includes('Ramamurthy')) return 'Plant #02 • Byrathi';
            if (prev.includes('Byrathi')) return 'Plant #03 • Kalkere';
            return 'Plant #01 • Ramamurthy Nagar';
          })}
          className="text-[10px] font-mono text-blue-400 hover:underline shrink-0 cursor-pointer"
          title="Switch plant terminal"
        >
          Switch
        </button>
      </div>
    </aside>
  );
};
