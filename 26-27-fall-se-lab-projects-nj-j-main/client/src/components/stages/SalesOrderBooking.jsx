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
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SalesOrderBooking = ({ isEmbedded = false }) => {
  const {
    salesBookings,
    recordBookingAdvance,
    setQrModalData,
    setActiveTab
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = salesBookings.filter(b => {
    const matchesSearch = b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && b.booking_status !== 'Booked';
  });

  return (
    <div className="space-y-3">
      {/* Standalone Module Header if accessed directly */}
      {!isEmbedded && (
        <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
          <div className="flex items-center gap-3 max-w-[1600px] mx-auto">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              01
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Booking Queue</h1>
              <p className="text-xs text-slate-500">
                Sales order confirmation, advance payment intake and transaction recording
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">



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
                <th className="p-2.5 text-right">Advance Required</th>
                <th className="p-2.5 text-right">Advance Received</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                      <span className="font-bold text-slate-800 text-sm">
                        All Orders Booked & Moved to Pre-Press!
                      </span>
                      <span className="text-xs text-slate-500">
                        Confirmed jobs have been released and moved directly to the Pre-Press & Artwork window.
                      </span>
                      <button
                        onClick={() => setActiveTab('prepress')}
                        className="mt-2 px-3 py-1.5 bg-[#002b41] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Go to Pre-Press & Artwork Window</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5">
                      <div className="font-mono font-bold text-slate-900">{b.booking_number}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.confirmation_date}</div>
                    </td>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-800">{b.customer_name}</div>
                      {b.job_title && (
                        <div className="text-[10px] text-slate-500 font-normal truncate max-w-[200px]" title={b.job_title}>
                          {b.job_title}
                        </div>
                      )}
                    </td>
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
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : b.booking_status === 'Awaiting Advance'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {b.booking_status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.booking_status === 'Booked' ? (
                          <button
                            onClick={() => setActiveTab('prepress')}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="View in Pre-Press Artwork window"
                          >
                            <span>In Pre-Press</span>
                            <ArrowRight size={11} />
                          </button>
                        ) : b.booking_status === 'Cancelled' ? (
                          <span className="text-[10px] text-slate-400 font-mono">Cancelled</span>
                        ) : (
                          <button
                            onClick={() => {
                              setQrModalData({
                                amount: b.advance_required,
                                title: `Advance Payment for SO ${b.booking_number}`,
                                orderNumber: b.booking_number,
                                bookingId: b.id,
                                customerName: b.customer_name,
                                jobTitle: b.job_title,
                                orderTotal: b.order_total,
                                advanceRequired: b.advance_required
                              });
                            }}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[10px] font-bold flex items-center gap-1.5 transition shadow-2xs hover:shadow-xs cursor-pointer"
                            title="Record advance payment (UPI, Cheque, Bank Transfer, Cash)"
                          >
                            <CreditCard size={12} className="text-amber-700" />
                            <span>Collect Advance</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
