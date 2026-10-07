import React, { useState } from 'react';
import {
  Printer,
  Gauge,
  Clock,
  Layers,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  LayoutList,
  Kanban,
  Search,
  FileText,
  MessageSquare,
  Filter,
  Sliders,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Calendar,
  Save,
  Send,
  Plus,
  History,
  User,
  ShieldCheck,
  FileCheck,
  Check,
  Building2,
  ArrowRight,
  Eye,
  Boxes
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

// Master Printing Press Fleet Specifications (from airules.md Architecture)
const MACHINE_FLEET = [
  {
    id: 'mac-1',
    name: 'Ryobi 32',
    shortName: 'Ryobi 32',
    plant: 'Kalkere Plant',
    type: 'Offset Press (Single/2-Color)',
    maxSheet: '13" x 19"',
    speed: '10,000 IPH',
    status: 'Running',
    colorTheme: 'blue',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    headerBg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    accentBorder: 'border-blue-400',
    initials: 'R32',
    category: 'Offset'
  },
  {
    id: 'mac-3',
    name: 'Lithrone 26',
    shortName: 'Lithrone 26',
    plant: 'Kalkere Plant',
    type: 'Komori Lithrone Multi-Color Offset',
    maxSheet: '20" x 26"',
    speed: '13,000 IPH',
    status: 'Running',
    colorTheme: 'purple',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    headerBg: 'bg-gradient-to-r from-purple-50 to-fuchsia-50',
    accentBorder: 'border-purple-400',
    initials: 'L26',
    category: 'Offset'
  },
  {
    id: 'mac-2',
    name: 'Ryobi 660',
    shortName: 'Ryobi 660',
    plant: 'Byrathi Plant',
    type: 'Offset Press (Multi-Color 4-Color)',
    maxSheet: '20" x 26"',
    speed: '12,000 IPH',
    status: 'Running',
    colorTheme: 'teal',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    headerBg: 'bg-gradient-to-r from-teal-50 to-emerald-50',
    accentBorder: 'border-teal-400',
    initials: 'R66',
    category: 'Offset'
  },
  {
    id: 'mac-4',
    name: 'KMC4080 (Kalkere)',
    shortName: 'KMC4080 Kalkere',
    plant: 'Kalkere Plant',
    type: 'Konica Minolta AccurioPress Color',
    maxSheet: '13" x 19.2"',
    speed: '81 PPM (4,860 IPH)',
    status: 'Running',
    colorTheme: 'amber',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    headerBg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    accentBorder: 'border-amber-400',
    initials: 'KC4',
    category: 'Digital'
  },
  {
    id: 'mac-5',
    name: 'KMC4080 (Byrathi)',
    shortName: 'KMC4080 Byrathi',
    plant: 'Byrathi Plant',
    type: 'Konica Minolta AccurioPress Color',
    maxSheet: '13" x 19.2"',
    speed: '81 PPM (4,860 IPH)',
    status: 'Idle',
    colorTheme: 'rose',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    headerBg: 'bg-gradient-to-r from-rose-50 to-pink-50',
    accentBorder: 'border-rose-400',
    initials: 'KB4',
    category: 'Digital'
  },
  {
    id: 'mac-6',
    name: 'KM2100 Black',
    shortName: 'KM2100 Mono',
    plant: 'Byrathi Plant',
    type: 'High-Speed Digital Monochrome',
    maxSheet: '12" x 18"',
    speed: '100 PPM (6,000 IPH)',
    status: 'Running',
    colorTheme: 'slate',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
    headerBg: 'bg-gradient-to-r from-slate-100 to-gray-100',
    accentBorder: 'border-slate-400',
    initials: 'KM2',
    category: 'Digital'
  }
];

export const PrintingTerminal = () => {
  const {
    jobOrders,
    updateJobOrder,
    advanceJobStage,
    bumpJobToTop,
    addJobComment,
    activeUser,
    setSelectedJobForModal,
    activeSubTab,
    setActiveSubTab,
    prepressJobs,
    inventory,
    deductPaperInventory
  } = useApp();

  const currentSubTab = activeSubTab || 'live_terminal';

  // Filter paper inventory items (category === 'Paper')
  const paperInventory = (inventory || []).filter(item => item.category === 'Paper');

  // Two-View Window State ('kanban' or 'list')
  const [viewMode, setViewMode] = useState('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'offset', 'digital', 'running', 'rush'
  const [selectedPlant, setSelectedPlant] = useState('all'); // 'all', 'Kalkere', 'Byrathi'
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Set of job IDs currently expanded in Kanban / List cards
  const [expandedJobIds, setExpandedJobIds] = useState(new Set());

  // Per-job paper substrate selection & sheets used state:
  // { [jobId]: { paperItemId: string, sheetsUsed: number | string, isDeducted: boolean } }
  const [jobPaperUsage, setJobPaperUsage] = useState({});

  // Pop-out Modal States (pop out like View Full Card)
  const [specSheetModalJob, setSpecSheetModalJob] = useState(null);
  const [commentsModalJob, setCommentsModalJob] = useState(null);
  const [modalNewComment, setModalNewComment] = useState('');

  const showNotification = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3200);
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

  // Helper to match initial paper from inventory for a job
  const getInitialPaperItemId = (job) => {
    if (job.deducted_paper_item_id) return job.deducted_paper_item_id;
    const paperText = (job.paper_details || '').toLowerCase();
    const matched = paperInventory.find(p => {
      const pName = p.name.toLowerCase();
      return (
        paperText.includes(pName.split('(')[0].trim()) ||
        (paperText.includes('130') && pName.includes('130')) ||
        (paperText.includes('300') && pName.includes('300')) ||
        (paperText.includes('80') && pName.includes('80')) ||
        (paperText.includes('350') && pName.includes('350'))
      );
    });
    return matched?.id || paperInventory[0]?.id || 'inv-1';
  };

  const getJobPaperState = (job) => {
    const current = jobPaperUsage[job.id];
    if (current) return current;

    const defaultPaperId = getInitialPaperItemId(job);
    const defaultSheets = job.sheets_used || job.print_quantity || 1000;
    const isAlreadyDeducted = !!job.paper_deducted;

    return {
      paperItemId: defaultPaperId,
      sheetsUsed: defaultSheets,
      isDeducted: isAlreadyDeducted
    };
  };

  const updateJobPaperState = (jobId, field, val) => {
    setJobPaperUsage(prev => {
      const cur = prev[jobId] || {
        paperItemId: paperInventory[0]?.id || 'inv-1',
        sheetsUsed: 1000,
        isDeducted: false
      };
      return {
        ...prev,
        [jobId]: {
          ...cur,
          [field]: val
        }
      };
    });
  };

  const handleDeductPaper = (job) => {
    const state = getJobPaperState(job);
    const sheets = Number(state.sheetsUsed) || 0;
    if (sheets <= 0) {
      showNotification('Please enter a valid number of sheets used.');
      return;
    }

    const selectedItem = paperInventory.find(p => p.id === state.paperItemId);
    const itemName = selectedItem?.name || 'Paper Stock';

    // Deduct from inventory in AppContext
    if (deductPaperInventory) {
      deductPaperInventory(state.paperItemId, sheets, job.job_ticket_number);
    }

    // Update job order state
    updateJobOrder(job.id, {
      sheets_used: sheets,
      deducted_paper_item_id: state.paperItemId,
      deducted_paper_name: itemName,
      paper_deducted: true
    });

    // Add note to job comments
    const reamsEquivalent = selectedItem?.unit_of_measure === 'Reams' ? ` (${(sheets / 500).toFixed(2)} Reams)` : '';
    addJobComment(
      job.id,
      `Deducted ${sheets.toLocaleString()} sheets${reamsEquivalent} of ${itemName} from inventory for press run.`,
      0
    );

    // Update local state
    setJobPaperUsage(prev => ({
      ...prev,
      [job.id]: {
        ...state,
        isDeducted: true
      }
    }));

    showNotification(`Deducted ${sheets.toLocaleString()} sheets of ${itemName}! Inventory balance reduced.`);
  };

  // Helper to resolve machine for each job
  const getJobMachineId = (job) => {
    const m = (job.assigned_press_machine || '').toLowerCase();
    if (m.includes('lithrone') || m.includes('komori') || m.includes('speedmaster') || m.includes('heidelberg')) {
      return 'mac-3';
    }
    if (m.includes('ryobi 660') || m.includes('660')) {
      return 'mac-2';
    }
    if (m.includes('ryobi 32') || m.includes('32') || m.includes('ryobi')) {
      return 'mac-1';
    }
    if (m.includes('kmc4080_byrathi') || (m.includes('4080') && m.includes('byrathi'))) {
      return 'mac-5';
    }
    if (m.includes('kmc4080') || (m.includes('4080') && m.includes('kalkere')) || m.includes('accuriopress')) {
      return 'mac-4';
    }
    if (m.includes('km2100') || m.includes('mono') || m.includes('black')) {
      return 'mac-6';
    }
    if (job.production_type === 'Digital') {
      return 'mac-4';
    }
    return 'mac-1'; // Default offset press
  };

  const handleStartPressRun = (job) => {
    advanceJobStage(
      job.id,
      'PressRun',
      `Make-ready completed on ${job.assigned_press_machine}. Offset print run initiated by ${activeUser?.full_name || 'Rajesh Nair'}.`
    );
    showNotification(`Order ${job.job_ticket_number} is now actively RUNNING on ${job.assigned_press_machine}.`);
  };

  const handleCompletePressRun = (job) => {
    const state = getJobPaperState(job);
    const sheets = Number(state.sheetsUsed) || job.print_quantity || 1000;
    const selectedItem = paperInventory.find(p => p.id === state.paperItemId);
    const itemName = selectedItem?.name || job.paper_details || 'Paper Stock';

    // Auto-deduct paper if not yet deducted
    if (!state.isDeducted && deductPaperInventory) {
      deductPaperInventory(state.paperItemId, sheets, job.job_ticket_number);
      updateJobOrder(job.id, {
        sheets_used: sheets,
        deducted_paper_item_id: state.paperItemId,
        deducted_paper_name: itemName,
        paper_deducted: true
      });
      setJobPaperUsage(prev => ({
        ...prev,
        [job.id]: {
          ...state,
          isDeducted: true
        }
      }));
    }

    advanceJobStage(
      job.id,
      'FinishingQC',
      `Press run completed on ${job.assigned_press_machine} (${sheets.toLocaleString()} sheets of ${itemName} consumed and deducted from inventory by ${activeUser?.full_name || 'Rajesh Nair'}).`
    );
    showNotification(`Order ${job.job_ticket_number} completed on press! Handed over to Finishing.`);
  };

  const handleReassignMachine = (jobId, targetMachineId) => {
    const targetMac = MACHINE_FLEET.find(m => m.id === targetMachineId);
    if (!targetMac) return;
    updateJobOrder(jobId, { assigned_press_machine: `${targetMac.name} (${targetMac.plant})` });
    showNotification(`Order reassigned to ${targetMac.name} (${targetMac.plant}).`);
  };

  const handleModalAddComment = () => {
    if (!commentsModalJob || !modalNewComment.trim()) return;
    const text = modalNewComment.trim();
    addJobComment(commentsModalJob.id, text, 0);
    const newComment = {
      id: `com-${Date.now()}`,
      text: text,
      author: activeUser?.full_name || 'Press Operator',
      hours_logged: 0,
      timestamp: new Date().toISOString()
    };
    setCommentsModalJob(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
      last_note: text
    }));
    setModalNewComment('');
    showNotification('Workstation comment logged.');
  };

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
    return job?.assigned_operator || matchedPrep?.assigned_designer || 'Rajesh Nair';
  };

  // Filter jobs based on search query, filter type, and plant
  const filteredJobs = jobOrders.filter(job => {
    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchesSearch =
        job.job_ticket_number?.toLowerCase().includes(q) ||
        job.customer_name?.toLowerCase().includes(q) ||
        job.job_title?.toLowerCase().includes(q) ||
        job.assigned_press_machine?.toLowerCase().includes(q) ||
        job.assigned_operator?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Plant filter
    if (selectedPlant !== 'all') {
      const mac = MACHINE_FLEET.find(m => m.id === getJobMachineId(job));
      if (mac && !mac.plant.toLowerCase().includes(selectedPlant.toLowerCase())) {
        return false;
      }
    }

    // Filter pills
    if (filterType === 'offset') {
      const mac = MACHINE_FLEET.find(m => m.id === getJobMachineId(job));
      if (mac && mac.category !== 'Offset') return false;
    } else if (filterType === 'digital') {
      const mac = MACHINE_FLEET.find(m => m.id === getJobMachineId(job));
      if (mac && mac.category !== 'Digital') return false;
    } else if (filterType === 'running') {
      if (job.current_stage !== 'PressRun') return false;
    } else if (filterType === 'rush') {
      if (!job.is_rush_order && job.priority !== 'Urgent') return false;
    }

    return true;
  });

  // Calculate high-level KPIs
  const totalPressOrders = jobOrders.length;
  const runningOrdersCount = jobOrders.filter(j => j.current_stage === 'PressRun').length;
  const deductedCount = jobOrders.filter(j => j.paper_deducted).length;

  const subTabs = [
    {
      id: 'live_terminal',
      label: 'Machine Queue Terminal',
      icon: Printer,
      badge: `${runningOrdersCount} Running`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'counters',
      label: 'Paper Stock Deductions',
      icon: Boxes,
      badge: `${deductedCount} Deducted`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'calibration',
      label: 'Setup & In-Process QC',
      icon: CheckCircle2,
      badge: 'Gate 6 Active',
      badgeColor: 'bg-amber-100 text-amber-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              04
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">Press Terminal (MES)</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Consolidated Suite
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Machine-segregated press scheduling, paper substrate consumption, and real-time inventory deduction
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
        </div>
      </div>

      <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
        {/* Gate 6 Banner */}
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>
              <b>[Gate 6 Enforced]:</b> Press Operator Material Consumption requires sheet count verification and paper inventory deduction before bindery handover.
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Gate 6 Calibrated
          </span>
        </div>

        {/* Feedback Toast */}
        {feedbackToast && (
          <div className="p-2.5 bg-blue-50 border border-blue-300 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={15} className="text-blue-600" />
              <span>{feedbackToast}</span>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-blue-700 hover:text-blue-900 text-[10px] font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Controls Toolbar: Two-View Switcher + Search + Plant & Fleet Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Two-View Toggle Window (similar to Prepress Studio) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Machine-Segregated Work Order Board"
              >
                <Kanban size={14} className={viewMode === 'kanban' ? 'text-emerald-600' : 'text-slate-500'} />
                <span>Machine Board</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] bg-emerald-100 text-emerald-800 font-bold">
                  {MACHINE_FLEET.length} Presses
                </span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold text-xs transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tabular Work Order List View"
              >
                <LayoutList size={14} className={viewMode === 'list' ? 'text-emerald-600' : 'text-slate-500'} />
                <span>List View</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full font-mono text-[9px] bg-slate-200 text-slate-700 font-bold">
                  {filteredJobs.length} Orders
                </span>
              </button>
            </div>

            {/* Quick Search Box */}
            <div className="relative">
              <Search size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, customer, machine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:border-emerald-500 focus:bg-white w-56"
              />
            </div>
          </div>

          {/* Plant & Fleet Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Plant Selector */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <Building2 size={13} className="text-slate-500" />
              <select
                value={selectedPlant}
                onChange={(e) => setSelectedPlant(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Plants (Kalkere & Byrathi)</option>
                <option value="Kalkere">Plant #01 • Kalkere</option>
                <option value="Byrathi">Plant #02 • Byrathi</option>
              </select>
            </div>

            {/* Fleet Type Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'offset', label: 'Offset Fleet' },
                { id: 'digital', label: 'Digital Fleet' },
                { id: 'running', label: 'Running Now' },
                { id: 'rush', label: 'Rush Orders' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-2 py-1 rounded font-semibold transition cursor-pointer ${
                    filterType === f.id
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Expand / Collapse All */}
            {viewMode === 'kanban' && (
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Expand All Work Orders"
                >
                  <Maximize2 size={11} /> Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Collapse All Work Orders"
                >
                  <Minimize2 size={11} /> Collapse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: MACHINE-SEGREGATED KANBAN BOARD                   */}
        {/* ========================================================= */}
        {viewMode === 'kanban' && (
          <div className="flex gap-3.5 items-start overflow-x-auto pb-4">
            {MACHINE_FLEET.map(machine => {
              // Get jobs assigned to this machine
              const machineJobs = filteredJobs
                .filter(job => getJobMachineId(job) === machine.id)
                .sort((a, b) => {
                  // Sort: Urgent rush orders first
                  const aRush = a.is_rush_order || a.priority === 'Urgent';
                  const bRush = b.is_rush_order || b.priority === 'Urgent';
                  if (aRush && !bRush) return -1;
                  if (!aRush && bRush) return 1;

                  // Then by queue position
                  const aPos = a.queue_position || 999;
                  const bPos = b.queue_position || 999;
                  if (aPos !== bPos) return aPos - bPos;

                  // Then by running state
                  if (a.current_stage === 'PressRun' && b.current_stage !== 'PressRun') return -1;
                  if (a.current_stage !== 'PressRun' && b.current_stage === 'PressRun') return 1;

                  return 0;
                });

              const isFilteredPlantMatch = selectedPlant === 'all' || machine.plant.toLowerCase().includes(selectedPlant.toLowerCase());
              if (!isFilteredPlantMatch) return null;

              return (
                <div
                  key={machine.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col w-[280px] shrink-0"
                >
                  {/* Machine Column Header */}
                  <div className={`p-3 border-b border-slate-200 ${machine.headerBg}`}>
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-xs shadow-xs font-mono">
                          {machine.initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-xs leading-tight">
                            {machine.name}
                          </h3>
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {machine.plant}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${machine.badgeClass}`}>
                        {machineJobs.length} Orders
                      </span>
                    </div>

                    {/* Machine Specs Micro-Strip */}
                    <div className="flex items-center justify-between text-[10px] text-slate-600 bg-white/70 p-1.5 rounded border border-slate-200/60 font-mono mt-1.5">
                      <span className="truncate">{machine.type.split(' ')[0]} {machine.maxSheet}</span>
                      <span className="font-bold text-slate-800">{machine.speed.split('/')[0]}</span>
                    </div>
                  </div>

                  {/* Machine Work Order Cards Queue */}
                  <div className="p-2 space-y-2.5 min-h-[460px] bg-slate-50/60">
                    {machineJobs.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 italic bg-white rounded-lg border border-dashed border-slate-200 p-4">
                        <Printer size={22} className="mx-auto mb-1.5 text-slate-300" />
                        <span className="block font-semibold text-xs">No Active Work Orders</span>
                        <span className="text-[10px]">Machine is idle & ready for scheduled press release.</span>
                      </div>
                    ) : (
                      machineJobs.map((job, idx) => {
                        const isExpanded = expandedJobIds.has(job.id);
                        const isUrgent = job.is_rush_order || job.priority === 'Urgent';
                        const activeNote = getLastNote(job);
                        const noteAuthor = getLastNoteAuthor(job);
                        const isJobRunning = job.current_stage === 'PressRun';
                        const paperState = getJobPaperState(job);
                        const selectedItem = paperInventory.find(p => p.id === paperState.paperItemId);
                        const paperDisplayName = selectedItem?.name || job.paper_details || 'Standard Paper';

                        // Sequential Work Order Rank
                        const orderRank = idx + 1;
                        const orderLabel = isJobRunning
                          ? `#${orderRank} RUNNING NOW`
                          : orderRank === 1
                            ? `#${orderRank} NEXT IN LINE`
                            : `#${orderRank} IN QUEUE`;

                        return (
                          <div
                            key={job.id}
                            className={`rounded-lg border transition-all text-xs overflow-hidden w-full max-w-full box-border ${
                              isUrgent
                                ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300/40 shadow-xs'
                                : isJobRunning
                                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300/30 shadow-xs'
                                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                            } p-2.5 space-y-2`}
                          >
                            {/* Card Top Strip: Sequential Rank + Ticket + Priority */}
                            <div className="flex items-center justify-between gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                                isJobRunning
                                  ? 'bg-emerald-600 text-white animate-pulse'
                                  : orderRank === 1
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                              }`}>
                                {orderLabel}
                              </span>

                              <div className="flex items-center gap-1">
                                {isUrgent && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white flex items-center gap-0.5 animate-pulse">
                                    <Zap size={9} /> RUSH
                                  </span>
                                )}
                                <span className="font-mono text-[10px] font-bold text-slate-800">
                                  {job.job_ticket_number}
                                </span>
                              </div>
                            </div>

                            {/* Job Description & Customer */}
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                                {job.job_title}
                              </h4>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                                Customer: <b>{job.customer_name}</b>
                              </p>
                            </div>

                            {/* Paper Stock & Sheets Consumption Summary Box (Replaces Old Impressions Box) */}
                            <div className="space-y-1 bg-white p-2 rounded border border-slate-200/80 shadow-2xs">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-slate-600 flex items-center gap-1">
                                  <Layers size={11} className="text-blue-600" /> Paper Stock:
                                </span>
                                <span className="font-bold text-slate-800 truncate max-w-[130px]" title={paperDisplayName}>
                                  {paperDisplayName.split('(')[0]}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono pt-0.5 border-t border-slate-100">
                                <span className="text-slate-500">Sheets Used:</span>
                                <span className={`font-bold ${paperState.isDeducted ? 'text-emerald-700' : 'text-blue-900'}`}>
                                  {paperState.sheetsUsed ? `${Number(paperState.sheetsUsed).toLocaleString()} Sheets` : `${job.print_quantity?.toLocaleString()} Target`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[9px] font-mono">
                                <span className="text-slate-400">Inventory Status:</span>
                                {paperState.isDeducted ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                    <Check size={9} /> Deducted
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-semibold">
                                    Pending Deduction
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Micro Tech Specs Strip */}
                            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5 border-t border-slate-100">
                              <span className="truncate max-w-[130px] font-medium">
                                SLA: {new Date(job.target_completion_date).toLocaleDateString()}
                              </span>
                              <span className="font-mono font-bold text-blue-700">
                                {job.color_spec?.split(' ')[0] || '4/4'}
                              </span>
                            </div>

                            {/* Last Note Bubble */}
                            {activeNote && !isExpanded && (
                              <div className="bg-slate-50 p-1.5 rounded border border-slate-100 text-[10px] text-slate-700 italic line-clamp-1">
                                "{activeNote}"
                              </div>
                            )}

                            {/* Expand / Collapse Button */}
                            <button
                              type="button"
                              onClick={() => toggleExpandJob(job.id)}
                              className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={12} /> Hide Work Order Terminal
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={12} /> Work Order Terminal & Paper Input
                                </>
                              )}
                            </button>

                            {/* ========================================================== */}
                            {/* EXPANDED VIEW: PAPER SUBSTRATE CONSUMPTION & DEDUCTION    */}
                            {/* ========================================================== */}
                            {isExpanded && (
                              <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-100">
                                {/* Last Note Full View */}
                                {activeNote && (
                                  <div className="bg-amber-50/70 p-2 rounded-lg border border-amber-200/80 text-[11px] text-amber-950">
                                    <div className="flex items-center justify-between text-[9px] font-mono text-amber-800 font-bold uppercase mb-0.5">
                                      <span className="flex items-center gap-1">
                                        <MessageSquare size={10} /> Latest Workstation Note
                                      </span>
                                      {noteAuthor && <span>by {noteAuthor}</span>}
                                    </div>
                                    <p className="italic">"{activeNote}"</p>
                                  </div>
                                )}

                                {/* PAPER SUBSTRATE CONSUMPTION & INVENTORY DEDUCTION */}
                                {(() => {
                                  const currentPaperItem = selectedItem || paperInventory[0];
                                  const sheetsCount = Number(paperState.sheetsUsed) || 0;
                                  const isReams = currentPaperItem?.unit_of_measure === 'Reams';
                                  const reamsEquivalent = isReams ? (sheetsCount / 500).toFixed(2) : sheetsCount;

                                  return (
                                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2 box-border w-full max-w-full overflow-hidden">
                                      <div className="flex items-center justify-between text-[11px] font-bold text-blue-950 gap-1">
                                        <span className="flex items-center gap-1.5 truncate min-w-0">
                                          <Layers size={13} className="text-blue-700 shrink-0" />
                                          <span className="truncate">Paper & Inventory:</span>
                                        </span>
                                        {paperState.isDeducted && (
                                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 flex items-center gap-1 shrink-0">
                                            <Check size={10} className="shrink-0" /> Deducted
                                          </span>
                                        )}
                                      </div>

                                      {/* "Which Paper" - Paper Dropdown Selector */}
                                      <div className="space-y-1 w-full max-w-full">
                                        <div className="flex items-center justify-between text-[10px] gap-1">
                                          <label className="font-semibold text-slate-700 truncate">
                                            Which Paper:
                                          </label>
                                          {currentPaperItem && (
                                            <span className="text-slate-500 font-mono text-[9px] truncate text-right">
                                              Stock:{' '}
                                              <b className={currentPaperItem.quantity_on_hand <= currentPaperItem.reorder_threshold ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                                                {currentPaperItem.quantity_on_hand} {currentPaperItem.unit_of_measure}
                                              </b>
                                            </span>
                                          )}
                                        </div>
                                        <select
                                          value={paperState.paperItemId}
                                          disabled={paperState.isDeducted}
                                          onChange={(e) => updateJobPaperState(job.id, 'paperItemId', e.target.value)}
                                          className="w-full max-w-full box-border bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 disabled:bg-slate-100 cursor-pointer truncate"
                                        >
                                          {paperInventory.map(item => (
                                            <option key={item.id} value={item.id}>
                                              {item.name} ({item.quantity_on_hand} {item.unit_of_measure} on hand)
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* "No. of Sheets Used" - Number Input */}
                                      {/* "No. of Sheets Used" & Deduct Button Stacked to stay strictly within card */}
                                      <div className="space-y-1.5 w-full max-w-full">
                                        <div className="flex items-center justify-between text-[10px] gap-1">
                                          <label className="font-semibold text-slate-700 truncate">
                                            No. of Sheets Used:
                                          </label>
                                          <span className="text-slate-500 font-mono text-[9px] truncate text-right">
                                            {isReams && sheetsCount > 0 ? `= ${reamsEquivalent} Reams` : `Target: ${job.print_quantity?.toLocaleString()}`}
                                          </span>
                                        </div>
                                        <input
                                          type="number"
                                          min="1"
                                          disabled={paperState.isDeducted}
                                          value={paperState.sheetsUsed || ''}
                                          placeholder={`Target: ${job.print_quantity || 1000} sheets`}
                                          onChange={(e) => updateJobPaperState(job.id, 'sheetsUsed', e.target.value)}
                                          className="w-full max-w-full box-border bg-white border border-slate-300 rounded p-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleDeductPaper(job)}
                                          disabled={!paperState.sheetsUsed || Number(paperState.sheetsUsed) <= 0 || paperState.isDeducted}
                                          className="w-full max-w-full box-border py-1.5 px-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs text-center min-w-0"
                                          title="Reduce paper stock from warehouse inventory"
                                        >
                                          <Boxes size={12} className="shrink-0" />
                                          <span className="truncate">{paperState.isDeducted ? 'Deducted from Inventory' : 'Deduct from Inventory'}</span>
                                        </button>
                                      </div>

                                      {/* Live Status Message */}
                                      {paperState.isDeducted ? (
                                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-900 flex flex-col gap-0.5 box-border w-full">
                                          <span className="break-words">
                                            Deducted <b>{Number(paperState.sheetsUsed).toLocaleString()} sheets</b> from <b>{currentPaperItem?.name}</b>.
                                          </span>
                                          <span className="font-mono font-bold text-emerald-800">
                                            Remaining: {currentPaperItem?.quantity_on_hand} {currentPaperItem?.unit_of_measure}
                                          </span>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] text-blue-700/80 italic break-words">
                                          Deducting will reduce {currentPaperItem?.name} stock by {reamsEquivalent} {currentPaperItem?.unit_of_measure || 'units'}.
                                        </p>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Reassign Machine Dropdown Stacked */}
                                <div className="bg-slate-100/70 p-1.5 rounded border border-slate-200 space-y-1 w-full max-w-full box-border">
                                  <label className="block font-semibold text-slate-700 text-[10px]">
                                    Assign Press Machine:
                                  </label>
                                  <select
                                    value={machine.id}
                                    onChange={(e) => handleReassignMachine(job.id, e.target.value)}
                                    className="w-full max-w-full box-border bg-white border border-slate-300 rounded px-1.5 py-1 font-bold text-slate-800 text-[10px] focus:outline-none truncate cursor-pointer"
                                  >
                                    {MACHINE_FLEET.map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} ({m.plant})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3 Pop-Out Trigger Buttons */}
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
                                    title="Pop out comments & shift logs"
                                  >
                                    <MessageSquare size={11} className="text-purple-600 shrink-0" />
                                    <span className="truncate">Shift Log</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedJobForModal(job)}
                                    className="min-w-0 w-full py-1.5 px-1 bg-[#002b41] hover:bg-[#002b41]/90 text-white rounded font-bold text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs overflow-hidden"
                                    title="Pop out full printable job ticket"
                                  >
                                    <Printer size={11} className="shrink-0" />
                                    <span className="truncate">Full Card</span>
                                  </button>
                                </div>

                                {/* Bottom Progression Action Bar */}
                                <div className="pt-2 border-t border-slate-200 space-y-1.5 w-full max-w-full box-border">
                                  {job.current_stage !== 'PressRun' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleStartPressRun(job)}
                                      className="w-full max-w-full box-border py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-w-0 text-center"
                                    >
                                      <Play size={13} className="shrink-0" />
                                      <span className="truncate">Start Make-Ready & Run</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleCompletePressRun(job)}
                                      className="w-full max-w-full box-border py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-w-0 text-center"
                                    >
                                      <CheckCircle2 size={13} className="shrink-0" />
                                      <span className="truncate">Complete & Hand Over</span>
                                    </button>
                                  )}

                                  <div className="flex items-center justify-between pt-1 gap-2 w-full max-w-full box-border">
                                    <button
                                      type="button"
                                      onClick={() => bumpJobToTop(job.id)}
                                      className={`btn btn-xxs ${isUrgent ? 'btn-warning' : 'btn-secondary'} cursor-pointer shrink-0 min-w-0`}
                                      title="Bump to #1 in queue"
                                    >
                                      <Zap size={11} className="shrink-0" />
                                      <span className="truncate">{isUrgent ? 'Top #1' : 'Prioritize'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleExpandJob(job.id)}
                                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded border border-slate-200 shrink-0 cursor-pointer"
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
        )}

        {/* ========================================================= */}
        {/* VIEW 2: TABULAR / LIST VIEW (similar to Prepress Studio)  */}
        {/* ========================================================= */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-xs">
                  All Scheduled Work Orders on Press Fleet
                </h3>
                <p className="text-[11px] text-slate-500">
                  Showing {filteredJobs.length} active orders sorted by production priority and machine scheduling
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-blue-100 text-blue-800">
                {filteredJobs.length} Work Orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Rank & Ticket</th>
                    <th className="py-2.5 px-3">Customer & Description</th>
                    <th className="py-2.5 px-3">Assigned Machine</th>
                    <th className="py-2.5 px-3">Paper & Sheets Used</th>
                    <th className="py-2.5 px-3">Color Inks</th>
                    <th className="py-2.5 px-3">Stage / Status</th>
                    <th className="py-2.5 px-3">Lead Operator</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 italic">
                        No work orders found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job, idx) => {
                      const isUrgent = job.is_rush_order || job.priority === 'Urgent';
                      const macId = getJobMachineId(job);
                      const machine = MACHINE_FLEET.find(m => m.id === macId) || MACHINE_FLEET[0];
                      const isJobRunning = job.current_stage === 'PressRun';
                      const paperState = getJobPaperState(job);
                      const selectedItem = paperInventory.find(p => p.id === paperState.paperItemId);
                      const paperName = selectedItem?.name || job.paper_details || 'Standard Paper';

                      return (
                        <tr
                          key={job.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isUrgent ? 'bg-amber-50/30' : isJobRunning ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          {/* Rank & Ticket */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                isJobRunning
                                  ? 'bg-emerald-600 text-white'
                                  : isUrgent
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                              }`}>
                                #{idx + 1}
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {job.job_ticket_number}
                              </span>
                            </div>
                            {isUrgent && (
                              <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[8px] font-bold bg-rose-100 text-rose-700 font-mono">
                                [RUSH ORDER]
                              </span>
                            )}
                          </td>

                          {/* Customer & Title */}
                          <td className="py-2.5 px-3 max-w-[220px]">
                            <h5 className="font-bold text-slate-900 text-xs truncate">
                              {job.job_title}
                            </h5>
                            <p className="text-[11px] text-slate-500 truncate">
                              {job.customer_name}
                            </p>
                          </td>

                          {/* Assigned Machine */}
                          <td className="py-2.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${machine.badgeClass}`}>
                              {machine.name}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {machine.plant}
                            </span>
                          </td>

                          {/* Paper & Sheets Used (Replaces Impressions Counter Column) */}
                          <td className="py-2.5 px-3 max-w-[190px]">
                            <div className="space-y-0.5">
                              <span className="font-medium text-slate-800 block truncate" title={paperName}>
                                {paperName.split('(')[0]}
                              </span>
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="font-bold text-blue-900">
                                  {paperState.sheetsUsed ? `${Number(paperState.sheetsUsed).toLocaleString()} sheets` : `${job.print_quantity?.toLocaleString()} target`}
                                </span>
                                {paperState.isDeducted ? (
                                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[9px]">
                                    <Check size={9} /> Deducted
                                  </span>
                                ) : (
                                  <span className="text-amber-700 text-[9px] font-semibold">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Color Inks */}
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[10px] text-blue-700 font-bold">
                              {job.color_spec || '4/4 CMYK'}
                            </span>
                          </td>

                          {/* Stage / Status */}
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              isJobRunning
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : job.current_stage === 'PlateMaking'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                            }`}>
                              {job.current_stage === 'PressRun' ? 'Running' : job.current_stage}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-mono mt-0.5">
                              SLA: {new Date(job.target_completion_date).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Lead Operator */}
                          <td className="py-2.5 px-3 text-slate-700 font-medium text-[11px]">
                            {job.assigned_operator || 'Rajesh Nair'}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
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
                                title="Shift Log & Comments"
                              >
                                <MessageSquare size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedJobForModal(job)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded border border-slate-200 transition cursor-pointer"
                                title="Open Printable Full Job Ticket"
                              >
                                <Printer size={12} />
                              </button>

                              {job.current_stage !== 'PressRun' ? (
                                <button
                                  type="button"
                                  onClick={() => handleStartPressRun(job)}
                                  className="btn btn-xxs btn-success cursor-pointer"
                                >
                                  Start Run
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCompletePressRun(job)}
                                  className="btn btn-xxs btn-primary cursor-pointer"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. POP-OUT MODAL: TECHNICAL SPEC SHEET                   */}
      {/* ========================================================= */}
      {specSheetModalJob && (() => {
        const activeJob = jobOrders.find(j => j.id === specSheetModalJob.id) || specSheetModalJob;
        const macId = getJobMachineId(activeJob);
        const machine = MACHINE_FLEET.find(m => m.id === macId) || MACHINE_FLEET[0];
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
                    Stage: {activeJob.current_stage}
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
                      <td className="py-2.5 px-3 font-medium text-slate-800">{machine.name} ({machine.plant})</td>
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

      {/* ========================================================= */}
      {/* 2. POP-OUT MODAL: COMMENTS & SHIFT LOG                   */}
      {/* ========================================================= */}
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
            title={`Comments & Shift History — ${activeJob.job_ticket_number}`}
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
                    const comAuthor = com.author || 'Press Operator';
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
                    No shift logs or comments logged yet for this work order.
                  </div>
                )}
              </div>

              {/* Active New Comment Form inside Modal */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">
                  Add Press Operator Note / Shift Handover Remark:
                </label>
                <textarea
                  rows="2"
                  value={modalNewComment}
                  onChange={(e) => setModalNewComment(e.target.value)}
                  placeholder="Mention ink viscosity, sheet squareness, blanket wash, run notes..."
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
