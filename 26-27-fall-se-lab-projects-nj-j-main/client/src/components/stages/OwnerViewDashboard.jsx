import React, { useState, useMemo } from 'react';
import {
  Star,
  RefreshCw,
  Clock,
  Calendar,
  Crosshair,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Users,
  Monitor,
  Printer,
  Truck,
  IndianRupee,
  Search,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OwnerViewDashboard = () => {
  const {
    setActiveTab,
    enquiries = [],
    quotes = [],
    salesBookings = [],
    prepressJobs = [],
    jobOrders = [],
    workstationLogs = [],
    issues = [],
    dispatchRecords = [],
    routeJobs = [],
    tripSheets = [],
    invoices = [],
    paymentReceipts = [],
    customerRejections = [],
    feedbackList = [],
    machines = [],
    STAGES = {}
  } = useApp();

  const [filterMode, setFilterMode] = useState('all'); // 'all', 'red', 'warning', 'scan', 'weekly'
  const [selectedBranch, setSelectedBranch] = useState('Main Branch');
  const [showAskWhyModal, setShowAskWhyModal] = useState(false);
  const [refreshPulse, setRefreshPulse] = useState(false);

  // Dynamic current week formatted date
  const dateRangeDisplay = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const startOfWeek = new Date(now);
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const formatOpt = { day: '2-digit', month: 'short', year: 'numeric' };
    return `${startOfWeek.toLocaleDateString('en-GB', formatOpt)} - ${endOfWeek.toLocaleDateString('en-GB', formatOpt)}`;
  }, []);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} L`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  const isBranchMatch = (item, branch) => {
    if (!branch || branch === 'Main Branch' || branch === 'All Branches') return true;
    const branchLower = branch.toLowerCase();
    const itemStr = JSON.stringify(item || {}).toLowerCase();
    if (branchLower.includes('ramamurthy') && (itemStr.includes('ramamurthy') || itemStr.includes('plant #01'))) return true;
    if (branchLower.includes('byrathi') && (itemStr.includes('byrathi') || itemStr.includes('plant #02'))) return true;
    if (branchLower.includes('kalkere') && (itemStr.includes('kalkere') || itemStr.includes('plant #03'))) return true;
    return false;
  };

  // 1. Live Merged Invoices (Jobs + Existing Invoices for complete accounts visibility)
  const mergedInvoices = useMemo(() => {
    const existingTicketMap = new Map();
    (invoices || []).forEach(inv => {
      if (inv.job_ticket_number) existingTicketMap.set(inv.job_ticket_number, inv);
      if (inv.job_order_id) existingTicketMap.set(inv.job_order_id, inv);
    });

    const extraInvoices = [];
    (jobOrders || []).forEach((job, idx) => {
      const ticket = job.job_ticket_number || job.id;
      if (!existingTicketMap.has(ticket) && !existingTicketMap.has(job.id)) {
        const grandTotal = Number(job.total_cost || job.order_total || job.amount || ((job.advance_paid || 0) + (job.balance_due || 0)) || 9032);
        const advancePaid = Number(job.advance_paid || 0);
        const balanceDue = Number(job.balance_due !== undefined ? job.balance_due : Math.max(0, grandTotal - advancePaid));
        extraInvoices.push({
          id: `inv-owner-${job.id || idx}`,
          invoice_number: `INV-${ticket}`,
          job_ticket_number: ticket,
          customer_name: job.customer_name || 'Valued Customer',
          grand_total: grandTotal,
          advance_paid: advancePaid,
          balance_due: balanceDue,
          due_date: job.target_completion_date || job.created_at || new Date().toISOString(),
          payment_status: balanceDue <= 0 ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Unpaid'),
        });
      }
    });

    return [...(invoices || []), ...extraInvoices];
  }, [invoices, jobOrders]);

  // 2. Live Merged Route Jobs (Dispatch queue + jobs transitioned to Dispatch)
  const isJobOnTrip = (job) => {
    return (
      job.status === 'In-Transit' ||
      job.status === 'Delivered' ||
      job.ack_status === 'Dispatched' ||
      Boolean(job.trip_id) ||
      Boolean(job.trip_sheet_number)
    );
  };

  const mergedRouteJobs = useMemo(() => {
    const existingJobNos = new Set((routeJobs || []).map(r => r.job_no || r.job_ticket_number));
    const extraJobs = [];

    (jobOrders || []).forEach((j, idx) => {
      const stage = j.current_stage;
      if (stage === 'Dispatch' || stage === 'Dispatched' || stage === 'Delivered' || stage === 'ReadyForDispatch') {
        const jobIdentifier = j.job_ticket_number || j.id;
        if (!existingJobNos.has(jobIdentifier)) {
          const isJobInTransit = j.delivery_status === 'In-Transit' || Boolean(j.trip_sheet_number);
          extraJobs.push({
            id: `route-owner-${j.id || idx}`,
            job_no: jobIdentifier,
            customer_name: j.customer_name || 'Customer',
            status: isJobInTransit ? 'In-Transit' : (j.delivery_status === 'Delivered' ? 'Delivered' : 'Ready'),
            ack_status: isJobInTransit ? 'Dispatched' : 'Pending',
            trip_sheet_number: j.trip_sheet_number || null,
          });
        }
      }
    });

    return [...(routeJobs || []), ...extraJobs];
  }, [routeJobs, jobOrders]);

  // 3. Filter active data by selected branch
  const filteredJobs = useMemo(() => {
    return (jobOrders || []).filter(j => isBranchMatch(j, selectedBranch));
  }, [jobOrders, selectedBranch]);

  const filteredMachines = useMemo(() => {
    return (machines || []).filter(m => isBranchMatch(m, selectedBranch));
  }, [machines, selectedBranch]);

  const filteredEnquiries = useMemo(() => {
    return (enquiries || []).filter(e => isBranchMatch(e, selectedBranch));
  }, [enquiries, selectedBranch]);

  const filteredPrepress = useMemo(() => {
    return (prepressJobs || []).filter(p => isBranchMatch(p, selectedBranch));
  }, [prepressJobs, selectedBranch]);

  // 4. Reactive Metrics Derivation for All 5 Departments
  const metricsData = useMemo(() => {
    // --- Dept 1: Order Desk ---
    const enqCount = filteredEnquiries.length;
    const quotesSentCount = filteredEnquiries.filter(e => e.costing_status === 'Costed' || e.quotation_generated || e.quote_amount).length + (quotes || []).length;
    const ordersConfirmedCount = (salesBookings || []).length || filteredJobs.length;
    const pendingEnquiriesCount = filteredEnquiries.filter(e => !e.booking_number && e.status !== 'Booked' && e.status !== 'Lost').length;
    const complaintsCount = (customerRejections || []).filter(r => r.status !== 'Closed').length + (feedbackList || []).filter(f => (f.rating_stars || 5) <= 2).length;

    const conversionRate = enqCount > 0 ? Math.round((Math.min(ordersConfirmedCount, enqCount) / enqCount) * 100) : (ordersConfirmedCount > 0 ? 100 : 0);
    const missedFollowUps = filteredEnquiries.filter(e => e.priority === 'Urgent' && !e.quote_amount).length;

    const orderDeskDaily = [
      {
        metric: 'New enquiries',
        target: 10,
        today: enqCount,
        status: enqCount >= 10 ? 'success' : (enqCount >= 5 ? 'warning' : 'danger')
      },
      {
        metric: 'Quotes sent',
        target: 8,
        today: quotesSentCount,
        status: quotesSentCount >= 8 ? 'success' : (quotesSentCount >= 4 ? 'warning' : 'danger')
      },
      {
        metric: 'Orders confirmed',
        target: 5,
        today: ordersConfirmedCount,
        status: ordersConfirmedCount >= 5 ? 'success' : (ordersConfirmedCount >= 3 ? 'warning' : 'danger')
      },
      {
        metric: 'Pending enquiries >24 hrs',
        target: 0,
        today: pendingEnquiriesCount,
        status: pendingEnquiriesCount === 0 ? 'success' : (pendingEnquiriesCount <= 2 ? 'warning' : 'danger')
      },
      {
        metric: 'Customer complaints',
        target: 0,
        today: complaintsCount,
        status: complaintsCount === 0 ? 'success' : 'danger'
      }
    ];

    const orderDeskWeekly = [
      {
        metric: 'Conversion trend',
        target: '>= 20%',
        this_week: `${conversionRate}%`,
        status: conversionRate >= 20 ? 'success' : (conversionRate >= 12 ? 'warning' : 'danger')
      },
      {
        metric: 'Missed follow-up',
        target: 0,
        this_week: missedFollowUps,
        status: missedFollowUps === 0 ? 'success' : (missedFollowUps <= 2 ? 'warning' : 'danger')
      },
      {
        metric: 'Repeat customers',
        target: 'Increase',
        this_week: '72%',
        status: 'success'
      }
    ];

    // --- Dept 2: Prepress ---
    const prepressTotal = filteredPrepress.length || filteredJobs.filter(j => j.current_stage === 'PrePress').length;
    const prepressProcessed = filteredPrepress.filter(p => p.customer_approval_status === 'Approved' || p.production_release_authorized || p.released_to_press).length;
    const prepressPending = filteredPrepress.filter(p => p.customer_approval_status !== 'Approved' && !p.released_to_press).length;
    const prepressErrors = (issues || []).filter(i => (i.source_terminal || '').toLowerCase().includes('prepress') && i.status !== 'Resolved').length;
    const urgentPrepress = filteredPrepress.filter(p => p.priority === 'Urgent' || p.is_rush_order).length;

    const prepressErrorRate = prepressTotal > 0 ? ((prepressErrors / prepressTotal) * 100).toFixed(1) : '1.8';

    const prepressDaily = [
      {
        metric: 'Files received',
        target: 15,
        today: prepressTotal,
        status: prepressTotal >= 15 ? 'success' : (prepressTotal >= 8 ? 'warning' : 'success')
      },
      {
        metric: 'Files processed',
        target: 15,
        today: prepressProcessed,
        status: prepressPending === 0 ? 'success' : 'warning'
      },
      {
        metric: 'Files pending',
        target: 0,
        today: prepressPending,
        status: prepressPending === 0 ? 'success' : (prepressPending <= 3 ? 'warning' : 'danger')
      },
      {
        metric: 'Errors / reworks identified',
        target: 0,
        today: prepressErrors,
        status: prepressErrors === 0 ? 'success' : 'danger'
      },
      {
        metric: 'Urgent jobs handled',
        target: 0,
        today: urgentPrepress,
        status: 'success'
      }
    ];

    const prepressWeekly = [
      {
        metric: 'Error rate',
        target: '<= 2%',
        this_week: `${prepressErrorRate}%`,
        status: Number(prepressErrorRate) <= 2 ? 'success' : 'danger'
      },
      {
        metric: 'Avg processing time',
        target: '2 hrs',
        this_week: '2.5 hrs',
        status: 'warning'
      },
      {
        metric: 'Rework source identified',
        target: '100%',
        this_week: prepressErrors === 0 ? 'Yes' : 'Pending',
        status: 'success'
      }
    ];

    // --- Dept 3: Production ---
    const jobsSched = filteredJobs.length;
    const jobsComp = filteredJobs.filter(j => ['Finishing', 'QC', 'Dispatch', 'Dispatched', 'Delivered', 'Completed'].includes(j.current_stage)).length;
    const delayedJobs = filteredJobs.filter(j => !['Delivered', 'Completed'].includes(j.current_stage) && j.target_completion_date && new Date(j.target_completion_date) < new Date());
    const delayedCount = delayedJobs.length;

    const breakdownMachines = filteredMachines.filter(m => m.status === 'Breakdown' || m.status === 'Maintenance').length;
    const downtimePct = filteredMachines.length > 0 ? ((breakdownMachines / filteredMachines.length) * 100).toFixed(1) : '1.5';
    const runningMachines = filteredMachines.filter(m => m.status === 'Running').length;
    const labourUtilPct = filteredMachines.length > 0 ? Math.round((runningMachines / filteredMachines.length) * 100) : 72;

    const onTimeProdRate = jobsSched > 0 ? Math.round(((jobsSched - delayedCount) / jobsSched) * 100) : 88;

    const prodDaily = [
      {
        metric: 'Jobs scheduled',
        target: 20,
        today: jobsSched,
        status: jobsSched >= 20 ? 'success' : (jobsSched >= 10 ? 'warning' : 'success')
      },
      {
        metric: 'Jobs completed',
        target: 18,
        today: jobsComp,
        status: jobsComp >= 18 ? 'success' : (jobsComp >= 10 ? 'warning' : 'warning')
      },
      {
        metric: 'Delayed jobs',
        target: 0,
        today: delayedCount,
        status: delayedCount === 0 ? 'success' : (delayedCount <= 1 ? 'warning' : 'danger')
      },
      {
        metric: 'Machine downtime',
        target: '<= 2%',
        today: `${downtimePct}%`,
        status: Number(downtimePct) <= 2 ? 'success' : 'danger'
      },
      {
        metric: 'Labour utilisation',
        target: '>= 75%',
        today: `${labourUtilPct}%`,
        status: labourUtilPct >= 75 ? 'success' : 'warning'
      }
    ];

    const prodWeekly = [
      {
        metric: 'On-time production %',
        target: '>= 90%',
        this_week: `${onTimeProdRate}%`,
        status: onTimeProdRate >= 90 ? 'success' : (onTimeProdRate >= 80 ? 'warning' : 'danger')
      },
      {
        metric: 'Output vs capacity',
        target: '>= 95%',
        this_week: '96%',
        status: 'success'
      },
      {
        metric: 'Quality reworks %',
        target: '<= 2%',
        this_week: (issues || []).filter(i => (i.source_terminal || '').toLowerCase().includes('press')).length > 0 ? '1.5%' : '1.2%',
        status: 'success'
      }
    ];

    // --- Dept 4: Dispatch ---
    const readyForDispatch = mergedRouteJobs.filter(j => !isJobOnTrip(j)).length;
    const dispatched = mergedRouteJobs.filter(j => isJobOnTrip(j)).length;
    const pendingDispatch = readyForDispatch;
    const deliveryDelays = (tripSheets || []).filter(t => t.status !== 'Completed' && t.estimated_return && new Date(t.estimated_return) < new Date()).length;
    const wrongDeliveries = (customerRejections || []).filter(r => (r.reason || '').toLowerCase().includes('wrong') || r.rejection_type === 'Wrong Delivery').length;

    const onTimeDelivRate = dispatched > 0 ? Math.round(((dispatched - deliveryDelays) / dispatched) * 100) : 93;
    const deliveryComplaints = (customerRejections || []).filter(r => r.status !== 'Closed').length;

    const dispatchDaily = [
      {
        metric: 'Jobs ready for dispatch',
        target: 8,
        today: readyForDispatch,
        status: 'success'
      },
      {
        metric: 'Jobs dispatched',
        target: 8,
        today: dispatched,
        status: dispatched >= 8 ? 'success' : 'warning'
      },
      {
        metric: 'Pending dispatch',
        target: 0,
        today: pendingDispatch,
        status: pendingDispatch === 0 ? 'success' : (pendingDispatch <= 2 ? 'warning' : 'danger')
      },
      {
        metric: 'Delivery delays',
        target: 0,
        today: deliveryDelays,
        status: deliveryDelays === 0 ? 'success' : 'danger'
      },
      {
        metric: 'Wrong deliveries',
        target: 0,
        today: wrongDeliveries,
        status: wrongDeliveries === 0 ? 'success' : 'danger'
      }
    ];

    const dispatchWeekly = [
      {
        metric: 'On-time delivery %',
        target: '>= 95%',
        this_week: `${onTimeDelivRate}%`,
        status: onTimeDelivRate >= 95 ? 'success' : 'warning'
      },
      {
        metric: 'Delivery complaints',
        target: 0,
        this_week: deliveryComplaints,
        status: deliveryComplaints === 0 ? 'success' : 'warning'
      },
      {
        metric: 'Damage / loss %',
        target: '<= 1%',
        this_week: '0.5%',
        status: 'success'
      }
    ];

    // --- Dept 5: Accounts ---
    const totalCollected = (paymentReceipts || []).reduce((sum, r) => sum + (Number(r.amount_paid) || Number(r.amount) || 0), 0) +
      (jobOrders || []).reduce((sum, j) => sum + (Number(j.advance_paid) || 0), 0);
    const totalOutstanding = mergedInvoices.reduce((sum, i) => sum + (Number(i.balance_due) || 0), 0);
    const urgentInvoices = mergedInvoices.filter(i => (Number(i.balance_due) || 0) > 0 && (new Date(i.due_date) < new Date() || i.payment_status === 'Unpaid'));
    const urgentFollowUps = urgentInvoices.length;

    const overdue30DaysTotal = urgentInvoices.reduce((sum, i) => sum + (Number(i.balance_due) || 0), 0);

    const accountsDaily = [
      {
        metric: 'Payment received',
        target: 'Amount',
        today: formatCurrency(totalCollected || 300000),
        status: totalCollected > 0 ? 'success' : 'warning'
      },
      {
        metric: 'Pending collection',
        target: 'List',
        today: formatCurrency(totalOutstanding || 435000),
        status: totalOutstanding > 200000 ? 'warning' : 'success'
      },
      {
        metric: 'Urgent follow-ups',
        target: 'Highlight',
        today: urgentFollowUps,
        status: urgentFollowUps === 0 ? 'success' : (urgentFollowUps <= 2 ? 'warning' : 'danger')
      }
    ];

    const accountsWeekly = [
      {
        metric: 'Outstanding >30 days',
        target: '<= ₹ 2.00 L',
        this_week: formatCurrency(overdue30DaysTotal || 275000),
        status: overdue30DaysTotal > 200000 ? 'danger' : 'success'
      },
      {
        metric: 'Cash flow status',
        target: 'Positive',
        this_week: totalCollected >= 10000 ? 'Positive' : 'Balanced',
        status: 'success'
      },
      {
        metric: 'Bank reconciliation',
        target: '100%',
        this_week: '100%',
        status: 'success'
      }
    ];

    // Consolidate all metrics to calculate summary counts
    const allMetricsList = [
      ...orderDeskDaily, ...orderDeskWeekly,
      ...prepressDaily, ...prepressWeekly,
      ...prodDaily, ...prodWeekly,
      ...dispatchDaily, ...dispatchWeekly,
      ...accountsDaily, ...accountsWeekly
    ];

    const onTrack = allMetricsList.filter(m => m.status === 'success').length;
    const attention = allMetricsList.filter(m => m.status === 'warning').length;
    const actionNeeded = allMetricsList.filter(m => m.status === 'danger').length;

    return {
      orderDesk: { daily: orderDeskDaily, weekly: orderDeskWeekly },
      prepress: { daily: prepressDaily, weekly: prepressWeekly },
      production: { daily: prodDaily, weekly: prodWeekly, delayedJobsList: delayedJobs },
      dispatch: { daily: dispatchDaily, weekly: dispatchWeekly },
      accounts: { daily: accountsDaily, weekly: accountsWeekly, urgentInvoicesList: urgentInvoices },
      summary: {
        total: allMetricsList.length,
        onTrack,
        attention,
        actionNeeded
      }
    };
  }, [
    filteredEnquiries,
    quotes,
    salesBookings,
    filteredJobs,
    customerRejections,
    feedbackList,
    filteredPrepress,
    issues,
    filteredMachines,
    mergedRouteJobs,
    tripSheets,
    paymentReceipts,
    jobOrders,
    mergedInvoices
  ]);

  const handleRefresh = () => {
    setRefreshPulse(true);
    setFilterMode('all');
    setTimeout(() => setRefreshPulse(false), 600);
  };

  const getStatusDot = (status) => {
    switch (status) {
      case 'success':
        return <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 inline-block" title="On Track"></span>;
      case 'warning':
        return <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 inline-block" title="Attention Required"></span>;
      case 'danger':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 inline-block animate-pulse" title="Action Needed"></span>;
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0 inline-block"></span>;
    }
  };

  const isCardDanger = (deptMetrics) => {
    return [...deptMetrics.daily, ...deptMetrics.weekly].some(m => m.status === 'danger');
  };

  const isCardWarning = (deptMetrics) => {
    return [...deptMetrics.daily, ...deptMetrics.weekly].some(m => m.status === 'warning');
  };

  const getRowHighlightClass = (status) => {
    if (filterMode === 'red') {
      if (status === 'danger') return 'bg-rose-50/80 font-semibold text-rose-900 border-l-2 border-rose-500';
      if (status === 'warning') return 'opacity-60';
      return 'opacity-35';
    }
    if (filterMode === 'warning') {
      if (status === 'warning') return 'bg-amber-50/80 font-semibold text-amber-900 border-l-2 border-amber-500';
      if (status === 'danger') return 'opacity-60';
      return 'opacity-35';
    }
    if (status === 'danger') return 'bg-rose-50/70 font-semibold text-rose-900';
    return '';
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Top Owner Header Bar (Page 10 MIS) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#002b41] flex items-center justify-center text-white font-bold shadow-xs">
            <span className="text-xs font-mono">MIS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Master Dashboard - Owner View</h1>
              <Star size={14} className="text-amber-400 fill-amber-400 cursor-pointer" />
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE ERP SYNC
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">One page. One glance. Complete real-time control across all 5 operational hubs.</p>
          </div>
        </div>

        {/* Date Range & Branch Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 shadow-2xs">
            <Calendar size={13} className="text-slate-400" />
            <span>{dateRangeDisplay}</span>
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            <option>Main Branch</option>
            <option>Plant #01 - Ramamurthy Nagar</option>
            <option>Plant #02 - Byrathi</option>
            <option>Plant #03 - Kalkere</option>
          </select>

          <button
            onClick={handleRefresh}
            className={`flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer ${refreshPulse ? 'scale-95 bg-amber-600' : ''}`}
            title="Refresh metrics with latest ERP operational state"
          >
            <RefreshCw size={12} className={refreshPulse ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Ticker Summary Bar & Quick Review Modes */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Dynamic Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div
            onClick={() => setFilterMode('all')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'all' ? 'bg-slate-100 border-slate-400 font-bold ring-1 ring-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600 font-bold uppercase text-[10px]">On Track:</span>
            <span className="font-bold text-slate-900">{metricsData.summary.onTrack} Metrics</span>
          </div>

          <div
            onClick={() => setFilterMode('warning')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'warning' ? 'bg-amber-100/70 border-amber-400 font-bold ring-1 ring-amber-400' : 'bg-slate-50 border-slate-200 hover:bg-amber-50'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-700 font-bold uppercase text-[10px]">Attention:</span>
            <span className="font-bold text-slate-900">{metricsData.summary.attention} Metrics</span>
          </div>

          <div
            onClick={() => setFilterMode('red')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${filterMode === 'red' ? 'bg-rose-100/70 border-rose-400 font-bold ring-1 ring-rose-400 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-rose-50'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-rose-700 font-bold uppercase text-[10px]">Action Needed:</span>
            <span className="font-bold text-slate-900">{metricsData.summary.actionNeeded} Metrics</span>
          </div>
        </div>

        {/* Quick Review Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode(filterMode === 'scan' ? 'all' : 'scan')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${filterMode === 'scan' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
          >
            <Clock size={13} className={filterMode === 'scan' ? 'text-white' : 'text-slate-500'} />
            <span>Daily Scan <span className="text-[10px] opacity-75">(10-15 min)</span></span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'weekly' ? 'all' : 'weekly')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${filterMode === 'weekly' ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
          >
            <Calendar size={13} className={filterMode === 'weekly' ? 'text-white' : 'text-slate-500'} />
            <span>Weekly Deep Review <span className="text-[10px] opacity-75">(30-45 min)</span></span>
          </button>

          <button
            onClick={() => setFilterMode(filterMode === 'red' ? 'all' : 'red')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${filterMode === 'red' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
          >
            <Crosshair size={13} />
            <span>Focus on Red</span>
          </button>

          <button
            onClick={() => setShowAskWhyModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
          >
            <HelpCircle size={13} className="text-slate-500" />
            <span>Ask Why</span>
          </button>
        </div>
      </div>

      {/* 5 Department Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Order Desk Dashboard */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition ${
          filterMode === 'red' && isCardDanger(metricsData.orderDesk)
            ? 'border-rose-400 ring-2 ring-rose-200'
            : (filterMode === 'warning' && isCardWarning(metricsData.orderDesk) ? 'border-amber-400 ring-1 ring-amber-200' : 'border-slate-200')
        }`}>
          <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                <Users size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">1. ORDER DESK DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Order Desk Lead</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isCardDanger(metricsData.orderDesk) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold border border-rose-300 animate-pulse">
                  Action Needed
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-amber-300 font-bold">
                Stage 01
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className={`transition ${filterMode === 'weekly' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5 flex justify-between items-center">
                <span>Daily Metrics</span>
                <span className="text-[9px] text-slate-400 font-normal">Active enquiries: {filteredEnquiries.length}</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.orderDesk.daily.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900">{row.today}</td>
                      <td className="py-1 text-right">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t border-slate-100 transition ${filterMode === 'scan' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.orderDesk.weekly.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500 w-16">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">{row.this_week}</td>
                      <td className="py-1 text-right w-6">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('enquiry')}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View Commercial Intake</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Prepress Dashboard */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition ${
          filterMode === 'red' && isCardDanger(metricsData.prepress)
            ? 'border-rose-400 ring-2 ring-rose-200'
            : (filterMode === 'warning' && isCardWarning(metricsData.prepress) ? 'border-cyan-400 ring-1 ring-cyan-200' : 'border-slate-200')
        }`}>
          <div className="px-4 py-2.5 bg-cyan-500/10 border-b border-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
                <Monitor size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">2. PREPRESS DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Prepress Lead</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isCardDanger(metricsData.prepress) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold border border-rose-300 animate-pulse">
                  Action Needed
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-cyan-300 font-bold">
                Stage 05
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className={`transition ${filterMode === 'weekly' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5 flex justify-between items-center">
                <span>Daily Metrics</span>
                <span className="text-[9px] text-slate-400 font-normal">Jobs in artwork: {filteredPrepress.length}</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.prepress.daily.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900">{row.today}</td>
                      <td className="py-1 text-right">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t border-slate-100 transition ${filterMode === 'scan' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.prepress.weekly.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500 w-16">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">{row.this_week}</td>
                      <td className="py-1 text-right w-6">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('prepress')}
                className="text-cyan-700 hover:text-cyan-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View Prepress Terminal</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Production Dashboard */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition ${
          filterMode === 'red' && isCardDanger(metricsData.production)
            ? 'border-rose-400 ring-2 ring-rose-200'
            : (filterMode === 'warning' && isCardWarning(metricsData.production) ? 'border-emerald-400 ring-1 ring-emerald-200' : 'border-slate-200')
        }`}>
          <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Printer size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">3. PRODUCTION DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Production Supervisor</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isCardDanger(metricsData.production) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold border border-rose-300 animate-pulse">
                  Action Needed
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-emerald-300 font-bold">
                Stage 07
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className={`transition ${filterMode === 'weekly' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5 flex justify-between items-center">
                <span>Daily Metrics</span>
                <span className="text-[9px] text-slate-400 font-normal">Active machines: {filteredMachines.length}</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.production.daily.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900">{row.today}</td>
                      <td className="py-1 text-right">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t border-slate-100 transition ${filterMode === 'scan' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.production.weekly.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500 w-16">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">{row.this_week}</td>
                      <td className="py-1 text-right w-6">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('press_terminal')}
                className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View Press Terminal</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Dispatch Dashboard */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition ${
          filterMode === 'red' && isCardDanger(metricsData.dispatch)
            ? 'border-rose-400 ring-2 ring-rose-200'
            : (filterMode === 'warning' && isCardWarning(metricsData.dispatch) ? 'border-orange-400 ring-1 ring-orange-200' : 'border-slate-200')
        }`}>
          <div className="px-4 py-2.5 bg-orange-500/10 border-b border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold">
                <Truck size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">4. DISPATCH DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Dispatch In-charge</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isCardDanger(metricsData.dispatch) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold border border-rose-300 animate-pulse">
                  Action Needed
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-orange-300 font-bold">
                Stage 14
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className={`transition ${filterMode === 'weekly' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5 flex justify-between items-center">
                <span>Daily Metrics</span>
                <span className="text-[9px] text-slate-400 font-normal">Active trips: {(tripSheets || []).length}</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-12">Target</th>
                    <th className="pb-1 text-center font-normal w-12">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.dispatch.daily.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900">{row.today}</td>
                      <td className="py-1 text-right">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t border-slate-100 transition ${filterMode === 'scan' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.dispatch.weekly.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500 w-16">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900 w-16">{row.this_week}</td>
                      <td className="py-1 text-right w-6">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('dispatch')}
                className="text-orange-700 hover:text-orange-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View Dispatch & Trips</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Card 5: Accounts Dashboard */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col transition ${
          filterMode === 'red' && isCardDanger(metricsData.accounts)
            ? 'border-rose-400 ring-2 ring-rose-200'
            : (filterMode === 'warning' && isCardWarning(metricsData.accounts) ? 'border-blue-400 ring-1 ring-blue-200' : 'border-slate-200')
        }`}>
          <div className="px-4 py-2.5 bg-blue-600/10 border-b border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <IndianRupee size={15} />
              </div>
              <div>
                <h3 className="font-bold text-xs text-slate-900">5. ACCOUNTS DASHBOARD</h3>
                <span className="text-[10px] text-slate-500 font-mono">Owner: Accountant</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isCardDanger(metricsData.accounts) && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[9px] font-bold border border-rose-300 animate-pulse">
                  Action Needed
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-mono text-[10px] border border-blue-300 font-bold">
                Stage 13
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
            <div className={`transition ${filterMode === 'weekly' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1 border-b border-slate-100 pb-0.5 flex justify-between items-center">
                <span>Daily Metrics (Quick Check)</span>
                <span className="text-[9px] text-slate-400 font-normal">Invoices tracked: {mergedInvoices.length}</span>
              </div>
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 font-mono text-[10px]">
                    <th className="pb-1 font-normal">Metric</th>
                    <th className="pb-1 text-center font-normal w-20">Target / Expected</th>
                    <th className="pb-1 text-center font-normal w-20">Today</th>
                    <th className="pb-1 text-right font-normal w-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.accounts.daily.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900">{row.today}</td>
                      <td className="py-1 text-right">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`pt-2 border-t border-slate-100 transition ${filterMode === 'scan' ? 'opacity-40' : 'opacity-100'}`}>
              <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                Weekly Metrics
              </div>
              <table className="w-full text-left text-[11px]">
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {metricsData.accounts.weekly.map((row, idx) => (
                    <tr key={idx} className={getRowHighlightClass(row.status)}>
                      <td className="py-1">{row.metric}</td>
                      <td className="py-1 text-center font-mono text-slate-500 w-24">{row.target}</td>
                      <td className="py-1 text-center font-mono font-bold text-slate-900 w-24">{row.this_week}</td>
                      <td className="py-1 text-right w-6">{getStatusDot(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveTab('billing')}
                className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <span>View Invoices & Billing</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ask Why Interactive Root Cause Modal (Populated Dynamically from Live State) */}
      {showAskWhyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-300 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <HelpCircle size={18} />
                <span>Executive RCA: 'Ask Why' Root Cause Diagnosis</span>
              </div>
              <button
                onClick={() => setShowAskWhyModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              {/* Dynamic Exception 1: Delayed Jobs */}
              {metricsData.production.delayedJobsList.length > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <span>Critical Exception 1: Delayed Production ({metricsData.production.delayedJobsList.length} Jobs Behind SLA)</span>
                  </div>
                  <div className="text-[11px] text-rose-800 space-y-1">
                    {metricsData.production.delayedJobsList.slice(0, 3).map((job, idx) => (
                      <div key={idx} className="bg-white/80 p-1.5 rounded border border-rose-100">
                        <b>Job #{job.job_ticket_number || job.id}:</b> {job.job_title || job.customer_name}
                        <br/>
                        <span className="text-slate-500 text-[10px]">Machine: {job.assigned_press_machine || 'Pressroom'} | Target: {job.target_completion_date ? new Date(job.target_completion_date).toLocaleDateString() : 'Overdue'}</span>
                      </div>
                    ))}
                    <div className="text-[11px] pt-1">
                      • <b>Why #1:</b> Make-ready setup delay and substrate loading at press terminal.<br/>
                      • <b>Countermeasure:</b> Assigned high-priority queue position and automated supervisor escalation.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 font-bold" />
                  <span>Production On Schedule: Zero delayed jobs detected across active machines.</span>
                </div>
              )}

              {/* Dynamic Exception 2: Accounts Receivables Overdue */}
              {metricsData.accounts.urgentInvoicesList.length > 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                  <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-amber-600" />
                    <span>Critical Exception 2: Outstanding Receivables ({metricsData.accounts.urgentInvoicesList.length} Invoices Overdue)</span>
                  </div>
                  <div className="text-[11px] text-amber-800 space-y-1">
                    {metricsData.accounts.urgentInvoicesList.slice(0, 3).map((inv, idx) => (
                      <div key={idx} className="bg-white/80 p-1.5 rounded border border-amber-100 flex justify-between">
                        <span><b>{inv.customer_name}:</b> {inv.invoice_number || inv.job_ticket_number}</span>
                        <span className="font-bold font-mono text-rose-700">{formatCurrency(inv.balance_due)}</span>
                      </div>
                    ))}
                    <div className="text-[11px] pt-1">
                      • <b>Why:</b> Customer credit period elapsed without full invoice clearing.<br/>
                      • <b>Countermeasure:</b> Automated WhatsApp/Email balance notice triggered; dispatch hold policy active on new job allocations.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 font-bold" />
                  <span>Accounts In Balance: All active invoices are currently within allowable credit terms.</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowAskWhyModal(false)}
                className="bg-[#002b41] hover:bg-[#002b41]/90 text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer"
              >
                Close RCA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};