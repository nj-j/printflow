import React, { useState, useMemo } from 'react';
import {
  Radar,
  Bell,
  CheckCircle2,
  Clock,
  Layers,
  Truck,
  Flame,
  ArrowRightCircle,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Check,
  Package,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationAutomation = () => {
  const {
    alerts = [],
    markAlertRead,
    clearAllAlerts,
    jobOrders = [],
    setSelectedJobForModal
  } = useApp();

  const [alertCategoryFilter, setAlertCategoryFilter] = useState('all'); // 'all', 'unread', 'progression', 'delivery', 'critical'
  const [alertSearchQuery, setAlertSearchQuery] = useState('');

  // Extract job identifier from alert message text
  const extractJobIdentifier = (message) => {
    if (!message) return null;
    const match = message.match(/(SO-\d{4}-\w+|JT-\d{4}-\w+|job-\w+)/i);
    return match ? match[0] : null;
  };

  // Determine category and icon for each alert
  const getAlertCategoryMeta = (alert) => {
    const type = alert.alert_type || '';
    const msg = (alert.message || '').toLowerCase();

    if (type === 'DeliveryAlert' || msg.includes('delivery') || msg.includes('delivered') || msg.includes('dispatch') || msg.includes('trip')) {
      return {
        key: 'delivery',
        label: 'Delivery & Dispatch',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Truck,
        iconColor: 'text-emerald-600',
        bgPill: 'bg-emerald-100/60'
      };
    }
    if (type === 'RushOrderAlert' || alert.severity === 'Critical' || msg.includes('rush') || msg.includes('urgent') || msg.includes('fast-track')) {
      return {
        key: 'critical',
        label: 'Rush & Critical',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: Flame,
        iconColor: 'text-rose-600',
        bgPill: 'bg-rose-100/60'
      };
    }
    if (type === 'StockAlert' || msg.includes('stock') || msg.includes('goods received') || msg.includes('material')) {
      return {
        key: 'stock',
        label: 'Stock & Inventory',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: Package,
        iconColor: 'text-amber-600',
        bgPill: 'bg-amber-100/60'
      };
    }
    if (msg.includes('stage progression') || msg.includes('moved to') || msg.includes('stage') || type === 'TaskAlert') {
      return {
        key: 'progression',
        label: 'Stage Progression',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: ArrowRightCircle,
        iconColor: 'text-blue-600',
        bgPill: 'bg-blue-100/60'
      };
    }
    return {
      key: 'system',
      label: 'System Telemetry',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Activity,
      iconColor: 'text-purple-600',
      bgPill: 'bg-purple-100/60'
    };
  };

  // Filtered Alerts calculation
  const filteredAlerts = useMemo(() => {
    return (alerts || []).filter(alert => {
      const meta = getAlertCategoryMeta(alert);

      // Category filter
      if (alertCategoryFilter === 'unread' && alert.is_read) return false;
      if (alertCategoryFilter === 'progression' && meta.key !== 'progression') return false;
      if (alertCategoryFilter === 'delivery' && meta.key !== 'delivery') return false;
      if (alertCategoryFilter === 'critical' && meta.key !== 'critical') return false;

      // Text search
      if (alertSearchQuery.trim()) {
        const query = alertSearchQuery.toLowerCase();
        const matchesMsg = (alert.message || '').toLowerCase().includes(query);
        const matchesCategory = meta.label.toLowerCase().includes(query);
        if (!matchesMsg && !matchesCategory) return false;
      }

      return true;
    });
  }, [alerts, alertCategoryFilter, alertSearchQuery]);

  const unreadAlertsCount = (alerts || []).filter(a => !a.is_read).length;
  const progressionAlertsCount = (alerts || []).filter(a => {
    const meta = getAlertCategoryMeta(a);
    return meta.key === 'progression';
  }).length;
  const deliveryAlertsCount = (alerts || []).filter(a => {
    const meta = getAlertCategoryMeta(a);
    return meta.key === 'delivery';
  }).length;
  const criticalAlertsCount = (alerts || []).filter(a => {
    const meta = getAlertCategoryMeta(a);
    return meta.key === 'critical';
  }).length;

  const formatAlertTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const d = new Date(timestamp);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (isToday) return timeStr;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
    } catch (e) {
      return String(timestamp);
    }
  };

  const handleOpenJobTicket = (jobId) => {
    if (!jobId) return;
    const matched = (jobOrders || []).find(j =>
      j.job_ticket_number === jobId ||
      j.id === jobId ||
      (j.dn_no && `SO-2026-${j.dn_no}` === jobId)
    );
    if (matched) {
      setSelectedJobForModal(matched);
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Module Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#002b41] text-white flex items-center justify-center font-bold shadow-xs">
              <Radar size={20} className="text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  System Alerts & Radar
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  RADAR ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Live operational event radar, real-time stage progression telemetry & logistics updates across all plant terminals
              </p>
            </div>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={clearAllAlerts}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Mark all radar alerts as read"
          >
            <Check size={13} />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Full-Width System Alerts & Radar Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute"></span>
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 tracking-tight">System Alerts & Radar Feed</span>
              <span className="ml-2 px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-slate-200/80 text-slate-700 font-semibold">
                {filteredAlerts.length} Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={clearAllAlerts}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold transition cursor-pointer hover:underline"
            >
              Mark all read
            </button>
          </div>
        </div>

        {/* Quick Filter Toolbar & Search */}
        <div className="p-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setAlertCategoryFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition cursor-pointer ${
                alertCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setAlertCategoryFilter('unread')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition cursor-pointer ${
                alertCategoryFilter === 'unread'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({unreadAlertsCount})
            </button>
            <button
              onClick={() => setAlertCategoryFilter('progression')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition cursor-pointer ${
                alertCategoryFilter === 'progression'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Stage Progression ({progressionAlertsCount})
            </button>
            <button
              onClick={() => setAlertCategoryFilter('delivery')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition cursor-pointer ${
                alertCategoryFilter === 'delivery'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Delivery ({deliveryAlertsCount})
            </button>
            {criticalAlertsCount > 0 && (
              <button
                onClick={() => setAlertCategoryFilter('critical')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition cursor-pointer ${
                  alertCategoryFilter === 'critical'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Critical ({criticalAlertsCount})
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              type="text"
              value={alertSearchQuery}
              onChange={(e) => setAlertSearchQuery(e.target.value)}
              placeholder="Search radar by job # or event..."
              className="w-full pl-8 pr-2.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Alert List */}
        <div className="overflow-y-auto divide-y divide-slate-100 max-h-[680px]">
          {filteredAlerts.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>
              <div className="font-bold text-slate-700 text-sm">All Radar Clear</div>
              <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No active system alerts match the selected filter. As jobs progress through production, finishing, QC, and dispatch, live telemetry notifications will appear here.
              </div>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const meta = getAlertCategoryMeta(alert);
              const Icon = meta.icon;
              const jobId = extractJobIdentifier(alert.message);

              return (
                <div
                  key={alert.id}
                  onClick={() => markAlertRead(alert.id)}
                  className={`p-3.5 text-xs transition cursor-pointer flex items-start gap-3.5 group ${
                    !alert.is_read
                      ? 'bg-blue-50/30 hover:bg-blue-50/60 border-l-3 border-blue-500'
                      : 'hover:bg-slate-50/80 opacity-75'
                  }`}
                >
                  {/* Category Icon */}
                  <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${meta.bgPill}`}>
                    <Icon size={16} className={meta.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        {!alert.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {formatAlertTime(alert.timestamp)}
                      </span>
                    </div>

                    <div className="text-slate-800 font-medium text-[11px] leading-relaxed break-words">
                      {alert.message}
                    </div>

                    {/* Interactive Job Link & Actions */}
                    <div className="flex items-center gap-3 pt-0.5">
                      {jobId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenJobTicket(jobId);
                          }}
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-0.5 rounded shadow-2xs hover:bg-blue-50 transition"
                          title="Open Job Ticket Modal"
                        >
                          <span>{jobId}</span>
                          <ExternalLink size={10} />
                        </button>
                      )}

                      {!alert.is_read ? (
                        <span className="text-[10px] text-blue-600 font-mono font-medium flex items-center gap-1">
                          Unread
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Check size={11} className="text-slate-400" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Radar Telemetry: Real-time event listener active</span>
          </div>
          <span>Showing {filteredAlerts.length} of {alerts.length} events</span>
        </div>
      </div>
    </div>
  );
};