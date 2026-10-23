import React from 'react';
import { Truck, Printer, X, ShieldCheck, CheckCircle } from 'lucide-react';

export const TripSheetModal = ({ trip, jobs, onClose, onCompleteTrip }) => {
  const isTripCompleted = trip.status === 'Completed';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3 bg-[#002b41] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Truck size={18} />
            <div>
              <div className="font-bold text-sm tracking-wide">JOSCO PRINTERS — DISPATCH TRIP SHEET</div>
              <div className="text-[10px] text-slate-300 font-mono">Trip Ref: {trip.trip_number} • Date: {trip.trip_date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Print (Ctrl+P)</span>
            </button>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-slate-300 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Trip Sheet Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 printable-area">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
            <div>
              <span className="text-slate-400 text-[10px] block">Trip / Run Name</span>
              <strong className="text-slate-900">{trip.trip_run_name || trip.route_name || 'Standard Delivery Run'}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Assigned Driver</span>
              <strong className="text-slate-900">{trip.driver_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Vehicle Number</span>
              <strong className="text-slate-900">{trip.vehicle_reg}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Trip Status</span>
              {isTripCompleted ? (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] inline-flex items-center gap-1">
                  <CheckCircle size={10} className="text-emerald-600" /> Completed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[10px] inline-flex items-center gap-1">
                  <Truck size={10} className="text-blue-600" /> In-Transit
                </span>
              )}
            </div>
          </div>

          {/* Jobs Manifest Table */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-700 mb-2">Dispatched Job Manifest</h4>
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-mono">
                  <th className="p-2 border border-slate-200">Job No</th>
                  <th className="p-2 border border-slate-200">Customer</th>
                  <th className="p-2 border border-slate-200">Product / Specs</th>
                  <th className="p-2 text-right border border-slate-200">Dispatch Qty</th>
                  <th className="p-2 text-right border border-slate-200">COD Due (₹)</th>
                  <th className="p-2 text-center border border-slate-200">Customer Sign / ACK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job, idx) => {
                  const isDelivered = job.ack_status === 'Delivered' || job.status === 'Delivered' || isTripCompleted;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold border border-slate-200">{job.job_no}</td>
                      <td className="p-2 font-semibold border border-slate-200">{job.customer}</td>
                      <td className="p-2 text-slate-600 border border-slate-200">{job.product}</td>
                      <td className="p-2 text-right font-mono font-bold border border-slate-200">{(job.route_qty || 0).toLocaleString()}</td>
                      <td className="p-2 text-right font-mono font-bold text-amber-700 border border-slate-200">₹ {(job.cod_amount || 0).toLocaleString()}</td>
                      <td className="p-2 text-center border border-slate-200">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle size={10} className="text-emerald-600" />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck size={10} className="text-blue-500" />
                            Dispatched
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Signatures */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-lg space-y-1">
              <div className="font-bold text-xs">Trip Manifest Totals:</div>
              <div className="font-mono text-xs">Total Dispatched Items: <b>{jobs.length} Jobs</b></div>
              <div className="font-mono text-xs">Total Quantity: <b>{(trip.total_qty || 0).toLocaleString()} units</b></div>
              <div className="font-mono text-xs text-amber-700 font-bold">Total Cash On Delivery: <b>₹ {(trip.total_cod || 0).toLocaleString()}</b></div>
            </div>

            <div className="p-3 border border-slate-200 rounded-lg flex flex-col justify-between h-24 text-[10px] text-slate-500">
              <div>Dispatcher Authorization & Vehicle Gate Pass</div>
              <div className="border-t border-slate-300 pt-1 flex justify-between font-mono">
                <span>Security Gate Checked</span>
                <span>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            {isTripCompleted ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle size={14} className="text-emerald-600" /> Trip Completed & All Orders Marked as Delivered
              </span>
            ) : (
              <span>Vehicle on road. Mark complete when driver finishes all deliveries.</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
            {!isTripCompleted && (
              <button
                type="button"
                onClick={() => {
                  if (onCompleteTrip) {
                    onCompleteTrip(trip.id || trip.trip_number);
                  }
                  onClose();
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Complete delivery trip and mark all orders in this manifest as Delivered"
              >
                <CheckCircle size={14} />
                <span>Complete Trip & Mark All Delivered</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
