import React, { useState } from 'react';
import {
  Kanban,
  Zap,
  Printer,
  Clock,
  ArrowRight,
  ArrowLeft,
  Eye,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Calendar,
  MessageSquare,
  FileText,
  Save,
  Send,
  Plus,
  History,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const ProductionPlanning = () => {
  const {
    jobOrders,
    prepressJobs,
    advanceJobStage,
    addJobComment,
    bumpJobToTop,
    setSelectedJobForModal,
    activeSubTab,
    setActiveSubTab,
    activeUser
  } = useApp();

  // Helper to dynamically retrieve the latest note or comment
  const getLastNote = (job) => {
    if (job?.comments && job.comments.length > 0) {
      const last = job.comments[job.comments.length - 1];
      const text = typeof last === 'string' ? last : (last?.text || last?.comment);
      if (text && text.trim()) return text.trim();
    }
    const matchedPrep = prepressJobs?.find(p => p.job_ticket_number === job.job_ticket_number);
    if (matchedPrep?.comments && matchedPrep.comments.length > 0) {
      const last = matchedPrep.comments[matchedPrep.comments.length - 1];
      const text = typeof last === 'string' ? last : (last?.text || last?.comment);
      if (text && text.trim()) return text.trim();
    }
    if (job?.last_note?.trim()) return job.last_note.trim();
    if (job?.last_comment?.trim()) return job.last_comment.trim();
    if (matchedPrep?.last_note?.trim()) return matchedPrep.last_note.trim();
    if (matchedPrep?.notes?.trim()) return matchedPrep.notes.trim();
    if (job?.notes?.trim()) return job.notes.trim();
    return '';
  };

  const getLastNoteAuthor = (job) => {
    if (job?.comments && job.comments.length > 0) {
      const last = job.comments[job.comments.length - 1];
      if (last?.author) return last.author;
    }
    const matchedPrep = prepressJobs?.find(p => p.job_ticket_number === job.job_ticket_number);
    if (matchedPrep?.comments && matchedPrep.comments.length > 0) {
      const last = matchedPrep.comments[matchedPrep.comments.length - 1];
      if (last?.author) return last.author;
    }
    return job?.assigned_operator || matchedPrep?.assigned_designer || '';
  };

  const currentSubTab = activeSubTab || 'job_tickets';

  // Set of job IDs currently expanded in the Kanban board
  const [expandedJobIds, setExpandedJobIds] = useState(new Set());

  // Input states per card: { [jobId]: { comment: '', targetStage: '' } }
  const [cardInputs, setCardInputs] = useState({});

  // Pop-out Modal States (pop out like View Full Card)
  const [specSheetModalJob, setSpecSheetModalJob] = useState(null);
  const [commentsModalJob, setCommentsModalJob] = useState(null);
  const [modalNewComment, setModalNewComment] = useState('');

  const handleModalAddComment = () => {
    if (!commentsModalJob || !modalNewComment.trim()) return;
    const text = modalNewComment.trim();
    addJobComment(commentsModalJob.id, text, 0);
    const newComment = {
      id: `com-${Date.now()}`,
      text: text,
      author: activeUser?.full_name || 'Production Operator',
      hours_logged: 0,
      timestamp: new Date().toISOString()
    };
    setCommentsModalJob(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
      last_note: text
    }));
    setModalNewComment('');
  };

  const getInputs = (jobId, defaultStage) => {
    return cardInputs[jobId] || {
      comment: '',
      targetStage: defaultStage,
      showPreview: false,
      showComments: false
    };
  };

  const updateInput = (jobId, field, val, defaultStage) => {
    setCardInputs(prev => {
      const current = prev[jobId] || {
        comment: '',
        targetStage: defaultStage,
        showPreview: false,
        showComments: false
      };
      return {
        ...prev,
        [jobId]: {
          ...current,
          [field]: val
        }
      };
    });
  };

  const toggleExpandJob = (jobId) => {
    setExpandedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedJobIds(new Set(jobOrders.map(j => j.id)));
  };

  const handleCollapseAll = () => {
    setExpandedJobIds(new Set());
  };

  const stages = [
    { id: 'DesignProofing', label: '1. Design & Proofing', color: '#8b5cf6' },
    { id: 'PlateMaking', label: '2. CTP Plate Making', color: '#ec4899' },
    { id: 'PressRun', label: '3. Offset Press Run', color: '#f59e0b' },
    { id: 'FinishingQC', label: '4. Finishing & QC', color: '#10b981' },
    { id: 'DispatchReady', label: '5. Dispatch Ready', color: '#06b6d4' },
  ];

  const getNextStage = (current) => {
    switch (current) {
      case 'DesignProofing': return 'PlateMaking';
      case 'PlateMaking': return 'PressRun';
      case 'PressRun': return 'FinishingQC';
      case 'FinishingQC': return 'DispatchReady';
      case 'DispatchReady': return 'Delivered';
      default: return null;
    }
  };

  const getPrevStage = (current) => {
    switch (current) {
      case 'PlateMaking': return 'DesignProofing';
      case 'PressRun': return 'PlateMaking';
      case 'FinishingQC': return 'PressRun';
      case 'DispatchReady': return 'FinishingQC';
      default: return null;
    }
  };

  const activeJobs = jobOrders.filter(j => j.current_stage !== 'Completed');
  const urgentJobsCount = jobOrders.filter(
    j => (j.priority === 'Urgent' || j.is_rush_order) && j.current_stage !== 'Completed'
  ).length;

  const subTabs = [
    {
      id: 'job_tickets',
      label: 'Digital Job Tickets',
      icon: Kanban,
      badge: `${activeJobs.length} Active`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'allocation',
      label: 'Machine Allocation',
      icon: Printer,
      badge: 'Registered Fleet',
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'rush',
      label: 'Rush Fast-Track',
      icon: Zap,
      badge: urgentJobsCount > 0 ? `${urgentJobsCount} Rush` : null,
      badgeColor: 'bg-rose-100 text-rose-700'
    }
  ];

  const handleAdvanceWithLog = (job, defaultNextStage) => {
    const inputs = getInputs(job.id, defaultNextStage);
    const comment = inputs.comment.trim();
    const targetStage = inputs.targetStage || defaultNextStage || 'PressRun';

    advanceJobStage(job.id, targetStage, comment, 0);

    // Reset inputs
    setCardInputs(prev => ({
      ...prev,
      [job.id]: {
        ...prev[job.id],
        comment: '',
      }
    }));
  };

  const handleSaveLogOnly = (job) => {
    const inputs = getInputs(job.id, getNextStage(job.current_stage));
    const comment = inputs.comment.trim();

    if (!comment) return;

    addJobComment(job.id, comment, 0);

    setCardInputs(prev => ({
      ...prev,
      [job.id]: {
        ...prev[job.id],
        comment: '',
      }
    }));
  };

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              03
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Planning & Kanban</h1>
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

      <div className="stage-page-container">
        {/* Machine Allocation Summary if allocation tab active */}
        {currentSubTab === 'allocation' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-900">Lithrone 26 (Ramamurthy Nagar Plant)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-500">Allocated: 2 Multi-Color Offset Jobs</p>
              <div className="mt-2 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold inline-block">
                Running @ 13,000 IPH Max
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-900">Ryobi 660 (Ramamurthy Nagar Plant)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <p className="text-[11px] text-slate-500">Allocated: 1 Active Commercial Job</p>
              <div className="mt-2 text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold inline-block">
                Plate Mounting & Make-Ready
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-slate-900">Konica Minolta C4080 (Dual Plants)</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <p className="text-[11px] text-slate-500">Allocated: Short-Run Production Color</p>
              <div className="mt-2 text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold inline-block">
                Digital Production @ 81 PPM
              </div>
            </div>
          </div>
        )}

        {/* Board Controls: Condensed / Expanded Switcher Toolbar */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 mb-3 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="font-bold text-slate-800 uppercase font-mono text-[11px]">Kanban View Mode:</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-500">
              Cards are <b>condensed with date</b>. Click any card to expand hours worked, comments, and the full Job Card.
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExpandAll}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition cursor-pointer"
              title="Expand all cards across columns"
            >
              <Maximize2 size={12} />
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition cursor-pointer"
              title="Collapse all cards to minimal view"
            >
              <Minimize2 size={12} />
              <span>Collapse All</span>
            </button>
            {expandedJobIds.size > 0 && (
              <span className="ml-1 text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                {expandedJobIds.size} Expanded
              </span>
            )}
          </div>
        </div>

        {/* Kanban Board Multi-Column Layout */}
        <div className="kanban-board-container">
          {stages.map(stage => {
            const columnJobs = jobOrders
              .filter(j => {
                if (j.current_stage !== stage.id) return false;
                if (currentSubTab === 'rush') return j.priority === 'Urgent' || j.is_rush_order;
                return true;
              })
              .sort((a, b) => {
                if (a.is_rush_order && !b.is_rush_order) return -1;
                if (!a.is_rush_order && b.is_rush_order) return 1;
                return (a.queue_position || 99) - (b.queue_position || 99);
              });

            return (
              <div key={stage.id} className="kanban-column">
                <div className="kanban-column-header" style={{ borderTopColor: stage.color }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{stage.label}</span>
                    <span className="column-count-badge">{columnJobs.length}</span>
                  </div>
                </div>

                <div className="kanban-cards-wrapper">
                  {columnJobs.length === 0 ? (
                    <div className="empty-kanban-slot">
                      <span>No jobs in this stage</span>
                    </div>
                  ) : (
                    columnJobs.map((job, idx) => {
                      const isUrgent = job.priority === 'Urgent' || job.is_rush_order;
                      const nextStage = getNextStage(job.current_stage);
                      const prevStage = getPrevStage(job.current_stage);
                      const isExpanded = expandedJobIds.has(job.id);
                      const inputs = getInputs(job.id, nextStage);

                      const formattedDate = job.target_completion_date
                        ? new Date(job.target_completion_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Today';

                      return (
                        <div
                          key={job.id}
                          onClick={() => toggleExpandJob(job.id)}
                          className={`kanban-job-card cursor-pointer transition select-none group ${
                            isUrgent ? 'urgent-glow-card' : ''
                          } ${isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-300' : 'hover:border-slate-400 hover:shadow-xs'}`}
                          title={isExpanded ? 'Click to collapse card' : 'Click to expand details'}
                        >
                          {/* Top Row: Identifier, Rank, Rush Tag & Expand Toggle Indicator */}
                          <div className="card-top-row">
                            <div className="flex items-center gap-1.5">
                              <span className="queue-rank-badge">#{job.queue_position || idx + 1}</span>
                              <span className="ticket-no font-bold text-xs text-slate-900 font-mono">
                                {job.job_ticket_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {isUrgent ? (
                                <span className="badge badge-danger text-xxs font-bold flex items-center gap-0.5">
                                  <Zap size={11} className="animate-pulse" /> [RUSH]
                                </span>
                              ) : (
                                <span className="badge badge-secondary text-xxs font-mono">{job.production_type}</span>
                              )}
                              <span className="text-slate-400 group-hover:text-blue-600 transition p-0.5 rounded">
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </span>
                            </div>
                          </div>

                          {/* CONDENSED VIEW (Minimal Details with DATE) */}
                          {!isExpanded && (
                            <div className="space-y-1.5 pt-0.5">
                              {/* Job Title Truncated */}
                              <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                                {job.job_title}
                              </h4>

                              {/* Customer & Quantity Row */}
                              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                <span className="truncate max-w-[130px] font-semibold text-slate-700">
                                  {job.customer_name}
                                </span>
                                <span className="font-mono text-slate-500 font-bold text-[10px] shrink-0">
                                  {job.print_quantity?.toLocaleString()} pcs
                                </span>
                              </div>

                              {/* Last Note snippet in collapsed card */}
                              {getLastNote(job) && (
                                <div className="text-[10px] text-slate-500 italic truncate" title={`Last Note: ${getLastNote(job)}`}>
                                  "{getLastNote(job)}"
                                </div>
                              )}

                              {/* Minimal Bottom Bar: TARGET DATE + Machine Snippet */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <Calendar size={11} className="text-blue-600" />
                                  <span>{formattedDate}</span>
                                </span>
                                <span className="truncate max-w-[110px] text-slate-400">
                                  {job.assigned_press_machine?.split(' ')[0]} {job.assigned_press_machine?.split(' ')[1]}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* EXPANDED VIEW (Full Specifications, Comments, Hours Worked, Stage Move, and Job Card View) */}
                          {isExpanded && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-100 text-xs"
                            >
                              {/* Full Job Title & Customer */}
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                  {job.job_title}
                                </h4>
                                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                                  <span><b>Customer:</b> {job.customer_name}</span>
                                  <span className="font-mono text-blue-700 font-bold">
                                    <Calendar size={11} className="inline mr-1 text-blue-600" />
                                    {formattedDate}
                                  </span>
                                </div>
                                {(() => {
                                  const activeNote = getLastNote(job);
                                  const author = getLastNoteAuthor(job);
                                  if (!activeNote) return null;
                                  return (
                                    <div className="mt-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                                      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                                        <span className="font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                                          <MessageSquare size={10} className="text-blue-600" /> Last Note
                                        </span>
                                        {author && <span className="text-[9px] text-slate-400 font-sans">by {author}</span>}
                                      </div>
                                      <p className="text-[11px] text-slate-700 italic leading-snug">
                                        "{activeNote}"
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>


                              {/* POP-OUT MODAL ACTIONS (Spec Sheet, Comments Log, Full Card) */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSpecSheetModalJob(job)}
                                  className="py-1.5 px-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="Pop out technical specification sheet like View Full Card"
                                >
                                  <FileText size={12} className="text-blue-600" />
                                  <span className="truncate">View Spec Sheet</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCommentsModalJob(job);
                                    setModalNewComment('');
                                  }}
                                  className="py-1.5 px-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="Pop out comments history log like View Full Card"
                                >
                                  <MessageSquare size={12} className="text-purple-600" />
                                  <span className="truncate">Comments Log ({(job.comments || []).length})</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedJobForModal({
                                    ...job,
                                    last_note: getLastNote(job) || job.last_note || job.notes,
                                    notes: getLastNote(job) || job.notes
                                  })}
                                  className="py-1.5 px-1 bg-[#002b41] hover:bg-[#002b41]/90 text-white rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                  title="Pop out full printable production job card"
                                >
                                  <Printer size={12} />
                                  <span className="truncate">Full Card</span>
                                </button>
                              </div>

                              {/* OPERATOR COMMENTS & NEXT STAGE PANEL */}
                              <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 space-y-2">
                                {/* Comments Textarea */}
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-semibold text-slate-700">
                                    Operator / Workstation Comments:
                                  </label>
                                  <textarea
                                    rows="2"
                                    value={inputs.comment}
                                    onChange={(e) => updateInput(job.id, 'comment', e.target.value, nextStage)}
                                    placeholder="Mention observations, make-ready runtime, color density, sheet inspection..."
                                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                {/* Next Stage Progression Controls */}
                                <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-700">Target Next Stage:</span>
                                    <select
                                      value={inputs.targetStage || nextStage || job.current_stage}
                                      onChange={(e) => updateInput(job.id, 'targetStage', e.target.value, nextStage)}
                                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-blue-900 text-[10px] focus:outline-none"
                                    >
                                      {stages.map(st => (
                                        <option key={st.id} value={st.id}>
                                          {st.label}
                                        </option>
                                      ))}
                                      <option value="Delivered">5. Delivered / Dispatched</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveLogOnly(job)}
                                      className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                                      title="Save comment without moving stage"
                                    >
                                      <Save size={11} /> Save Comment Only
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAdvanceWithLog(job, nextStage)}
                                      className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Send size={11} /> Move to Next Stage
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Action Bar */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => bumpJobToTop(job.id)}
                                  className={`btn btn-xxs ${isUrgent ? 'btn-warning' : 'btn-secondary'} cursor-pointer`}
                                  title="Fast-track to position #1"
                                >
                                  <Zap size={11} /> {isUrgent ? 'Top #1' : 'Prioritize'}
                                </button>

                                <div className="flex items-center gap-1">
                                  {prevStage && (
                                    <button
                                      type="button"
                                      onClick={() => advanceJobStage(job.id, prevStage, 'Stage reverted')}
                                      className="btn btn-xxs btn-secondary cursor-pointer"
                                      title={`Revert to ${prevStage}`}
                                    >
                                      <ArrowLeft size={11} /> Back
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => toggleExpandJob(job.id)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                                  >
                                    Collapse
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1. POP-OUT MODAL: TECHNICAL SPEC SHEET */}
      {specSheetModalJob && (() => {
        const activeJob = jobOrders.find(j => j.id === specSheetModalJob.id) || specSheetModalJob;
        const matchedPrep = prepressJobs?.find(p => p.job_ticket_number === activeJob.job_ticket_number);
        const stageObj = stages.find(s => s.id === activeJob.current_stage);
        const stageLabel = stageObj?.label || activeJob.current_stage;
        const isUrgent = activeJob.priority === 'Urgent' || activeJob.is_rush_order;
        const activeNote = getLastNote(activeJob);
        const author = getLastNoteAuthor(activeJob);

        return (
          <Modal
            isOpen={!!specSheetModalJob}
            onClose={() => setSpecSheetModalJob(null)}
            title={`Technical Spec Sheet — ${activeJob.job_ticket_number}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 text-xs">
              {/* Header / Summary Banner */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Job Order Details</span>
                  <h4 className="font-bold text-slate-900 text-sm">{activeJob.job_title}</h4>
                  <p className="text-slate-600 font-medium text-[11px]">{activeJob.customer_name}</p>
                </div>
                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Stage: {stageLabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Priority: {activeJob.priority || 'Normal'}
                  </span>
                  <span className="text-slate-500 font-semibold text-[10px] flex items-center gap-1">
                    <Clock size={11} /> Target SLA: {activeJob.target_completion_date ? new Date(activeJob.target_completion_date).toLocaleDateString() : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200">
                  <Layers size={14} className="text-slate-500" />
                  <span>Job Engineering & Press Specifications</span>
                </div>
                <table className="w-full text-left text-[11px]">
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-white">
                      <td className="py-2.5 px-3 font-semibold text-slate-500 w-1/3">Print Quantity:</td>
                      <td className="py-2.5 px-3 font-bold text-blue-900">{activeJob.print_quantity?.toLocaleString()} Copies</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Assigned Press Machine:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.assigned_press_machine}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Paper Substrate / Stock:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.paper_details || '130 GSM Gloss Art Paper (23" x 36")'}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Color Inks:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.color_spec || '4/4 Front & Back Process CMYK'}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Plate Exposure / CTP:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.plate_spec || matchedPrep?.plate_status || '4 CTP Thermal Plates (2400 DPI)'}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Screen Ruling:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.screen_ruling || '175 LPI Conventional Screening'}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Post-Press Bindery:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.finishing_spec || 'Thermal Matte Lamination, Folding, Center Pin Stitching, 3-Side Trim'}</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-500">Assigned Lead Operator:</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.assigned_operator || 'Rajesh Nair'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Special Instructions / Notes */}
              {activeNote && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-800 mb-0.5">
                    <span>Special Job Notes / Observations</span>
                    {author && <span className="font-normal text-amber-700 capitalize">by {author}</span>}
                  </div>
                  <p className="italic">"{activeNote}"</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const target = { ...activeJob };
                    setSpecSheetModalJob(null);
                    setSelectedJobForModal(target);
                  }}
                  className="btn btn-sm btn-secondary cursor-pointer flex items-center gap-1.5"
                  title="Open Printable Full Job Ticket"
                >
                  <Printer size={13} />
                  <span>Open Printable Job Ticket</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpecSheetModalJob(null)}
                  className="btn btn-sm btn-outline cursor-pointer"
                >
                  Close Spec Sheet
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* 2. POP-OUT MODAL: COMMENTS & WORKSTATION LOG */}
      {commentsModalJob && (() => {
        const activeJob = jobOrders.find(j => j.id === commentsModalJob.id) || commentsModalJob;
        const commentList = activeJob.comments || [];

        return (
          <Modal
            isOpen={!!commentsModalJob}
            onClose={() => {
              setCommentsModalJob(null);
              setModalNewComment('');
            }}
            title={`Comments & Workstation History — ${activeJob.job_ticket_number}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 text-xs">
              {/* Header Summary */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{activeJob.job_title}</h4>
                  <p className="text-slate-500 text-[11px]">{activeJob.customer_name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  {commentList.length} Logged Entries
                </span>
              </div>

              {/* Chronological Comments Thread */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {commentList.length > 0 ? (
                  commentList.map((com, idx) => {
                    const comText = typeof com === 'string' ? com : (com.text || com.comment || '');
                    const comAuthor = com.author || 'Workstation Operator';
                    const comTime = com.timestamp ? new Date(com.timestamp).toLocaleString() : 'Recent update';
                    return (
                      <div key={com.id || idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-purple-900 flex items-center gap-1">
                            <User size={11} className="text-purple-600" />
                            {comAuthor}
                          </span>
                          <span className="text-slate-400 font-medium">{comTime}</span>
                        </div>
                        <p className="text-[11px] text-slate-800 italic bg-purple-50/50 p-2 rounded border border-purple-100/50">
                          "{comText}"
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-slate-400 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No workstation comments logged yet for this job order.
                  </div>
                )}
              </div>

              {/* Active New Comment Form inside Modal */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">
                  Add Workstation Comment / QA Note:
                </label>
                <textarea
                  rows="2"
                  value={modalNewComment}
                  onChange={(e) => setModalNewComment(e.target.value)}
                  placeholder="Type observations, plate inspection, color approvals, post-press remarks..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!modalNewComment.trim()}
                    onClick={handleModalAddComment}
                    className="btn btn-sm btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Post Comment</span>
                  </button>
                </div>
              </div>

              {/* Modal Close Button */}
              <div className="pt-2 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCommentsModalJob(null);
                    setModalNewComment('');
                  }}
                  className="btn btn-sm btn-secondary cursor-pointer"
                >
                  Close History
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};
