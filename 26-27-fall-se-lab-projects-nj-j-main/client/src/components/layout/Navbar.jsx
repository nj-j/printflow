import React, { useState } from 'react';
import {
  Printer,
  Bell,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = () => {
  const {
    activeUser,
    switchUser,
    users,
    alerts,
    markAlertRead,
    clearAllAlerts,
    setActiveTab,
    resetToDefaultData,
    clearAllPipelineJobs,
    selectedDate,
    setSelectedDate,
    selectedSourceFilter,
    setSelectedSourceFilter
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const unreadAlerts = alerts.filter(a => !a.is_read);

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-40 px-4 flex items-center justify-between shadow-sm">
      {/* Brand & System Identity */}
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => setActiveTab('owner_dashboard')}
          title="Impress MIS Master Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-[#002b41] flex items-center justify-center text-white shadow-sm font-bold shrink-0">
            <Printer size={18} className="text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-base text-[#002b41] tracking-tight">JOSCO</span>
            <span className="font-bold text-base text-slate-500 tracking-wider">PRINTERS</span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold ml-2 border-l border-slate-300 pl-2 hidden sm:inline">
              PRINTFLOW ERP
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Date, Source, Notifications, User Role */}
      <div className="flex items-center gap-2.5">
        {/* Date Filter / Today's Date */}
        <div
          className="relative hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 font-mono transition shadow-2xs cursor-pointer group"
          title={`Today: ${selectedDate} (Click to change date)`}
        >
          <Calendar size={13} className="text-slate-500 pointer-events-none group-hover:text-blue-600 transition" />
          <span className="pointer-events-none select-none">{selectedDate}</span>
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Change Date"
            onChange={(e) => {
              if (e.target.value) {
                const [y, m, d] = e.target.value.split('-');
                setSelectedDate(`${d}-${m}-${y}`);
              }
            }}
          />
        </div>

        {/* Source Dropdown */}
        <div className="relative hidden sm:block">
          <select
            value={selectedSourceFilter}
            onChange={(e) => setSelectedSourceFilter(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded pl-2.5 pr-7 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All Sources">All Sources</option>
            <option value="Walk-in">Walk - in</option>
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Mail">Mail</option>
          </select>
          <ChevronDown size={12} className="text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center transition relative"
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            title="System Alerts & Notifications"
          >
            <Bell size={15} />
            {unreadAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                {unreadAlerts.length}
              </span>
            )}
          </button>

          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800">System Alerts & Radar</span>
                <button
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                  onClick={clearAllAlerts}
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {alerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No active alerts.</div>
                ) : (
                  alerts.slice(0, 8).map(alert => (
                    <div
                      key={alert.id}
                      className={`p-2.5 text-xs hover:bg-slate-50 cursor-pointer transition ${alert.is_read ? 'opacity-60' : 'bg-blue-50/20'}`}
                      onClick={() => markAlertRead(alert.id)}
                    >
                      <div className="text-slate-800 font-medium text-[11px]">{alert.message}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Simulator */}
        <div className="relative">
          <button
            className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 transition"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            title="Simulate Role & Terminal View"
          >
            <span className="font-bold font-mono text-[10px] text-[#002b41] bg-slate-200 px-1.5 py-0.5 rounded">
              {activeUser.avatar || 'USR'}
            </span>
            <span className="font-medium text-xs hidden md:inline">{activeUser.full_name.split(' ')[0]}</span>
            <span className="text-[10px] font-mono text-slate-400 hidden lg:inline">({activeUser.role_code})</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 py-1 border-b border-slate-100 mb-1">
                Simulate Role & Terminal View
              </div>
              {users.map(u => (
                <div
                  key={u.id}
                  className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition ${activeUser.id === u.id ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  onClick={() => {
                    switchUser(u.id);
                    setShowRoleMenu(false);
                  }}
                >
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#002b41]">
                    {u.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-[11px]">{u.full_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.role_code} Terminal</div>
                  </div>
                  {activeUser.id === u.id && <CheckCircle size={14} className="text-blue-600 shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load Mock Data */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
          onClick={() => {
            if (window.confirm('Load complete mock data across all stages and modules for screenshots?')) {
              resetToDefaultData();
            }
          }}
          title="Populate all modules with realistic mock data for testing & screenshots"
        >
          <Sparkles size={13} className="text-blue-600" />
          <span className="hidden md:inline">Load Mock Data</span>
        </button>

        {/* Start Fresh / Clear Pipeline Button */}
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs"
          onClick={() => {
            if (window.confirm('Clear all jobs across all stages and start fresh? All customer directory, press machines, and material inventory will be preserved.')) {
              clearAllPipelineJobs();
            }
          }}
          title="Clear all active jobs across all stages and start with a clean pipeline"
        >
          <RotateCcw size={13} className="text-rose-600" />
          <span className="hidden md:inline">Start Fresh</span>
        </button>
      </div>
    </header>
  );
};
