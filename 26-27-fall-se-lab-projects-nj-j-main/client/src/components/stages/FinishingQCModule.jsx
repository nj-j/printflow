import React from 'react';
import {
  Scissors,
  Building2,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinishingOperations } from './FinishingOperations';
import { AssociateOutsourcing } from './AssociateOutsourcing';
import { FinishingQC } from './FinishingQC';

export const FinishingQCModule = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    finishingOps,
    associates,
    outsourceChallans,
    jobOrders,
    issues
  } = useApp();

  const currentSubTab = activeSubTab || 'bindery';

  const activeFinishingCount = finishingOps.filter(f => f.status !== 'Completed').length;
  const activeChallansCount = outsourceChallans.filter(c => c.status !== 'Received').length;
  const inQcCount = jobOrders.filter(j => j.current_stage === 'FinishingQC').length;

  const subTabs = [
    {
      id: 'bindery',
      label: 'Bindery Operations',
      icon: Scissors,
      badge: activeFinishingCount > 0 ? `${activeFinishingCount} Active` : null,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'outsourced',
      label: 'Outsourced Job-Work',
      icon: Building2,
      badge: activeChallansCount > 0 ? `${activeChallansCount} Challans` : `${associates.length} Vendors`,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'qc_inspection',
      label: 'QC Inspection',
      icon: ShieldCheck,
      badge: inQcCount > 0 ? `${inQcCount} In QC` : null,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              05
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Finishing & Quality Control</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Consolidated Suite
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Post-press bindery operations, external vendor job-work handovers, and final pre-dispatch QC clearance
              </p>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
            {subTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Active Sub-Tab View */}
      <div>
        {currentSubTab === 'outsourced' ? (
          <AssociateOutsourcing />
        ) : currentSubTab === 'qc_inspection' ? (
          <FinishingQC />
        ) : (
          <FinishingOperations />
        )}
      </div>
    </div>
  );
};
