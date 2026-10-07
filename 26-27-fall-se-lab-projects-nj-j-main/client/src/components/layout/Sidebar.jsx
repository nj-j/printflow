import React, { useState } from 'react';
import {
  HelpCircle,
  FileCheck2,
  Palette,
  Boxes,
  Kanban,
  Printer,
  Scissors,
  Truck,
  Receipt,
  BarChart3,
  CheckSquare,
  Zap,
  FolderSync,
  Layers,
  FileText,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sliders,
  Send,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    activeSubTab,
    navigateToTab,
    quotes,
    jobOrders,
    inventory,
    invoices,
    enquiries,
    dispatchRoutes,
    salesBookings,
    prepressJobs,
    finishingOps,
    associates,
    customerRejections,
    activeBranch,
    setActiveBranch,
    estimatorViewMode,
    setEstimatorViewMode,
    notificationsLog,
    excessStock
  } = useApp();

  const [isSubNavCollapsed, setIsSubNavCollapsed] = useState(false);

  // Counts & metrics
  const activeEnquiriesCount = enquiries.length;
  const pendingQuotesCount = enquiries.filter(
    e => !e.amount || Number(e.amount) === 0 || e.costing_status === 'Awaiting Costing'
  ).length;
  const awaitingAdvanceCount = salesBookings.filter(s => s.booking_status === 'Awaiting Advance').length;
  const pendingProofsCount = prepressJobs.filter(p => !p.production_release_authorized).length;
  const activeJobsCount = jobOrders.filter(j => j.current_stage !== 'Completed').length;
  const urgentJobsCount = jobOrders.filter(
    j => (j.priority === 'Urgent' || j.is_rush_order) && j.current_stage !== 'Completed'
  ).length;
  const activeFinishingCount = finishingOps.filter(f => f.status !== 'Completed').length;
  const lowStockCount = inventory.filter(i => i.quantity_on_hand <= i.reorder_threshold).length;
  const pendingInvoicesCount = invoices.filter(i => i.payment_status !== 'Paid').length;
  const activeRejectionsCount = customerRejections.filter(r => r.status !== 'Closed').length;

  // The 9 Consolidated ERP Modules
  const modules = [
    { id: 'commercial', num: '01', label: 'Commercial Desk', icon: HelpCircle },
    { id: 'prepress', num: '02', label: 'Prepress Studio', icon: Palette },
    { id: 'planning', num: '03', label: 'Planning & Kanban', icon: Kanban, highlight: urgentJobsCount > 0 },
    { id: 'press_terminal', num: '04', label: 'Press Terminal (MES)', icon: Printer },
    { id: 'finishing_qc', num: '05', label: 'Finishing & QC', icon: Scissors },
    { id: 'inventory', num: '06', label: 'Inventory & Stores', icon: Boxes },
    { id: 'dispatch', num: '07', label: 'Dispatch & Logistics', icon: Truck },
    { id: 'billing', num: '08', label: 'Finance & Billing', icon: Receipt },
    { id: 'admin_analytics', num: '09', label: 'Admin & Analytics', icon: BarChart3 },
  ];

  const isTabActive = (modId) => {
    if (activeTab === modId) return true;
    if (modId === 'commercial' && (activeTab === 'enquiry' || activeTab === 'costing' || activeTab === 'estimator' || activeTab === 'booking')) return true;
    if (modId === 'planning' && activeTab === 'production') return true;
    if (modId === 'finishing_qc' && (activeTab === 'finishing' || activeTab === 'associates' || activeTab === 'qc_packing')) return true;
    if (modId === 'inventory' && activeTab === 'procurement') return true;
    if (modId === 'dispatch' && activeTab === 'rejections') return true;
    if (modId === 'admin_analytics' && (activeTab === 'owner_dashboard' || activeTab === 'dashboard' || activeTab === 'notifications' || activeTab === 'config')) return true;
    return false;
  };

  const currentModuleId = modules.find(m => isTabActive(m.id))?.id || 'commercial';

  // Render contextual secondary sub-navigation rail for the 9 consolidated modules
  const renderSubNavContent = () => {
    switch (currentModuleId) {
      case 'commercial':
      case 'booking': {
        const sub = activeSubTab || 'intake';
        const isBookingSub = sub === 'booking' || sub === 'booking_queue' || sub === 'qr_desk' || sub === 'confirmations';

        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Commercial Desk
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  01
                </span>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Sub-Tabs</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('commercial', 'intake')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'intake' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Inbox size={13} /> Intake & CRM</span>
                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-mono text-[10px]">{enquiries.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('commercial', 'quotes')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'quotes' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><FileText size={13} /> Quotations</span>
                  <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full font-mono text-[10px]">{quotes.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('commercial', 'booking')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    isBookingSub ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><FileCheck2 size={13} /> Order Booking</span>
                  <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                    awaitingAdvanceCount > 0 ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {salesBookings.length}
                  </span>
                </button>
              </div>

              {/* Sub-Tab Specific Views */}
              {sub === 'quotes' && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Quotation Views</div>
                  <button
                    type="button"
                    onClick={() => setEstimatorViewMode('pending')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition ${
                      estimatorViewMode === 'pending'
                        ? 'bg-amber-50 border border-amber-300 text-amber-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Pending Quotes</span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-amber-500 text-white">
                      {pendingQuotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstimatorViewMode('quoted')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition ${
                      estimatorViewMode === 'quoted'
                        ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>Quoted Records</span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-emerald-600 text-white">
                      {enquiries.length - pendingQuotesCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEstimatorViewMode('all')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition ${
                      estimatorViewMode === 'all'
                        ? 'bg-blue-50 border border-blue-300 text-blue-900 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>All Enquiries</span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-blue-600 text-white">
                      {enquiries.length}
                    </span>
                  </button>
                </div>
              )}

              {sub === 'intake' && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Assigned Team</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
                      <span>Nicey</span>
                      <span className="text-[10px] font-mono text-slate-400">4</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
                      <span>Krishnamani</span>
                      <span className="text-[10px] font-mono text-slate-400">5</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
                      <span>Pavithra</span>
                      <span className="text-[10px] font-mono text-slate-400">6</span>
                    </div>
                  </div>
                </div>
              )}

              {isBookingSub && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Booking Views</div>
                  <button
                    type="button"
                    onClick={() => navigateToTab('commercial', 'booking_queue')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                      sub === 'booking' || sub === 'booking_queue'
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Booked Orders</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      sub === 'booking' || sub === 'booking_queue' ? 'bg-blue-600 text-white' : 'text-slate-500'
                    }`}>
                      {salesBookings.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab('commercial', 'qr_desk')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                      sub === 'qr_desk'
                        ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Awaiting 60% Advance</span>
                    <span className="font-mono text-amber-600 font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100">
                      {awaitingAdvanceCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToTab('commercial', 'confirmations')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                      sub === 'confirmations'
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Released to Production</span>
                    <span className="font-mono text-emerald-600 font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100">
                      {salesBookings.length - awaitingAdvanceCount}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {isBookingSub ? (
              <div className="p-2 border-t border-slate-100 bg-emerald-50 rounded-lg text-emerald-900">
                <div className="text-[10px] font-bold uppercase font-mono text-emerald-800">Gate 3: Payment Gate</div>
                <div className="text-[11px] mt-1 space-y-0.5">
                  <div>• Dynamic 60% UPI QR Desk</div>
                  <div>• ARC client credit release</div>
                  <div>• Production lock till advance</div>
                </div>
              </div>
            ) : (
              <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-lg">
                <div className="text-[10px] font-bold text-slate-600 uppercase font-mono">Commercial Gate</div>
                <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                  <div>• Gate 1: Spec Completeness</div>
                  <div>• Gate 2: Margin Lock (25%+)</div>
                  <div>• Auto-BOM generation</div>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'prepress': {
        const sub = activeSubTab || 'all';
        const preflightCount = prepressJobs.filter(j => !j.production_release_authorized || j.revision_count > 1).length;
        const ctpReadyCount = prepressJobs.filter(p => p.production_release_authorized).length;

        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Prepress Studio
                </span>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                  02
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Studio Stages</div>
                
                <button
                  type="button"
                  onClick={() => navigateToTab('prepress', 'all')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'all'
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Artwork Jobs</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    sub === 'all' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}>
                    {prepressJobs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('prepress', 'preflight')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'preflight'
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Artwork Pre-Flight</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    sub === 'preflight' ? 'bg-purple-600 text-white' : 'text-slate-500'
                  }`}>
                    {preflightCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('prepress', 'proof_signoff')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'proof_signoff'
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Proof Sign-Off (WhatsApp)</span>
                  <span className="font-mono text-amber-600 font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100">
                    {pendingProofsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('prepress', 'ctp')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'ctp'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>CTP Plate Output</span>
                  <span className="font-mono text-emerald-600 font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100">
                    {ctpReadyCount}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-purple-50 rounded-lg text-purple-900">
              <div className="text-[10px] font-bold uppercase font-mono text-purple-800">CTP Thermal Imager</div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>• Screen PlateRite 8600</div>
                <div>• 2400 DPI Resolution</div>
                <div>• Auto Bleed & Trap Check</div>
              </div>
            </div>
          </div>
        );
      }

      case 'planning': {
        const sub = activeSubTab || 'job_tickets';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Planning & Kanban
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  03
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Workload Queue</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('planning', 'job_tickets')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'job_tickets'
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Active Job Tickets</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    sub === 'job_tickets' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}>
                    {activeJobsCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('planning', 'allocation')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'allocation'
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Machine Allocation</span>
                  <span className="font-mono text-slate-400">3 Presses</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('planning', 'rush')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'rush'
                      ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Zap size={12} className="text-rose-500 fill-rose-500" /> Rush Fast-Track
                  </span>
                  <span className="font-mono font-bold text-rose-600 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100">
                    {urgentJobsCount}
                  </span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Kanban Stages</div>
                {['DesignProofing', 'PlateMaking', 'PressRun', 'FinishingQC', 'DispatchReady'].map(st => (
                  <div key={st} className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
                    <span className="capitalize">{st.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {jobOrders.filter(j => j.current_stage === st).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-amber-50 rounded-lg text-amber-900">
              <div className="text-[10px] font-bold uppercase font-mono text-amber-800">Priority Policy</div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>• Rush overrides standard queue</div>
                <div>• Material reservation required</div>
                <div>• Machine runtime pre-allocated</div>
              </div>
            </div>
          </div>
        );
      }

      case 'press_terminal': {
        const sub = activeSubTab || 'live_terminal';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Press Terminal (MES)
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                  04
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Terminal Modes</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('press_terminal', 'live_terminal')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'live_terminal'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Live Terminal</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('press_terminal', 'counters')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'counters'
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Impression Counter</span>
                  <span className="font-mono text-blue-600 font-bold text-[10px]">Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('press_terminal', 'calibration')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'calibration'
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Setup & Calibration</span>
                  <span className="font-mono text-amber-600 font-bold text-[10px]">Density</span>
                </button>
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-lg text-slate-600">
              <div className="text-[10px] font-bold uppercase font-mono text-slate-700">Operator Sign-Off</div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>• Density 1.45 CMYK verified</div>
                <div>• Blanket inspection passed</div>
                <div>• Digital waste tally logging</div>
              </div>
            </div>
          </div>
        );
      }

      case 'finishing_qc': {
        const sub = activeSubTab || 'bindery';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Finishing & QC
                </span>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                  05
                </span>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Sub-Tabs</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('finishing_qc', 'bindery')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'bindery' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Scissors size={13} /> Bindery Ops</span>
                  <span className="px-1.5 py-0.2 bg-indigo-600 text-white rounded-full font-mono text-[10px]">{activeFinishingCount}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('finishing_qc', 'outsourced')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'outsourced' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Building2 size={13} /> Outsourced Job-Work</span>
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-mono text-[10px]">{associates.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('finishing_qc', 'qc_inspection')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'qc_inspection' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> QC Inspection</span>
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-mono text-[10px]">
                    {jobOrders.filter(j => j.current_stage === 'FinishingQC').length}
                  </span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Bindery Units</div>
                <div className="px-2 py-1 text-slate-600 hover:bg-slate-50 rounded flex justify-between">
                  <span>Guillotine Cutting</span>
                  <span className="font-mono text-emerald-600 font-bold">Active</span>
                </div>
                <div className="px-2 py-1 text-slate-600 hover:bg-slate-50 rounded flex justify-between">
                  <span>Folding & Creasing</span>
                  <span className="font-mono text-emerald-600 font-bold">Active</span>
                </div>
                <div className="px-2 py-1 text-slate-600 hover:bg-slate-50 rounded flex justify-between">
                  <span>Saddle Stitching</span>
                  <span className="font-mono text-slate-400">Idle</span>
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-emerald-50 rounded-lg text-emerald-900">
              <div className="text-[10px] font-bold uppercase font-mono text-emerald-800">Quality Checklist</div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>• Zero color shift tolerance</div>
                <div>• Registration & trim alignment</div>
                <div>• Moisture-proof shrink wrap</div>
              </div>
            </div>
          </div>
        );
      }

      case 'inventory': {
        const sub = activeSubTab || 'raw_stock';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Inventory & Stores
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  06
                </span>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Sub-Tabs</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('inventory', 'raw_stock')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'raw_stock' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Boxes size={13} /> Raw Stock Levels</span>
                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-mono text-[10px]">{inventory.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('inventory', 'offcuts')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'offcuts' ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Layers size={13} /> Offcuts & Excess</span>
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full font-mono text-[10px]">{excessStock?.length || 2}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('inventory', 'purchase_orders')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'purchase_orders' ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><CheckSquare size={13} /> Supplier POs</span>
                  {lowStockCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full font-mono text-[10px]">{lowStockCount} Low</span>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Substrates & Inks</div>
                {['Paper', 'Plate', 'Ink', 'Chemical'].map(cat => (
                  <div key={cat} className="flex items-center justify-between px-2 py-1 text-slate-600 hover:bg-slate-50 rounded cursor-pointer">
                    <span>{cat} Stock</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {inventory.filter(i => i.category === cat).length} SKUs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {lowStockCount > 0 ? (
              <div className="p-2 border-t border-slate-100 bg-rose-50 rounded-lg text-rose-900">
                <div className="text-[10px] font-bold uppercase font-mono text-rose-800 flex items-center gap-1">
                  <AlertTriangle size={12} /> Low Stock Alert
                </div>
                <div className="text-[11px] mt-1">
                  {lowStockCount} items below safety reorder threshold. PO auto-generation ready.
                </div>
              </div>
            ) : (
              <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-lg text-slate-600 text-[11px]">
                Stock levels balanced. Zero press-stop stockouts reported.
              </div>
            )}
          </div>
        );
      }

      case 'dispatch': {
        const sub = activeSubTab || 'route_tracking';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Dispatch & Logistics
                </span>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  07
                </span>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Sub-Tabs</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('dispatch', 'route_tracking')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'route_tracking' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Truck size={13} /> Route Tracking</span>
                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-mono text-[10px]">5 Routes</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('dispatch', 'gate_pass')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'gate_pass' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Gate Pass Clearance</span>
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-mono text-[10px]">Gate #1</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('dispatch', 'returns')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'returns' ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><RotateCcw size={13} /> Returns & Rework</span>
                  {activeRejectionsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full font-mono text-[10px]">{activeRejectionsCount}</span>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Active Routes</div>
                {dispatchRoutes.slice(0, 3).map(route => (
                  <div
                    key={route.id}
                    className="p-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition"
                  >
                    <div className="font-semibold text-slate-800 text-[11px] truncate">{route.name}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{route.jobs_count} Jobs</span>
                      <span className="font-bold text-slate-700">₹{route.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-lg text-[11px] text-slate-600">
              <div className="font-bold font-mono text-[10px] uppercase text-slate-500">Fleet Ready</div>
              <div>• KA 03 AB 1234 (Ramesh)</div>
              <div>• KA 53 M 9081 (Suresh)</div>
              <div>• KA 04 D 5567 (Anand)</div>
            </div>
          </div>
        );
      }

      case 'billing': {
        const sub = activeSubTab || 'invoices';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Finance & Billing
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                  08
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Accounts Views</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('billing', 'invoices')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'invoices'
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tax Invoices (HSN 4911)</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    sub === 'invoices' ? 'bg-blue-600 text-white' : 'text-slate-500'
                  }`}>
                    {invoices.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('billing', 'receipts')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'receipts'
                      ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Pending Receipts</span>
                  <span className="font-mono text-amber-600 font-bold px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100">
                    {pendingInvoicesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('billing', 'ar_aging')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition text-left cursor-pointer ${
                    sub === 'ar_aging'
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>AR Aging Analysis</span>
                  <span className="font-mono text-purple-700 font-bold text-[10px]">Live</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">GST Compliance</div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                  <div className="font-mono font-bold text-slate-700">HSN: 49111010</div>
                  <div>Commercial Printed Items</div>
                  <div className="text-emerald-700 font-semibold">12% GST Auto-Calculated</div>
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-emerald-50 rounded-lg text-emerald-900">
              <div className="text-[10px] font-bold uppercase font-mono text-emerald-800">Payment Reconciliation</div>
              <div className="text-[11px] mt-1 space-y-0.5">
                <div>• Instant UPI QR reconciliation</div>
                <div>• Automated receipt generation</div>
                <div>• Customer ledger export</div>
              </div>
            </div>
          </div>
        );
      }

      case 'admin_analytics': {
        const sub = activeSubTab || 'executive_oee';
        return (
          <div className="flex-1 flex flex-col justify-between p-2 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="font-bold text-slate-800 tracking-tight text-[11px] uppercase">
                  Admin & Analytics
                </span>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                  09
                </span>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Sub-Tabs</div>
                <button
                  type="button"
                  onClick={() => navigateToTab('admin_analytics', 'executive_oee')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'executive_oee' ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><BarChart3 size={13} /> Executive OEE</span>
                  <span className="px-1.5 py-0.2 bg-purple-600 text-white rounded-full font-mono text-[10px]">Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('admin_analytics', 'notifications')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'notifications' ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Send size={13} /> Notification Hub</span>
                  <span className="px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-mono text-[10px]">{notificationsLog.length}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToTab('admin_analytics', 'config')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    sub === 'config' ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Sliders size={13} /> Master Data Config</span>
                  <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full font-mono text-[10px]">Live</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase px-2">Owner Review</div>
                <div className="p-2 rounded bg-blue-50 border border-blue-200 text-blue-900 cursor-pointer">
                  <div className="font-bold text-xs">Daily Scan (10-15m)</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Focus on Red exceptions & WIP delays</div>
                </div>
              </div>
            </div>

            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px] font-mono text-slate-500">
              <div>On Track: 27 Metrics</div>
              <div>Attention: 11 Metrics</div>
              <div>Action Needed: 8 Metrics</div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="flex shrink-0 z-30 select-none">
      {/* Primary Rail: Deep Navy (#001523) with 10 Master Workflow Modules */}
      <aside className="w-60 bg-[#001523] text-slate-300 flex flex-col border-r border-slate-800 h-[calc(100vh-3.5rem)] sticky top-14 shrink-0">
        {/* Rail Header */}
        <div className="p-3 border-b border-slate-800/80 bg-[#00101b]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              Workflow Pipeline
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[9px] border border-blue-700/50">
              10 Modules
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Josco Production Rail</div>
        </div>

        {/* Scrollable Stage Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 text-xs font-medium custom-scrollbar">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = isTabActive(m.id);

            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition text-left group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate min-w-0">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-slate-800 group-hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {m.num}
                  </span>
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate text-xs">{m.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active Module"></span>
                  )}
                  {m.highlight && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Rush order inside"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Plant Indicator */}
        <div className="p-3 border-t border-slate-800 bg-[#00101b] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="truncate font-mono">{activeBranch}</span>
          </div>
          <button
            onClick={() => setActiveBranch(prev => prev.includes('Kalkere') ? 'Plant #02 • Byrathi' : 'Plant #01 • Kalkere')}
            className="text-[10px] font-mono text-blue-400 hover:underline shrink-0 cursor-pointer"
            title="Switch plant terminal"
          >
            Switch
          </button>
        </div>
      </aside>

      {/* Contextual Secondary Sub-Navigation Rail (White #ffffff) */}
      {!isSubNavCollapsed && (
        <aside className="w-52 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 shrink-0 text-xs shadow-xs animate-in slide-in-from-left-2 duration-100">
          <div className="flex-1 flex flex-col overflow-y-auto">
            {renderSubNavContent()}
          </div>
          {/* Collapse rail button */}
          <div className="p-2 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setIsSubNavCollapsed(true)}
              className="px-2 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-700 flex items-center gap-1 rounded hover:bg-slate-50 transition cursor-pointer"
              title="Collapse Sub-Rail"
            >
              <ChevronLeft size={13} />
              <span>Hide</span>
            </button>
          </div>
        </aside>
      )}

      {/* Collapsed rail restore trigger */}
      {isSubNavCollapsed && (
        <button
          onClick={() => setIsSubNavCollapsed(false)}
          className="w-4 bg-slate-100 hover:bg-slate-200 border-r border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 h-[calc(100vh-3.5rem)] sticky top-14 cursor-pointer transition"
          title="Expand Sub-Rail"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
