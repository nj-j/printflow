import React, { useState } from 'react';
import {
  Building2,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  FileText,
  DollarSign,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AssociateOutsourcing = () => {
  const { associates, outsourceChallans, updateOutsourceChallan } = useApp();
  const [expandedChallanId, setExpandedChallanId] = useState(null);
  const [receivedInputs, setReceivedInputs] = useState({});
  const [feedbackByChallan, setFeedbackByChallan] = useState({});

  const getReceivedInput = (challanId) => receivedInputs[challanId] || '';
  const setReceivedInput = (challanId, val) => setReceivedInputs(prev => ({
    ...prev,
    [challanId]: val
  }));

  const handleAddReceived = (challan) => {
    const inputVal = getReceivedInput(challan.id);
    if (!inputVal || Number(inputVal) <= 0) return;
    const addVal = Number(inputVal);
    const newReceived = (challan.quantity_received || 0) + addVal;
    const isCompleted = newReceived >= (challan.quantity_sent || 0);
    const newStatus = isCompleted ? 'Completed' : 'Received';

    updateOutsourceChallan(challan.id, {
      quantity_received: newReceived,
      status: newStatus,
      received_date: new Date().toISOString().split('T')[0]
    });

    setFeedbackByChallan(prev => ({
      ...prev,
      [challan.id]: `+${addVal.toLocaleString()} units received for ${challan.challan_number}! Cumulative: ${newReceived.toLocaleString()} / ${challan.quantity_sent.toLocaleString()} units.`
    }));
    setReceivedInput(challan.id, '');
    setTimeout(() => {
      setFeedbackByChallan(prev => ({ ...prev, [challan.id]: null }));
    }, 3500);
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Associates Directory */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {associates.map(asc => (
          <div key={asc.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-900 truncate">{asc.associate_name}</h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px]">
                {asc.rating} ★
              </span>
            </div>
            <div className="text-[11px] text-slate-600">Contact: <b>{asc.contact_person}</b> ({asc.phone})</div>
            <div className="text-[11px] text-slate-500">Location: {asc.location}</div>
            <div className="flex flex-wrap gap-1 pt-1">
              {asc.process_types.map(p => (
                <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[9px]">
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Challan Handover Table with expandable inline logger rows */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 uppercase font-mono">External Job Issue Challans</span>
            <span className="text-[10px] text-slate-400 font-normal">(Click any challan row to expand receipt logger)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">{outsourceChallans.length} Active Challans</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5 w-8 text-center"></th>
                <th className="p-2.5">Challan No</th>
                <th className="p-2.5">Job Ticket</th>
                <th className="p-2.5">Associate Partner</th>
                <th className="p-2.5">Process Description</th>
                <th className="p-2.5 text-right">Sent Qty</th>
                <th className="p-2.5 text-right">Received Qty</th>
                <th className="p-2.5 text-right">Outsource Cost</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {outsourceChallans.map(c => {
                const isExpanded = expandedChallanId === c.id;
                const remainingPending = Math.max(0, (c.quantity_sent || 0) - (c.quantity_received || 0));
                const progressPercent = c.quantity_sent > 0
                  ? Math.min(100, Math.round(((c.quantity_received || 0) / c.quantity_sent) * 100))
                  : 0;
                const feedback = feedbackByChallan[c.id];

                return (
                  <React.Fragment key={c.id}>
                    <tr
                      onClick={() => setExpandedChallanId(prev => prev === c.id ? null : c.id)}
                      className={`cursor-pointer transition select-none ${
                        isExpanded
                          ? 'bg-blue-50/70'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="p-2.5 text-center">
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 mx-auto ${
                            isExpanded ? 'rotate-180 text-blue-600' : 'text-slate-400'
                          }`}
                        />
                      </td>
                      <td className="p-2.5 font-mono font-bold text-blue-700">
                        <div className="flex items-center gap-1.5">
                          <span>{c.challan_number}</span>
                          {isExpanded && (
                            <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-100 px-1 rounded">Open</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{c.job_ticket_number}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{c.associate_name}</td>
                      <td className="p-2.5 text-slate-600 text-[11px]">{c.process_description}</td>
                      
                      {/* Sent Qty - Non-editable read-only */}
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                        {c.quantity_sent.toLocaleString()}
                      </td>

                      {/* Received Qty - Non-editable read-only, updated through expanded menu */}
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        <div className="flex items-center justify-end gap-1">
                          <span>{(c.quantity_received || 0).toLocaleString()}</span>
                          {c.quantity_sent > 0 && (
                            <span className="text-[9px] font-normal text-emerald-600">
                              ({progressPercent}%)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹ {c.outsource_cost.toLocaleString()}</td>

                      {/* Status - Non-editable badge, automatically updated */}
                      <td className="p-2.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          c.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'Received'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : c.status === 'In-Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      {/* Action column */}
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        {c.status !== 'Completed' && c.status !== 'Received' ? (
                          <button
                            onClick={() => setExpandedChallanId(prev => prev === c.id ? null : c.id)}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                            title="Open expanded menu to record received delivery units"
                          >
                            <Plus size={11} />
                            <span>{isExpanded ? 'Close' : 'Log Receipt'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {c.status === 'Completed' ? 'Completed' : 'Received'}
                            </span>
                            <button
                              onClick={() => updateOutsourceChallan(c.id, { status: 'In-Progress' })}
                              className="text-[10px] text-slate-400 hover:text-slate-700 underline font-mono cursor-pointer"
                              title="Re-open Challan"
                            >
                              Reopen
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Challan Receipt Logger Option */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60 border-b border-slate-200">
                        <td colSpan={10} className="p-3 pt-0 pb-4">
                          <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-xs space-y-3">
                            {/* Header inside the expanded drawer */}
                            <div className="flex items-center justify-between text-xs font-bold text-blue-950 pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
                                  <Truck size={14} />
                                </div>
                                <div>
                                  <span className="text-blue-700 font-bold font-mono">{c.challan_number}</span>
                                  <span className="text-slate-400 mx-1.5">•</span>
                                  <span className="text-slate-900 font-bold">{c.job_ticket_number}</span>
                                  <span className="text-slate-500 font-normal text-[11px] ml-1.5">({c.associate_name} — {c.process_description})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Sent: <b className="text-slate-800">{c.quantity_sent.toLocaleString()} units</b>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-bold border border-blue-200">
                                  Received: <b>{(c.quantity_received || 0).toLocaleString()} sh</b>
                                </span>
                              </div>
                            </div>

                            {/* Incremental Received Qty Logger */}
                            <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <label className="font-semibold text-teal-800 flex items-center gap-1">
                                  <CheckCircle2 size={12} className="text-teal-600" />
                                  Units Received from Partner:
                                </label>
                                <div className="flex items-center gap-1">
                                  {['50', '100', '250', '500'].map(val => (
                                    <button
                                      key={val}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceivedInput(c.id, val);
                                      }}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                                        String(getReceivedInput(c.id)) === val
                                          ? 'bg-teal-600 text-white border-teal-600'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      +{Number(val).toLocaleString()}
                                    </button>
                                  ))}
                                  {remainingPending > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setReceivedInput(c.id, String(remainingPending));
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                                      title="Fill all remaining pending units"
                                    >
                                      +All ({remainingPending})
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={getReceivedInput(c.id)}
                                  placeholder="Enter units received to add... (e.g. 250)"
                                  onChange={(e) => setReceivedInput(c.id, e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddReceived(c);
                                  }}
                                  disabled={!getReceivedInput(c.id) || Number(getReceivedInput(c.id)) <= 0}
                                  className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                >
                                  <Plus size={13} />
                                  <span>
                                    {Number(getReceivedInput(c.id)) > 0
                                      ? `Save & Increase Received (+${Number(getReceivedInput(c.id)).toLocaleString()} sh)`
                                      : 'Save & Increase Received Qty'}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Feedback message banner */}
                            {feedback && (
                              <div className="p-2 rounded text-xs font-mono font-bold bg-teal-100 text-teal-900 border border-teal-300 animate-in fade-in">
                                {feedback}
                              </div>
                            )}

                            {/* Live Cumulative Status Message Box */}
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex flex-col gap-1 box-border w-full">
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-semibold">Cumulative Received:</span>
                                <span className="font-bold text-emerald-800 text-xs">
                                  {(c.quantity_received || 0).toLocaleString()} units ({progressPercent}% of {c.quantity_sent.toLocaleString()} Sent)
                                </span>
                              </div>
                              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden my-0.5">
                                <div
                                  className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-emerald-200/60 font-mono">
                                <span>Pending from Associate ({c.associate_name}):</span>
                                <span className={`font-bold ${remainingPending > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                  {remainingPending.toLocaleString()} units
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5 font-mono">
                                <span>Challan Status:</span>
                                <select
                                  value={c.status}
                                  onChange={(e) => updateOutsourceChallan(c.id, { status: e.target.value })}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${
                                    c.status === 'Completed'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : c.status === 'Received'
                                      ? 'bg-teal-100 text-teal-800 border-teal-300'
                                      : c.status === 'In-Progress'
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border-amber-300'
                                  }`}
                                >
                                  <option value="Sent">Sent</option>
                                  <option value="In-Progress">In-Progress</option>
                                  <option value="Received">Received</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
