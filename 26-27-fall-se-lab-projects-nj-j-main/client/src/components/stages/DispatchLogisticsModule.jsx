import React, { useState } from 'react';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  AlertTriangle,
  User,
  Package,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryDispatchPlanning } from './DeliveryDispatchPlanning';
import { CustomerRejectionRefund } from './CustomerRejectionRefund';

export const DispatchLogisticsModule = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    dispatchRoutes,
    routeJobs,
    vehicles,
    tripSheets,
    customerRejections,
    jobOrders
  } = useApp();

  const currentSubTab = activeSubTab || 'route_tracking';

  // Gate Pass Security Clearance State
  const [gatePasses, setGatePasses] = useState([
    {
      id: 'GP-2026-081',
      vehicle_no: 'KA 03 AB 1234',
      driver_name: 'Ramesh',
      route_name: 'Route 1: Central Business District (CBD)',
      job_count: 4,
      security_officer: 'Inspector G. Kumar',
      status: 'Cleared & Dispatched',
      timestamp: 'Today, 09:30 AM',
      seal_number: 'SEAL-JOS-9942',
      items_verified: true
    },
    {
      id: 'GP-2026-082',
      vehicle_no: 'KA 53 M 9081',
      driver_name: 'Suresh',
      route_name: 'Route 2: Whitefield & IT Corridor',
      job_count: 3,
      security_officer: 'Inspector G. Kumar',
      status: 'Cleared & Dispatched',
      timestamp: 'Today, 11:15 AM',
      seal_number: 'SEAL-JOS-9943',
      items_verified: true
    },
    {
      id: 'GP-2026-083',
      vehicle_no: 'KA 04 D 5567',
      driver_name: 'Anand',
      route_name: 'Route 3: Peenya & Industrial Hub',
      job_count: 2,
      security_officer: 'Pending Gate Inspection',
      status: 'Awaiting Gate Clearance',
      timestamp: 'Today, 02:00 PM',
      seal_number: 'SEAL-JOS-9944',
      items_verified: false
    }
  ]);

  const activeRejectionsCount = customerRejections.filter(r => r.status !== 'Closed').length;
  const pendingGatePasses = gatePasses.filter(g => g.status !== 'Cleared & Dispatched').length;

  const handleAuthorizePass = (id) => {
    setGatePasses(prev => prev.map(gp => {
      if (gp.id === id) {
        return {
          ...gp,
          status: 'Cleared & Dispatched',
          security_officer: 'Inspector G. Kumar',
          items_verified: true,
          timestamp: 'Just Now'
        };
      }
      return gp;
    }));
  };

  const subTabs = [
    {
      id: 'route_tracking',
      label: 'Route Tracking & Dispatch',
      icon: Truck,
      badge: '5 Routes',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'gate_pass',
      label: 'Gate Pass Clearance',
      icon: ShieldCheck,
      badge: pendingGatePasses > 0 ? `${pendingGatePasses} Pending` : 'All Cleared',
      badgeColor: pendingGatePasses > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
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

        {currentSubTab === 'gate_pass' && (
          <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
            {/* Gate Pass Security Dashboard */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-[#002b41]" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Plant Security Gate Pass & Vehicle Clearance Desk
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Physical security gate check-in/out, delivery vehicle box sealing, and authorized dispatch trip sheets
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-mono text-xs flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>2 Gate Passes Active Today</span>
                </div>
              </div>
            </div>

            {/* Passes Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                  Today's Authorized Gate Passes
                </span>
                <span className="text-[11px] font-mono text-slate-500">Security Gate #01 • Main Plant</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Gate Pass No</th>
                      <th className="p-3">Vehicle & Driver</th>
                      <th className="p-3">Delivery Route</th>
                      <th className="p-3">Consignments</th>
                      <th className="p-3">Security Seal</th>
                      <th className="p-3">Clearance Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {gatePasses.map(gp => (
                      <tr key={gp.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-mono font-bold text-blue-700">
                          {gp.id}
                          <div className="text-[10px] text-slate-400 font-normal">{gp.timestamp}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{gp.vehicle_no}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <User size={12} /> {gp.driver_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700">{gp.route_name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono font-bold">
                            {gp.job_count} Jobs Bundled
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          <div className="font-semibold">{gp.seal_number}</div>
                          <div className="text-[10px] text-slate-400">{gp.security_officer}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            gp.status === 'Cleared & Dispatched'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {gp.status === 'Cleared & Dispatched' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {gp.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {gp.status === 'Cleared & Dispatched' ? (
                            <button
                              onClick={() => window.print()}
                              className="px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer size={12} /> Print Pass
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAuthorizePass(gp.id)}
                              className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              <ShieldCheck size={12} /> Sign & Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentSubTab === 'returns' && <CustomerRejectionRefund />}
      </div>
    </div>
  );
};
