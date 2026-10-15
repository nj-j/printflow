import React, { useState, useMemo } from 'react';
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
  User,
  RotateCcw,
  Calculator,
  DollarSign,
  Check,
  X,
  Tag,
  Scissors,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { RushBadge } from '../common/RushBadge';
import { QuoteEstimatorModal } from '../common/QuoteEstimatorModal';
import { TechnicalSpecSheetModal } from '../common/TechnicalSpecSheetModal';

export const ProductionPlanning = () => {
  const {
    jobOrders,
    setJobOrders,
    prepressJobs,
    enquiries,
    updateEnquiry,
    salesBookings,
    addSalesBooking,
    resolveJobRushStatus,
    advanceJobStage,
    rewindJobStage,
    addJobComment,
    setSelectedJobForModal,
    activeSubTab,
    setActiveSubTab,
    activeUser
  } = useApp();

  // The 5 Canonical Print ERP Workflow Stages
  const stages = [
    { id: 'Quotation', label: '1. Quotation', color: '#2563eb', badgeClass: 'bg-blue-100 text-blue-800' },
    { id: 'Prepress', label: '2. Prepress', color: '#8b5cf6', badgeClass: 'bg-purple-100 text-purple-800' },
    { id: 'Press', label: '3. Press', color: '#f59e0b', badgeClass: 'bg-amber-100 text-amber-800' },
    { id: 'Finishing', label: '4. Finishing', color: '#10b981', badgeClass: 'bg-emerald-100 text-emerald-800' },
    { id: 'Dispatch', label: '5. Dispatch', color: '#06b6d4', badgeClass: 'bg-cyan-100 text-cyan-800' },
  ];

  // Helper to normalize any incoming stage into one of the 5 canonical stages
  const mapToCanonicalStage = (stage) => {
    if (!stage) return 'Quotation';
    const s = String(stage).toLowerCase().trim();
    if (s.includes('quote') || s.includes('cost') || s.includes('order desk') || s.includes('enquiry')) {
      return 'Quotation';
    }
    if (s.includes('prep') || s.includes('design') || s.includes('plate') || s.includes('proof')) {
      return 'Prepress';
    }
    if (s.includes('press') || s.includes('print')) {
      return 'Press';
    }
    if (s.includes('finish') || s.includes('bind') || s.includes('qc') || s.includes('pack')) {
      return 'Finishing';
    }
    if (s.includes('dispatch') || s.includes('deliver') || s.includes('logist')) {
      return 'Dispatch';
    }
    return 'Press';
  };

  const getNextStage = (current) => {
    const canonical = mapToCanonicalStage(current);
    switch (canonical) {
      case 'Quotation': return 'Prepress';
      case 'Prepress': return 'Press';
      case 'Press': return 'Finishing';
      case 'Finishing': return 'Dispatch';
      case 'Dispatch': return 'Completed';
      default: return null;
    }
  };

  const getPrevStage = (current) => {
    const canonical = mapToCanonicalStage(current);
    switch (canonical) {
      case 'Dispatch': return 'Finishing';
      case 'Finishing': return 'Press';
      case 'Press': return 'Prepress';
      case 'Prepress': return 'Quotation';
      default: return null;
    }
  };

  const [showRushOnly, setShowRushOnly] = useState(activeSubTab === 'rush');

  // Set of card IDs currently expanded
  const [expandedJobIds, setExpandedJobIds] = useState(new Set());

  // Input states per card: { [cardId]: { comment: '', targetStage: '' } }
  const [cardInputs, setCardInputs] = useState({});

  // Modals state
  const [specSheetModalEntity, setSpecSheetModalEntity] = useState(null);
  const [quoteEstimatorEntity, setQuoteEstimatorEntity] = useState(null);
  const [commentsModalJob, setCommentsModalJob] = useState(null);
  const [modalNewComment, setModalNewComment] = useState('');

  // QC Rewind / Send Back Modal State
  const [qcRewindModalCard, setQcRewindModalCard] = useState(null);
  const [qcTargetStage, setQcTargetStage] = useState('Press');
  const [qcDefectCategory, setQcDefectCategory] = useState('Color / Inking Defect');
  const [qcReturnNotes, setQcReturnNotes] = useState('');

  // Helper to dynamically retrieve the latest note or comment
  const getLastNote = (card) => {
    if (card?.comments && card.comments.length > 0) {
      const last = card.comments[card.comments.length - 1];
      const text = typeof last === 'string' ? last : (last?.text || last?.comment);
      if (text && text.trim()) return text.trim();
    }
    if (card?.notes?.trim()) return card.notes.trim();
    return '';
  };

  const getLastNoteAuthor = (card) => {
    if (card?.comments && card.comments.length > 0) {
      const last = card.comments[card.comments.length - 1];
      if (last?.author) return last.author;
    }
    return card?.assignedResource || '';
  };

  const getInputs = (cardId, defaultStage) => {
    return cardInputs[cardId] || {
      comment: '',
      targetStage: defaultStage,
    };
  };

  const updateInput = (cardId, field, val, defaultStage) => {
    setCardInputs(prev => {
      const current = prev[cardId] || {
        comment: '',
        targetStage: defaultStage,
      };
      return {
        ...prev,
        [cardId]: {
          ...current,
          [field]: val
        }
      };
    });
  };

  const toggleExpandJob = (cardId) => {
    setExpandedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Compile Unified Kanban Pipeline Cards
  const unifiedCards = useMemo(() => {
    const cards = [];
    const seenTickets = new Set();
    const seenNames = new Set();

    // 1. Existing Production Job Orders (Prepress, Press, Finishing, Dispatch, or rewound Quotation)
    (jobOrders || []).forEach((j, idx) => {
      if (j.current_stage === 'Completed' || j.current_stage === 'Delivered') return;
      const canonical = mapToCanonicalStage(j.current_stage);
      const isUrgent = resolveJobRushStatus(j);
      const ticket = j.job_ticket_number || j.id;
      seenTickets.add(ticket);
      if (j.customer_name) seenNames.add(j.customer_name.toLowerCase().trim());

      cards.push({
        id: j.id,
        entityType: 'job_order',
        rawEntity: j,
        ticketNumber: ticket,
        customerName: j.customer_name,
        jobTitle: j.job_title || 'Commercial Print Job',
        quantity: j.print_quantity || 1000,
        currentStage: canonical,
        priority: isUrgent ? 'Urgent' : (j.priority || 'Normal'),
        isUrgent,
        queuePosition: j.queue_position || idx + 1,
        assignedResource: j.assigned_press_machine || j.assigned_operator || 'Pressroom',
        paperDetails: j.paper_details,
        colorSpec: j.color_spec,
        finishingSpec: j.finishing_spec,
        targetCompletionDate: j.target_completion_date,
        totalCost: Number(j.total_cost || j.amount || 0),
        advancePaid: Number(j.advance_paid || 0),
        advanceRequired: Math.round(Number(j.total_cost || j.amount || 0) * 0.6),
        isQuoted: true,
        isAdvancePaid: Number(j.advance_paid || 0) >= Math.round(Number(j.total_cost || j.amount || 0) * 0.6),
        qcFlagged: Boolean(j.qc_flagged || j.returned_from_qc),
        lastQcReason: j.last_qc_return_reason || (j.notes?.includes('QC') ? j.notes : ''),
        comments: j.comments || [],
        notes: j.notes || j.last_note || '',
      });
    });

    // 2. Prepress Jobs not yet linked in jobOrders
    (prepressJobs || []).forEach((p, idx) => {
      const ticket = p.job_ticket_number || p.id;
      if (seenTickets.has(ticket)) return;
      if (p.customer_name && seenNames.has(p.customer_name.toLowerCase().trim())) return;
      seenTickets.add(ticket);
      if (p.customer_name) seenNames.add(p.customer_name.toLowerCase().trim());

      const isUrgent = p.priority === 'Urgent' || p.is_rush_order;
      cards.push({
        id: p.id,
        entityType: 'prepress_job',
        rawEntity: p,
        ticketNumber: ticket,
        customerName: p.customer_name,
        jobTitle: p.job_title || p.job_specification || 'Artwork & Prepress Job',
        quantity: p.quantity || 1000,
        currentStage: 'Prepress',
        priority: isUrgent ? 'Urgent' : 'Normal',
        isUrgent,
        queuePosition: 20 + idx,
        assignedResource: p.assigned_designer || 'Prepress Studio',
        paperDetails: p.paper_details || p.paper,
        colorSpec: p.color_spec || p.color,
        finishingSpec: p.finishing_spec,
        targetCompletionDate: p.target_completion_date || p.expected_delivery,
        totalCost: Number(p.amount || 0),
        advancePaid: 0,
        advanceRequired: Math.round(Number(p.amount || 0) * 0.6),
        isQuoted: Number(p.amount || 0) > 0,
        isAdvancePaid: false,
        qcFlagged: Boolean(p.returned_from_qc),
        lastQcReason: p.last_note?.includes('QC') ? p.last_note : '',
        comments: p.comments || [],
        notes: p.notes || p.last_note || '',
      });
    });

    // 3. Enquiries (Populate the QUOTATION column with live reactive status)
    (enquiries || []).forEach((e, idx) => {
      if (e.status === 'Cancelled') return;
      const ticket = e.enquiry_no || (e.dn_no && e.dn_no !== '-' ? `DN-${e.dn_no}` : e.id);
      if (seenTickets.has(ticket) || seenTickets.has(e.id)) return;
      if (e.customer_name && seenNames.has(e.customer_name.toLowerCase().trim())) return;

      const canonical = mapToCanonicalStage(e.current_stage);
      const isUrgent = e.priority === 'Urgent' || e.is_rush_order || e.urgency === 'Urgent';
      const amt = Number(e.amount || 0);
      const isQuoted = Boolean(e.quotation_generated || (amt > 0 && e.costing_status === 'Costed'));
      const advReq = Math.round(amt * 0.6);
      const advRecv = Number(e.advance) || (e.status === 'Completed' || e.advance_remarks?.toLowerCase().includes('full') ? amt : 0);
      const isAdvPaid = isQuoted && (advRecv >= advReq || e.advance_remarks?.toLowerCase().includes('full') || e.status === 'Completed');

      // If an enquiry is already in a later stage, map it; otherwise default to Quotation
      const stage = (canonical === 'Completed' || e.status === 'Completed') ? 'Completed' : canonical;
      if (stage === 'Completed') return;

      cards.push({
        id: e.id,
        entityType: 'enquiry',
        rawEntity: e,
        ticketNumber: ticket,
        customerName: e.customer_name,
        jobTitle: e.job_specification || e.job_name || 'Commercial Enquiry',
        quantity: parseInt(e.quantity) || 1000,
        currentStage: stage,
        priority: isUrgent ? 'Urgent' : 'Normal',
        isUrgent,
        queuePosition: 50 + idx,
        assignedResource: e.quote_assigned_to ? `${e.quote_assigned_to} (Sales)` : (e.prepress && e.prepress !== '-' ? e.prepress : 'Order Desk'),
        paperDetails: e.paper,
        colorSpec: e.color,
        finishingSpec: Array.isArray(e.finishing) ? e.finishing.join(', ') : e.finishing,
        targetCompletionDate: e.expected_delivery,
        totalCost: amt,
        advancePaid: advRecv,
        advanceRequired: advReq,
        isQuoted,
        isAdvancePaid: isAdvPaid,
        qcFlagged: false,
        lastQcReason: '',
        comments: [],
        notes: e.support_notes || e.amount_note || '',
      });
    });

    return cards;
  }, [jobOrders, prepressJobs, enquiries, resolveJobRushStatus]);

  const activeCards = unifiedCards.filter(c => c.currentStage !== 'Completed');
  const urgentCardsCount = activeCards.filter(c => c.isUrgent).length;

  const handleExpandAll = () => {
    setExpandedJobIds(new Set(activeCards.map(c => c.id)));
  };

  const handleCollapseAll = () => {
    setExpandedJobIds(new Set());
  };

  // Stage Advancement Handler
  const handleAdvanceStage = (card, targetNextStage, comment = '') => {
    const next = targetNextStage || getNextStage(card.currentStage);
    if (!next) return;

    if (card.entityType === 'enquiry') {
      const enq = card.rawEntity;
      updateEnquiry(enq.id, {
        current_stage: next === 'Prepress' ? 'Pre-Press' : next,
        status: 'Pending',
      });

      // Ensure a production job order exists for downstream press & finishing
      const existingJob = jobOrders.find(j => j.job_ticket_number === card.ticketNumber || j.id === card.id);
      if (!existingJob) {
        const isRush = card.isUrgent;
        const newJob = {
          id: `job-${Date.now()}`,
          job_ticket_number: card.ticketNumber.startsWith('JT') ? card.ticketNumber : `JT-2026-${card.ticketNumber.replace(/\D/g, '') || String(Date.now()).slice(-4)}`,
          customer_id: enq.customer_id || `cust-${enq.id}`,
          customer_name: enq.customer_name,
          job_title: enq.job_specification || enq.job_name || 'Commercial Print Job',
          production_type: 'Offset',
          print_quantity: parseInt(enq.quantity) || 1000,
          paper_details: enq.paper || '130 GSM Gloss Art Paper (23" x 36")',
          color_spec: enq.color || '4/4 Front & Back (Process CMYK)',
          finishing_spec: Array.isArray(enq.finishing) ? enq.finishing.join(', ') : (enq.finishing || 'Standard Trimming'),
          current_stage: next,
          priority: card.priority,
          is_rush_order: isRush,
          queue_position: 1,
          assigned_press_machine: 'Ryobi 660 (Ramamurthy Nagar Plant)',
          assigned_operator: 'Rajesh Nair',
          target_completion_date: enq.expected_delivery || new Date(Date.now() + 86400000 * 2).toISOString(),
          created_at: new Date().toISOString(),
          advance_paid: card.advancePaid,
          balance_due: Math.max(0, card.totalCost - card.advancePaid),
          comments: comment ? [{
            id: `com-${Date.now()}`,
            text: comment,
            author: activeUser?.full_name || 'Production Operator',
            stage: next,
            timestamp: new Date().toISOString()
          }] : []
        };
        setJobOrders(prev => [newJob, ...prev]);
      } else {
        advanceJobStage(existingJob.id, next, comment, 0);
      }
    } else {
      advanceJobStage(card.id, next, comment, 0);
    }

    // Reset card comment input
    setCardInputs(prev => ({
      ...prev,
      [card.id]: {
        ...prev[card.id],
        comment: '',
      }
    }));
  };

  const handleSaveLogOnly = (card) => {
    const inputs = getInputs(card.id, getNextStage(card.currentStage));
    const comment = inputs.comment.trim();
    if (!comment) return;

    if (card.entityType === 'job_order') {
      addJobComment(card.id, comment, 0);
    } else if (card.entityType === 'enquiry') {
      updateEnquiry(card.id, {
        support_notes: `${card.notes ? card.notes + ' | ' : ''}${comment}`
      });
    }

    setCardInputs(prev => ({
      ...prev,
      [card.id]: {
        ...prev[card.id],
        comment: '',
      }
    }));
  };

  // QC Rewind Confirmation Handler
  const handleConfirmQcRewind = () => {
    if (!qcRewindModalCard) return;
    const reasonText = `[${qcDefectCategory}]: ${qcReturnNotes.trim() || 'Returned for QC rework and correction.'}`;
    rewindJobStage(qcRewindModalCard.id, qcTargetStage, reasonText);
    setQcRewindModalCard(null);
    setQcReturnNotes('');
  };

  const handleApplyQuoteFromKanban = (newAmount, quoteDetails) => {
    if (!quoteEstimatorEntity) return;
    const enq = quoteEstimatorEntity.rawEntity;
    const isRush = quoteDetails.priority === 'Urgent';
    const resolvedPriority = isRush ? 'Urgent' : 'Normal';

    if (enq?.id) {
      updateEnquiry(enq.id, {
        amount: newAmount,
        quotation_generated: true,
        costing_status: 'Costed',
        priority: resolvedPriority,
        is_rush_order: isRush,
        job_specification: quoteDetails.jobTitle || enq.job_specification,
        paper: quoteDetails.paperType || enq.paper,
        size: quoteDetails.sheetSize || enq.size,
        quantity: quoteDetails.quantity || enq.quantity,
      });

      // Mirror in Sales Bookings
      const advanceReq = Math.round(Number(newAmount) * 0.6);
      const existingAdv = Number(enq.advance) || (enq.status === 'Completed' || enq.advance_remarks?.toLowerCase().includes('full') ? Number(newAmount) : 0);
      const isBooked = existingAdv >= advanceReq && advanceReq > 0;

      addSalesBooking({
        booking_number: enq.dn_no && enq.dn_no !== '-' 
          ? `SO-2026-${enq.dn_no}` 
          : `SO-2026-${enq.id.replace(/\D/g, '') || String(Date.now()).slice(-4)}`,
        quote_id: `q-${enq.id}`,
        enquiry_id: enq.id,
        customer_id: enq.customer_id || `cust-${enq.id}`,
        customer_name: enq.customer_name,
        customer_po_ref: enq.dn_no && enq.dn_no !== '-' ? `DN-${enq.dn_no}` : (enq.enquiry_no || enq.id),
        job_title: quoteDetails.jobTitle || enq.job_name || enq.job_specification || 'Commercial Print Job',
        confirmation_channel: enq.source || 'Walk-in',
        confirmation_date: new Date().toISOString().split('T')[0],
        order_total: Number(newAmount),
        advance_required: advanceReq,
        advance_received: existingAdv,
        balance_pending: Math.max(0, Number(newAmount) - existingAdv),
        booking_status: isBooked ? 'Booked' : 'Awaiting Advance',
        production_release: isBooked,
        priority: resolvedPriority,
        is_rush_order: isRush,
        prepress: enq.prepress && enq.prepress !== '-' ? enq.prepress : 'Aruna'
      });
    }

    setQuoteEstimatorEntity(null);
  };

  const handleModalAddComment = () => {
    if (!commentsModalJob || !modalNewComment.trim()) return;
    const text = modalNewComment.trim();
    if (commentsModalJob.entityType === 'job_order') {
      addJobComment(commentsModalJob.id, text, 0);
    }
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
      notes: text
    }));
    setModalNewComment('');
  };

  return (
    <div className="space-y-3">
      {/* Module Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              03
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Planning & Kanban</h1>
              <p className="text-[11px] text-slate-500 font-medium">End-to-End Workflow Command Center</p>
            </div>
          </div>

          {/* Controls: Only Rush Jobs & Collapse All */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRushOnly(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                showRushOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs ring-1 ring-rose-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
              title={showRushOnly ? "Showing Rush Jobs only (Click to show all)" : "Filter to Rush Jobs only"}
            >
              <Zap size={13} className={showRushOnly ? "text-rose-600 fill-rose-600" : "text-amber-500"} />
              <span>Rush Jobs</span>
              {urgentCardsCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                  showRushOnly ? 'bg-rose-200 text-rose-900' : 'bg-rose-100 text-rose-700'
                }`}>
                  {urgentCardsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleCollapseAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-xs transition cursor-pointer shadow-2xs"
              title="Collapse all cards to minimal view"
            >
              <Minimize2 size={13} className="text-slate-500" />
              <span>Collapse All</span>
            </button>
            {expandedJobIds.size > 0 && (
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                {expandedJobIds.size} Expanded
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="stage-page-container">
        {/* 5-Column Kanban Board Layout */}
        <div className="kanban-board-container grid grid-cols-1 md:grid-cols-5 gap-3">
          {stages.map(stage => {
            const columnCards = activeCards
              .filter(card => {
                if (card.currentStage !== stage.id) return false;
                if (showRushOnly) return card.isUrgent;
                return true;
              })
              .sort((a, b) => {
                // QC rework cards prioritized at top
                if (a.qcFlagged && !b.qcFlagged) return -1;
                if (!a.qcFlagged && b.qcFlagged) return 1;
                // Rush cards next
                if (a.isUrgent && !b.isUrgent) return -1;
                if (!a.isUrgent && b.isUrgent) return 1;
                return (a.queuePosition || 99) - (b.queuePosition || 99);
              });

            return (
              <div key={stage.id} className="kanban-column bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden flex flex-col min-w-[240px]">
                {/* Column Header */}
                <div
                  className="kanban-column-header p-3 bg-white border-b border-slate-200"
                  style={{ borderTop: `3px solid ${stage.color}` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-tight text-slate-900">{stage.label}</span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {columnCards.length}
                    </span>
                  </div>
                </div>

                {/* Cards Wrapper */}
                <div className="kanban-cards-wrapper p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
                  {columnCards.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs italic bg-white/60 rounded-lg border border-dashed border-slate-200">
                      No jobs in this stage
                    </div>
                  ) : (
                    columnCards.map((card, idx) => {
                      const nextStage = getNextStage(card.currentStage);
                      const prevStage = getPrevStage(card.currentStage);
                      const isExpanded = expandedJobIds.has(card.id);
                      const inputs = getInputs(card.id, nextStage);

                      const formattedDate = card.targetCompletionDate
                        ? new Date(card.targetCompletionDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : 'Today';

                      return (
                        <div
                          key={card.id}
                          onClick={() => toggleExpandJob(card.id)}
                          className={`kanban-job-card bg-white border rounded-xl p-3 shadow-2xs cursor-pointer transition select-none group ${
                            card.qcFlagged
                              ? 'border-rose-400 ring-1 ring-rose-300 bg-rose-50/20'
                              : card.isUrgent
                              ? 'border-amber-400 ring-1 ring-amber-300'
                              : isExpanded
                              ? 'border-blue-400 shadow-md ring-1 ring-blue-300'
                              : 'border-slate-200 hover:border-slate-400 hover:shadow-xs'
                          }`}
                        >
                          {/* Top Row: Rank, Ticket, Badges & Expand Indicator */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-900">
                                {card.ticketNumber}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              {card.isUrgent && <RushBadge size="xs" />}

                              {/* Quotation Stage Sub-state Badges */}
                              {stage.id === 'Quotation' && (
                                <>
                                  {!card.isQuoted ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300 whitespace-nowrap">
                                      Pending Quote
                                    </span>
                                  ) : !card.isAdvancePaid ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300 whitespace-nowrap">
                                      Pending Advance
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                                      Advance Cleared
                                    </span>
                                  )}
                                </>
                              )}

                              <span className="text-slate-400 group-hover:text-blue-600 transition p-0.5 rounded">
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </span>
                            </div>
                          </div>

                          {/* QC REWORK BANNER (If Rewound by QC) */}
                          {card.qcFlagged && (
                            <div className="bg-rose-50 border border-rose-300 text-rose-900 rounded-md p-1.5 mb-2 shadow-2xs animate-in fade-in">
                              <div className="flex items-center gap-1 font-black text-[10px] text-rose-800 uppercase tracking-tight">
                                <AlertCircle size={12} className="text-rose-600 shrink-0" />
                                <span>QC REWORK RETURN</span>
                              </div>
                              <p className="mt-0.5 text-[10px] text-rose-700 font-medium italic line-clamp-2">
                                {card.lastQcReason || 'Returned from downstream station for correction.'}
                              </p>
                            </div>
                          )}

                          {/* Job Title & Customer */}
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                              {card.jobTitle}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium pt-0.5">
                              <span className="truncate max-w-[130px] font-semibold text-slate-700">
                                {card.customerName}
                              </span>
                              <span className="font-mono text-slate-500 font-bold text-[10px] shrink-0">
                                {card.quantity?.toLocaleString()} pcs
                              </span>
                            </div>
                          </div>

                          {/* Stage-Specific Metadata & Metrics */}
                          <div className="mt-2 pt-1.5 border-t border-slate-100 text-[11px] space-y-1">
                            {stage.id === 'Quotation' && (
                              <div className="flex items-center justify-between text-[10px] font-mono">
                                <span className="font-bold text-slate-900">
                                  {card.totalCost > 0 ? `₹ ${card.totalCost.toLocaleString('en-IN')}` : 'Awaiting Quote'}
                                </span>
                                {card.totalCost > 0 && (
                                  <span className={card.isAdvancePaid ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                                    Adv: ₹{card.advancePaid.toLocaleString('en-IN')} / ₹{card.advanceRequired.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            )}

                            {stage.id === 'Prepress' && (
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                                <span className="truncate max-w-[120px]">Designer: {card.assignedResource}</span>
                                <span className="text-purple-700 font-semibold">{formattedDate}</span>
                              </div>
                            )}

                            {stage.id === 'Press' && (
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
                                <span className="truncate max-w-[130px]">{card.assignedResource?.split(' ')[0]} {card.assignedResource?.split(' ')[1]}</span>
                                <span className="text-amber-700 font-semibold">{formattedDate}</span>
                              </div>
                            )}

                            {stage.id === 'Finishing' && (
                              <div className="flex items-center justify-between text-[10px] text-slate-600">
                                <span className="truncate max-w-[130px] font-medium">{card.finishingSpec || 'Standard Finishing'}</span>
                                <span className="text-emerald-700 font-mono font-semibold">{formattedDate}</span>
                              </div>
                            )}

                            {stage.id === 'Dispatch' && (
                              <div className="flex items-center justify-between text-[10px] text-slate-600">
                                <span className="text-cyan-800 font-semibold font-mono">Ready for Dispatch</span>
                                <span className="font-mono text-slate-500">{formattedDate}</span>
                              </div>
                            )}
                          </div>

                          {/* COLLAPSED QUICK ACTIONS BAR */}
                          {!isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setSpecSheetModalEntity(card.rawEntity || card)}
                                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                  title="View Job Spec Sheet"
                                >
                                  <FileText size={11} className="text-blue-600" /> Specs
                                </button>

                                {/* QC Send Back Button for Stages 2-5 */}
                                {prevStage && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setQcRewindModalCard(card);
                                      setQcTargetStage(prevStage);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                    title="Send Back / QC Rework Return"
                                  >
                                    <RotateCcw size={10} className="text-rose-600" /> QC Revert
                                  </button>
                                )}
                              </div>

                              <div>
                                {stage.id === 'Quotation' && !card.isQuoted && (
                                  <button
                                    type="button"
                                    onClick={() => setQuoteEstimatorEntity(card)}
                                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                  >
                                    <Calculator size={11} /> Quote
                                  </button>
                                )}

                                {stage.id === 'Quotation' && card.isQuoted && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStage(card, 'Prepress')}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer ${
                                      card.isAdvancePaid
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}
                                    title={card.isAdvancePaid ? "Release to Prepress Studio" : "Advance to Prepress"}
                                  >
                                    <Send size={10} /> Prepress
                                  </button>
                                )}

                                {stage.id !== 'Quotation' && nextStage && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStage(card, nextStage)}
                                    className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer"
                                    title={`Advance to ${nextStage}`}
                                  >
                                    <Send size={10} /> {nextStage}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* EXPANDED VIEW */}
                          {isExpanded && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 pt-2 border-t border-slate-200 space-y-3 text-xs"
                            >
                              {/* Specification Highlights */}
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                                {card.paperDetails && (
                                  <div><span className="font-semibold text-slate-500">Stock:</span> <span className="font-medium text-slate-800">{card.paperDetails}</span></div>
                                )}
                                {card.colorSpec && (
                                  <div><span className="font-semibold text-slate-500">Colors:</span> <span className="font-medium text-slate-800">{card.colorSpec}</span></div>
                                )}
                                {card.finishingSpec && (
                                  <div><span className="font-semibold text-slate-500">Finishing:</span> <span className="font-medium text-slate-800">{card.finishingSpec}</span></div>
                                )}
                              </div>

                              {/* Last Note Snippet */}
                              {getLastNote(card) && (
                                <div className="bg-blue-50/60 p-2 rounded border border-blue-100 text-[11px] text-blue-900">
                                  <div className="flex items-center justify-between text-[9px] font-bold text-blue-700 mb-0.5">
                                    <span>LATEST WORKSTATION NOTE</span>
                                    <span>by {getLastNoteAuthor(card) || 'Operator'}</span>
                                  </div>
                                  <p className="italic">"{getLastNote(card)}"</p>
                                </div>
                              )}

                              {/* Modal Launcher Buttons */}
                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSpecSheetModalEntity(card.rawEntity || card)}
                                  className="py-1.5 px-1 bg-white hover:bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <FileText size={12} className="text-blue-600" />
                                  <span className="truncate">Spec Sheet</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCommentsModalJob(card);
                                    setModalNewComment('');
                                  }}
                                  className="py-1.5 px-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-200 rounded font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <MessageSquare size={12} className="text-purple-600" />
                                  <span className="truncate">Comments</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedJobForModal({
                                    ...card.rawEntity,
                                    job_ticket_number: card.ticketNumber,
                                    job_title: card.jobTitle,
                                    customer_name: card.customerName,
                                    notes: getLastNote(card) || card.notes
                                  })}
                                  className="py-1.5 px-1 bg-[#002b41] hover:bg-[#002b41]/90 text-white rounded font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Printer size={12} />
                                  <span className="truncate">Job Ticket</span>
                                </button>
                              </div>

                              {/* Operator Comment & Target Stage Controls */}
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold text-slate-700">
                                    Operator / Workstation Log:
                                  </label>
                                  <textarea
                                    rows="2"
                                    value={inputs.comment}
                                    onChange={(e) => updateInput(card.id, 'comment', e.target.value, nextStage)}
                                    placeholder="Add observations, make-ready runtime, color density..."
                                    className="w-full bg-white border border-slate-300 rounded p-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                                  />
                                </div>

                                <div className="pt-2 border-t border-slate-200 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-semibold text-slate-700">Target Next Stage:</span>
                                    <select
                                      value={inputs.targetStage || nextStage || card.currentStage}
                                      onChange={(e) => updateInput(card.id, 'targetStage', e.target.value, nextStage)}
                                      className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-bold text-blue-900 text-[10px] focus:outline-none"
                                    >
                                      {stages.map(st => (
                                        <option key={st.id} value={st.id}>
                                          {st.label}
                                        </option>
                                      ))}
                                      <option value="Completed">Completed / Delivered</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveLogOnly(card)}
                                      className="flex-1 py-1 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-bold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Save size={11} /> Save Log
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAdvanceStage(card, inputs.targetStage || nextStage, inputs.comment)}
                                      className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                    >
                                      <Send size={11} /> Move Stage
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Footer Action Bar */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                <div>
                                  {prevStage && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQcRewindModalCard(card);
                                        setQcTargetStage(prevStage);
                                      }}
                                      className="btn btn-xxs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <RotateCcw size={11} /> QC Send Back
                                    </button>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleExpandJob(card.id)}
                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                                >
                                  Collapse
                                </button>
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

      {/* 1. QC REWIND / SEND BACK MODAL */}
      {qcRewindModalCard && (
        <Modal
          isOpen={!!qcRewindModalCard}
          onClose={() => setQcRewindModalCard(null)}
          title={`Send Back Job #${qcRewindModalCard.ticketNumber} for QC Rework`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-bold text-rose-900">{qcRewindModalCard.jobTitle}</span>
                <span className="font-mono text-rose-700">Current: {qcRewindModalCard.currentStage}</span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">Customer: {qcRewindModalCard.customerName}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Rewind Destination Stage:
              </label>
              <select
                value={qcTargetStage}
                onChange={(e) => setQcTargetStage(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
              >
                {stages.map(st => (
                  <option key={st.id} value={st.id}>
                    Return to {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Defect Category:
              </label>
              <select
                value={qcDefectCategory}
                onChange={(e) => setQcDefectCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              >
                <option value="Color / Inking Defect">Color / Inking Defect (Density Drift / Hickey)</option>
                <option value="Plate / CTP Imposition Defect">Plate / CTP Imposition Defect (Scratch / Wrong Imposition)</option>
                <option value="Trimming / Die-cutting Flaw">Trimming / Die-cutting Flaw (Off Registration / Burrs)</option>
                <option value="Lamination / Coating Flaw">Lamination / Coating Flaw (Peeling / Wrinkling)</option>
                <option value="Customer Artwork / Spec Revision">Customer Artwork / Spec Revision (Client Updated File)</option>
                <option value="Packaging / Delivery Error">Packaging / Delivery Error (Damaged Carton / Missing Label)</option>
                <option value="Other Quality Concern">Other Quality Concern</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Rework Instructions & Defect Description:
              </label>
              <textarea
                rows="3"
                value={qcReturnNotes}
                onChange={(e) => setQcReturnNotes(e.target.value)}
                placeholder="Mention specific instructions (e.g., Reprint 400 sheets with Cyan density 1.45, fix front margin creep, remake black plate)..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setQcRewindModalCard(null)}
                className="btn btn-sm btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmQcRewind}
                className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw size={12} />
                <span>Confirm QC Return</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. REUSABLE TECHNICAL SPEC SHEET MODAL */}
      <TechnicalSpecSheetModal
        isOpen={!!specSheetModalEntity}
        onClose={() => setSpecSheetModalEntity(null)}
        entity={specSheetModalEntity}
        onOpenQuoteEstimator={(enq) => {
          setSpecSheetModalEntity(null);
          setQuoteEstimatorEntity({ rawEntity: enq });
        }}
      />

      {/* 3. QUOTE ESTIMATOR MODAL */}
      <QuoteEstimatorModal
        isOpen={!!quoteEstimatorEntity}
        onClose={() => setQuoteEstimatorEntity(null)}
        enquiry={quoteEstimatorEntity?.rawEntity || quoteEstimatorEntity}
        onApplyQuote={handleApplyQuoteFromKanban}
      />

      {/* 4. COMMENTS & WORKSTATION HISTORY MODAL */}
      {commentsModalJob && (
        <Modal
          isOpen={!!commentsModalJob}
          onClose={() => {
            setCommentsModalJob(null);
            setModalNewComment('');
          }}
          title={`Comments & Workstation History — ${commentsModalJob.ticketNumber}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">{commentsModalJob.jobTitle}</h4>
                <p className="text-slate-500 text-[11px]">{commentsModalJob.customerName}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                {(commentsModalJob.comments || []).length} Logged Entries
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(commentsModalJob.comments || []).length > 0 ? (
                commentsModalJob.comments.map((com, idx) => {
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
      )}
    </div>
  );
};
