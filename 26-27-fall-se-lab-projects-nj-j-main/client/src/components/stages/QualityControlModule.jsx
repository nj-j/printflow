import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Scissors,
  ArrowRight,
  Layers,
  PlusCircle,
  Clock,
  Sparkles,
  FileText,
  Filter,
  Check,
  Eye,
  AlertCircle,
  RotateCcw,
  Flag,
  Palette,
  Printer,
  Truck,
  ArrowLeft,
  X,
  User,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RushBadge } from '../common/RushBadge';
import { STAGES, normalizeStage, STAGE_CONFIG } from '../../utils/stageConstants';

export const QualityControlModule = () => {
  const {
    jobOrders,
    issues,
    reportIssue,
    resolveIssue,
    raiseQCFlag,
    markQCFlagFixed,
    sendBackJobFromQC,
    openQCFlagModal,
    advanceJobStage,
    setSelectedJobForModal,
    setActiveTab,
    activeSubTab,
    setActiveSubTab,
    activeUser,
    resolveJobRushStatus
  } = useApp();

  const finishingJobs = jobOrders.filter(j => 
    j.current_stage === 'QualityControl' || 
    j.current_stage === 'QC' || 
    j.current_stage === 'QC & Packaging' ||
    j.current_stage === 'QCInspection' ||
    (j.current_stage === 'FinishingQC' && (j.qc_ready || j.qc_flagged))
  );
  const openIssues = issues.filter(i => !i.resolved);
  const resolvedIssues = issues.filter(i => i.resolved);

  const [issueFilter, setIssueFilter] = useState('all'); // 'all', 'open', 'resolved'

  // Interactive Action Panel state per issue: { [issueId]: { mode: 'fix' | 'send_back' | null, notes: '', targetStage: '' } }
  const [activeActions, setActiveActions] = useState({});

  const currentSubTab = activeSubTab || 'qc_inspection';

  const getActionState = (issue) => {
    const existing = activeActions[issue.id];
    if (existing) return existing;

    // Suggest default previous station based on canonical stage
    let defaultStage = STAGES.FINISHING;
    const curStage = normalizeStage(issue.current_stage);
    if (curStage === STAGES.DISPATCH || curStage === STAGES.COMPLETED) {
      defaultStage = STAGES.QC;
    } else if (curStage === STAGES.QC) {
      defaultStage = STAGES.FINISHING;
    } else if (curStage === STAGES.FINISHING) {
      defaultStage = STAGES.PRESS;
    } else if (curStage === STAGES.PRESS) {
      defaultStage = STAGES.PREPRESS;
    } else {
      defaultStage = STAGES.PREPRESS;
    }

    return {
      mode: null,
      notes: '',
      targetStage: defaultStage
    };
  };

  const updateActionState = (issueId, updates) => {
    setActiveActions(prev => ({
      ...prev,
      [issueId]: {
        ...(prev[issueId] || {}),
        ...updates
      }
    }));
  };

  const handleToggleMode = (issue, mode) => {
    const current = getActionState(issue);
    if (current.mode === mode) {
      updateActionState(issue.id, { mode: null });
    } else {
      updateActionState(issue.id, {
        mode,
        notes: mode === 'fix'
          ? 'Defect rectified and inspected. Tolerances passed 100% standard.'
          : `Defect observed: ${issue.defect_category || issue.issue_type || 'flaw'}. Station return required for correction.`
      });
    }
  };

  const handleConfirmFixed = (issue) => {
    const state = getActionState(issue);
    markQCFlagFixed(issue.id, state.notes);
    updateActionState(issue.id, { mode: null });
  };

  const handleConfirmSendBack = (issue) => {
    const state = getActionState(issue);
    sendBackJobFromQC(issue.id, state.targetStage || STAGES.PRESS, state.notes);
    updateActionState(issue.id, { mode: null });
  };

  const handlePassQCAndReadyDispatch = (jobId) => {
    advanceJobStage(jobId, STAGES.DISPATCH, 'Passed 100% Quality Inspection. Packed and ready for dispatch.');
    setActiveTab('dispatch');
  };

  const filteredIssues = issues.filter(iss => {
    if (issueFilter === 'open') return !iss.resolved;
    if (issueFilter === 'resolved') return iss.resolved;
    return true;
  });

  const getTerminalDetails = (terminal) => {
    const t = (terminal || '').toLowerCase();
    if (t.includes('prepress') || t.includes('proof') || t.includes('design') || t.includes('pre-press')) {
      return {
        label: 'Pre-Press Studio',
        icon: Palette,
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    }
    if (t.includes('press') || t.includes('print')) {
      return {
        label: 'Press Terminal',
        icon: Printer,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    }
    if (t.includes('finish') || t.includes('bind')) {
      return {
        label: 'Finishing & Bindery',
        icon: Scissors,
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
      };
    }
    if (t.includes('dispatch') || t.includes('delivery')) {
      return {
        label: 'Delivery & Dispatch',
        icon: Truck,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    }
    return {
      label: terminal || 'Workstation',
      icon: Layers,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-200'
    };
  };

  const getStageHumanName = (stageKey) => {
    switch (stageKey) {
      case 'DesignProofing': return '1. Pre-Press & Artwork Proofing';
      case 'PlateMaking': return '2. Pre-Press CTP Plate';
      case 'PressRun': return '3. Press Run Terminal';
      case 'Finishing':
      case 'FinishingQC': return '4. Finishing & Bindery';
      case 'QualityControl':
      case 'QC':
      case 'QC & Packaging': return '5. Quality Control Inspection';
      case 'DispatchReady': return '6. Delivery & Dispatch Ready';
      default: return stageKey || 'Production Station';
    }
  };

  const subTabs = [
    {
      id: 'qc_inspection',
      label: 'QC Inspection Queue',
      icon: ShieldCheck,
      badge: finishingJobs.length > 0 ? `${finishingJobs.length} In QC` : '0 Jobs',
      badgeColor: finishingJobs.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
    },
    {
      id: 'defects',
      label: 'Defect & QC Flags Register',
      icon: AlertTriangle,
      badge: openIssues.length > 0 ? `${openIssues.length} Open Flags` : '0 Open',
      badgeColor: openIssues.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
    },
    {
      id: 'all',
      label: 'Dual Workspace',
      icon: Layers,
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <div className="space-y-3 text-xs select-none">
      {/* Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              06
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Quality Control (QC)</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Sub-Tab Navigation Bar */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
              {subTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = currentSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-slate-500'} />
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

            <button
              onClick={() => openQCFlagModal(jobOrders[0] || null, 'Quality Control Desk')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Raise new QC flag on any job"
            >
              <Flag size={13} />
              <span>Raise QC Flag</span>
            </button>

            <button
              onClick={() => setActiveTab('dispatch')}
              className="px-3 py-1.5 bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Proceed to Dispatch & Logistics Stage"
            >
              <span>Dispatch Desk</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 max-w-[1600px] mx-auto space-y-4">
        {/* Active QC Flags Alert Banner */}
        {openIssues.length > 0 && (
          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-950">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={18} className="text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-rose-900">Quality Inspection Alert:</span>
                <span className="ml-2 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  {openIssues.length} Active QC Flags Blocking Dispatch
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View Layout Switcher */}
        <div className={`grid gap-4 ${
          currentSubTab === 'all'
            ? 'grid-cols-1 lg:grid-cols-12'
            : 'grid-cols-1'
        }`}>
          {/* SECTION A: QC INSPECTION QUEUE */}
          {(currentSubTab === 'qc_inspection' || currentSubTab === 'all') && (
            <div className={`space-y-3 ${currentSubTab === 'all' ? 'lg:col-span-6' : 'w-full'}`}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                      Inspection Queue ({finishingJobs.length} Jobs Awaiting Clearance)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Pre-Dispatch Clearance & Tolerance Check
                  </span>
                </div>

                <div className="p-3 divide-y divide-slate-100">
                  {finishingJobs.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic">
                      <ShieldCheck size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-xs">No Jobs Currently in Quality Inspection</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All printed batches have been inspected or are still on press.</p>
                    </div>
                  ) : (
                    finishingJobs.map(job => {
                      const isUrgent = resolveJobRushStatus(job);
                      const hasFlag = job.qc_flagged || issues.some(i => i.job_ticket_number === job.job_ticket_number && !i.resolved);
                      const activeJobIssue = issues.find(i => i.job_ticket_number === job.job_ticket_number && !i.resolved);

                      return (
                        <div key={job.id} className="py-3 first:pt-0 last:pb-0 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-100 text-slate-900 border border-slate-200">
                                {job.job_ticket_number}
                              </span>
                              {isUrgent && <RushBadge size="xs" />}
                              {hasFlag && (
                                <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                                  <Flag size={11} /> QC FLAGGED
                                </span>
                              )}
                              {job.returned_from_qc && (
                                <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <RotateCcw size={10} /> REWORKED FROM QC
                                </span>
                              )}
                              <span className="font-bold text-slate-900 text-xs">
                                {job.customer_name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">
                              Target: <strong className={isUrgent ? 'text-rose-600' : 'text-slate-800'}>
                                {new Date(job.target_completion_date).toLocaleDateString()}
                              </strong>
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs text-slate-800 leading-snug">
                              {job.job_title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              Quantity: <b>{job.print_quantity?.toLocaleString()} pcs</b> | Color: <b>{job.color_spec}</b>
                            </p>
                          </div>

                          {/* Active QC Flag notification on the job card if present */}
                          {hasFlag && activeJobIssue && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5 text-xs text-rose-950">
                              <div className="flex items-center justify-between">
                                <span className="font-bold flex items-center gap-1.5 text-rose-800 text-[11px]">
                                  <AlertTriangle size={13} className="text-rose-600" />
                                  Active Flag: {activeJobIssue.defect_category || activeJobIssue.issue_type} ({activeJobIssue.severity})
                                </span>
                                <span className="text-[10px] font-mono text-rose-700">
                                  Source: {activeJobIssue.source_terminal || 'Workstation'}
                                </span>
                              </div>
                              <p className="text-rose-900 text-[11px]">{activeJobIssue.description}</p>
                            </div>
                          )}

                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                            <span className="font-bold text-slate-700 block text-[11px]">
                              Required Finishing & Bindery Specs:
                            </span>
                            <p className="text-slate-600 font-medium text-[11px]">
                              {job.finishing_spec || 'Standard Post-Press Trim & Packaging'}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedJobForModal(job)}
                                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> Inspect Job Card
                              </button>
                              <button
                                type="button"
                                onClick={() => openQCFlagModal(job, 'Finishing & Bindery')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                              >
                                <Flag size={12} /> Raise QC Flag
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handlePassQCAndReadyDispatch(job.id)}
                              disabled={hasFlag}
                              className={`px-3 py-1.5 rounded font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                                hasFlag
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                              title={hasFlag ? 'Cannot release to dispatch while active QC flag exists' : 'Release batch to dispatch'}
                            >
                              <ShieldCheck size={14} />
                              <span>QC Passed - Release to Dispatch</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECTION B: DEFECT & QUALITY ISSUE REGISTER */}
          {(currentSubTab === 'defects' || currentSubTab === 'all') && (
            <div className={`space-y-3 ${currentSubTab === 'all' ? 'lg:col-span-6' : 'w-full'}`}>
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                      Defect Register ({openIssues.length} Open Flags Across All Terminals)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'all', label: `All (${issues.length})` },
                      { id: 'open', label: `Open Flags (${openIssues.length})` },
                      { id: 'resolved', label: `Resolved (${resolvedIssues.length})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setIssueFilter(f.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          issueFilter === f.id
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 divide-y divide-slate-100 max-h-[700px] overflow-y-auto space-y-3">
                  {filteredIssues.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic">
                      <CheckCircle2 size={28} className="mx-auto mb-2 text-emerald-400" />
                      <p className="font-semibold text-xs">No Defect Issues Found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">All production lines operating within tolerance standards.</p>
                    </div>
                  ) : (
                    filteredIssues.map(iss => {
                      const terminalInfo = getTerminalDetails(iss.source_terminal);
                      const TerminalIcon = terminalInfo.icon;
                      const actionState = getActionState(iss);
                      const isFixMode = actionState.mode === 'fix';
                      const isSendBackMode = actionState.mode === 'send_back';

                      return (
                        <div key={iss.id} className="pt-3 first:pt-0 space-y-2.5">
                          {/* Top row: Ticket, Terminal badge, Severity */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {iss.job_ticket_number}
                              </span>

                              {/* Terminal badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${terminalInfo.badgeClass}`}>
                                <TerminalIcon size={11} />
                                <span>{iss.source_terminal || terminalInfo.label}</span>
                              </span>

                              {/* Severity Badge */}
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                iss.resolved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : iss.severity === 'Critical'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : iss.severity === 'Major'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {iss.resolved ? 'RESOLVED' : `${iss.severity || 'Major'} Priority`}
                              </span>
                            </div>

                            {/* Status label if resolved */}
                            {iss.resolved && (
                              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {iss.resolution_type === 'SentBack'
                                  ? `Rewound to ${getStageHumanName(iss.return_stage)}`
                                  : 'Fixed & Cleared'}
                              </span>
                            )}
                          </div>

                          {/* Customer & Title */}
                          {(iss.customer_name || iss.job_title) && (
                            <div className="text-[11px] text-slate-700">
                              <span className="font-bold text-slate-900">{iss.customer_name}</span>
                              {iss.job_title && <span className="text-slate-500 font-normal"> — {iss.job_title}</span>}
                            </div>
                          )}

                          {/* Defect Description */}
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                            <span className="font-bold text-slate-800 block text-[11px] mb-0.5">
                              {iss.defect_category || iss.issue_type || 'Defect Note'}:
                            </span>
                            <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                              {iss.description}
                            </p>
                          </div>

                          {/* Meta row: Reporter and Date */}
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Reported by: <b className="text-slate-600">{iss.reported_by_name || 'Inspector'}</b></span>
                            <span>{iss.created_at ? new Date(iss.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Today'}</span>
                          </div>

                          {/* Resolved Banner if resolved */}
                          {iss.resolved && iss.resolution_notes && (
                            <div className="p-2 bg-emerald-50/80 rounded border border-emerald-200 text-[11px] space-y-0.5 text-emerald-950 font-mono">
                              <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                                <span>{iss.resolution_type === 'SentBack' ? 'PIPELINE REWOUND' : 'FLAG FIXED & CLEARED'}</span>
                                <span>Resolved by {iss.resolved_by || 'QC'}</span>
                              </div>
                              <p className="text-emerald-900 font-sans">{iss.resolution_notes}</p>
                            </div>
                          )}

                          {/* Resolution Action Trigger Buttons (Visible only when not resolved) */}
                          {!iss.resolved && (
                            <div className="pt-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMode(iss, 'fix')}
                                  className={`flex-1 py-1.5 px-2.5 rounded font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                    isFixMode
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                  title="Mark defect as fixed and continue production at current station"
                                >
                                  <CheckCircle2 size={13} />
                                  <span>Mark as Fixed</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleMode(iss, 'send_back')}
                                  className={`flex-1 py-1.5 px-2.5 rounded font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                    isSendBackMode
                                      ? 'bg-amber-700 text-white'
                                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                                  }`}
                                  title="Rewind job card back a station or up the production pipeline"
                                >
                                  <RotateCcw size={13} />
                                  <span>Send Back a Station</span>
                                </button>
                              </div>

                              {/* INLINE OPTION 1: MARK AS FIXED FORM */}
                              {isFixMode && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 animate-in fade-in">
                                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                                    <span className="flex items-center gap-1.5">
                                      <CheckCircle2 size={13} className="text-emerald-600" />
                                      Confirm Fix & Clear Defect Flag
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateActionState(iss.id, { mode: null })}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-bold text-emerald-800 mb-1">
                                      Resolution / Inspection Verification Notes:
                                    </label>
                                    <textarea
                                      rows="2"
                                      value={actionState.notes}
                                      onChange={(e) => updateActionState(iss.id, { notes: e.target.value })}
                                      className="w-full bg-white border border-emerald-300 rounded p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                                      placeholder="State how the defect was corrected and verified..."
                                    />
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => updateActionState(iss.id, { mode: null })}
                                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded font-bold text-[11px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmFixed(iss)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check size={12} /> Confirm Fixed (Proceed at Station)
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* INLINE OPTION 2: SEND BACK A STATION FORM */}
                              {isSendBackMode && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 animate-in fade-in">
                                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                                    <span className="flex items-center gap-1.5">
                                      <RotateCcw size={13} className="text-amber-600" />
                                      Send Back Up Production Pipeline
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => updateActionState(iss.id, { mode: null })}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>

                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-[10px] font-bold text-amber-800 mb-1">
                                        Select Target Workstation to Rewind Job Card:
                                      </label>
                                      <select
                                        value={actionState.targetStage || STAGES.PRESS}
                                        onChange={(e) => updateActionState(iss.id, { targetStage: e.target.value })}
                                        className="w-full bg-white border border-amber-300 rounded p-1.5 text-xs font-bold text-amber-950 focus:outline-none focus:border-amber-500 cursor-pointer"
                                      >
                                        <option value={STAGES.PREPRESS}>1. Pre-Press & Proofing (Art File / Preflight Corrections)</option>
                                        
                                        <option value={STAGES.PRESS}>2. Press Run Terminal (Rerun Sheets / Ink Balance Correction)</option>
                                        <option value={STAGES.FINISHING}>3. Finishing & Bindery (Recut, Re-laminate, or Re-bind)</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-[10px] font-bold text-amber-800 mb-1">
                                        Station Return Reason & Corrective Instructions:
                                      </label>
                                      <textarea
                                        rows="2"
                                        value={actionState.notes}
                                        onChange={(e) => updateActionState(iss.id, { notes: e.target.value })}
                                        className="w-full bg-white border border-amber-300 rounded p-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                                        placeholder="Detail instructions for the receiving workstation operator..."
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => updateActionState(iss.id, { mode: null })}
                                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded font-bold text-[11px] cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleConfirmSendBack(iss)}
                                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] shadow-2xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <RotateCcw size={12} /> Send Job Back to Workstation
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
