import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileText,
  Send,
  Eye,
  ShieldCheck,
  RotateCcw,
  Layers,
  LayoutList,
  Kanban,
  User,
  Users,
  Check,
  Sparkles,
  ArrowRightLeft,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Calendar,
  Printer,
  Save,
  MessageSquare,
  Flag,
  ArrowRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export const PrepressArtwork = () => {
  const {
    prepressJobs,
    updatePrepressJob,
    jobOrders,
    setJobOrders,
    advanceJobStage,
    setSelectedJobForModal,
    activeSubTab,
    setActiveSubTab,
    activeUser,
    addJobComment,
    openQCFlagModal,
    issues,
    markQCFlagFixed,
    setActiveTab
  } = useApp();

  const currentSubTab = activeSubTab || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedQCJob, setSelectedQCJob] = useState(null);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set of prepress job IDs currently expanded in the Kanban board
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());
  const [specSheetModalJob, setSpecSheetModalJob] = useState(null);
  const [commentsModalJob, setCommentsModalJob] = useState(null);
  const [modalNewComment, setModalNewComment] = useState('');

  // Input states per card: { [jobId]: { hours: '1.0', comment: '', targetStage: '', showPreview: false } }
  const [cardInputs, setCardInputs] = useState({});

  const getInputs = (jobId) => {
    const job = prepressJobs.find(p => p.id === jobId);
    const matched = jobOrders.find(j => j.job_ticket_number === job?.job_ticket_number);
    const defaultStage = matched?.current_stage === 'PlateMaking' ? 'PressRun' : (job?.production_release_authorized ? 'PressRun' : 'PlateMaking');
    return cardInputs[jobId] || {
      hours: '1.0',
      comment: '',
      targetStage: defaultStage,
      showPreview: false
    };
  };

  const updateInput = (jobId, field, val) => {
    setCardInputs(prev => {
      const current = prev[jobId] || getInputs(jobId);
      return {
        ...prev,
        [jobId]: {
          ...current,
          [field]: val
        }
      };
    });
  };

  const toggleExpandCard = (jobId) => {
    setExpandedCardIds(prev => {
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
    setExpandedCardIds(new Set(prepressJobs.map(j => j.id)));
  };

  const handleCollapseAll = () => {
    setExpandedCardIds(new Set());
  };

  const showNotification = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const preflightCount = prepressJobs.filter(j => !j.production_release_authorized || j.revision_count > 1).length;
  const pendingProofsCount = prepressJobs.filter(p => !p.production_release_authorized).length;
  const ctpReadyCount = prepressJobs.filter(p => p.production_release_authorized).length;

  // Filter jobs based on sub-tab, artwork type, and search query
  const filtered = prepressJobs.filter(j => {
    if (currentSubTab === 'preflight') {
      if (j.production_release_authorized && j.revision_count <= 1) return false;
    } else if (currentSubTab === 'proof_signoff') {
      if (j.production_release_authorized) return false;
    } else if (currentSubTab === 'ctp') {
      if (!j.production_release_authorized) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      j.job_ticket_number?.toLowerCase().includes(q) ||
      j.customer_name?.toLowerCase().includes(q) ||
      j.assigned_designer?.toLowerCase().includes(q) ||
      j.notes?.toLowerCase().includes(q);

    return matchesSearch;
  });

  // Helper to dynamically retrieve the latest note or comment
  const getLastNote = (job) => {
    if (job?.comments && job.comments.length > 0) {
      const last = job.comments[job.comments.length - 1];
      const text = typeof last === 'string' ? last : (last?.text || last?.comment);
      if (text && text.trim()) return text.trim();
    }
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched?.comments && matched.comments.length > 0) {
      const last = matched.comments[matched.comments.length - 1];
      const text = typeof last === 'string' ? last : (last?.text || last?.comment);
      if (text && text.trim()) return text.trim();
    }
    if (job?.last_note?.trim()) return job.last_note.trim();
    if (job?.last_comment?.trim()) return job.last_comment.trim();
    if (matched?.last_note?.trim()) return matched.last_note.trim();
    if (matched?.last_comment?.trim()) return matched.last_comment.trim();
    if (job?.notes?.trim()) return job.notes.trim();
    if (matched?.notes?.trim()) return matched.notes.trim();
    return '';
  };

  const getLastNoteAuthor = (job) => {
    if (job?.comments && job.comments.length > 0) {
      const last = job.comments[job.comments.length - 1];
      if (last?.author) return last.author;
    }
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched?.comments && matched.comments.length > 0) {
      const last = matched.comments[matched.comments.length - 1];
      if (last?.author) return last.author;
    }
    return job?.assigned_designer || '';
  };

  // Open the official Job Ticket modal (matching attached screenshot)
  const handleOpenJobTicketModal = (job) => {
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    const activeNote = getLastNote(job);
    if (matched) {
      setSelectedJobForModal({
        ...matched,
        last_note: activeNote || matched.last_note || matched.notes,
        notes: activeNote || matched.notes
      });
    } else {
      setSelectedJobForModal({
        id: job.id,
        job_ticket_number: job.job_ticket_number,
        customer_name: job.customer_name,
        job_title: `${job.artwork_type} for ${job.customer_name}`,
        print_quantity: 3000,
        assigned_press_machine: 'Lithrone 26 (Ramamurthy Nagar Plant)',
        target_completion_date: '2026-08-28T18:00:00Z',
        paper_details: '130 GSM Gloss Art Paper (23" x 36") - 6.5 Reams',
        color_spec: '4/4 Front & Back (Process CMYK)',
        finishing_spec: 'Thermal Matte Lamination, Center Stitch, 3-Side Trim',
        current_stage: job.production_release_authorized ? 'PlateMaking' : 'DesignProofing',
        priority: 'Normal',
        notes: activeNote || job.notes,
        last_note: activeNote || job.notes,
      });
    }
  };

  // Designer team profiles
  const DESIGNER_PROFILES = [
    {
      name: 'Kiran Verma',
      role: 'Pre-Press Lead',
      specialty: 'Offset Imposition & Color Profiles',
      color: '#7c3aed',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      headerBg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
      initials: 'KV'
    },
    {
      name: 'Aruna',
      role: 'Senior DTP Artist',
      specialty: 'Packaging Die-Lines & Vector Keylines',
      color: '#0284c7',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      headerBg: 'bg-gradient-to-r from-sky-50 to-blue-50',
      initials: 'AR'
    },
    {
      name: 'Karthik',
      role: 'Pre-Press Designer',
      specialty: 'Commercial Print Layouts & Pre-Flight',
      color: '#d97706',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      headerBg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      initials: 'KT'
    },
    {
      name: 'Girish',
      role: 'Imposition Specialist',
      specialty: 'Publication Layouts & CTP Thermal Output',
      color: '#059669',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      headerBg: 'bg-gradient-to-r from-emerald-50 to-teal-50',
      initials: 'GR'
    },
    {
      name: 'Anand',
      role: 'DTP & Plate Specialist',
      specialty: 'Proofing QC & Plate Calibrations',
      color: '#4f46e5',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      headerBg: 'bg-gradient-to-r from-indigo-50 to-violet-50',
      initials: 'AN'
    }
  ];

  const designerNames = [
    ...DESIGNER_PROFILES.map(d => d.name),
    ...prepressJobs
      .map(j => j.assigned_designer || 'Unassigned')
      .filter(name => !DESIGNER_PROFILES.some(d => d.name === name))
  ];
  const uniqueDesigners = Array.from(new Set(designerNames));

  const subTabs = [
    {
      id: 'all',
      label: 'All Artwork Jobs',
      icon: Palette,
      badge: `${prepressJobs.length} Files`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'preflight',
      label: 'Artwork Pre-Flight',
      icon: Layers,
      badge: `${preflightCount} Review`,
      badgeColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'proof_signoff',
      label: 'Proof Sign-Off',
      icon: Eye,
      badge: pendingProofsCount > 0 ? `${pendingProofsCount} Pending` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'ctp',
      label: 'CTP Output',
      icon: CheckCircle2,
      badge: `${ctpReadyCount} Plates Exposed`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

    const handleModalAddComment = (job, text) => {
    if (!text || !text.trim()) return;
    const authorName = activeUser?.full_name || job.assigned_designer || 'Studio Specialist';
    const newCommentObj = {
      id: `c-${Date.now()}`,
      text: text.trim(),
      author: authorName,
      hours: 0,
      timestamp: new Date().toISOString()
    };
    const updatedComments = [...(job.comments || []), newCommentObj];

    updatePrepressJob(job.id, {
      comments: updatedComments,
      notes: text.trim(),
      last_note: text.trim()
    });

    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched && addJobComment) {
      addJobComment(matched.id, text.trim(), 0);
    }
    showNotification(`Added comment to ${job.job_ticket_number}.`);
  };

  const handleApproveAndRelease = (job) => {
    updatePrepressJob(job.id, {
      customer_approval_status: 'Approved',
      production_release_authorized: true,
      ctp_plates_generated: 4,
      approved_date: new Date().toISOString(),
      approval_mode: 'Digital Sign-Off Verified'
    });
    // Advance linked job order
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched) {
      advanceJobStage(matched.id, 'PlateMaking', 'CTP Plates authorized from Prepress Studio.');
    }
    showNotification(`Artwork ${job.job_ticket_number} approved! 4 CTP Plates queued for press release.`);
  };

  const handleSendToPress = (job) => {
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched) {
      advanceJobStage(
        matched.id,
        'PressRun',
        `CTP Plates authorized and released from Pre-Press Studio to Press Terminal by ${job.assigned_designer || activeUser?.full_name || 'Pre-Press'}.`
      );
    } else {
      const newJob = {
        id: `job-${Date.now()}`,
        job_ticket_number: job.job_ticket_number,
        quote_id: `q-${Date.now()}`,
        customer_id: `cust-${Date.now()}`,
        customer_name: job.customer_name,
        job_title: job.job_title || `${job.customer_name} Commercial Print Order`,
        production_type: 'Offset',
        print_quantity: 3000,
        paper_details: '130 GSM Gloss Art Paper (23" x 36") - 6.5 Reams',
        color_spec: '4/4 Front & Back (Process CMYK)',
        finishing_spec: 'Thermal Matte Lamination, Center Stitch, 3-Side Trim',
        current_stage: 'PressRun',
        priority: 'Normal',
        is_rush_order: false,
        queue_position: jobOrders.length + 1,
        assigned_press_machine: 'Komori Lithrone GL-40 (5-Color + Coater)',
        assigned_operator: 'Rajesh Nair',
        created_at: new Date().toISOString(),
        target_completion_date: new Date(Date.now() + 86400000 * 2).toISOString()
      };
      setJobOrders(prev => [newJob, ...prev]);
    }

    updatePrepressJob(job.id, {
      customer_approval_status: 'Approved',
      production_release_authorized: true,
      released_to_press: true,
      ctp_plates_generated: job.ctp_plates_generated || 4,
      approved_date: job.approved_date || new Date().toISOString(),
      approval_mode: job.approval_mode || 'Digital Sign-Off Verified'
    });

    showNotification(`Job ${job.job_ticket_number} sent to Press Terminal (MES) queue!`);
  };

  const handleQCResolve = (issueId, ticketNo) => {
    if (issueId && markQCFlagFixed) {
      markQCFlagFixed(issueId, `QC defect verified and cleared by Pre-press Studio (${activeUser?.full_name || 'Studio Lead'}).`);
    }
    if (selectedQCJob) {
      updatePrepressJob(selectedQCJob.id, { qc_flagged: false });
    }
    showNotification(`QC Flag cleared for ${ticketNo}. Ready for press run.`);
    setSelectedQCJob(null);
  };

  const handleAdvanceWithLog = (job) => {
    const inputs = getInputs(job.id);
    const hrs = parseFloat(inputs.hours) || 0;
    const comment = inputs.comment.trim();
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    const targetStage = inputs.targetStage || (matched?.current_stage === 'PlateMaking' ? 'PressRun' : 'PlateMaking');

    const newHours = (job.hours_worked || 0) + hrs;
    const newCommentObj = comment ? {
      id: `c-${Date.now()}`,
      text: comment,
      author: activeUser?.full_name || job.assigned_designer,
      hours: hrs,
      timestamp: new Date().toISOString()
    } : null;

    const updatedComments = newCommentObj ? [...(job.comments || []), newCommentObj] : (job.comments || []);

    updatePrepressJob(job.id, {
      hours_worked: newHours,
      comments: updatedComments,
      notes: comment || job.notes,
      last_note: comment || job.last_note || job.notes,
      production_release_authorized: targetStage === 'PlateMaking' || targetStage === 'PressRun' ? true : job.production_release_authorized,
      released_to_press: targetStage === 'PressRun' ? true : job.released_to_press,
      ctp_plates_generated: targetStage === 'PlateMaking' || targetStage === 'PressRun' ? 4 : job.ctp_plates_generated
    });

    // Also advance linked production planning job if available
    if (matched) {
      advanceJobStage(matched.id, targetStage, comment || `Prepress handoff by ${job.assigned_designer}`, hrs);
    }

    showNotification(`Logged ${hrs}h and advanced ${job.job_ticket_number} to ${targetStage}!`);

    // Reset inputs
    setCardInputs(prev => ({
      ...prev,
      [job.id]: {
        ...prev[job.id],
        comment: '',
        hours: '1.0'
      }
    }));
  };

  const handleSaveLogOnly = (job) => {
    const inputs = getInputs(job.id);
    const hrs = parseFloat(inputs.hours) || 0;
    const comment = inputs.comment.trim();

    if (!comment && hrs <= 0) return;

    const newHours = (job.hours_worked || 0) + hrs;
    const newCommentObj = comment ? {
      id: `c-${Date.now()}`,
      text: comment,
      author: activeUser?.full_name || job.assigned_designer,
      hours: hrs,
      timestamp: new Date().toISOString()
    } : null;

    const updatedComments = newCommentObj ? [...(job.comments || []), newCommentObj] : (job.comments || []);

    updatePrepressJob(job.id, {
      hours_worked: newHours,
      comments: updatedComments,
      notes: comment || job.notes,
      last_note: comment || job.last_note || job.notes,
    });

    // Sync log to linked production planning job if matched
    const matched = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
    if (matched && comment) {
      advanceJobStage(matched.id, matched.current_stage, comment, hrs);
    }

    showNotification(`Logged ${hrs}h and saved comment for ${job.job_ticket_number}.`);

    setCardInputs(prev => ({
      ...prev,
      [job.id]: {
        ...prev[job.id],
        comment: '',
        hours: '1.0'
      }
    }));
  };

  const handleReassignDesigner = (jobId, newDesigner) => {
    updatePrepressJob(jobId, { assigned_designer: newDesigner });
    showNotification(`Job reassigned to ${newDesigner}.`);
  };

  const handleIncrementRevision = (job) => {
    const nextRev = (job.revision_count || 1) + 1;
    updatePrepressJob(job.id, {
      revision_count: nextRev,
      current_version: `V${nextRev}`,
      customer_approval_status: 'Pending Customer Review',
      production_release_authorized: false
    });
    showNotification(`Revision updated to V${nextRev} for ${job.job_ticket_number}.`);
  };

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              02
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Prepress Studio</h1>
              <p className="text-xs text-slate-500">Artwork validation, proofing sign-off and CTP plate queue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">


        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>{feedbackToast}</span>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-emerald-700 hover:text-emerald-900 text-[10px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Controls Toolbar: Two-View Switcher + Search + Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Two-View Toggle Window */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tabular List View"
              >
                <LayoutList size={14} className={viewMode === 'list' ? 'text-purple-600' : 'text-slate-500'} />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Designer Workload Kanban Board"
              >
                <Kanban size={14} className={viewMode === 'kanban' ? 'text-purple-600' : 'text-slate-500'} />
                <span>Designer Board</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] bg-purple-100 text-purple-700 font-bold">
                  {uniqueDesigners.length} Staff
                </span>
              </button>
            </div>

            {/* Quick Search Box */}
            <div className="relative">
              <Search size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, customer, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-purple-500 focus:bg-white w-56"
              />
            </div>

            {/* Filter Dropdown Button placed next to Search Bar */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition cursor-pointer border shadow-2xs ${
                  currentSubTab !== 'all'
                    ? 'bg-purple-50 border-purple-300 text-purple-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title="Filter Artwork by Stage"
              >
                <Filter size={13} className={currentSubTab !== 'all' ? 'text-purple-600' : 'text-slate-500'} />
                <span>Filter</span>
                {currentSubTab !== 'all' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                )}
              </button>

              {/* Filter Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 space-y-1 animate-in fade-in duration-100">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-100 flex items-center justify-between">
                    <span>Filter By Stage</span>
                    {currentSubTab !== 'all' && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubTab('all');
                          setIsFilterOpen(false);
                        }}
                        className="text-purple-600 hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {subTabs.map(tab => {
                    const Icon = tab.icon;
                    const isSelected = currentSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer text-left ${
                          isSelected
                            ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                            : 'text-slate-700 hover:bg-slate-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={14} className={isSelected ? 'text-purple-600' : 'text-slate-400'} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span className={`px-1.5 py-0.2 rounded-full font-mono text-[9px] font-bold ${tab.badgeColor}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VIEW 1: THE CURRENT LIST FORMAT */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <LayoutList size={15} className="text-purple-600" />
                <span className="font-bold text-xs text-slate-800 uppercase font-mono">
                  Artwork Job Register ({filtered.length} Jobs)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Showing {filtered.length} of {prepressJobs.length} total records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                    <th className="p-2.5">Job Ticket No</th>
                    <th className="p-2.5">Customer Name</th>
                    <th className="p-2.5">Artwork Source / Type</th>
                    <th className="p-2.5">Assigned Designer</th>
                    <th className="p-2.5 text-center">Version & Revisions</th>
                    <th className="p-2.5">Proof Channel & Date</th>
                    <th className="p-2.5 text-center">Approval Status</th>
                    <th className="p-2.5 text-center">CTP Release & Job Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No prepress artwork jobs found matching the current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(job => (
                      <tr key={job.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">{job.job_ticket_number}</span>
                            {(job.qc_flagged || issues.some(i => i.job_ticket_number === job.job_ticket_number && !i.resolved)) && (
                              <button
                                type="button"
                                onClick={() => setSelectedQCJob(job)}
                                className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 flex items-center gap-0.5 cursor-pointer transition shadow-2xs"
                                title="Click to view and resolve QC Flag details"
                              >
                                <Flag size={9} /> QC
                              </button>
                            )}
                            {job.returned_from_qc && (
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-amber-100 text-amber-800 border border-amber-300">
                                REWORK
                              </span>
                            )}
                          </div>
                          {getLastNote(job) && (
                            <div className="text-[10px] text-slate-500 italic truncate max-w-xs" title={`Last Note: ${getLastNote(job)}`}>
                              "{getLastNote(job)}"
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{job.customer_name}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200">
                            {job.artwork_type}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-800 font-semibold">
                              {job.assigned_designer || 'Unassigned'}
                            </span>
                            <select
                              value={job.assigned_designer || ''}
                              onChange={(e) => handleReassignDesigner(job.id, e.target.value)}
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-slate-600 focus:outline-none"
                              title="Reassign Designer"
                            >
                              {uniqueDesigners.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {job.current_version}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1">({job.revision_count} revs)</span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1">
                            <span>{job.proof_shared_channel}</span>
                            {job.proof_shared_date && (
                              <span className="text-slate-400 text-[10px] font-mono">
                                ({new Date(job.proof_shared_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            job.customer_approval_status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {job.customer_approval_status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {(() => {
                              const linkedJob = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
                              const isInPress = linkedJob?.current_stage === 'PressRun' || linkedJob?.current_stage === 'FinishingQC' || linkedJob?.current_stage === 'DispatchReady' || job.released_to_press;
                              const isAuthorized = job.production_release_authorized;

                              if (isInPress) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setActiveTab('press_terminal')}
                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                    title="Job active in 04 Press Terminal (MES) - Click to view"
                                  >
                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                    <span>In Press Terminal</span>
                                    <ArrowRight size={11} />
                                  </button>
                                );
                              }

                              if (isAuthorized) {
                                return (
                                  <button
                                    type="button"
                                    onClick={() => handleSendToPress(job)}
                                    className="px-2.5 py-1 bg-[#002b41] hover:bg-slate-800 text-white rounded text-[10px] font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    title="Send authorized CTP plates to 04 Press Terminal queue"
                                  >
                                    <Printer size={12} />
                                    <span>Send to Press</span>
                                    <ArrowRight size={11} />
                                  </button>
                                );
                              }

                              return (
                                <button
                                  type="button"
                                  onClick={() => handleApproveAndRelease(job)}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[10px] font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                                  title="Approve artwork and authorize CTP plates"
                                >
                                  <CheckCircle2 size={12} />
                                  <span>Approve & Release</span>
                                </button>
                              );
                            })()}

                            {/* Job Ticket Modal Button (Matches Attached Image) */}
                            <button
                              type="button"
                              onClick={() => setSpecSheetModalJob(job)}
                              className="p-1.5 bg-slate-100 hover:bg-blue-50 text-blue-700 rounded border border-slate-200 transition cursor-pointer"
                              title="View Spec Sheet"
                            >
                              <FileText size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCommentsModalJob(job);
                                setModalNewComment('');
                              }}
                              className="p-1.5 bg-slate-100 hover:bg-purple-50 text-purple-700 rounded border border-slate-200 transition cursor-pointer"
                              title="Studio Shift Log & Comments"
                            >
                              <MessageSquare size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openQCFlagModal(job, 'Pre-Press Studio')}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition cursor-pointer"
                              title="Raise Quality Control Flag"
                            >
                              <Flag size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenJobTicketModal(job)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 transition cursor-pointer"
                              title="Open Printable Full Job Ticket"
                            >
                              <Printer size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('planning')}
                              className="p-1.5 bg-slate-100 hover:bg-amber-50 text-amber-800 rounded border border-slate-200 transition cursor-pointer"
                              title="View in 03 Planning & Kanban"
                            >
                              <Kanban size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: THE DESIGNER WORKLOAD KANBAN BOARD */}
        {viewMode === 'kanban' && (
          <div className="space-y-3">
            {/* Board Controls Toolbar: Condensed / Expanded Switcher */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Kanban size={15} className="text-purple-600" />
                <span className="font-bold text-xs text-slate-800 uppercase font-mono tracking-wide">
                  Designer Workload Kanban Board
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-[11px] text-slate-500">
                  Cards are <b>condensed with date</b>. Click any job card to expand hours worked, comments, and the full Job Card.
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition cursor-pointer"
                  title="Expand all cards"
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
                {expandedCardIds.size > 0 && (
                  <span className="ml-1 text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                    {expandedCardIds.size} Expanded
                  </span>
                )}
              </div>
            </div>

            {/* Kanban Columns Grid - One Column per Designer */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {uniqueDesigners.map(designerName => {
                const profile = DESIGNER_PROFILES.find(p => p.name === designerName) || {
                  name: designerName,
                  role: 'Pre-Press Specialist',
                  specialty: 'Graphic & Imposition Production',
                  color: '#64748b',
                  badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
                  headerBg: 'bg-gradient-to-r from-slate-50 to-gray-50',
                  initials: designerName.slice(0, 2).toUpperCase()
                };

                const designerJobs = filtered.filter(
                  j => (j.assigned_designer || 'Unassigned') === designerName
                );
                const approvedCount = designerJobs.filter(j => j.customer_approval_status === 'Approved').length;
                const pendingCount = designerJobs.filter(j => j.customer_approval_status !== 'Approved').length;

                return (
                  <div
                    key={designerName}
                    className="bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col min-h-[500px] shadow-2xs overflow-hidden"
                  >
                    {/* Column Header: Designer Identity & Workload */}
                    <div
                      className={`p-3 border-b border-slate-200 ${profile.headerBg}`}
                      style={{ borderTop: `3px solid ${profile.color}` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs"
                            style={{ backgroundColor: profile.color }}
                          >
                            {profile.initials}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              {profile.name}
                            </h3>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              {profile.role}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-white text-slate-700 border border-slate-200 shadow-2xs">
                          {designerJobs.length} {designerJobs.length === 1 ? 'Job' : 'Jobs'}
                        </span>
                      </div>

                      {/* Micro Workload Sub-bar */}
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500">
                        <span className="truncate max-w-[170px]" title={profile.specialty}>
                          {profile.specialty}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {approvedCount} Ok
                          </span>
                          {pendingCount > 0 && (
                            <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {pendingCount} Pend
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cards Container for This Designer */}
                    <div className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[680px]">
                      {designerJobs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white/50">
                          <User size={24} className="text-slate-300 mb-1" />
                          <span className="text-xs font-medium">No Active Jobs</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Ready for next assignment</span>
                        </div>
                      ) : (
                        designerJobs.map(job => {
                          const isApproved = job.customer_approval_status === 'Approved';
                          const isAuthorized = job.production_release_authorized;
                          const isExpanded = expandedCardIds.has(job.id);
                          const inputs = getInputs(job.id);

                          const formattedDate = job.proof_shared_date
                            ? new Date(job.proof_shared_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '26 Aug 2026';

                          return (
                            <div
                              key={job.id}
                              onClick={() => toggleExpandCard(job.id)}
                              className={`bg-white border rounded-lg p-2.5 transition flex flex-col gap-1.5 select-none cursor-pointer group ${
                                isExpanded
                                  ? 'border-purple-400 shadow-md ring-1 ring-purple-300'
                                  : 'border-slate-200 shadow-xs hover:border-slate-400 hover:shadow-xs'
                              }`}
                              title={isExpanded ? 'Click to collapse card' : 'Click to expand details'}
                            >
                              {/* Top Bar: Ticket No, Current Version & Expand Chevron */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {job.job_ticket_number}
                                  </span>
                                  <span className="font-mono font-bold text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                    {job.current_version}
                                  </span>
                                  {(job.qc_flagged || issues.some(i => i.job_ticket_number === job.job_ticket_number && !i.resolved)) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedQCJob(job);
                                      }}
                                      className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-0.5 shadow-2xs cursor-pointer"
                                      title="Click to view and resolve QC Flag details"
                                    >
                                      <Flag size={8} /> QC
                                    </button>
                                  )}
                                  {job.returned_from_qc && (
                                    <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-amber-100 text-amber-800 border border-amber-300">
                                      REWORK
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className={`px-2 py-0.2 rounded-full font-mono text-[9px] font-bold ${
                                    isApproved
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    {isApproved ? 'Approved' : 'Pending'}
                                  </span>
                                  <span className="text-slate-400 group-hover:text-purple-600 transition p-0.5 rounded">
                                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  </span>
                                </div>
                              </div>

                              {/* CONDENSED VIEW (Minimal Details with DATE & Send to Press Button) */}
                              {!isExpanded && (
                                <div className="space-y-1.5 pt-0.5">
                                  <h4 className="font-bold text-xs text-slate-900 truncate leading-snug">
                                    {job.customer_name}
                                  </h4>

                                  {/* Last Note snippet in collapsed view */}
                                  {getLastNote(job) && (
                                    <div className="text-[10px] text-slate-500 italic truncate" title={`Last Note: ${getLastNote(job)}`}>
                                      "{getLastNote(job)}"
                                    </div>
                                  )}

                                  {/* Minimal Date + Artwork Type Bottom Bar */}
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                                      <Calendar size={11} className="text-purple-600" />
                                      <span>{formattedDate}</span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-600 text-[9px]">
                                        {job.artwork_type}
                                      </span>
                                      {isAuthorized ? (
                                        <span className="font-bold text-emerald-700 text-[9px]">4 Plt</span>
                                      ) : (
                                        <span className="text-amber-700 text-[9px]">Rev</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* One-click Action Button on Condensed Card */}
                                  {(() => {
                                    const linkedJob = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
                                    const isInPress = linkedJob?.current_stage === 'PressRun' || linkedJob?.current_stage === 'FinishingQC' || linkedJob?.current_stage === 'DispatchReady' || job.released_to_press;

                                    return (
                                      <div className="pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                        {isInPress ? (
                                          <button
                                            type="button"
                                            onClick={() => setActiveTab('press_terminal')}
                                            className="w-full py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                            title="Job active in 04 Press Terminal (MES) - Click to view"
                                          >
                                            <CheckCircle2 size={11} className="text-emerald-600" />
                                            <span>In Press Terminal</span>
                                            <ArrowRight size={11} />
                                          </button>
                                        ) : isAuthorized ? (
                                          <button
                                            type="button"
                                            onClick={() => handleSendToPress(job)}
                                            className="w-full py-1 px-2 bg-[#002b41] hover:bg-slate-800 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                            title="Send CTP Plates to 04 Press Terminal queue"
                                          >
                                            <Printer size={11} />
                                            <span>Send to Press</span>
                                            <ArrowRight size={11} />
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveAndRelease(job)}
                                            className="w-full py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                            title="Approve & Generate CTP Plates"
                                          >
                                            <CheckCircle2 size={11} />
                                            <span>Approve & Release</span>
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* EXPANDED VIEW (Full Details, Job Card View, Hours Worked, Comments, Next Stage) */}
                              {isExpanded && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-100 text-xs"
                                >
                                  {/* Full Customer & Date */}
                                  <div>
                                    <h4 className="font-bold text-xs text-slate-900 leading-snug">
                                      {job.customer_name}
                                    </h4>
                                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-0.5">
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        {job.artwork_type}
                                      </span>
                                      <span className="font-mono text-purple-700 font-bold text-[10px]">
                                        <Calendar size={11} className="inline mr-1 text-purple-600" />
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
                                            <span className="font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                                              <MessageSquare size={10} className="text-purple-600" /> Last Note
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

                                  {/* Proofing Channel & Approval Info */}
                                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <Send size={11} className="text-slate-400" />
                                      <span>{job.proof_shared_channel}</span>
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      Total Logged: <b>{job.hours_worked || 0} hrs</b>
                                    </span>
                                  </div>

                                  {/* 3 Pop-Out Trigger Buttons (Similar to Press Terminal) */}
                                  <div className="grid grid-cols-3 gap-1 pt-1 w-full max-w-full box-border">
                                    <button
                                      type="button"
                                      onClick={() => setSpecSheetModalJob(job)}
                                      className="min-w-0 w-full py-1.5 px-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs overflow-hidden"
                                      title="Pop out technical specification sheet"
                                    >
                                      <FileText size={11} className="text-blue-600 shrink-0" />
                                      <span className="truncate">Spec Sheet</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCommentsModalJob(job);
                                        setModalNewComment('');
                                      }}
                                      className="min-w-0 w-full py-1.5 px-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs overflow-hidden"
                                      title="Pop out comments & studio shift log"
                                    >
                                      <MessageSquare size={11} className="text-purple-600 shrink-0" />
                                      <span className="truncate">Shift Log</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenJobTicketModal(job)}
                                      className="min-w-0 w-full py-1.5 px-1 bg-[#002b41] hover:bg-[#002b41]/90 text-white rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs overflow-hidden"
                                      title="Pop out full printable job ticket"
                                    >
                                      <Printer size={11} className="shrink-0" />
                                      <span className="truncate">Full Card</span>
                                    </button>
                                  </div>

                                  {/* WORK LOG & COMMENTS & STAGE PROGRESSION PANEL */}
                                  <div className="bg-purple-50/60 border border-purple-200 rounded-lg p-2.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-purple-900 text-[11px] flex items-center gap-1">
                                        <Clock size={12} className="text-purple-600" />
                                        Log Hours & Studio Comments
                                      </span>
                                      <span className="text-[10px] font-mono text-purple-700">
                                        Logged: <b>{job.hours_worked || 0} hrs</b>
                                      </span>
                                    </div>

                                    {/* Hours Worked Input & Presets */}
                                    <div className="space-y-1">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <label className="font-semibold text-slate-700">Hours Worked on Artwork:</label>
                                        <div className="flex gap-1">
                                          {['0.5', '1.0', '2.0', '4.0'].map(hrs => (
                                            <button
                                              key={hrs}
                                              type="button"
                                              onClick={() => updateInput(job.id, 'hours', hrs)}
                                              className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border transition ${
                                                inputs.hours === hrs
                                                  ? 'bg-purple-600 text-white border-purple-600'
                                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                              }`}
                                            >
                                              +{hrs}h
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                      <input
                                        type="number"
                                        step="0.25"
                                        min="0"
                                        value={inputs.hours}
                                        onChange={(e) => updateInput(job.id, 'hours', e.target.value)}
                                        placeholder="Enter hours worked..."
                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono font-bold text-purple-800 focus:outline-none focus:border-purple-500"
                                      />
                                    </div>

                                    {/* Comments Textarea */}
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-semibold text-slate-700">
                                        Pre-Press / Proofing Comments:
                                      </label>
                                      <textarea
                                        rows="2"
                                        value={inputs.comment}
                                        onChange={(e) => updateInput(job.id, 'comment', e.target.value)}
                                        placeholder="Mention color calibration, bleed adjustments, customer revisions, plate notes..."
                                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-purple-500"
                                      />
                                    </div>

                                    {/* Display Recent Comments History */}
                                    {job.comments && job.comments.length > 0 && (
                                      <div className="max-h-24 overflow-y-auto space-y-1 pt-1 border-t border-purple-200/60">
                                        <span className="text-[9px] font-mono text-slate-400 uppercase font-bold block">
                                          Comments History ({job.comments.length}):
                                        </span>
                                        {job.comments.map(c => (
                                          <div key={c.id} className="p-1 bg-white rounded border border-slate-200 text-[10px]">
                                            <div className="flex justify-between text-slate-400 font-mono text-[9px]">
                                              <span className="font-bold text-slate-700">{c.author}</span>
                                              <span>{c.hours > 0 ? `(${c.hours}h logged)` : ''}</span>
                                            </div>
                                            <p className="text-slate-700 mt-0.5">{c.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Next Stage Progression Controls */}
                                    <div className="pt-2 border-t border-purple-200/60 space-y-1.5">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="font-semibold text-slate-700">Handoff Stage:</span>
                                        <select
                                          value={inputs.targetStage}
                                          onChange={(e) => updateInput(job.id, 'targetStage', e.target.value)}
                                          className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-purple-900 text-[10px] focus:outline-none"
                                        >
                                          <option value="PressRun">3. Offset Press Run (Press Terminal)</option>
                                          <option value="PlateMaking">2. CTP Plate Making (Output)</option>
                                          <option value="DesignProofing">1. Revert to Pre-Flight</option>
                                        </select>
                                      </div>

                                      <div className="flex items-center gap-1.5 pt-1">
                                        <button
                                          type="button"
                                          onClick={() => handleSaveLogOnly(job)}
                                          className="py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                                          title="Save comments and hours without advancing stage"
                                        >
                                          <Save size={11} /> Save Log
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleAdvanceWithLog(job)}
                                          className="flex-1 py-1 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Send size={11} /> Move Stage
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleSendToPress(job)}
                                          className="flex-1 py-1 px-2 bg-[#002b41] hover:bg-slate-800 text-white rounded font-bold text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                          title="Direct send to 04 Press Terminal queue"
                                        >
                                          <Printer size={11} /> Send to Press
                                        </button>
                                      </div>

                                      {/* Quick Navigation to Next Menus */}
                                      <div className="flex items-center justify-between pt-1 border-t border-purple-200/40 text-[10px]">
                                        <button
                                          type="button"
                                          onClick={() => setActiveTab('planning')}
                                          className="hover:underline flex items-center gap-1 font-semibold text-purple-700 cursor-pointer"
                                        >
                                          <Kanban size={10} /> View in Planning (03)
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setActiveTab('press_terminal')}
                                          className="hover:underline flex items-center gap-1 font-semibold text-emerald-700 cursor-pointer"
                                        >
                                          <Printer size={10} /> Open Press Terminal (04) &rarr;
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Actions & Reassign Bar */}
                                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between gap-1.5">
                                      {(() => {
                                        const linkedJob = jobOrders.find(j => j.job_ticket_number === job.job_ticket_number);
                                        const isInPress = linkedJob?.current_stage === 'PressRun' || linkedJob?.current_stage === 'FinishingQC' || linkedJob?.current_stage === 'DispatchReady' || job.released_to_press;

                                        if (isInPress) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => setActiveTab('press_terminal')}
                                              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-1 px-2 rounded text-[10px] transition shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                                              title="Open in 04 Press Terminal (MES)"
                                            >
                                              <CheckCircle2 size={11} className="text-emerald-600" />
                                              <span>In Press Terminal</span>
                                              <ArrowRight size={11} />
                                            </button>
                                          );
                                        }

                                        if (isAuthorized) {
                                          return (
                                            <button
                                              type="button"
                                              onClick={() => handleSendToPress(job)}
                                              className="flex-1 bg-[#002b41] hover:bg-slate-800 text-white font-bold py-1 px-2 rounded text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                              title="Send to 04 Press Terminal queue"
                                            >
                                              <Printer size={11} />
                                              <span>Send to Press</span>
                                              <ArrowRight size={11} />
                                            </button>
                                          );
                                        }

                                        return (
                                          <button
                                            type="button"
                                            onClick={() => handleApproveAndRelease(job)}
                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-[10px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                          >
                                            <CheckCircle2 size={12} />
                                            <span>Approve & Release CTP</span>
                                          </button>
                                        );
                                      })()}

                                      <button
                                        type="button"
                                        onClick={() => handleIncrementRevision(job)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1 px-2 rounded text-[10px] transition border border-slate-200 flex items-center justify-center gap-1 cursor-pointer"
                                        title="Bump Revision for Corrections"
                                      >
                                        <RotateCcw size={11} />
                                        <span>New Rev</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openQCFlagModal(job, 'Pre-Press Studio');
                                        }}
                                        className="py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                                        title="Raise Quality Control Flag"
                                      >
                                        <Flag size={11} className="text-amber-600" />
                                        <span>QC Flag</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => toggleExpandCard(job.id)}
                                        className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                                      >
                                        Collapse
                                      </button>
                                    </div>

                                    {/* Reassign Designer Selector */}
                                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-1 rounded">
                                      <span className="flex items-center gap-1 text-slate-400">
                                        <ArrowRightLeft size={10} /> Move to Designer:
                                      </span>
                                      <select
                                        value={job.assigned_designer || ''}
                                        onChange={(e) => handleReassignDesigner(job.id, e.target.value)}
                                        className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 font-semibold focus:outline-none"
                                      >
                                        {uniqueDesigners.map(dName => (
                                          <option key={dName} value={dName}>
                                            {dName}
                                          </option>
                                        ))}
                                      </select>
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
        )}
        {/* ========================================================= */}
        {/* 1. POP-OUT MODAL: TECHNICAL SPECIFICATION SHEET          */}
        {/* ========================================================= */}
        {specSheetModalJob && (() => {
          const matched = jobOrders.find(j => j.job_ticket_number === specSheetModalJob.job_ticket_number);
          const activeJob = matched || specSheetModalJob;
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
                    <h4 className="font-bold text-slate-900 text-sm">{activeJob.job_title || `${activeJob.customer_name} Artwork`}</h4>
                    <p className="text-slate-600 font-medium text-[11px]">{activeJob.customer_name}</p>
                  </div>
                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      Stage: {activeJob.current_stage || (activeJob.production_release_authorized ? 'PlateMaking' : 'DesignProofing')}
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
                    <span>Job Engineering & Prepress Specifications</span>
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-white">
                        <td className="py-2.5 px-3 font-semibold text-slate-500 w-1/3">Print Quantity:</td>
                        <td className="py-2.5 px-3 font-bold text-purple-900">{activeJob.print_quantity ? `${activeJob.print_quantity.toLocaleString()} Copies` : '3,000 Copies'}</td>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-500">Assigned Press Machine:</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.assigned_press_machine || 'Ryobi 32 (Ramamurthy Nagar Plant)'}</td>
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
                        <td className="py-2.5 px-3 font-medium text-slate-800">{activeJob.plate_spec || '4 CTP Thermal Plates (2400 DPI)'}</td>
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
                        <td className="py-2.5 px-3 font-semibold text-slate-500">Assigned Designer:</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{specSheetModalJob.assigned_designer || activeJob.assigned_designer || 'Kiran Verma'}</td>
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
                      setSpecSheetModalJob(null);
                      handleOpenJobTicketModal(specSheetModalJob);
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

        {/* ========================================================= */}
        {/* 2. POP-OUT MODAL: STUDIO SHIFT LOG & COMMENTS            */}
        {/* ========================================================= */}
        {commentsModalJob && (() => {
          const matched = jobOrders.find(j => j.job_ticket_number === commentsModalJob.job_ticket_number);
          const commentList = commentsModalJob.comments && commentsModalJob.comments.length > 0
            ? commentsModalJob.comments
            : (matched?.comments || []);

          return (
            <Modal
              isOpen={!!commentsModalJob}
              onClose={() => {
                setCommentsModalJob(null);
                setModalNewComment('');
              }}
              title={`Studio Shift Log & Comments — ${commentsModalJob.job_ticket_number}`}
              maxWidth="max-w-xl"
            >
              <div className="space-y-4 text-xs">
                {/* Header Summary */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{commentsModalJob.customer_name}</h4>
                    <p className="text-slate-500 text-[11px]">{commentsModalJob.artwork_type} • Designer: <b>{commentsModalJob.assigned_designer}</b></p>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-slate-400">Total Entries: </span>
                    <span className="font-bold text-purple-700">{commentList.length}</span>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {commentList.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      No studio comments or shift logs recorded for this artwork job yet.
                    </div>
                  ) : (
                    commentList.map((c, i) => (
                      <div key={c.id || i} className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                            <User size={10} className="text-purple-600" />
                            {c.author || 'Studio Specialist'}
                          </span>
                          <span className="text-slate-400 font-mono text-[9px]">
                            {c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Just now'}
                            {c.hours > 0 ? ` • ${c.hours}h logged` : ''}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs italic">"{c.text || c.comment}"</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add New Comment Box */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700 text-xs">
                    Add Pre-Press Note / Customer Revision Log:
                  </label>
                  <div className="flex gap-2">
                    <textarea
                      rows="2"
                      value={modalNewComment}
                      onChange={(e) => setModalNewComment(e.target.value)}
                      placeholder="Log artwork revisions, bleed/margin corrections, color proof sign-offs, plate remarks..."
                      className="flex-1 p-2 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Logged by: <b>{activeUser?.full_name || commentsModalJob.assigned_designer || 'Studio Specialist'}</b>
                    </span>
                    <button
                      type="button"
                      disabled={!modalNewComment.trim()}
                      onClick={() => {
                        if (!modalNewComment.trim()) return;
                        handleModalAddComment(commentsModalJob, modalNewComment.trim());
                        setModalNewComment('');
                      }}
                      className="btn btn-sm btn-primary cursor-pointer disabled:opacity-50"
                    >
                      <Send size={12} /> Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          );
        })()}

        {/* ========================================================= */}
        {/* 3. POP-OUT MODAL: INTERACTIVE QC ISSUE & RESOLUTION       */}
        {/* ========================================================= */}
        {selectedQCJob && (() => {
          const activeIssues = issues.filter(
            i => i.job_ticket_number === selectedQCJob.job_ticket_number && !i.resolved
          );
          const topIssue = activeIssues[0];

          return (
            <Modal
              isOpen={!!selectedQCJob}
              onClose={() => setSelectedQCJob(null)}
              title={`Quality Control Flag Details — ${selectedQCJob.job_ticket_number}`}
              maxWidth="max-w-lg"
            >
              <div className="p-1 space-y-3.5 text-xs select-none">
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-800 text-xs flex items-center gap-1.5">
                      <Flag size={13} className="text-rose-600" />
                      Active QC Flag ({activeIssues.length || 1} Reported)
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-rose-600 text-white shadow-2xs">
                      {topIssue?.severity || 'Major'} Severity
                    </span>
                  </div>

                  <div className="text-slate-800 space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Customer:</span>
                      <span className="font-bold text-slate-900">{selectedQCJob.customer_name}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Defect Category:</span>
                      <span className="font-semibold text-rose-700">{topIssue?.defect_category || topIssue?.issue_type || 'Color Mismatch & Delta-E'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Source Station:</span>
                      <span className="font-mono text-slate-700">{topIssue?.source_terminal || 'Pre-Press / Press'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Reported By:</span>
                      <span className="font-mono text-slate-700">{topIssue?.reported_by_name || 'QC Inspector'}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-2.5 border border-rose-200 text-slate-700">
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-rose-600 block mb-0.5">
                      Defect Description:
                    </span>
                    <p className="text-xs leading-relaxed italic text-slate-800">
                      "{topIssue?.description || 'Defect flagged for pre-flight and cylinder ink fountain verification.'}"
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  Quality control flags are recorded for traceability. Once pre-press adjustments or proof checks are verified, click <b>Resolve Flag</b> to clear the warning and release plates to press.
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQCJob(null);
                      setActiveTab('qc');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition cursor-pointer"
                  >
                    Open QC Module (06)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQCJob(null)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQCResolve(topIssue?.id, selectedQCJob.job_ticket_number)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Resolve & Clear Flag</span>
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          );
        })()}
      </div>
    </div>
  );
};
