import React from 'react';
import {
  BarChart3,
  Radar,
  Sparkles,
  Layers,
  Bell,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OwnerViewDashboard } from './OwnerViewDashboard';
import { NotificationAutomation } from './NotificationAutomation';

export const AdminAnalyticsModule = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    notificationsLog,
    alerts = []
  } = useApp();

  const currentSubTab = activeSubTab === 'config' ? 'executive_oee' : (activeSubTab || 'executive_oee');
  const unreadAlertsCount = (alerts || []).filter(a => !a.is_read).length;

  const subTabs = [
    {
      id: 'executive_oee',
      label: 'Executive Dashboard (OEE)',
      icon: BarChart3,
      badge: 'Owner',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'notifications',
      label: 'System Alerts & Radar',
      icon: Radar,
      badge: unreadAlertsCount > 0 ? `${unreadAlertsCount} Unread` : `${alerts.length} Events`,
      badgeColor: unreadAlertsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-700'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              10
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Admin & Analytics</h1>
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
                  <Icon size={14} className={isActive ? 'text-purple-600' : 'text-slate-500'} />
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
        {currentSubTab === 'notifications' ? (
          <NotificationAutomation />
        ) : (
          <OwnerViewDashboard />
        )}
      </div>
    </div>
  );
};
