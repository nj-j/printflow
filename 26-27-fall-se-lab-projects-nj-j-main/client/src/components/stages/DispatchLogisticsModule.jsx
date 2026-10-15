import React from 'react';
import {
  Truck,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryDispatchPlanning } from './DeliveryDispatchPlanning';
import { CustomerRejectionRefund } from './CustomerRejectionRefund';

export const DispatchLogisticsModule = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    routeJobs,
    customerRejections
  } = useApp();

  const currentSubTab = activeSubTab === 'gate_pass' ? 'route_tracking' : (activeSubTab || 'route_tracking');

  const activeRejectionsCount = customerRejections?.filter(r => r.status !== 'Closed')?.length || 0;
  const pendingJobsCount = (routeJobs || []).filter(j => !j.assigned_to_trip && j.status !== 'In-Transit' && j.status !== 'Delivered').length;

  const subTabs = [
    {
      id: 'route_tracking',
      label: 'Delivery & Dispatch Planning',
      icon: Truck,
      badge: `${pendingJobsCount} Ready`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'returns',
      label: 'Returns & Rework',
      icon: RotateCcw,
      badge: activeRejectionsCount > 0 ? `${activeRejectionsCount} Incidents` : null,
      badgeColor: 'bg-rose-100 text-rose-700'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              08
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Dispatch & Logistics</h1>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2">
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
                    <Icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-500'} />
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
      </div>

      {/* Render Active Sub-Tab View */}
      <div>
        {currentSubTab === 'route_tracking' && <DeliveryDispatchPlanning />}
        {currentSubTab === 'returns' && <CustomerRejectionRefund />}
      </div>
    </div>
  );
};
