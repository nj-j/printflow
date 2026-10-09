import React from 'react';
import {
  FileText,
  Inbox,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EnquiryManagement } from './EnquiryManagement';
import { SalesOrderBooking } from './SalesOrderBooking';

export const CommercialDesk = () => {
  const {
    activeSubTab,
    setActiveSubTab,
    enquiries,
    quotes,
    salesBookings
  } = useApp();

  const isBooking = activeSubTab === 'booking' || activeSubTab === 'booking_queue';
  const currentSubTab = isBooking ? 'booking' : (activeSubTab === 'costing' ? 'quotes' : (activeSubTab || 'intake'));

  // Counts
  const totalEnquiries = enquiries.length;
  const pendingQuotes = enquiries.filter(
    e => !e.amount || Number(e.amount) === 0 || e.costing_status === 'Awaiting Costing'
  ).length;
  const pendingBookingsCount = (salesBookings || []).filter(s => s.booking_status !== 'Booked').length;

  const subTabs = [
    {
      id: 'intake',
      label: 'Intake & CRM',
      icon: Inbox,
      badge: `${totalEnquiries}`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'quotes',
      label: 'Quotations',
      icon: FileText,
      badge: pendingQuotes > 0 ? `${pendingQuotes} Pending` : `${quotes.length} Quotes`,
      badgeColor: pendingQuotes > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'booking',
      label: 'Booking Queue',
      icon: FileCheck2,
      badge: pendingBookingsCount > 0 ? `${pendingBookingsCount} Pending` : `${(salesBookings || []).length} Booked`,
      badgeColor: pendingBookingsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              01
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Commercial Desk</h1>
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

      {/* Render Active Sub-Tab View */}
      <div>
        {isBooking ? (
          <SalesOrderBooking isEmbedded={true} />
        ) : (
          <EnquiryManagement />
        )}
      </div>
    </div>
  );
};
