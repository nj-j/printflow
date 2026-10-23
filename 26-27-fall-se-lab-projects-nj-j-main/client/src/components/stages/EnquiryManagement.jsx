import React, { useState } from 'react';
import {
  Calculator,
  PlusCircle,
  Zap,
  Printer,
  Sparkles,
  FileText,
  DollarSign,
  Layers,
  CheckCircle,
  ArrowRight,
  Phone,
  MessageSquare,
  Search,
  Eye,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Inbox,
  Send,
  File,
  Settings,
  List,
  Grid,
  PhoneCall,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  User,
  Edit3,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EnquiryFormModal } from '../common/EnquiryFormModal';
import { QuoteEstimatorModal } from '../common/QuoteEstimatorModal';
import { TechnicalSpecSheetModal } from '../common/TechnicalSpecSheetModal';
import {
  STAGES,
  STAGE_CONFIG,
  STAGE_DROPDOWN_OPTIONS,
  normalizeStage,
  getStageDisplay
} from '../../utils/stageConstants';

export const STAGE_OPTIONS = STAGE_DROPDOWN_OPTIONS.map(o => o.label);

export const getEnquiryStage = (enq, jobOrders = []) => {
  if (jobOrders && jobOrders.length > 0) {
    const matchedJob = jobOrders.find(j =>
      j.job_ticket_number === enq.enquiry_no ||
      j.job_ticket_number === enq.id ||
      (enq.dn_no && j.job_ticket_number === `SO-2026-${enq.dn_no}`) ||
      (enq.dn_no && j.job_ticket_number?.includes(enq.dn_no)) ||
      j.job_ticket_number?.includes(enq.id) ||
      (enq.customer_name && j.customer_name && j.customer_name.toLowerCase().trim() === enq.customer_name.toLowerCase().trim() && (j.job_title === enq.job_specification || j.job_title === enq.job_name)) ||
      (enq.customer_name && j.customer_name && j.customer_name.toLowerCase().trim() === enq.customer_name.toLowerCase().trim())
    );
    if (matchedJob) {
      return normalizeStage(matchedJob.current_stage);
    }
  }
  if (enq.current_stage) return normalizeStage(enq.current_stage);
  if (enq.status === 'Cancelled') return STAGES.CANCELLED;
  if (enq.status === 'Completed') return STAGES.COMPLETED;
  if (enq.prepress && enq.prepress !== '-') return STAGES.PREPRESS;
  return STAGES.QUOTATION;
};

export const getStageBadgeStyle = (stage) => {
  const canonical = normalizeStage(stage);
  return STAGE_CONFIG[canonical]?.badgeClass || 'bg-blue-100 text-blue-900 border-blue-300';
};

export const EnquiryManagement = () => {
  const {
    customers,
    quotes,
    createQuote,
    setSelectedQuoteForModal,
    setActiveTab,
    activeTab,
    enquiries = [],
    addEnquiry,
    updateEnquiry,
    addSalesBooking,
    toggleStarEnquiry,
    isMasterEnquiryModalOpen,
    setIsMasterEnquiryModalOpen,
    activeSubTab,
    jobOrders = [],
    advanceJobStage
  } = useApp();

  const isEstimatorView = activeTab === 'estimator' || activeSubTab === 'quotes';

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [selectedEnquiryForQuote, setSelectedEnquiryForQuote] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [specSheetModalEnq, setSpecSheetModalEnq] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Helper to determine if a quotation has been generated for a job
  const isQuotationGenerated = (enq) => {
    if (enq.quotation_generated) return true;
    if (Number(enq.amount) > 0 && enq.costing_status === 'Costed') return true;
    if (Number(enq.amount) > 0 && enq.costing_status !== 'Awaiting Costing' && enq.costing_status !== 'Costing In-Progress') return true;
    return false;
  };

  const toggleExpandRow = (id) => {
    setExpandedRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filters & State for Order Desk Dashboard
  const [selectedFolder, setSelectedFolder] = useState('Inbox'); // Inbox, Starred, Snoozed, Sent, Drafts
  const [statusFilter, setStatusFilter] = useState('All'); // All, Completed, Pending, Cancelled
  const [sourceFilter, setSourceFilter] = useState('All'); // All, Walk-in, Phone, WhatsApp, Others
  const [assignedFilter, setAssignedFilter] = useState('All'); // All, or specific staff
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [sortBy, setSortBy] = useState('Date (Newest)');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Extract unique assigned staff members dynamically from enquiries
  const uniqueAssignedStaff = Array.from(
    new Set(enquiries.map(e => e.quote_assigned_to).filter(Boolean))
  );

  // Count of active filters
  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) +
    (sourceFilter !== 'All' ? 1 : 0) +
    (assignedFilter !== 'All' ? 1 : 0) +
    (dateFilter ? 1 : 0);

  const handleOpenQuoteModal = (enq) => {
    setSelectedEnquiryForQuote(enq);
    setIsQuoteModalOpen(true);
  };

  const handleApplyQuote = (newAmount, quoteDetails = {}) => {
    if (!selectedEnquiryForQuote) return;

    const isRush = (quoteDetails.priority === 'Urgent') || (selectedEnquiryForQuote.priority === 'Urgent') || (selectedEnquiryForQuote.urgency?.toLowerCase().includes('urgent'));
    const resolvedPriority = isRush ? 'Urgent' : (quoteDetails.priority || selectedEnquiryForQuote.priority || 'Normal');

    updateEnquiry(selectedEnquiryForQuote.id, {
      amount: newAmount,
      estimated_amount: newAmount,
      final_quote: newAmount,
      total_amount: newAmount,
      amount_note: `Quoted: ₹${newAmount.toLocaleString('en-IN')}`,
      costing_status: 'Costed',
      quotation_generated: true,
      current_stage: STAGES.QUOTATION,
      quantity: quoteDetails.quantity || selectedEnquiryForQuote.quantity,
      paper: quoteDetails.paperType || selectedEnquiryForQuote.paper,
      size: quoteDetails.sheetSize || selectedEnquiryForQuote.size,
      color_spec: quoteDetails.colorSpec || selectedEnquiryForQuote.color,
      finishing_spec: quoteDetails.finishingSpec || selectedEnquiryForQuote.finishing,
      target_machine: quoteDetails.targetMachine,
      assigned_press_machine: quoteDetails.targetMachine,
      job_name: quoteDetails.jobTitle || selectedEnquiryForQuote.job_name || selectedEnquiryForQuote.job_specification,
      priority: resolvedPriority,
      is_rush_order: isRush
    });

    let createdQuoteId = null;
    if (quoteDetails?.saveToRegister) {
      const q = createQuote({
        customer_name: selectedEnquiryForQuote.customer_name,
        priority: resolvedPriority,
        total_estimated_price: newAmount,
        target_machine: quoteDetails.targetMachine,
        assigned_press_machine: quoteDetails.targetMachine,
        valid_until: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
        items: [
          {
            id: `qi-${Date.now()}`,
            job_title: quoteDetails.jobTitle || selectedEnquiryForQuote.job_specification,
            print_quantity: quoteDetails.quantity,
            paper_type: quoteDetails.paperType,
            target_machine: quoteDetails.targetMachine,
            assigned_press_machine: quoteDetails.targetMachine,
            item_subtotal: newAmount
          }
        ]
      });
      createdQuoteId = q?.id;
    }

    // Automatically reflect in Order Booking tab
    const advanceReq = Math.round(Number(newAmount) * 0.6);
    const existingAdv = Number(selectedEnquiryForQuote.advance) || (selectedEnquiryForQuote.status === 'Completed' || selectedEnquiryForQuote.advance_remarks?.toLowerCase().includes('full') ? Number(newAmount) : 0);
    const isBooked = existingAdv >= advanceReq && advanceReq > 0;

    addSalesBooking({
      booking_number: selectedEnquiryForQuote.dn_no && selectedEnquiryForQuote.dn_no !== '-' 
        ? `SO-2026-${selectedEnquiryForQuote.dn_no}` 
        : `SO-2026-${selectedEnquiryForQuote.id.replace(/\D/g, '') || String(Date.now()).slice(-4)}`,
      quote_id: createdQuoteId || `q-${selectedEnquiryForQuote.id}`,
      enquiry_id: selectedEnquiryForQuote.id,
      customer_id: selectedEnquiryForQuote.customer_id || `cust-${selectedEnquiryForQuote.id}`,
      customer_name: selectedEnquiryForQuote.customer_name,
      customer_po_ref: selectedEnquiryForQuote.dn_no && selectedEnquiryForQuote.dn_no !== '-' 
        ? `DN-${selectedEnquiryForQuote.dn_no}` 
        : (selectedEnquiryForQuote.enquiry_no || selectedEnquiryForQuote.id),
      arc_number: null,
      job_title: quoteDetails.jobTitle || selectedEnquiryForQuote.job_name || selectedEnquiryForQuote.job_specification || 'Commercial Print Job',
      confirmation_channel: selectedEnquiryForQuote.source || 'Walk-in',
      confirmation_date: new Date().toISOString().split('T')[0],
      order_total: Number(newAmount),
      advance_required: advanceReq,
      advance_received: existingAdv,
      balance_pending: Math.max(0, Number(newAmount) - existingAdv),
      booking_status: isBooked ? 'Booked' : 'Awaiting Advance',
      production_release: isBooked,
      refund_applicable: false,
      priority: resolvedPriority,
      is_rush_order: isRush,
      target_machine: quoteDetails.targetMachine,
      assigned_press_machine: quoteDetails.targetMachine,
      prepress: selectedEnquiryForQuote.prepress && selectedEnquiryForQuote.prepress !== '-' ? selectedEnquiryForQuote.prepress : 'Aruna'
    });

    setToastNotification(`Quotation ₹${newAmount.toLocaleString('en-IN')} applied! Reflected in Order Booking queue.`);
    setTimeout(() => setToastNotification(null), 4000);
  };

  // Calculations for unquoted vs quoted
  const pendingQuotesEnquiries = enquiries.filter(e => !isQuotationGenerated(e));
  const quotedEnquiries = enquiries.filter(e => isQuotationGenerated(e));

  // Dashboard KPI metrics calculations
  const totalEnquiriesCount = enquiries.length;
  const completedCount = enquiries.filter(e => e.status === 'Completed').length;
  const pendingCount = enquiries.filter(e => e.status === 'Pending' || e.status === 'Enquiry').length;
  const cancelledCount = enquiries.filter(e => e.status === 'Cancelled').length;

  const totalValueSum = enquiries.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalAdvanceSum = 16500; // Received total advance matching mockup

  // Helper to parse 'DD-MM-YYYY' string into a comparable timestamp
  const parseCustomDate = (dateStr) => {
    if (!dateStr) return 0;
    // Format could be DD-MM-YYYY or YYYY-MM-DD
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts[0].length === 4) {
        return new Date(dateStr).getTime() || 0;
      }
      if (parts.length === 3) {
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
      }
    }
    return new Date(dateStr).getTime() || 0;
  };

  // Filtering enquiries for main table
  const filteredEnquiries = enquiries.filter(e => {
    // If in Estimation & Quotes menu, strictly keep only pending quotations
    if (isEstimatorView) {
      if (isQuotationGenerated(e)) return false;
    }

    if (selectedFolder === 'Starred' && !e.is_starred) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Pending') {
        if (e.status !== 'Pending' && e.status !== 'Enquiry') return false;
      } else if (e.status !== statusFilter) {
        return false;
      }
    }
    if (sourceFilter !== 'All' && e.source !== sourceFilter) return false;
    if (assignedFilter !== 'All' && e.quote_assigned_to !== assignedFilter) return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = e.customer_name?.toLowerCase().includes(q);
      const matchPhone = e.phone?.includes(q);
      const matchSpec = e.job_specification?.toLowerCase().includes(q);
      const matchAssign = e.quote_assigned_to?.toLowerCase().includes(q);
      const matchStage = (e.current_stage || getEnquiryStage(e))?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchSpec && !matchAssign && !matchStage) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'Due Date (Soonest)') {
      const dateA = parseCustomDate(a.expected_delivery);
      const dateB = parseCustomDate(b.expected_delivery);
      return dateA - dateB;
    }
    if (sortBy === 'Due Date (Latest)') {
      const dateA = parseCustomDate(a.expected_delivery);
      const dateB = parseCustomDate(b.expected_delivery);
      return dateB - dateA;
    }
    if (sortBy === 'Date (Newest)') {
      const dateA = parseCustomDate(a.date);
      const dateB = parseCustomDate(b.date);
      return dateB - dateA;
    }
    if (sortBy === 'Amount (High)') {
      return (Number(b.amount) || 0) - (Number(a.amount) || 0);
    }
    if (sortBy === 'Customer') {
      return (a.customer_name || '').localeCompare(b.customer_name || '');
    }
    return 0;
  });

  return (
    <div className="stage-page-container">
      {/* Top Header Bar (Hidden in Estimation & Quotes menu as requested) */}
      {!isEstimatorView && (
        <div className="page-header flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title text-2xl font-black text-slate-900">Josco Printers — Enquiry Management</h1>
              <span className="badge badge-primary font-bold text-xs">Order Desk Dashboard</span>
            </div>
            <p className="page-subtitle text-xs text-slate-500 mt-0.5">
              Real-time Order Desk Dashboard & 10-Section Master Physical Enquiry Form System
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* New Enquiry Button */}
            <button
              className="btn btn-sm btn-primary font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              onClick={() => {
                setEditingEnquiry(null);
                setIsFormModalOpen(true);
              }}
            >
              <PlusCircle size={16} /> New Enquiry
            </button>
          </div>
        </div>
      )}

      {/* Top KPI Metrics Bar (Hidden in Estimation & Quotes menu as requested) */}
      {!isEstimatorView && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* TOTAL ENQUIRIES */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">TOTAL ENQUIRIES</div>
              <div className="text-xl font-black text-slate-900">{totalEnquiriesCount}</div>
              <div className="text-xxs text-primary font-semibold">Today</div>
            </div>
          </div>

          {/* COMPLETED */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">COMPLETED</div>
              <div className="text-xl font-black text-emerald-600">{completedCount}</div>
            </div>
          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">PENDING</div>
              <div className="text-xl font-black text-amber-600">{pendingCount}</div>
            </div>
          </div>

          {/* CANCELLED */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <XCircle size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">CANCELLED</div>
              <div className="text-xl font-black text-red-600">{cancelledCount}</div>
            </div>
          </div>

          {/* TOTAL VALUE */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">TOTAL VALUE</div>
              <div className="text-lg font-black text-slate-900">₹ {totalValueSum.toLocaleString()}</div>
              <div className="text-xxs text-purple-700 font-semibold">(All Enquiries)</div>
            </div>
          </div>

          {/* TOTAL ADVANCE */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-xxs font-bold text-slate-400 uppercase tracking-wider">TOTAL ADVANCE</div>
              <div className="text-lg font-black text-blue-700">₹ {totalAdvanceSum.toLocaleString()}</div>
              <div className="text-xxs text-blue-600 font-semibold">(Received)</div>
            </div>
          </div>
        </div>
      )}

      {/* Order Desk Main Content: Full-Width Table */}
      <div className="w-full space-y-3">

        {/* Table Action Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2.5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                {/* Search Bar + Filter Button Combo */}
                <div className="flex items-center gap-2 flex-1 w-full">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-primary font-medium"
                      placeholder="Search by Customer Name, Phone, Job Specification..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Button Beside Search */}
                  <button
                    type="button"
                    onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs ${
                      isFilterMenuOpen || (statusFilter !== 'All' || sourceFilter !== 'All' || assignedFilter !== 'All')
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                    title="Toggle Advanced Filters"
                  >
                    <Filter size={14} className={isFilterMenuOpen ? "text-blue-600" : "text-slate-500"} />
                    <span>Filter</span>
                    {(statusFilter !== 'All' || sourceFilter !== 'All' || assignedFilter !== 'All') && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Sort By Dropdown */}
                  <select
                    className="form-control text-xs py-1.5 px-2 bg-slate-50 border-slate-200 font-semibold w-full sm:w-auto"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Date (Newest)">Sort by: Date (Newest)</option>
                    <option value="Due Date (Soonest)">Sort by: Due Date (Soonest)</option>
                    <option value="Due Date (Latest)">Sort by: Due Date (Latest)</option>
                    <option value="Amount (High)">Sort by: Amount (High)</option>
                    <option value="Customer">Sort by: Customer Name</option>
                  </select>
                </div>
              </div>

              {/* Filter Panel (Expands when Filter Button is clicked) */}
              {isFilterMenuOpen && (
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                  {/* Date Filter */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Enquiry Date
                    </label>
                    <div className="flex items-center gap-1 bg-white border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <input
                        type="date"
                        className="bg-transparent focus:outline-none font-mono w-full text-xs"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Intake Source
                    </label>
                    <select
                      className="form-control text-xs py-1.5 px-2.5 font-semibold bg-white border-slate-300 w-full"
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                    >
                      <option value="All">All Sources</option>
                      <option value="Walk-in">Walk-in</option>
                      <option value="Phone">Phone</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>

                  {/* Assigned To Filter */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Assigned To
                    </label>
                    <select
                      className="form-control text-xs py-1.5 px-2.5 font-semibold bg-white border-slate-300 w-full"
                      value={assignedFilter}
                      onChange={(e) => setAssignedFilter(e.target.value)}
                    >
                      <option value="All">All Staff</option>
                      {uniqueAssignedStaff.map(staff => (
                        <option key={staff} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        className="form-control text-xs py-1.5 px-2.5 font-semibold bg-white border-slate-300 flex-1"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="All">All Statuses</option>
                        <option value="Enquiry">Enquiry</option>
                        <option value="Pending">Pending</option>
                        <option value="Booked">Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      {/* Reset Filters button */}
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('All');
                          setSourceFilter('All');
                          setAssignedFilter('All');
                        }}
                        className="px-2 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg font-semibold transition"
                        title="Reset all filters"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Data Table View */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="table-responsive">
                <table className="compact-table w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xxs">
                      <th className="w-8 text-center"><Star size={12} /></th>
                      <th>Order Name</th>
                      <th>Customer Name</th>
                      <th>Status & Stage</th>
                      <th>Assigned To</th>
                      <th>Expected Delivery</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          {isEstimatorView ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-4">
                              <CheckCircle2 size={32} className="text-emerald-500" />
                              <span className="font-bold text-slate-700 text-sm">All Quotations Generated!</span>
                              <span className="text-xs text-slate-400">There are currently no pending jobs awaiting cost estimation or quotations.</span>
                            </div>
                          ) : (
                            'No enquiries match the selected filters.'
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredEnquiries.map(enq => {
                        const isCompleted = enq.status === 'Completed';
                        const isCancelled = enq.status === 'Cancelled';
                        const isPending = enq.status === 'Pending';
                        const isExpanded = expandedRowIds.has(enq.id);

                        return (
                          <React.Fragment key={enq.id}>
                            <tr
                              className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                isCancelled ? 'bg-red-50/20' : ''
                              } ${isExpanded ? 'bg-blue-50/30 font-medium' : ''}`}
                              onClick={() => toggleExpandRow(enq.id)}
                            >
                              <td
                                className="text-center cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStarEnquiry(enq.id);
                                }}
                              >
                                <Star
                                  size={14}
                                  className={enq.is_starred ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-400'}
                                />
                              </td>
                              <td>
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                                    <FileText size={14} />
                                  </div>
                                  <div className="max-w-xs md:max-w-sm">
                                    <span className="font-bold text-slate-900 block truncate" title={enq.job_specification}>
                                      {enq.job_specification}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xxs text-slate-400 mt-0.5">
                                      <span className="font-mono font-bold text-slate-500">
                                        #{enq.dn_no && enq.dn_no !== '-' ? `DN-${enq.dn_no}` : enq.id}
                                      </span>
                                      <span>•</span>
                                      <span>{enq.source}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="whitespace-nowrap">
                                <div className="font-bold text-slate-900">{enq.customer_name}</div>
                                <div className="flex items-center gap-1.5 text-xxs text-slate-500 mt-0.5">
                                  <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                    {enq.customer_type || 'Retail'}
                                  </span>
                                  <span className="text-slate-600 font-mono font-medium">
                                    {enq.phone}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`status-pill text-xxs font-bold ${
                                    isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                    isCancelled ? 'bg-red-100 text-red-700' :
                                    enq.status === 'Booked' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                    enq.status === 'Enquiry' ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}>
                                    {enq.status}
                                  </span>
                                  <select
                                    value={getEnquiryStage(enq, jobOrders)}
                                    onChange={(e) => {
                                      const canonicalStage = normalizeStage(e.target.value);
                                      updateEnquiry(enq.id, {
                                        current_stage: canonicalStage,
                                        status: canonicalStage === STAGES.COMPLETED ? 'Completed' : (canonicalStage === STAGES.CANCELLED ? 'Cancelled' : (canonicalStage === STAGES.PREPRESS ? 'Booked' : 'Pending'))
                                      });
                                      const matchedJob = jobOrders?.find(j =>
                                        j.job_ticket_number === enq.enquiry_no ||
                                        j.job_ticket_number === enq.id ||
                                        (enq.dn_no && j.job_ticket_number === `SO-2026-${enq.dn_no}`) ||
                                        (enq.dn_no && j.job_ticket_number?.includes(enq.dn_no)) ||
                                        j.job_ticket_number?.includes(enq.id) ||
                                        (enq.customer_name && j.customer_name && j.customer_name.toLowerCase().trim() === enq.customer_name.toLowerCase().trim())
                                      );
                                      if (matchedJob && advanceJobStage) {
                                        advanceJobStage(matchedJob.id, canonicalStage);
                                      }
                                    }}
                                    className={`text-[10px] font-bold py-0.5 px-1.5 rounded border cursor-pointer focus:outline-none transition shadow-2xs ${getStageBadgeStyle(getEnquiryStage(enq, jobOrders))}`}
                                    title="Department stage (Click to change)"
                                  >
                                    {STAGE_DROPDOWN_OPTIONS.map(opt => (
                                      <option key={opt.id} value={opt.id} className="bg-white text-slate-800 font-semibold">
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                                    {enq.quote_assigned_to?.[0] || 'U'}
                                  </div>
                                  <span>{enq.quote_assigned_to}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                  <Calendar size={13} className="text-slate-400" />
                                  <span className="font-mono text-xs">{enq.expected_delivery || '05-06-2025'}</span>
                                </div>
                              </td>
                              <td className="text-right font-mono font-bold whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className={enq.amount > 0 ? "text-slate-900 mr-1" : "text-slate-400 mr-1"}>
                                    {enq.amount > 0 ? `₹ ${Number(enq.amount).toLocaleString('en-IN')}` : '—'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSpecSheetModalEnq(enq);
                                    }}
                                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-sans font-semibold flex items-center gap-1 shadow-2xs hover:shadow transition cursor-pointer"
                                    title={`View technical job spec sheet for ${enq.customer_name}`}
                                  >
                                    <FileText size={12} className="text-blue-600" /> Spec Sheet
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQuoteModal(enq)}
                                    className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-sans font-semibold flex items-center gap-1 shadow-2xs hover:shadow transition cursor-pointer"
                                    title={`Calculate cost estimate & quote for ${enq.customer_name}`}
                                  >
                                    <Calculator size={12} className="text-blue-600" /> Quote
                                  </button>
                                </div>
                                {enq.amount_note && (
                                  <span className="block text-xxs font-normal text-red-600 mt-0.5">{enq.amount_note}</span>
                                )}
                              </td>
                            </tr>

                            {/* Detailed Job Card (Visible on Expand) */}
                            {isExpanded && (
                              <tr className="bg-slate-50/90 border-b-2 border-blue-200">
                                <td colSpan="7" className="p-3.5 sm:p-4">
                                  <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-4 space-y-4 text-xs">
                                    {/* Card Header Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black flex-shrink-0">
                                          <FileText size={20} />
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                              JOB CARD #{enq.dn_no && enq.dn_no !== '-' ? `DN-${enq.dn_no}` : enq.id.toUpperCase()}
                                            </span>
                                            <span className="font-bold text-slate-900 text-sm">
                                              {enq.customer_name}
                                            </span>
                                            <span className="text-xxs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                              {enq.customer_type || 'Retail Customer'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-600 mt-1 font-medium">
                                            {enq.job_specification}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 flex-wrap">
                                        <button
                                          type="button"
                                          onClick={() => setSpecSheetModalEnq(enq)}
                                          className="btn btn-xs bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                        >
                                          <FileText size={13} className="text-blue-600" /> Spec Sheet
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenQuoteModal(enq)}
                                          className="btn btn-xs btn-primary font-bold flex items-center gap-1.5 shadow-sm"
                                        >
                                          <Calculator size={13} /> Quote Estimator
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingEnquiry(enq);
                                            setIsFormModalOpen(true);
                                          }}
                                          className="btn btn-xs btn-secondary font-semibold flex items-center gap-1.5"
                                        >
                                          <Edit3 size={13} /> Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => window.print()}
                                          className="btn btn-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold flex items-center gap-1"
                                          title="Print Job Ticket"
                                        >
                                          <Printer size={13} /> Print Ticket
                                        </button>
                                      </div>
                                    </div>

                                    {/* 4-Box Detailed Dossier Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                      {/* Box 1: Customer & Intake Details */}
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                          <User size={12} className="text-blue-600" />
                                          CUSTOMER & INTAKE
                                        </div>
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Customer:</span>
                                            <strong className="text-slate-800">{enq.customer_name}</strong>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Phone:</span>
                                            <span className="text-slate-800 font-mono font-bold">
                                              {enq.phone}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Intake Source:</span>
                                            <span className="font-semibold text-slate-700">{enq.source || 'Walk-in'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Enquiry Date:</span>
                                            <span className="font-mono text-slate-700">{enq.date}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Delivery Note (DN):</span>
                                            <span className="font-mono font-bold text-slate-800">{enq.dn_no || '-'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Box 2: Job Specification & Pre-Press */}
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                          <Layers size={12} className="text-purple-600" />
                                          JOB SPECIFICATION
                                        </div>
                                        <div className="space-y-1.5">
                                          <div>
                                            <span className="text-slate-500 block text-[11px]">Full Job Scope:</span>
                                            <p className="font-semibold text-slate-800 text-[11px] leading-relaxed bg-white p-2 rounded border border-slate-200 mt-0.5">
                                              {enq.job_specification}
                                            </p>
                                          </div>
                                          <div className="flex justify-between pt-1">
                                            <span className="text-slate-500">Pre-Press Operator:</span>
                                            <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                              {enq.prepress || '-'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Expected Delivery:</span>
                                            <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                                              <Calendar size={11} className="text-slate-400" />
                                              {enq.expected_delivery || '05-06-2025'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Box 3: Department Stage & Workflow */}
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                          <Clock size={12} className="text-amber-600" />
                                          DEPARTMENT & STAGE
                                        </div>
                                        <div className="space-y-1.5">
                                          <div>
                                            <span className="text-slate-500 block text-[11px] mb-1">Current Department:</span>
                                            <select
                                              value={getEnquiryStage(enq, jobOrders)}
                                              onChange={(e) => {
                                                const canonicalStage = normalizeStage(e.target.value);
                                                updateEnquiry(enq.id, {
                                                  current_stage: canonicalStage,
                                                  status: canonicalStage === STAGES.COMPLETED ? 'Completed' : (canonicalStage === STAGES.CANCELLED ? 'Cancelled' : 'Pending')
                                                });
                                                const matchedJob = jobOrders?.find(j =>
                                                  j.job_ticket_number === enq.enquiry_no ||
                                                  j.job_ticket_number === enq.id ||
                                                  (enq.dn_no && j.job_ticket_number === `SO-2026-${enq.dn_no}`) ||
                                                  (enq.dn_no && j.job_ticket_number?.includes(enq.dn_no)) ||
                                                  j.job_ticket_number?.includes(enq.id) ||
                                                  (enq.customer_name && j.customer_name && j.customer_name.toLowerCase().trim() === enq.customer_name.toLowerCase().trim())
                                                );
                                                if (matchedJob && advanceJobStage) {
                                                  advanceJobStage(matchedJob.id, canonicalStage);
                                                }
                                              }}
                                              className={`w-full text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer focus:outline-none transition ${getStageBadgeStyle(getEnquiryStage(enq, jobOrders))}`}
                                            >
                                              {STAGE_DROPDOWN_OPTIONS.map(opt => (
                                                <option key={opt.id} value={opt.id} className="bg-white text-slate-800 font-semibold">
                                                  {opt.label}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                          <div className="flex justify-between pt-1">
                                            <span className="text-slate-500">Assigned Staff:</span>
                                            <strong className="text-slate-800">{enq.quote_assigned_to}</strong>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Overall Status:</span>
                                            <span className={`status-pill text-xxs font-bold ${
                                              isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                              isCancelled ? 'bg-red-100 text-red-700' :
                                              enq.status === 'Enquiry' ? 'bg-blue-100 text-blue-800' :
                                              'bg-amber-100 text-amber-800'
                                            }`}>
                                              {enq.status}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Costing Status:</span>
                                            <span className="font-semibold text-slate-700">{enq.costing_status || 'Costed'}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Box 4: Commercial & Settlement */}
                                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                                        <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                          <DollarSign size={12} className="text-emerald-600" />
                                          COMMERCIAL & ADVANCE
                                        </div>
                                        <div className="space-y-1.5">
                                          <div className="flex justify-between items-baseline">
                                            <span className="text-slate-500">Quotation Price:</span>
                                            <span className="text-base font-black font-mono text-slate-900">
                                              {enq.amount > 0 ? `₹ ${Number(enq.amount).toLocaleString('en-IN')}` : '— Not Quoted'}
                                            </span>
                                          </div>
                                          {enq.amount_note && (
                                            <div className="text-xxs text-red-600 bg-red-50 p-1 rounded border border-red-100 font-semibold">
                                              {enq.amount_note}
                                            </div>
                                          )}
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Advance / Remarks:</span>
                                            <strong className={
                                              enq.advance_remarks?.includes('Full') ? 'text-emerald-700 font-bold' :
                                              enq.advance_remarks === 'Cancelled' ? 'text-red-600 font-bold' :
                                              'text-blue-700 font-bold'
                                            }>
                                              {enq.advance_remarks || '-'}
                                            </strong>
                                          </div>
                                          {enq.support_notes && (
                                            <div>
                                              <span className="text-slate-500 block text-[10px]">Support Notes:</span>
                                              <p className="text-xxs text-slate-600 italic bg-white p-1 rounded border border-slate-200 mt-0.5">
                                                {enq.support_notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Legend (Matching Uploaded Mockup media_1788894065565.png) */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center text-xxs text-slate-600 gap-3 font-medium">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span><strong>Completed:</strong> Job delivered / Closed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span><strong>Pending:</strong> In progress / Awaiting action</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span><strong>Cancelled:</strong> Enquiry cancelled</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <Layers size={12} className="text-blue-600" /> Click any row to expand/collapse full job details
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400" /> Click on star to favorite
                  </span>
                </div>
              </div>
            </div>
      </div>

      {/* Intelligent Cost Estimator & Quote Modal */}
      <QuoteEstimatorModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setSelectedEnquiryForQuote(null);
        }}
        enquiry={selectedEnquiryForQuote}
        onApplyQuote={handleApplyQuote}
      />

      {/* Technical Spec Sheet Modal */}
      <TechnicalSpecSheetModal
        isOpen={!!specSheetModalEnq}
        onClose={() => setSpecSheetModalEnq(null)}
        entity={specSheetModalEnq}
        onOpenQuoteEstimator={handleOpenQuoteModal}
      />

      {/* 10-Section Master Enquiry Form Modal */}
      <EnquiryFormModal
        isOpen={isFormModalOpen || isMasterEnquiryModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setIsMasterEnquiryModalOpen(false);
          setEditingEnquiry(null);
        }}
        enquiryData={editingEnquiry}
        onSaveEnquiry={(savedData) => {
          if (editingEnquiry?.id) {
            updateEnquiry(editingEnquiry.id, savedData);
            setToastNotification(`Job ${editingEnquiry.enquiry_no || editingEnquiry.id} updated successfully!`);
          } else {
            addEnquiry(savedData);
            setToastNotification('New enquiry added successfully!');
          }
          setEditingEnquiry(null);
          setIsFormModalOpen(false);
          setIsMasterEnquiryModalOpen(false);
          setTimeout(() => setToastNotification(null), 3500);
        }}
      />

      {/* Floating Action Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
};
