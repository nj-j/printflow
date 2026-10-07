import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  ShieldCheck,
  CreditCard,
  QrCode,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SalesOrderBooking = ({ isEmbedded = false }) => {
  const {
    salesBookings,
    updateSalesBooking,
    setQrModalData,
    setActiveTab,
    activeSubTab,
    setActiveSubTab
  } = useApp();

  const currentSubTab = (activeSubTab === 'booking' || !activeSubTab || activeSubTab === 'intake' || activeSubTab === 'quotes')
    ? 'booking_queue'
    : activeSubTab;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const awaitingAdvanceCount = salesBookings.filter(s => s.booking_status === 'Awaiting Advance').length;
  const bookedCount = salesBookings.filter(b => b.booking_status === 'Booked').length;

  const filtered = salesBookings.filter(b => {
    const matchesSearch = b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase());
    if (currentSubTab === 'qr_desk') {
      return matchesSearch && b.booking_status === 'Awaiting Advance';
    }
    if (currentSubTab === 'confirmations') {
      return matchesSearch && b.booking_status === 'Booked';
    }
    const matchesStatus = statusFilter === 'All' || b.booking_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const subTabs = [
    {
      id: 'booking_queue',
      label: 'Booking Queue',
      icon: FileCheck2,
      badge: `${salesBookings.length}`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'qr_desk',
      label: 'Payment QR Desk',
      icon: QrCode,
      badge: awaitingAdvanceCount > 0 ? `${awaitingAdvanceCount} Pending 60%` : null,
      badgeColor: 'bg-indigo-100 text-indigo-700'
    },
    {
      id: 'confirmations',
      label: 'Order Confirmations',
      icon: CheckCircle2,
      badge: `${bookedCount} Confirmed`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* If embedded in Commercial Desk, render sleek sub-tabs bar without duplicate module header */}
      {isEmbedded ? (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 shadow-2xs select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">
                Order Booking Queue
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                Gate 3 Enforced
              </span>
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
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
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
      ) : (
        /* Standalone Module Header */
        <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                01
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">Order Booking</h1>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                    Commercial Desk Sub-Module
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Sales order confirmation, Dynamic 60% UPI QR advance desk, and production release gating
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
      )}

      <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">

      {/* Gate 3 Governance Alert */}
      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span><b>[Gate 3 Enforced]:</b> Production release is strictly blocked until either 60% advance is received via UPI/Bank or approved ARC contract is linked.</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Gate 3 Active</span>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search booked orders by Customer or SO No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'Booked', 'Awaiting Advance', 'Cancelled'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold transition ${
                  statusFilter === st ? 'bg-[#002b41] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5">Booking No & Date</th>
                <th className="p-2.5">Customer Name</th>
                <th className="p-2.5">PO / ARC Reference</th>
                <th className="p-2.5">Confirmation</th>
                <th className="p-2.5 text-right">Order Total</th>
                <th className="p-2.5 text-right">60% Advance Required</th>
                <th className="p-2.5 text-right">Advance Received</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="p-2.5">
                    <div className="font-mono font-bold text-slate-900">{b.booking_number}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.confirmation_date}</div>
                  </td>
                  <td className="p-2.5 font-semibold text-slate-800">{b.customer_name}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-600">
                    {b.arc_number ? (
                      <span className="text-blue-600 font-semibold">{b.arc_number} (ARC)</span>
                    ) : (
                      b.customer_po_ref || '-'
                    )}
                  </td>
                  <td className="p-2.5 text-[11px] text-slate-600">{b.confirmation_channel}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                    ₹ {b.order_total.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right font-mono font-semibold text-slate-700">
                    ₹ {b.advance_required.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                    ₹ {b.advance_received.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      b.booking_status === 'Booked'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.booking_status === 'Awaiting Advance'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {b.booking_status === 'Awaiting Advance' ? (
                        <button
                          onClick={() => {
                            setQrModalData({
                              amount: b.advance_required,
                              orderTitle: `60% Advance for SO ${b.booking_number} (${b.customer_name})`,
                              refNo: b.booking_number
                            });
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1 transition"
                        >
                          <QrCode size={12} />
                          <span>Collect 60% QR</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('prepress')}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold transition"
                        >
                          Prepress View
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
