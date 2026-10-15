import React, { useState } from 'react';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  AlertTriangle,
  Layers,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Flag,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RushBadge } from '../common/RushBadge';

export const FinishingOperations = () => {
  const {
    finishingOps,
    updateFinishingOp,
    jobOrders,
    setActiveTab,
    setActiveSubTab,
    advanceJobStage,
    openQCFlagModal,
    issues,
    resolveJobRushStatus
  } = useApp();
  const [expandedOpId, setExpandedOpId] = useState(null);
  const [logInputs, setLogInputs] = useState({});
  const [feedbackByOp, setFeedbackByOp] = useState({});
  const [viewFilter, setViewFilter] = useState('active'); // 'active' | 'sent_to_qc'

  const activeOps = finishingOps.filter(op => !op.moved_to_qc);
  const movedToQcOps = finishingOps.filter(op => op.moved_to_qc);
  const displayOps = viewFilter === 'active' ? activeOps : movedToQcOps;

  const handleMoveToQC = (op) => {
    const matchedJob = jobOrders?.find(j => j.job_ticket_number === op.job_ticket_number);
    if (matchedJob) {
      if (advanceJobStage && matchedJob.current_stage !== 'FinishingQC' && matchedJob.current_stage !== 'QC & Packaging') {
        advanceJobStage(
          matchedJob.id,
          'FinishingQC',
          `Finishing & Bindery completed (${op.activity_type}). Transferred to Quality Control (QC) inspection.`
        );
      }
    }
    updateFinishingOp(op.id, { moved_to_qc: true, qc_ready: true, status: 'Completed' });
    setExpandedOpId(null);
    setActiveTab('qc');
    if (setActiveSubTab) {
      setActiveSubTab('qc_inspection');
    }
  };

  const getCompletedInput = (opId) => logInputs[opId]?.completed || '';
  const getWastageInput = (opId) => logInputs[opId]?.wastage || '';

  const setCompletedInput = (opId, val) => setLogInputs(prev => ({
    ...prev,
    [opId]: { ...(prev[opId] || {}), completed: val }
  }));

  const setWastageInput = (opId, val) => setLogInputs(prev => ({
    ...prev,
    [opId]: { ...(prev[opId] || {}), wastage: val }
  }));

  const handleAddCompleted = (op) => {
    const inputVal = getCompletedInput(op.id);
    if (!inputVal || Number(inputVal) <= 0) return;
    const addVal = Number(inputVal);
    const matchedJob = jobOrders?.find(j => j.job_ticket_number === op.job_ticket_number);
    const targetQty = matchedJob?.print_quantity || op.planned_qty || 0;
    const newCompleted = (op.completed_qty || 0) + addVal;
    const isCompleted = targetQty > 0 && newCompleted >= targetQty;
    const newStatus = isCompleted ? 'Completed' : (newCompleted > 0 ? 'In-Progress' : op.status);

    updateFinishingOp(op.id, {
      completed_qty: newCompleted,
      planned_qty: targetQty,
      status: newStatus
    });

    setFeedbackByOp(prev => ({
      ...prev,
      [op.id]: {
        type: 'completed',
        text: isCompleted
          ? `Order quantity achieved! Batch marked Completed (${newCompleted.toLocaleString()} / ${targetQty.toLocaleString()} units). Ready to Move to QC Window.`
          : `+${addVal.toLocaleString()} units saved! Cumulative: ${newCompleted.toLocaleString()} / ${targetQty.toLocaleString()} units.`
      }
    }));
    setCompletedInput(op.id, '');
    setTimeout(() => {
      setFeedbackByOp(prev => ({ ...prev, [op.id]: null }));
    }, 4500);
  };

  const handleAddWastage = (op) => {
    const inputVal = getWastageInput(op.id);
    if (!inputVal || Number(inputVal) <= 0) return;
    const addVal = Number(inputVal);
    const newWastage = (op.wastage_qty || 0) + addVal;

    updateFinishingOp(op.id, {
      wastage_qty: newWastage
    });

    setFeedbackByOp(prev => ({
      ...prev,
      [op.id]: {
        type: 'wastage',
        text: `+${addVal.toLocaleString()} wastage logged! Total wastage: ${newWastage.toLocaleString()} units.`
      }
    }));
    setWastageInput(op.id, '');
    setTimeout(() => {
      setFeedbackByOp(prev => ({ ...prev, [op.id]: null }));
    }, 4000);
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">


      {/* Operations Table with expandable inline logger rows */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 uppercase font-mono">
              {viewFilter === 'active' ? 'Active Finishing Batches' : 'Batches Transferred to QC'}
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              {viewFilter === 'active'
                ? '(Click order row to expand logger and update completed quantity/wastage)'
                : '(Batches transferred to Quality Control Inspection desk)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setViewFilter('active')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewFilter === 'active'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Active Batches</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeOps.length > 0 ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  {activeOps.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewFilter('sent_to_qc')}
                className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  viewFilter === 'sent_to_qc'
                    ? 'bg-white text-emerald-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Sent to QC</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  movedToQcOps.length > 0 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
                }`}>
                  {movedToQcOps.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5 w-8 text-center"></th>
                <th className="p-2.5">Job Ticket</th>
                <th className="p-2.5">Activity Type</th>
                <th className="p-2.5">Workcenter / Machine</th>
                <th className="p-2.5">Operator</th>
                <th className="p-2.5 text-right">Job Card Qty</th>
                <th className="p-2.5 text-right">Completed Qty</th>
                <th className="p-2.5 text-right">Wastage</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {displayOps.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-2">
                      <CheckCircle2 size={32} className="text-emerald-500" />
                      <span className="font-bold text-slate-800 text-sm">
                        {viewFilter === 'active'
                          ? 'No Active Finishing Batches Pending'
                          : 'No Batches Transferred to QC Yet'}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {viewFilter === 'active'
                          ? 'All completed finishing batches have been transferred to the Quality Control (QC) window.'
                          : 'Batches that you complete and move to QC will be displayed here.'}
                      </p>
                      {viewFilter === 'active' && movedToQcOps.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setViewFilter('sent_to_qc')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition border border-slate-300 cursor-pointer flex items-center gap-1.5"
                          >
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>View {movedToQcOps.length} Batches Sent to QC</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('qc');
                              if (setActiveSubTab) setActiveSubTab('qc_inspection');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>Open QC Window</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                displayOps.map(op => {
                const matchedJob = jobOrders?.find(j => j.job_ticket_number === op.job_ticket_number);
                const targetQty = matchedJob?.print_quantity || op.planned_qty || 0;
                const isExpanded = expandedOpId === op.id;
                const progressPercent = targetQty > 0
                  ? Math.min(100, Math.round(((op.completed_qty || 0) / targetQty) * 100))
                  : 0;
                const feedback = feedbackByOp[op.id];

                return (
                  <React.Fragment key={op.id}>
                    <tr
                      onClick={() => setExpandedOpId(prev => prev === op.id ? null : op.id)}
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
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{op.job_ticket_number}</span>
                          {resolveJobRushStatus(matchedJob || op) && (
                            <RushBadge size="xs" />
                          )}
                          {(op.qc_flagged || issues?.some(i => i.job_ticket_number === op.job_ticket_number && !i.resolved)) && (
                            <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[8px] bg-rose-600 text-white flex items-center gap-0.5 shadow-2xs">
                              <Flag size={8} /> QC
                            </span>
                          )}
                          {op.returned_from_qc && (
                            <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[8px] bg-amber-100 text-amber-800 border border-amber-300">
                              REWORK
                            </span>
                          )}
                          {isExpanded && (
                            <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-100 px-1 rounded">Open</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-800">{op.activity_type}</td>
                      <td className="p-2.5 font-mono text-[11px] text-slate-600">{op.workcenter}</td>
                      <td className="p-2.5 text-slate-600">{op.operator_name}</td>
                      
                      {/* Job Card Planned Qty - Non-editable read-only */}
                      <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                        <span title="Order quantity from Job Card">
                          {targetQty.toLocaleString()}
                        </span>
                      </td>

                      {/* Completed Qty - Non-editable read-only, updated through expanded menu */}
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        <div className="flex items-center justify-end gap-1">
                          <span>{(op.completed_qty || 0).toLocaleString()}</span>
                          {targetQty > 0 && (
                            <span className="text-[9px] font-normal text-emerald-600">
                              ({progressPercent}%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Wastage - Non-editable read-only */}
                      <td className="p-2.5 text-right font-mono font-bold text-rose-600">
                        {(op.wastage_qty || 0).toLocaleString()}
                      </td>

                      {/* Status - Non-editable badge, automatically updated */}
                      <td className="p-2.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          op.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : op.status === 'In-Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {op.status}
                        </span>
                      </td>

                      {/* Action column */}
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {op.status !== 'Completed' ? (
                            <button
                              onClick={() => setExpandedOpId(prev => prev === op.id ? null : op.id)}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                              title="Open expanded menu to record completed quantity"
                            >
                              <Plus size={11} />
                              <span>{isExpanded ? 'Close' : 'Log Output'}</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleMoveToQC(op)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1 shadow-2xs ${
                                  op.moved_to_qc
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                                title="Move completed job to Quality Control (QC) inspection window"
                              >
                                <ShieldCheck size={12} className={op.moved_to_qc ? 'text-emerald-700' : 'text-white'} />
                                <span>{op.moved_to_qc ? 'In QC Window' : 'Move to QC'}</span>
                                <ArrowRight size={10} />
                              </button>
                              <button
                                onClick={() => updateFinishingOp(op.id, { status: 'In-Progress', moved_to_qc: false })}
                                className="text-[10px] text-slate-400 hover:text-slate-700 underline font-mono cursor-pointer"
                                title="Re-open operation"
                              >
                                Reopen
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              const job = jobOrders.find(j => j.job_ticket_number === op.job_ticket_number);
                              openQCFlagModal(job || {
                                job_ticket_number: op.job_ticket_number,
                                customer_name: op.operator_name,
                                job_title: `${op.activity_type} (${op.workcenter})`,
                                current_stage: 'FinishingQC'
                              }, 'Finishing & Bindery');
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                            title="Raise Quality Control Flag on this finishing operation"
                          >
                            <Flag size={11} />
                            <span>QC Flag</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Output & Wastage Logger Option */}
                    {isExpanded && (
                      <tr className="bg-slate-50/60 border-b border-slate-200">
                        <td colSpan={10} className="p-3 pt-0 pb-4">
                          <div className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-xs space-y-3">
                            {/* Header inside the expanded drawer */}
                            <div className="flex items-center justify-between text-xs font-bold text-blue-950 pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                                  <Scissors size={14} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-slate-900 font-bold">{op.job_ticket_number}</span>
                                  {resolveJobRushStatus(matchedJob || op) && (
                                    <RushBadge size="xs" />
                                  )}
                                  <span className="text-slate-400 mx-1">•</span>
                                  <span className="text-slate-700">{op.activity_type}</span>
                                  <span className="text-slate-500 font-normal text-[11px] ml-1">({op.workcenter})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Job Card Target: <b className="text-slate-800">{targetQty.toLocaleString()} units</b>
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 font-bold border border-blue-200">
                                  Completed: <b>{(op.completed_qty || 0).toLocaleString()} sh</b>
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const job = jobOrders.find(j => j.job_ticket_number === op.job_ticket_number);
                                    openQCFlagModal(job || {
                                      job_ticket_number: op.job_ticket_number,
                                      customer_name: op.operator_name,
                                      job_title: `${op.activity_type} (${op.workcenter})`,
                                      current_stage: 'FinishingQC'
                                    }, 'Finishing & Bindery');
                                  }}
                                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Raise Quality Control Flag on this batch"
                                >
                                  <Flag size={11} className="text-amber-600" />
                                  <span>Raise QC Flag</span>
                                </button>
                              </div>
                            </div>

                            {/* The two quick-add sections: Units to Complete & Wastage Sheets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* 1. Units to Complete */}
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <label className="font-semibold text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    Units to Complete:
                                  </label>
                                  <div className="flex items-center gap-1">
                                    {['100', '250', '500', '1000'].map(val => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCompletedInput(op.id, val);
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                                          String(getCompletedInput(op.id)) === val
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        +{Number(val).toLocaleString()}
                                      </button>
                                    ))}
                                    {targetQty > (op.completed_qty || 0) && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCompletedInput(op.id, String(Math.max(0, targetQty - (op.completed_qty || 0))));
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                                        title="Fill remaining balance to achieve full job card order quantity"
                                      >
                                        +Bal ({Math.max(0, targetQty - (op.completed_qty || 0)).toLocaleString()})
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={getCompletedInput(op.id)}
                                    placeholder="Enter sheets to complete... (e.g. 500)"
                                    onChange={(e) => setCompletedInput(op.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddCompleted(op);
                                    }}
                                    disabled={!getCompletedInput(op.id) || Number(getCompletedInput(op.id)) <= 0}
                                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                  >
                                    <Plus size={13} />
                                    <span>
                                      {Number(getCompletedInput(op.id)) > 0
                                        ? `Save & Increase Completed (+${Number(getCompletedInput(op.id)).toLocaleString()} sh)`
                                        : 'Save & Increase Completed Qty'}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* 2. Wastage Sheets to Log */}
                              <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                  <label className="font-semibold text-rose-800 flex items-center gap-1">
                                    <AlertTriangle size={12} className="text-rose-600" />
                                    Wastage Sheets to Log:
                                  </label>
                                  <div className="flex items-center gap-1">
                                    {['5', '10', '25', '50'].map(val => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setWastageInput(op.id, val);
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                                          String(getWastageInput(op.id)) === val
                                            ? 'bg-rose-600 text-white border-rose-600'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                      >
                                        +{Number(val).toLocaleString()}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={getWastageInput(op.id)}
                                    placeholder="Enter waste sheets to add... (e.g. 15)"
                                    onChange={(e) => setWastageInput(op.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-1 bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-rose-700 focus:outline-none focus:border-rose-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddWastage(op);
                                    }}
                                    disabled={!getWastageInput(op.id) || Number(getWastageInput(op.id)) <= 0}
                                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                  >
                                    <AlertTriangle size={13} />
                                    <span>
                                      {Number(getWastageInput(op.id)) > 0
                                        ? `Save & Increase Wastage (+${Number(getWastageInput(op.id)).toLocaleString()} sh)`
                                        : 'Save & Increase Wastage'}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Feedback message banner */}
                            {feedback && (
                              <div className={`p-2 rounded text-xs font-mono font-bold animate-in fade-in ${
                                feedback.type === 'completed'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}>
                                {feedback.text}
                              </div>
                            )}

                            {/* Live Cumulative Status Message Box */}
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex flex-col gap-1 box-border w-full">
                              <div className="flex items-center justify-between font-mono">
                                <span className="font-semibold">Cumulative Finished:</span>
                                <span className="font-bold text-emerald-800 text-xs">
                                  {(op.completed_qty || 0).toLocaleString()} sheets ({progressPercent}% of {targetQty.toLocaleString()} Target)
                                </span>
                              </div>
                              <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden my-0.5">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-emerald-200/60 font-mono">
                                <span>Wastage Sheets ({op.job_ticket_number}):</span>
                                <span className="font-bold text-rose-600">
                                  {(op.wastage_qty || 0).toLocaleString()} sheets
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5 font-mono">
                                <span>Operation Status:</span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    op.status === 'Completed'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : op.status === 'In-Progress'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}>
                                    {op.status}
                                  </span>
                                  {op.status !== 'Completed' && (
                                    <span className="text-[9px] text-slate-400 italic">
                                      (Auto-completes at {targetQty.toLocaleString()} units)
                                    </span>
                                  )}
                                </div>
                              </div>

                              {op.status === 'Completed' && (
                                <div className="mt-2 pt-2 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-100/50 -mx-1 px-2.5 py-1.5 rounded-md">
                                  <div className="flex items-center gap-1.5 text-emerald-950 font-semibold text-xs">
                                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                                    <span>Finishing target met. Move job forward to Quality Control:</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveToQC(op)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                                    title="Move this job ticket directly to Quality Control (QC) inspection window"
                                  >
                                    <ShieldCheck size={13} />
                                    <span>{op.moved_to_qc ? 'Open in QC Window' : 'Move Job to QC Window'}</span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
