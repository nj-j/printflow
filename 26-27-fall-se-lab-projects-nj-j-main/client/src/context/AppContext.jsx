import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_MACHINES,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_QUOTES,
  INITIAL_DESIGN_PROOFS,
  INITIAL_JOB_ORDERS,
  INITIAL_WORKSTATION_LOGS,
  INITIAL_MATERIAL_RESERVATIONS,
  INITIAL_ISSUES,
  INITIAL_DISPATCH,
  INITIAL_INVOICES,
  INITIAL_PAYMENT_RECEIPTS,
  INITIAL_CUSTOMER_FEEDBACK,
  INITIAL_TASKS,
  INITIAL_ALERTS,
  INITIAL_ENQUIRIES,
  INITIAL_DISPATCH_ROUTES,
  INITIAL_ROUTE_JOBS,
  INITIAL_VEHICLES,
  INITIAL_TRIP_SHEETS,
  INITIAL_OWNER_METRICS,
  INITIAL_COSTING_REQUESTS,
  INITIAL_SALES_BOOKINGS,
  INITIAL_PREPRESS_JOBS,
  INITIAL_FINISHING_OPS,
  INITIAL_ASSOCIATES,
  INITIAL_OUTSOURCE_CHALLANS,
  INITIAL_EXCESS_STOCK,
  INITIAL_CUSTOMER_REJECTIONS,
  INITIAL_NOTIFICATIONS_LOG,
  INITIAL_MASTER_DATA,
  WORKFLOW_CONTROL_GATES
} from '../data/initialData';
import { resolveDefaultPressMachine } from '../utils/machineRouting';
import {
  STAGES,
  CANONICAL_STAGES,
  STAGE_CONFIG,
  STAGE_DROPDOWN_OPTIONS,
  normalizeStage,
  getNextStage,
  getPrevStage,
  getStageDisplay
} from '../utils/stageConstants';

const AppContext = createContext(null);

const STORAGE_KEY = 'PRINTFLOW_ERP_STATE_V1';

export const getTodayFormattedDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

export const AppProvider = ({ children }) => {
  // Load state from local storage or defaults
  const [activeUser, setActiveUser] = useState(() => {
    return INITIAL_USERS[0];
  });

  const [activeTab, setActiveTabState] = useState('commercial');
  const [activeSubTab, setActiveSubTab] = useState('intake');

  const getDefaultSubTab = (tabId) => {
    switch (tabId) {
      case 'commercial':
      case 'enquiry':
        return 'intake';
      case 'costing':
        return 'costing';
      case 'estimator':
        return 'quotes';
      case 'booking':
        return 'booking';
      case 'prepress':
        return 'preflight';
      case 'planning':
      case 'production':
        return 'job_tickets';
      case 'press_terminal':
        return 'live_terminal';
      case 'finishing':
      case 'associates':
      case 'finishing_qc':
        return 'bindery';
      case 'qc':
      case 'qc_packing':
      case 'qc_inspection':
        return 'qc_inspection';
      case 'inventory':
        return 'raw_stock';
      case 'procurement':
        return 'purchase_orders';
      case 'dispatch':
        return 'route_tracking';
      case 'rejections':
        return 'returns';
      case 'billing':
        return 'invoices';
      case 'admin_analytics':
      case 'owner_dashboard':
      case 'dashboard':
      case 'config':
        return 'executive_oee';
      case 'notifications':
        return 'notifications';
      default:
        return 'intake';
    }
  };

  const setActiveTab = (tabId) => {
    let targetTab = tabId;
    let targetSubTab = null;

    if (tabId === 'enquiry') { targetTab = 'commercial'; targetSubTab = 'intake'; }
    else if (tabId === 'costing') { targetTab = 'commercial'; targetSubTab = 'costing'; }
    else if (tabId === 'estimator') { targetTab = 'commercial'; targetSubTab = 'quotes'; }
    else if (tabId === 'booking') { targetTab = 'commercial'; targetSubTab = 'booking'; }
    else if (tabId === 'production') { targetTab = 'planning'; targetSubTab = 'job_tickets'; }
    else if (tabId === 'finishing' || tabId === 'associates' || tabId === 'finishing_qc') { targetTab = 'finishing'; targetSubTab = 'bindery'; }
    else if (tabId === 'qc' || tabId === 'qc_packing' || tabId === 'qc_inspection') { targetTab = 'qc'; targetSubTab = 'qc_inspection'; }
    else if (tabId === 'procurement') { targetTab = 'inventory'; targetSubTab = 'purchase_orders'; }
    else if (tabId === 'rejections') { targetTab = 'dispatch'; targetSubTab = 'returns'; }
    else if (tabId === 'owner_dashboard' || tabId === 'dashboard') { targetTab = 'admin_analytics'; targetSubTab = 'executive_oee'; }
    else if (tabId === 'notifications') { targetTab = 'admin_analytics'; targetSubTab = 'notifications'; }
    else if (tabId === 'config') { targetTab = 'admin_analytics'; targetSubTab = 'executive_oee'; }
    else {
      targetSubTab = getDefaultSubTab(targetTab);
    }

    setActiveTabState(targetTab);
    if (targetSubTab) {
      setActiveSubTab(targetSubTab);
    }
  };

  const navigateToTab = (tabId, subTabId = null) => {
    let targetTab = tabId;
    let targetSubTab = subTabId;

    if (tabId === 'enquiry') { targetTab = 'commercial'; if (!targetSubTab) targetSubTab = 'intake'; }
    else if (tabId === 'costing') { targetTab = 'commercial'; if (!targetSubTab) targetSubTab = 'costing'; }
    else if (tabId === 'estimator') { targetTab = 'commercial'; if (!targetSubTab) targetSubTab = 'quotes'; }
    else if (tabId === 'booking') { targetTab = 'commercial'; if (!targetSubTab) targetSubTab = 'booking'; }
    else if (tabId === 'production') { targetTab = 'planning'; if (!targetSubTab) targetSubTab = 'job_tickets'; }
    else if (tabId === 'finishing' || tabId === 'associates' || tabId === 'finishing_qc') { targetTab = 'finishing'; if (!targetSubTab) targetSubTab = 'bindery'; }
    else if (tabId === 'qc' || tabId === 'qc_packing' || tabId === 'qc_inspection') { targetTab = 'qc'; if (!targetSubTab) targetSubTab = 'qc_inspection'; }
    else if (tabId === 'procurement') { targetTab = 'inventory'; if (!targetSubTab) targetSubTab = 'purchase_orders'; }
    else if (tabId === 'rejections') { targetTab = 'dispatch'; if (!targetSubTab) targetSubTab = 'returns'; }
    else if (tabId === 'owner_dashboard' || tabId === 'dashboard') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'executive_oee'; }
    else if (tabId === 'notifications') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'notifications'; }
    else if (tabId === 'config') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'executive_oee'; }

    setActiveTabState(targetTab);
    setActiveSubTab(targetSubTab || getDefaultSubTab(targetTab));
  };

  const [estimatorViewMode, setEstimatorViewMode] = useState('pending'); // 'pending', 'quoted', 'all'
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState(null);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState(null);
  const [qrModalData, setQrModalData] = useState(null); // { amount, orderTitle, refNo }

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [purchaseRequests, setPurchaseRequests] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_po`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_REQUESTS;
  });

  const [quotes, setQuotes] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_quotes`);
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [designProofs, setDesignProofs] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_proofs`);
    return saved ? JSON.parse(saved) : INITIAL_DESIGN_PROOFS;
  });

  const [jobOrders, setJobOrders] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
    const initial = saved ? JSON.parse(saved) : INITIAL_JOB_ORDERS;
    const savedEnqs = localStorage.getItem(`${STORAGE_KEY}_enquiries`);
    const enqs = savedEnqs ? JSON.parse(savedEnqs) : INITIAL_ENQUIRIES;
    const savedBookings = localStorage.getItem(`${STORAGE_KEY}_sales_bookings`);
    const bookings = savedBookings ? JSON.parse(savedBookings) : INITIAL_SALES_BOOKINGS;

    return initial.map((job, idx) => {
      // JT-2026-001 is legitimately rush from initial seed data
      if (job.job_ticket_number === 'JT-2026-001') return job;

      const matchedEnq = enqs.find(e =>
        e.enquiry_no === job.job_ticket_number ||
        e.id === job.job_ticket_number ||
        (e.dn_no && `SO-2026-${e.dn_no}` === job.job_ticket_number) ||
        (job.customer_name && e.customer_name?.toLowerCase().trim() === job.customer_name?.toLowerCase().trim())
      );
      const matchedBooking = bookings.find(b =>
        b.booking_number === job.job_ticket_number ||
        (job.customer_name && b.customer_name?.toLowerCase().trim() === b.customer_name?.toLowerCase().trim())
      );

      const isActuallyRush = 
        matchedEnq?.priority === 'Urgent' || 
        matchedEnq?.is_rush_order === true || 
        matchedBooking?.priority === 'Urgent' ||
        matchedBooking?.is_rush_order === true;

      let updatedJob = job;
      if (job.current_stage === 'PlateMaking') {
        updatedJob = { ...job, current_stage: 'PressRun' };
      }

      if (!isActuallyRush && (job.is_rush_order || job.priority === 'Urgent')) {
        const correctPriority = matchedEnq?.priority || matchedBooking?.priority || 'Normal';
        return {
          ...updatedJob,
          priority: correctPriority,
          is_rush_order: false,
          queue_position: job.queue_position === 1 ? idx + 1 : job.queue_position
        };
      }
      return updatedJob;
    });
  });

  const [workstationLogs, setWorkstationLogs] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_WORKSTATION_LOGS;
  });

  const [materialReservations, setMaterialReservations] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reservations`);
    return saved ? JSON.parse(saved) : INITIAL_MATERIAL_RESERVATIONS;
  });

  const [issues, setIssues] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_issues`);
    return saved ? JSON.parse(saved) : INITIAL_ISSUES;
  });

  const [dispatchRecords, setDispatchRecords] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dispatch`);
    return saved ? JSON.parse(saved) : INITIAL_DISPATCH;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [paymentReceipts, setPaymentReceipts] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_receipts`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENT_RECEIPTS;
  });

  const [feedbackList, setFeedbackList] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_feedback`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_FEEDBACK;
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [machines, setMachines] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_machines`);
    return saved ? JSON.parse(saved) : INITIAL_MACHINES;
  });

  const [enquiries, setEnquiries] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_enquiries`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_ENQUIRIES;
      }
    }
    return INITIAL_ENQUIRIES;
  });

  const [dispatchRoutes, setDispatchRoutes] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dispatch_routes`);
    return saved ? JSON.parse(saved) : INITIAL_DISPATCH_ROUTES;
  });

  const [routeJobs, setRouteJobs] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_route_jobs`);
    return saved ? JSON.parse(saved) : INITIAL_ROUTE_JOBS;
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vehicles`);
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [tripSheets, setTripSheets] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_trip_sheets`);
    return saved ? JSON.parse(saved) : INITIAL_TRIP_SHEETS;
  });

  const [ownerMetrics, setOwnerMetrics] = useState(() => {
    return INITIAL_OWNER_METRICS;
  });

  const [costingRequests, setCostingRequests] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_costing`);
    return saved ? JSON.parse(saved) : INITIAL_COSTING_REQUESTS;
  });

  const [salesBookings, setSalesBookings] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sales_bookings`);
    return saved ? JSON.parse(saved) : INITIAL_SALES_BOOKINGS;
  });

  const [prepressJobs, setPrepressJobs] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_prepress_jobs`);
    return saved ? JSON.parse(saved) : INITIAL_PREPRESS_JOBS;
  });

  const [finishingOps, setFinishingOps] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_finishing_ops`);
    return saved ? JSON.parse(saved) : INITIAL_FINISHING_OPS;
  });

  const [associates, setAssociates] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_associates`);
    return saved ? JSON.parse(saved) : INITIAL_ASSOCIATES;
  });

  const [outsourceChallans, setOutsourceChallans] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_outsource_challans`);
    return saved ? JSON.parse(saved) : INITIAL_OUTSOURCE_CHALLANS;
  });

  const [excessStock, setExcessStock] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_excess_stock`);
    return saved ? JSON.parse(saved) : INITIAL_EXCESS_STOCK;
  });

  const [customerRejections, setCustomerRejections] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customer_rejections`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_REJECTIONS;
  });

  const [notificationsLog, setNotificationsLog] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs_log`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS_LOG;
  });

  const [masterData, setMasterData] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_master_data`);
    return saved ? JSON.parse(saved) : INITIAL_MASTER_DATA;
  });

  const [controlGates, setControlGates] = useState(WORKFLOW_CONTROL_GATES);

  // Global modals & filters matching designtemplate
  const [isControlGatesModalOpen, setIsControlGatesModalOpen] = useState(false);
  const [isMasterEnquiryModalOpen, setIsMasterEnquiryModalOpen] = useState(false);
  const [selectedTripSheetForModal, setSelectedTripSheetForModal] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getTodayFormattedDate);
  const [isManualDate, setIsManualDate] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isManualDate) {
        setSelectedDate(getTodayFormattedDate());
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [isManualDate]);

  const handleSetSelectedDate = (date) => {
    setIsManualDate(true);
    setSelectedDate(date);
  };
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All Sources');
  const [activeBranch, setActiveBranch] = useState('Plant #01 • Ramamurthy Nagar');

  // Global QC Flag Modal State
  const [isQCFlagModalOpen, setIsQCFlagModalOpen] = useState(false);
  const [qcFlagModalJob, setQcFlagModalJob] = useState(null);
  const [qcFlagSourceTerminal, setQcFlagSourceTerminal] = useState('Press Terminal');

  const openQCFlagModal = (job, terminalName = 'Press Terminal') => {
    setQcFlagModalJob(job);
    setQcFlagSourceTerminal(terminalName);
    setIsQCFlagModalOpen(true);
  };

  const closeQCFlagModal = () => {
    setIsQCFlagModalOpen(false);
    setQcFlagModalJob(null);
  };

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    localStorage.setItem(`${STORAGE_KEY}_inventory`, JSON.stringify(inventory));
    localStorage.setItem(`${STORAGE_KEY}_po`, JSON.stringify(purchaseRequests));
    localStorage.setItem(`${STORAGE_KEY}_quotes`, JSON.stringify(quotes));
    localStorage.setItem(`${STORAGE_KEY}_proofs`, JSON.stringify(designProofs));
    localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobOrders));
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(workstationLogs));
    localStorage.setItem(`${STORAGE_KEY}_reservations`, JSON.stringify(materialReservations));
    localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify(issues));
    localStorage.setItem(`${STORAGE_KEY}_dispatch`, JSON.stringify(dispatchRecords));
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    localStorage.setItem(`${STORAGE_KEY}_receipts`, JSON.stringify(paymentReceipts));
    localStorage.setItem(`${STORAGE_KEY}_feedback`, JSON.stringify(feedbackList));
    localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks));
    localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    localStorage.setItem(`${STORAGE_KEY}_machines`, JSON.stringify(machines));
    localStorage.setItem(`${STORAGE_KEY}_enquiries`, JSON.stringify(enquiries));
    localStorage.setItem(`${STORAGE_KEY}_dispatch_routes`, JSON.stringify(dispatchRoutes));
    localStorage.setItem(`${STORAGE_KEY}_route_jobs`, JSON.stringify(routeJobs));
    localStorage.setItem(`${STORAGE_KEY}_vehicles`, JSON.stringify(vehicles));
    localStorage.setItem(`${STORAGE_KEY}_trip_sheets`, JSON.stringify(tripSheets));
    localStorage.setItem(`${STORAGE_KEY}_costing`, JSON.stringify(costingRequests));
    localStorage.setItem(`${STORAGE_KEY}_sales_bookings`, JSON.stringify(salesBookings));
    localStorage.setItem(`${STORAGE_KEY}_prepress_jobs`, JSON.stringify(prepressJobs));
    localStorage.setItem(`${STORAGE_KEY}_finishing_ops`, JSON.stringify(finishingOps));
    localStorage.setItem(`${STORAGE_KEY}_associates`, JSON.stringify(associates));
    localStorage.setItem(`${STORAGE_KEY}_outsource_challans`, JSON.stringify(outsourceChallans));
    localStorage.setItem(`${STORAGE_KEY}_excess_stock`, JSON.stringify(excessStock));
    localStorage.setItem(`${STORAGE_KEY}_customer_rejections`, JSON.stringify(customerRejections));
    localStorage.setItem(`${STORAGE_KEY}_notifs_log`, JSON.stringify(notificationsLog));
    localStorage.setItem(`${STORAGE_KEY}_master_data`, JSON.stringify(masterData));
  }, [
    customers, inventory, purchaseRequests, quotes, designProofs, jobOrders,
    workstationLogs, materialReservations, issues, dispatchRecords, invoices,
    paymentReceipts, feedbackList, tasks, alerts, machines, enquiries,
    dispatchRoutes, routeJobs, vehicles, tripSheets, costingRequests,
    salesBookings, prepressJobs, finishingOps, associates, outsourceChallans,
    excessStock, customerRejections, notificationsLog, masterData
  ]);

  // Synchronize all quoted enquiries into salesBookings so they automatically reflect in Order Booking tab
  useEffect(() => {
    const quotedEnquiries = enquiries.filter(e => 
      Number(e.amount) > 0 && (e.costing_status === 'Costed' || e.quotation_generated)
    );

    if (quotedEnquiries.length === 0) return;

    setSalesBookings(prevBookings => {
      const existingEnquiryIds = new Set(prevBookings.map(b => b.enquiry_id).filter(Boolean));
      const existingBookingNums = new Set(prevBookings.map(b => b.booking_number).filter(Boolean));
      const existingCustomerTotalPairs = new Set(
        prevBookings.map(b => `${(b.customer_name || '').toLowerCase()}_${b.order_total}`)
      );

      const toAdd = [];

      quotedEnquiries.forEach(enq => {
        const amount = Number(enq.amount);
        const bookingNum = enq.dn_no && enq.dn_no !== '-' 
          ? `SO-2026-${enq.dn_no}` 
          : (enq.enquiry_no ? `SO-2026-${enq.enquiry_no.replace(/\D/g, '').slice(-4)}` : `SO-2026-${enq.id.replace(/\D/g, '') || String(enq.id).slice(-4)}`);

        const pairKey = `${(enq.customer_name || '').toLowerCase()}_${amount}`;

        if (
          !existingEnquiryIds.has(enq.id) &&
          !existingBookingNums.has(bookingNum) &&
          !existingCustomerTotalPairs.has(pairKey)
        ) {
          const advReq = Math.round(amount * 0.6);
          const advReceived = Number(enq.advance) || (enq.status === 'Completed' || enq.advance_remarks?.toLowerCase().includes('full') ? amount : 0);
          const isBooked = advReceived >= advReq && advReq > 0;

          toAdd.push({
            id: `sb-enq-${enq.id}`,
            booking_number: bookingNum,
            quote_id: `q-${enq.id}`,
            enquiry_id: enq.id,
            customer_id: enq.customer_id || `cust-${enq.id}`,
            customer_name: enq.customer_name,
            customer_po_ref: enq.dn_no && enq.dn_no !== '-' ? `DN-${enq.dn_no}` : (enq.enquiry_no || enq.id),
            arc_number: null,
            job_title: enq.job_name || enq.job_specification || 'Commercial Print Job',
            confirmation_channel: enq.source || 'Walk-in',
            confirmation_date: enq.date || new Date().toISOString().split('T')[0],
            order_total: amount,
            advance_required: advReq,
            advance_received: advReceived,
            balance_pending: Math.max(0, amount - advReceived),
            booking_status: isBooked ? 'Booked' : 'Awaiting Advance',
            production_release: isBooked,
            refund_applicable: false,
            priority: enq.priority || 'Normal',
            is_rush_order: enq.priority === 'Urgent' || enq.is_rush_order === true,
            prepress: enq.prepress && enq.prepress !== '-' ? enq.prepress : 'Aruna',
            created_at: new Date().toISOString()
          });
        }
      });

      const updatedPrev = prevBookings.map(b => {
        const matchingEnq = quotedEnquiries.find(e => e.id === b.enquiry_id || (e.dn_no && `SO-2026-${e.dn_no}` === b.booking_number));
        if (matchingEnq && matchingEnq.prepress && matchingEnq.prepress !== '-' && (!b.prepress || b.prepress === '-')) {
          return { ...b, prepress: matchingEnq.prepress };
        }
        return b;
      });

      if (toAdd.length === 0) return updatedPrev;
      return [...toAdd, ...updatedPrev];
    });
  }, [enquiries]);

  // Synchronize all jobOrders currently in STAGES.DISPATCH into routeJobs for dispatch planning
  useEffect(() => {
    const dispatchJobs = (jobOrders || []).filter(j => normalizeStage(j.current_stage) === STAGES.DISPATCH);
    if (!dispatchJobs.length) return;

    setRouteJobs(prev => {
      let changed = false;
      let nextList = [...prev];

      dispatchJobs.forEach(job => {
        const ticket = job.job_ticket_number || job.id;
        const exists = nextList.some(r => r.job_no === ticket || r.id === job.id);
        if (!exists) {
          changed = true;
          const isJobInTransit = job.delivery_status === 'In-Transit' || Boolean(job.trip_sheet_number);
          nextList.unshift({
            id: `rj-${job.id || Date.now()}`,
            route_id: 'route-1',
            job_no: ticket,
            customer: job.customer_name || 'Customer',
            product: job.job_title || job.job_name || 'Commercial Print Order',
            route_qty: Number(job.print_quantity || 1000),
            dispatched: isJobInTransit ? Number(job.print_quantity || 1000) : 0,
            balance: isJobInTransit ? 0 : Number(job.print_quantity || 1000),
            cod_amount: Number(job.balance_due || job.balance || 0),
            ack_status: isJobInTransit ? 'Dispatched' : 'Pending',
            status: isJobInTransit ? 'In-Transit' : 'Ready',
            area: job.delivery_area || job.area || 'Bengaluru Central',
            assigned_to_trip: isJobInTransit,
            trip_number: job.trip_sheet_number || null
          });
        }
      });

      return changed ? nextList : prev;
    });
  }, [jobOrders]);

  // Auto-generate & synchronize GST Tax Invoices for all confirmed / production / dispatch job orders
  useEffect(() => {
    if (!jobOrders || jobOrders.length === 0) return;

    setInvoices(prevInvoices => {
      const existingTicketMap = new Map();
      prevInvoices.forEach(inv => {
        if (inv.job_ticket_number) existingTicketMap.set(inv.job_ticket_number, inv);
        if (inv.job_order_id) existingTicketMap.set(inv.job_order_id, inv);
      });

      let changed = false;
      let nextList = [...prevInvoices];

      jobOrders.forEach((job, idx) => {
        const ticket = job.job_ticket_number || job.id;
        const existingInv = existingTicketMap.get(ticket) || existingTicketMap.get(job.id);

        const grandTotal = Number(job.total_cost || job.order_total || job.amount || ((job.advance_paid || 0) + (job.balance_due || 0)) || 9032);
        const advancePaid = Number(job.advance_paid || 0);
        const balanceDue = Number(job.balance_due !== undefined ? job.balance_due : Math.max(0, grandTotal - advancePaid));

        if (!existingInv) {
          changed = true;
          const taxable = Math.round(grandTotal / 1.12);
          const cgst = Math.round((grandTotal - taxable) / 2);
          const sgst = grandTotal - taxable - cgst;
          const invNumber = `INV-2026-${String(891 + prevInvoices.length + idx).padStart(4, '0')}`;

          const newInv = {
            id: `inv-${job.id || Date.now()}-${idx}`,
            invoice_number: invNumber,
            job_order_id: job.id,
            job_ticket_number: ticket,
            customer_id: job.customer_id || 'cust-generic',
            customer_name: job.customer_name || 'Valued Customer',
            invoice_type: 'GST_Tax_Invoice',
            hsn_code: '49111010 (Commercial Print Materials)',
            subtotal: taxable,
            rush_fee_amount: job.is_rush_order ? 1500 : 0,
            taxable_amount: taxable,
            cgst_percent: 6,
            cgst_amount: cgst,
            sgst_percent: 6,
            sgst_amount: sgst,
            igst_amount: 0,
            grand_total: grandTotal,
            advance_paid: advancePaid,
            balance_due: balanceDue,
            payment_status: balanceDue <= 0 ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Unpaid'),
            due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
            issued_at: job.created_at || new Date().toISOString(),
          };

          nextList.unshift(newInv);
        } else if (existingInv.balance_due !== balanceDue || existingInv.advance_paid !== advancePaid || existingInv.grand_total !== grandTotal) {
          changed = true;
          nextList = nextList.map(inv => {
            if (inv.id === existingInv.id) {
              return {
                ...inv,
                grand_total: grandTotal,
                advance_paid: advancePaid,
                balance_due: balanceDue,
                payment_status: balanceDue <= 0 ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Unpaid'),
              };
            }
            return inv;
          });
        }
      });

      return changed ? nextList : prevInvoices;
    });
  }, [jobOrders]);

  const addSalesBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: bookingData.id || `sb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: bookingData.created_at || new Date().toISOString()
    };
    setSalesBookings(prev => {
      const existsIndex = prev.findIndex(b => 
        (bookingData.enquiry_id && b.enquiry_id === bookingData.enquiry_id) ||
        (bookingData.booking_number && b.booking_number === bookingData.booking_number)
      );
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...newBooking };
        return next;
      }
      return [newBooking, ...prev];
    });
    return newBooking;
  };

  const updateSalesBooking = (id, updates) => {
    setSalesBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addCostingRequest = (requestData) => {
    const newReq = {
      ...requestData,
      id: `cost-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setCostingRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  const updateCostingRequest = (id, updates) => {
    setCostingRequests(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addPrepressJob = (jobData) => {
    const newJob = {
      ...jobData,
      id: `prep-${Date.now()}`
    };
    setPrepressJobs(prev => [newJob, ...prev]);
    return newJob;
  };

  const updatePrepressJob = (id, updates) => {
    let matchedTicket = null;
    let syncNote = updates.notes || updates.last_note;
    if (!syncNote && updates.comments && updates.comments.length > 0) {
      const last = updates.comments[updates.comments.length - 1];
      syncNote = last?.text || last?.comment;
    }

    setPrepressJobs(prev => prev.map(p => {
      if (p.id !== id) return p;
      matchedTicket = p.job_ticket_number;
      return {
        ...p,
        ...updates,
        last_note: syncNote || updates.last_note || p.last_note || p.notes,
        notes: syncNote || updates.notes || p.notes
      };
    }));

    if (matchedTicket && syncNote) {
      setJobOrders(jPrev => jPrev.map(job => {
        if (job.job_ticket_number === matchedTicket) {
          const newComment = {
            id: `com-${Date.now()}`,
            text: syncNote,
            author: activeUser?.full_name || 'Designer',
            hours_logged: updates.hours_worked || 0,
            stage: job.current_stage,
            timestamp: new Date().toISOString()
          };
          return {
            ...job,
            last_note: syncNote,
            last_comment: syncNote,
            notes: syncNote,
            comments: [...(job.comments || []), newComment]
          };
        }
        return job;
      }));
    }
  };

  const addFinishingOp = (opData) => {
    const newOp = {
      ...opData,
      id: `fin-op-${Date.now()}`
    };
    setFinishingOps(prev => [newOp, ...prev]);
    return newOp;
  };

  const updateFinishingOp = (id, updates) => {
    setFinishingOps(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const addOutsourceChallan = (challanData) => {
    const newChallan = {
      ...challanData,
      id: `osc-${Date.now()}`
    };
    setOutsourceChallans(prev => [newChallan, ...prev]);
    return newChallan;
  };

  const updateOutsourceChallan = (id, updates) => {
    setOutsourceChallans(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addExcessStock = (stockData) => {
    const newStock = {
      ...stockData,
      id: `exs-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setExcessStock(prev => [newStock, ...prev]);
    return newStock;
  };

  const addCustomerRejection = (rejectionData) => {
    const newRej = {
      ...rejectionData,
      id: `rej-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setCustomerRejections(prev => [newRej, ...prev]);
    return newRej;
  };

  const updateCustomerRejection = (id, updates) => {
    setCustomerRejections(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addNotificationLog = (notifData) => {
    const newNotif = {
      ...notifData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setNotificationsLog(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const updateRouteJob = (jobId, updates) => {
    setRouteJobs(prev => prev.map(j => j.id === jobId || j.job_no === jobId ? { ...j, ...updates } : j));
    if (updates.assigned_to_trip === false || updates.status === 'Pending') {
      setJobOrders(prev => prev.map(job => {
        if (job.id === jobId || job.job_ticket_number === jobId) {
          return {
            ...job,
            current_stage: STAGES.DISPATCH,
            delivery_status: 'Ready',
            trip_sheet_number: null
          };
        }
        return job;
      }));
    }
  };

  const createTripSheet = (tripData) => {
    const newTrip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      trip_number: `TS-2026-0${tripSheets.length + 43}`,
      status: 'In-Transit',
      created_at: new Date().toISOString()
    };
    setTripSheets(prev => [newTrip, ...prev]);

    if (tripData.vehicle_reg) {
      setVehicles(prev => prev.map(v => v.reg_no === tripData.vehicle_reg ? { ...v, status: 'On Trip' } : v));
    }

    // Mark assigned route jobs as in-transit and assigned to trip
    if (tripData.selected_job_ids?.length) {
      setRouteJobs(prev => {
        const existingNos = new Set(prev.map(j => j.job_no));
        const missingFromRouteJobs = (jobOrders || [])
          .filter(j => tripData.selected_job_ids.includes(j.job_ticket_number) && !existingNos.has(j.job_ticket_number))
          .map(j => ({
            id: `rj-${j.id || Date.now()}`,
            route_id: 'route-1',
            job_no: j.job_ticket_number || j.id,
            customer: j.customer_name || 'Customer',
            product: j.job_title || j.job_name || 'Commercial Print Order',
            route_qty: Number(j.print_quantity || 1000),
            dispatched: Number(j.print_quantity || 1000),
            balance: 0,
            cod_amount: Number(j.balance_due || j.balance || 0),
            ack_status: 'Dispatched',
            status: 'In-Transit',
            assigned_to_trip: true,
            trip_id: newTrip.id,
            trip_number: newTrip.trip_number,
            area: j.delivery_area || j.area || 'Bengaluru Central',
          }));

        const updated = prev.map(j => {
          if (tripData.selected_job_ids.includes(j.job_no)) {
            return {
              ...j,
              status: 'In-Transit',
              ack_status: 'Dispatched',
              dispatched: j.route_qty || j.balance || 0,
              balance: 0,
              assigned_to_trip: true,
              trip_id: newTrip.id,
              trip_number: newTrip.trip_number
            };
          }
          return j;
        });

        return [...missingFromRouteJobs, ...updated];
      });

      // Also advance stage in jobOrders if matching tickets exist
      setJobOrders(prev => prev.map(job => {
        if (tripData.selected_job_ids.includes(job.job_ticket_number)) {
          return {
            ...job,
            current_stage: 'InTransit',
            delivery_status: 'In-Transit',
            trip_sheet_number: newTrip.trip_number
          };
        }
        return job;
      }));
    }
    return newTrip;
  };

  // Update Delivery Status (Dispatched <-> Delivered) for a specific job order
  const updateJobDeliveryStatus = (jobTicketOrId, newStatus = 'Delivered') => {
    const isDelivered = newStatus === 'Delivered';
    const timestamp = new Date().toISOString();

    let targetTripId = null;
    let targetTripNumber = null;

    // 1. Update routeJobs
    setRouteJobs(prev => prev.map(j => {
      if (j.job_no === jobTicketOrId || j.id === jobTicketOrId) {
        targetTripId = j.trip_id;
        targetTripNumber = j.trip_number;
        return {
          ...j,
          status: isDelivered ? 'Delivered' : 'In-Transit',
          ack_status: isDelivered ? 'Delivered' : 'Dispatched',
          delivered_at: isDelivered ? timestamp : null
        };
      }
      return j;
    }));

    // 2. Update jobOrders
    setJobOrders(prev => prev.map(job => {
      if (job.job_ticket_number === jobTicketOrId || job.id === jobTicketOrId) {
        if (!targetTripId && job.trip_id) targetTripId = job.trip_id;
        if (!targetTripNumber && job.trip_sheet_number) targetTripNumber = job.trip_sheet_number;
        return {
          ...job,
          delivery_status: isDelivered ? 'Delivered' : 'In-Transit',
          current_stage: isDelivered ? STAGES.COMPLETED : 'InTransit',
          delivered_at: isDelivered ? timestamp : null
        };
      }
      return job;
    }));

    // 3. Update enquiries and salesBookings
    setEnquiries(prev => prev.map(e => {
      const isMatch = e.enquiry_no === jobTicketOrId || e.id === jobTicketOrId || (e.dn_no && `SO-2026-${e.dn_no}` === jobTicketOrId);
      if (isMatch) {
        return {
          ...e,
          current_stage: isDelivered ? STAGES.COMPLETED : STAGES.DISPATCH,
          status: isDelivered ? 'Completed' : 'Booked'
        };
      }
      return e;
    }));

    setSalesBookings(prev => prev.map(b => {
      if (b.booking_number === jobTicketOrId || b.id === jobTicketOrId) {
        return {
          ...b,
          current_stage: isDelivered ? STAGES.COMPLETED : STAGES.DISPATCH,
          status: isDelivered ? 'Completed' : 'Booked'
        };
      }
      return b;
    }));

    // 4. Update trip sheet status if needed
    if (targetTripId || targetTripNumber) {
      setTripSheets(prevTrips => prevTrips.map(trip => {
        if (trip.id === targetTripId || trip.trip_number === targetTripNumber) {
          const allOtherDelivered = (routeJobs || []).every(rj => {
            if (rj.trip_id === trip.id || rj.trip_number === trip.trip_number) {
              if (rj.job_no === jobTicketOrId || rj.id === jobTicketOrId) {
                return isDelivered;
              }
              return rj.status === 'Delivered' || rj.ack_status === 'Delivered';
            }
            return true;
          });

          if (isDelivered && allOtherDelivered) {
            if (trip.vehicle_reg) {
              setVehicles(vPrev => vPrev.map(v => v.reg_no === trip.vehicle_reg ? { ...v, status: 'Available' } : v));
            }
            return {
              ...trip,
              status: 'Completed',
              completed_at: timestamp
            };
          } else if (!isDelivered) {
            return {
              ...trip,
              status: 'In-Transit',
              completed_at: null
            };
          }
        }
        return trip;
      }));
    }

    addAlert({
      alert_type: 'DeliveryAlert',
      severity: isDelivered ? 'Success' : 'Info',
      message: `Job ${jobTicketOrId} delivery status updated to [${isDelivered ? 'Delivered' : 'Dispatched'}].`,
    });
  };

  // Complete an entire Trip Sheet manifest and mark all assigned orders as Delivered
  const completeTripSheet = (tripIdOrNumber) => {
    const timestamp = new Date().toISOString();
    let affectedJobNos = [];
    let vehicleReg = null;

    setTripSheets(prev => prev.map(trip => {
      if (trip.id === tripIdOrNumber || trip.trip_number === tripIdOrNumber) {
        affectedJobNos = trip.selected_job_ids || [];
        vehicleReg = trip.vehicle_reg;
        return {
          ...trip,
          status: 'Completed',
          completed_at: timestamp
        };
      }
      return trip;
    }));

    if (vehicleReg) {
      setVehicles(prev => prev.map(v => v.reg_no === vehicleReg ? { ...v, status: 'Available' } : v));
    }

    setRouteJobs(prev => prev.map(j => {
      if (affectedJobNos.includes(j.job_no) || affectedJobNos.includes(j.id) || j.trip_id === tripIdOrNumber || j.trip_number === tripIdOrNumber) {
        return {
          ...j,
          status: 'Delivered',
          ack_status: 'Delivered',
          delivered_at: timestamp
        };
      }
      return j;
    }));

    setJobOrders(prev => prev.map(job => {
      if (affectedJobNos.includes(job.job_ticket_number) || affectedJobNos.includes(job.id) || job.trip_sheet_number === tripIdOrNumber) {
        return {
          ...job,
          delivery_status: 'Delivered',
          current_stage: STAGES.COMPLETED,
          delivered_at: timestamp
        };
      }
      return job;
    }));

    setEnquiries(prev => prev.map(e => {
      const match = affectedJobNos.some(no => e.enquiry_no === no || e.id === no || (e.dn_no && `SO-2026-${e.dn_no}` === no));
      if (match) {
        return { ...e, current_stage: STAGES.COMPLETED, status: 'Completed' };
      }
      return e;
    }));

    setSalesBookings(prev => prev.map(b => {
      if (affectedJobNos.includes(b.booking_number) || affectedJobNos.includes(b.id)) {
        return { ...b, current_stage: STAGES.COMPLETED, status: 'Completed' };
      }
      return b;
    }));

    addAlert({
      alert_type: 'DeliveryAlert',
      severity: 'Success',
      message: `[TRIP COMPLETED] Trip ${tripIdOrNumber} finished. All assigned orders marked as Delivered.`,
    });

    addNotificationLog({
      title: `Trip ${tripIdOrNumber} Completed`,
      message: `All orders marked as Delivered and vehicle released to fleet.`,
      channel: 'App',
      type: 'Delivery',
      status: 'Delivered'
    });
  };

  const updateMasterData = (section, updates) => {
    setMasterData(prev => ({
      ...prev,
      [section]: updates
    }));
  };

  const addEnquiry = (enquiryData) => {
    const newEnq = {
      ...enquiryData,
      id: `enq-${Date.now()}`,
      is_starred: false
    };
    setEnquiries(prev => [newEnq, ...prev]);
    return newEnq;
  };

  const toggleStarEnquiry = (enquiryId) => {
    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, is_starred: !e.is_starred } : e));
  };

  const updateEnquiry = (enquiryId, updates) => {
    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, ...updates } : e));

    if (updates.prepress && updates.prepress !== '-') {
      const targetEnq = enquiries.find(e => e.id === enquiryId);
      const enqNumber = targetEnq?.enquiry_no || enquiryId;
      const dnNumber = targetEnq?.dn_no;
      const custName = targetEnq?.customer_name;

      // Synchronize prepress designer with salesBookings
      setSalesBookings(prev => prev.map(b => {
        const isMatch = b.enquiry_id === enquiryId ||
          b.customer_po_ref === enqNumber ||
          (dnNumber && dnNumber !== '-' && (b.booking_number?.includes(dnNumber) || b.customer_po_ref?.includes(dnNumber))) ||
          (custName && b.customer_name === custName);
        return isMatch ? { ...b, prepress: updates.prepress } : b;
      }));

      // Synchronize prepress designer with prepressJobs
      setPrepressJobs(prev => prev.map(p => {
        const isMatch = (custName && p.customer_name === custName) ||
          (dnNumber && dnNumber !== '-' && p.job_ticket_number?.includes(dnNumber)) ||
          p.job_ticket_number?.includes(enquiryId.replace(/\D/g, ''));
        return isMatch ? { ...p, assigned_designer: updates.prepress } : p;
      }));
    }
  };

  // Role simulation switcher
  const switchUser = (userId) => {
    const found = INITIAL_USERS.find(u => u.id === userId);
    if (found) setActiveUser(found);
  };

  // 1. CRM
  const addCustomer = (customerData) => {
    const newCust = {
      ...customerData,
      id: `cust-${Date.now()}`,
      current_balance: 0,
      created_at: new Date().toISOString(),
    };
    setCustomers(prev => [newCust, ...prev]);
    return newCust;
  };

  // 2. Estimation & Quotation
  const createQuote = (quoteData) => {
    const quoteNumber = `QUO-2026-${String(quotes.length + 145).padStart(4, '0')}`;
    const newQuote = {
      ...quoteData,
      id: `q-${Date.now()}`,
      quote_number: quoteNumber,
      created_by_user_id: activeUser.id,
      created_by_name: activeUser.full_name,
      status: 'Draft',
      created_at: new Date().toISOString(),
    };
    setQuotes(prev => [newQuote, ...prev]);

    // Push alert if Urgent
    if (newQuote.priority === 'Urgent') {
      addAlert({
        alert_type: 'RushOrderAlert',
        severity: 'Critical',
        message: `[RUSH QUOTE] ${newQuote.quote_number} for ${newQuote.customer_name} marked as URGENT.`,
      });
    }

    return newQuote;
  };

  // 3. Order Booking & Confirmation (Convert Quote to Job Order)
  const approveQuoteAndBookOrder = (quoteId, advanceAmount, paymentMethod = 'UPI_QR', priorityOverride = null, targetDate = null) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return null;

    const ticketNumber = `JT-2026-${String(jobOrders.length + 5).padStart(3, '0')}`;
    const priority = priorityOverride || quote.priority || 'Normal';
    const isRush = priority === 'Urgent';

    // Update Quote status
    setQuotes(prev => prev.map(q => q.id === quoteId ? {
      ...q,
      status: 'Approved',
      advance_collected_amount: advanceAmount
    } : q));

    // Calculate queue position: Rush jobs go to top (position 1), others append
    let newQueuePos = jobOrders.length + 1;
    if (isRush) {
      newQueuePos = 1;
      // bump others down
      setJobOrders(prev => prev.map(j => ({ ...j, queue_position: j.queue_position + 1 })));
    }

    const firstItem = quote.items && quote.items[0] ? quote.items[0] : {};

    const newJob = {
      id: `job-${Date.now()}`,
      job_ticket_number: ticketNumber,
      quote_id: quote.id,
      customer_id: quote.customer_id,
      customer_name: quote.customer_name,
      job_title: firstItem.job_title || 'Custom Offset Print Job',
      production_type: 'Offset',
      print_quantity: firstItem.print_quantity || 1000,
      paper_details: `${firstItem.paper_type || 'Art Paper'} (${firstItem.sheet_size || 'Standard'})`,
      color_spec: `${firstItem.color_pages_front || 4}/${firstItem.color_pages_back || 0} Process CMYK`,
      finishing_spec: firstItem.finishing_specs || 'Standard Trimming & Packing',
      current_stage: 'DesignProofing',
      priority: priority,
      is_rush_order: isRush,
      queue_position: newQueuePos,
      assigned_press_machine: quote.assigned_press_machine || quote.target_machine || firstItem.assigned_press_machine || resolveDefaultPressMachine({ ...quote, print_quantity: firstItem.print_quantity, printing_type: quote.printing_type }),
      assigned_operator: 'Rajesh Nair',
      target_completion_date: targetDate || new Date(Date.now() + (isRush ? 12 : 48) * 3600 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      advance_paid: advanceAmount,
      balance_due: (quote.total_estimated_price || 0) - advanceAmount,
    };

    setJobOrders(prev => [newJob, ...prev]);

    // Create Design Proof entry
    const newProof = {
      id: `dp-${Date.now()}`,
      quote_id: quote.id,
      job_ticket_number: ticketNumber,
      job_title: newJob.job_title,
      designer_user_id: 'usr-3',
      designer_name: 'Kiran Verma',
      revision_round: 1,
      proof_file_name: `${newJob.job_title.replace(/\s+/g, '_')}_Proof_v1.pdf`,
      checklist_cmyk: true,
      checklist_dpi: true,
      checklist_bleed: true,
      checklist_overprint: false,
      checklist_fonts: true,
      client_approval_status: 'PendingReview',
      client_feedback: '',
      approved_at: null,
    };
    setDesignProofs(prev => [newProof, ...prev]);

    // Reserve materials (Phase 1)
    const newReservation = {
      id: `res-${Date.now()}`,
      job_order_id: newJob.id,
      inventory_item_id: 'inv-1',
      item_name: '130 GSM Gloss Art Paper',
      quantity_reserved: 5,
      quantity_deducted: 0,
      is_deducted: false,
    };
    setMaterialReservations(prev => [newReservation, ...prev]);

    // Log Advance payment receipt
    if (advanceAmount > 0) {
      const receipt = {
        id: `rec-${Date.now()}`,
        invoice_id: `temp-inv-${newJob.id}`,
        invoice_number: `ADV-${newJob.job_ticket_number}`,
        customer_name: newJob.customer_name,
        amount_paid: advanceAmount,
        payment_method: paymentMethod,
        transaction_ref: `UPI/${Date.now().toString().slice(-8)}/ADVANCE`,
        payment_date: new Date().toISOString(),
        receipt_type: `Advance Booking (${Math.round((advanceAmount / (quote.total_estimated_price || 1)) * 100)}%)`,
      };
      setPaymentReceipts(prev => [receipt, ...prev]);
    }

    addAlert({
      alert_type: isRush ? 'RushOrderAlert' : 'TaskAlert',
      severity: isRush ? 'Critical' : 'Info',
      message: `${isRush ? '[URGENT JOB CREATED]' : '[NEW JOB BOOKED]'}: ${ticketNumber} (${newJob.job_title}) released to Design Proofing.`,
    });

    return newJob;
  };

  // 4. Fast-Track / Bump to Top (1-Click Queue Prioritization)
  const bumpJobToTop = (jobId) => {
    setJobOrders(prev => {
      const target = prev.find(j => j.id === jobId);
      if (!target) return prev;

      const rest = prev.filter(j => j.id !== jobId).map(j => ({
        ...j,
        queue_position: j.queue_position + 1,
      }));

      const prioritized = {
        ...target,
        priority: 'Urgent',
        is_rush_order: true,
        queue_position: 1,
      };

      addAlert({
        alert_type: 'RushOrderAlert',
        severity: 'Critical',
        message: `[FAST-TRACK ACTIVATED] Job ${target.job_ticket_number} (${target.job_title}) bumped to #1 priority.`,
      });

      return [prioritized, ...rest];
    });
  };

  // Update Job Order Generic
  const updateJobOrder = (jobId, updates) => {
    setJobOrders(prev => prev.map(job => (job.id === jobId || job.job_ticket_number === jobId) ? { ...job, ...updates } : job));
  };

  // Add Comment and/or Log Hours for a Job
  const addJobComment = (jobId, commentText, hoursWorked = 0) => {
    const numHours = Number(hoursWorked) || 0;
    const cleanComment = (commentText || '').trim();

    setJobOrders(prev => prev.map(job => {
      if (job.id !== jobId) return job;
      const newComment = cleanComment ? {
        id: `com-${Date.now()}`,
        text: cleanComment,
        author: activeUser.full_name,
        hours_logged: numHours,
        stage: job.current_stage,
        timestamp: new Date().toISOString()
      } : null;
      return {
        ...job,
        total_hours_worked: (job.total_hours_worked || 0) + numHours,
        comments: newComment ? [...(job.comments || []), newComment] : (job.comments || []),
        last_comment: cleanComment || job.last_comment,
        last_note: cleanComment || job.last_note || job.notes,
        notes: cleanComment || job.notes,
      };
    }));

    if (numHours > 0 || cleanComment) {
      const targetJob = jobOrders.find(j => j.id === jobId);
      if (targetJob) {
        setWorkstationLogs(prev => [{
          id: `log-${Date.now()}`,
          job_order_id: jobId,
          job_ticket_number: targetJob.job_ticket_number,
          operator_user_id: activeUser.id,
          operator_name: activeUser.full_name,
          workstation_stage: targetJob.current_stage,
          machine_name: targetJob.assigned_press_machine,
          started_at: new Date().toISOString(),
          completed_at: null,
          good_impressions: targetJob.print_quantity,
          waste_sheets_logged: 0,
          hours_worked: numHours,
          operator_notes: cleanComment || `Logged ${numHours} hours by ${activeUser.full_name}`,
        }, ...prev]);

        // Synchronize note to prepressJobs if matching ticket exists
        if (cleanComment) {
          setPrepressJobs(pPrev => pPrev.map(p => {
            if (p.job_ticket_number === targetJob.job_ticket_number) {
              const pComment = {
                id: `c-${Date.now()}`,
                text: cleanComment,
                author: activeUser.full_name,
                hours: numHours,
                timestamp: new Date().toISOString()
              };
              return {
                ...p,
                notes: cleanComment,
                last_note: cleanComment,
                comments: [...(p.comments || []), pComment]
              };
            }
            return p;
          }));
        }
      }
    }
  };

  // 5. Advance Stage Workflow & Workstation Logging
  const advanceJobStage = (jobId, nextStage, notes = '', hoursWorked = 0) => {
    const canonicalStage = normalizeStage(nextStage);
    const numHours = Number(hoursWorked) || 0;
    const cleanNotes = (notes || '').trim();

    setJobOrders(prev => prev.map(job => {
      if (job.id !== jobId && job.job_ticket_number !== jobId) return job;

      const currentTotalHours = (job.total_hours_worked || 0) + numHours;
      const newCommentObj = cleanNotes ? {
        id: `com-${Date.now()}`,
        text: cleanNotes,
        author: activeUser.full_name,
        hours_logged: numHours,
        stage: canonicalStage,
        timestamp: new Date().toISOString()
      } : null;
      const updatedComments = newCommentObj ? [...(job.comments || []), newCommentObj] : (job.comments || []);

      // When advancing into Press, trigger Phase 2 Material Deduction
      if (canonicalStage === STAGES.PRESS) {
        setMaterialReservations(resPrev => resPrev.map(res => {
          if ((res.job_order_id === jobId || res.job_order_id === job.id) && !res.is_deducted) {
            // Deduct from inventory on hand
            setInventory(invPrev => invPrev.map(item => {
              if (item.id === res.inventory_item_id) {
                const newQty = Math.max(0, item.quantity_on_hand - res.quantity_reserved);
                return { ...item, quantity_on_hand: newQty, updated_at: new Date().toISOString() };
              }
              return item;
            }));
            return { ...res, is_deducted: true, quantity_deducted: res.quantity_reserved };
          }
          return res;
        }));
      }

      return {
        ...job,
        current_stage: canonicalStage,
        qc_flagged: false,
        returned_from_qc: false,
        total_hours_worked: currentTotalHours,
        comments: updatedComments,
        last_comment: cleanNotes || job.last_comment,
        last_note: cleanNotes || job.last_note || job.notes,
        notes: cleanNotes || job.notes,
      };
    }));

    // Add workstation log
    const targetJob = jobOrders.find(j => j.id === jobId || j.job_ticket_number === jobId);
    if (targetJob) {
      const newLog = {
        id: `log-${Date.now()}`,
        job_order_id: targetJob.id,
        job_ticket_number: targetJob.job_ticket_number,
        operator_user_id: activeUser.id,
        operator_name: activeUser.full_name,
        workstation_stage: canonicalStage,
        machine_name: targetJob.assigned_press_machine,
        started_at: new Date().toISOString(),
        completed_at: canonicalStage === STAGES.COMPLETED ? new Date().toISOString() : null,
        good_impressions: targetJob.print_quantity,
        waste_sheets_logged: canonicalStage === STAGES.PRESS ? 30 : 5,
        hours_worked: numHours,
        operator_notes: notes || `Advanced to ${STAGE_CONFIG[canonicalStage]?.label || canonicalStage} by ${activeUser.full_name}`,
      };
      setWorkstationLogs(prev => [newLog, ...prev]);

      // Auto-manage finishing operations when advancing to Finishing
      if (canonicalStage === STAGES.FINISHING) {
        setFinishingOps(prev => {
          const exists = prev.some(f => f.job_ticket_number === targetJob.job_ticket_number);
          if (exists) {
            return prev.map(f => f.job_ticket_number === targetJob.job_ticket_number ? { ...f, status: 'In-Progress', moved_to_qc: false } : f);
          }
          const newFinOp = {
            id: `fin-op-${Date.now()}`,
            job_ticket_number: targetJob.job_ticket_number,
            job_title: targetJob.job_title || targetJob.job_name || targetJob.product || targetJob.job_specification || 'Commercial Print Order',
            customer_name: targetJob.customer_name || 'Customer',
            activity_type: targetJob.finishing_spec || 'Standard Trimming & Packing',
            workcenter: 'Standard Finishing & Bindery Unit',
            operator_name: 'Anil Kumar',
            status: 'In-Progress',
            planned_qty: targetJob.print_quantity || 1000,
            completed_qty: 0,
            wastage_qty: 0,
            quality_issues: 'None',
            started_at: new Date().toISOString(),
            is_subcontract: false,
            moved_to_qc: false,
            qc_ready: false
          };
          return [newFinOp, ...prev];
        });
      }

      if (canonicalStage === STAGES.QC) {
        setFinishingOps(prev => prev.map(f => {
          if (f.job_ticket_number === targetJob.job_ticket_number) {
            return { ...f, status: 'Completed', moved_to_qc: true, qc_ready: true };
          }
          return f;
        }));
      }

      // Auto-manage route jobs when advancing to Dispatch
      if (canonicalStage === STAGES.DISPATCH) {
        setRouteJobs(prev => {
          const ticket = targetJob.job_ticket_number || targetJob.id;
          const exists = prev.some(r => r.job_no === ticket || r.id === targetJob.id);
          if (exists) {
            return prev.map(r => (r.job_no === ticket || r.id === targetJob.id)
              ? {
                  ...r,
                  status: 'Ready',
                  ack_status: 'Pending',
                  balance: (r.balance && r.balance > 0) ? r.balance : Number(targetJob.print_quantity || 1000),
                  cod_amount: r.cod_amount !== undefined ? r.cod_amount : Number(targetJob.balance_due || targetJob.balance || 0),
                  customer: targetJob.customer_name || r.customer,
                  product: targetJob.job_title || targetJob.job_name || r.product,
                  route_qty: Number(targetJob.print_quantity || r.route_qty || 1000),
                  area: targetJob.delivery_area || targetJob.area || r.area || 'Bengaluru Central',
                }
              : r
            );
          }
          const newRouteJob = {
            id: `rj-${Date.now()}`,
            route_id: 'route-1',
            job_no: ticket,
            customer: targetJob.customer_name || 'Customer',
            product: targetJob.job_title || targetJob.job_name || 'Commercial Print Order',
            route_qty: Number(targetJob.print_quantity || 1000),
            dispatched: 0,
            balance: Number(targetJob.print_quantity || 1000),
            cod_amount: Number(targetJob.balance_due || targetJob.balance || 0),
            ack_status: 'Pending',
            status: 'Ready',
            area: targetJob.delivery_area || targetJob.area || 'Bengaluru Central',
          };
          return [newRouteJob, ...prev];
        });
      }

      // Synchronize linked Enquiry so Order Desk reflects the live production stage
      setEnquiries(prev => prev.map(e => {
        const isMatch = e.enquiry_no === targetJob.job_ticket_number ||
          e.id === targetJob.job_ticket_number ||
          (e.dn_no && `SO-2026-${e.dn_no}` === targetJob.job_ticket_number) ||
          (targetJob.job_ticket_number && (targetJob.job_ticket_number.includes(e.id) || e.id.includes(targetJob.job_ticket_number))) ||
          (e.dn_no && targetJob.job_ticket_number?.includes(e.dn_no)) ||
          (targetJob.customer_name && e.customer_name && e.customer_name.toLowerCase().trim() === targetJob.customer_name.toLowerCase().trim());
        if (isMatch) {
          const isDelivered = canonicalStage === STAGES.COMPLETED;
          return {
            ...e,
            current_stage: canonicalStage,
            status: isDelivered ? 'Completed' : (canonicalStage === STAGES.CANCELLED ? 'Cancelled' : 'Booked')
          };
        }
        return e;
      }));

      // Synchronize linked Sales Booking
      setSalesBookings(prev => prev.map(b => {
        const isMatch = b.booking_number === targetJob.job_ticket_number ||
          b.id === targetJob.job_ticket_number ||
          (targetJob.customer_name && b.customer_name?.toLowerCase().trim() === targetJob.customer_name?.toLowerCase().trim());
        if (isMatch) {
          return {
            ...b,
            current_stage: canonicalStage,
            status: canonicalStage === STAGES.COMPLETED ? 'Completed' : 'Booked'
          };
        }
        return b;
      }));

      // Synchronize linked Prepress Job
      setPrepressJobs(prev => prev.map(p => {
        const isMatch = p.job_ticket_number === targetJob.job_ticket_number || p.id === targetJob.job_ticket_number;
        if (isMatch) {
          return {
            ...p,
            current_stage: canonicalStage,
            production_release_authorized: canonicalStage !== STAGES.PREPRESS && canonicalStage !== STAGES.QUOTATION
          };
        }
        return p;
      }));

      addAlert({
        alert_type: 'TaskAlert',
        severity: 'Info',
        message: `Stage Progression: Job ${targetJob.job_ticket_number} moved to [${STAGE_CONFIG[canonicalStage]?.label || canonicalStage}] stage.${numHours > 0 ? ` (${numHours} hrs logged)` : ''}`,
      });
    }
  };

  // 6. Pre-Press Checklist & Proof Approval
  const updateDesignProof = (proofId, checklistUpdates, status, feedback) => {
    setDesignProofs(prev => prev.map(p => {
      if (p.id !== proofId) return p;

      const updated = {
        ...p,
        ...checklistUpdates,
        client_approval_status: status,
        client_feedback: feedback || p.client_feedback,
        approved_at: status === 'Approved' ? new Date().toISOString() : p.approved_at,
      };

      // If approved, advance corresponding job directly to PressRun
      if (status === 'Approved') {
        const job = jobOrders.find(j => j.job_ticket_number === p.job_ticket_number);
        if (job) {
          advanceJobStage(job.id, 'PressRun', 'Design proof signed off. Ready for Press.');
        }
      }

      return updated;
    }));
  };

  // 7. Inventory Stock & Purchase Management
  const createPurchaseRequest = (poData) => {
    const poNumber = `PO-2026-${String(purchaseRequests.length + 90).padStart(3, '0')}`;
    const newPO = {
      ...poData,
      id: `po-${Date.now()}`,
      po_number: poNumber,
      status: 'Requested',
      created_at: new Date().toISOString(),
    };
    setPurchaseRequests(prev => [newPO, ...prev]);
    return newPO;
  };

  const receivePurchaseOrder = (poId) => {
    setPurchaseRequests(prev => prev.map(po => {
      if (po.id !== poId) return po;

      // Update inventory on hand
      setInventory(invPrev => invPrev.map(item => {
        if (item.id === po.inventory_item_id) {
          return {
            ...item,
            quantity_on_hand: item.quantity_on_hand + Number(po.requested_qty),
            updated_at: new Date().toISOString(),
          };
        }
        return item;
      }));

      addAlert({
        alert_type: 'StockAlert',
        severity: 'Info',
        message: `[GOODS RECEIVED] ${po.requested_qty} units of ${po.item_name} added to stock from ${po.supplier_name}.`,
      });

      return { ...po, status: 'Received' };
    }));
  };

  // Stock Transfer between branches
  const transferStock = (itemId, fromBranch, toBranch, qty) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity_on_hand: Math.max(0, item.quantity_on_hand - qty),
          updated_at: new Date().toISOString(),
        };
      }
      return item;
    }));

    addAlert({
      alert_type: 'StockAlert',
      severity: 'Info',
      message: `[STOCK TRANSFER] ${qty} units transferred from ${fromBranch} to ${toBranch}.`,
    });
  };

  // Deduct Paper Substrate Sheets from Inventory
  const deductPaperInventory = (inventoryItemId, sheetsUsed, jobTicketNumber = '') => {
    const numSheets = Number(sheetsUsed) || 0;
    if (numSheets <= 0) return { success: false, message: 'Invalid sheet count' };

    let deductedItem = null;
    let newQty = 0;

    setInventory(prev => prev.map(item => {
      const isMatch = item.id === inventoryItemId || 
        item.name.toLowerCase().trim() === (inventoryItemId || '').toLowerCase().trim() ||
        (inventoryItemId && item.name.toLowerCase().includes(inventoryItemId.toLowerCase()));

      if (isMatch && !deductedItem) {
        deductedItem = item;
        const unit = item.unit_of_measure || 'Reams';
        // If stored in Reams, 1 Ream = 500 sheets
        const unitsToDeduct = unit.toLowerCase() === 'reams'
          ? Number((numSheets / 500).toFixed(2))
          : numSheets;
        newQty = Math.max(0, Number((item.quantity_on_hand - unitsToDeduct).toFixed(2)));

        return {
          ...item,
          quantity_on_hand: newQty,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    }));

    if (deductedItem) {
      addAlert({
        alert_type: 'StockAlert',
        severity: newQty <= deductedItem.reorder_threshold ? 'Warning' : 'Info',
        message: `[PAPER INVENTORY REDUCED] ${numSheets.toLocaleString()} sheets deducted from ${deductedItem.name} for Job ${jobTicketNumber || 'Press Run'}. Remaining: ${newQty} ${deductedItem.unit_of_measure}.`,
      });
      return { success: true, item: deductedItem, remaining: newQty };
    }
    return { success: false, message: 'Paper item not found' };
  };

  // 8. Quality & Defect Issue Register
  const reportIssue = (issueData) => {
    const newIssue = {
      ...issueData,
      id: `iss-${Date.now()}`,
      reported_by_name: issueData.reported_by_name || activeUser.full_name,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    setIssues(prev => [newIssue, ...prev]);

    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Warning',
      message: `[QUALITY ISSUE LOGGED] [${newIssue.issue_type || newIssue.defect_category}] on Job ${newIssue.job_ticket_number}.`,
    });
    return newIssue;
  };

  const resolveIssue = (issueId) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, resolved: true, resolved_at: new Date().toISOString() } : i));
  };

  // Dedicated QC Flag Handler (Callable from Prepress, Press, Finishing, Delivery)
  const raiseQCFlag = ({
    jobId,
    jobTicketNumber,
    customerName,
    jobTitle,
    terminal,
    defectCategory,
    severity = 'Major',
    description,
    reportedBy
  }) => {
    const reporter = reportedBy || activeUser.full_name;
    const ticketNo = jobTicketNumber || 'General';
    const cleanDesc = (description || '').trim();

    // Match or find job order
    const matchedJob = jobOrders.find(j => j.id === jobId || j.job_ticket_number === ticketNo);

    const newFlag = {
      id: `qc-flag-${Date.now()}`,
      job_order_id: matchedJob?.id || jobId || `job-${Date.now()}`,
      job_ticket_number: ticketNo,
      customer_name: customerName || matchedJob?.customer_name || 'Customer',
      job_title: jobTitle || matchedJob?.job_title || 'Commercial Job',
      source_terminal: terminal || 'Production Terminal',
      defect_category: defectCategory || 'General Defect',
      issue_type: defectCategory || 'General Defect',
      severity: severity,
      description: cleanDesc,
      reported_by_name: reporter,
      created_at: new Date().toISOString(),
      resolved: false,
      resolution_type: null, // 'Fixed' | 'SentBack'
      resolution_notes: '',
      resolved_at: null,
      resolved_by: null,
      current_stage: matchedJob?.current_stage || terminal
    };

    setIssues(prev => [newFlag, ...prev]);

    // Update Job Order with QC Flag and Comment
    if (matchedJob) {
      setJobOrders(prev => prev.map(j => {
        if (j.id !== matchedJob.id && j.job_ticket_number !== ticketNo) return j;
        const qcComment = {
          id: `com-${Date.now()}`,
          text: `[QC FLAG RAISED at ${terminal}]: ${defectCategory} (${severity} Severity) - ${cleanDesc}`,
          author: reporter,
          stage: j.current_stage,
          timestamp: new Date().toISOString()
        };
        return {
          ...j,
          qc_flagged: true,
          active_qc_flag_id: newFlag.id,
          qc_flag_count: (j.qc_flag_count || 0) + 1,
          comments: [...(j.comments || []), qcComment],
          last_note: `QC Flag: ${defectCategory} (${cleanDesc})`,
          notes: `QC Flag: ${defectCategory} (${cleanDesc})`
        };
      }));

      // Sync to prepressJobs if applicable
      setPrepressJobs(prev => prev.map(p => {
        if (p.job_ticket_number === ticketNo) {
          return {
            ...p,
            qc_flagged: true,
            notes: `[QC FLAGGED]: ${cleanDesc || defectCategory}`
          };
        }
        return p;
      }));

      // Sync to finishingOps if applicable
      setFinishingOps(prev => prev.map(f => {
        if (f.job_ticket_number === ticketNo) {
          return {
            ...f,
            qc_flagged: true
          };
        }
        return f;
      }));
    }

    addAlert({
      alert_type: 'TaskAlert',
      severity: severity === 'Critical' ? 'Critical' : 'Warning',
      message: `[QC DEFECT FLAGGED] ${ticketNo} flagged at [${terminal}]: ${defectCategory} (${severity}). Inspect in Quality Control Module.`,
    });

    addNotificationLog({
      title: `QC Defect Flagged on ${ticketNo}`,
      message: `Raised at ${terminal}: ${defectCategory} - ${cleanDesc}`,
      channel: 'App',
      type: 'Defect',
      status: 'Sent'
    });

    return newFlag;
  };

  // Mark QC Flag as Fixed (Allows continuing at current station)
  const markQCFlagFixed = (issueId, fixNotes = '') => {
    const cleanNotes = (fixNotes || 'Defect rectified and inspected. Tolerances passed.').trim();
    let affectedTicket = null;

    setIssues(prev => prev.map(iss => {
      if (iss.id === issueId) {
        affectedTicket = iss.job_ticket_number;
        return {
          ...iss,
          resolved: true,
          resolution_type: 'Fixed',
          resolution_notes: cleanNotes,
          resolved_at: new Date().toISOString(),
          resolved_by: activeUser.full_name
        };
      }
      return iss;
    }));

    if (affectedTicket) {
      // Check if any other unresolved issues exist for this ticket
      const remainingOpen = issues.filter(i => i.job_ticket_number === affectedTicket && i.id !== issueId && !i.resolved);

      setJobOrders(prev => prev.map(j => {
        if (j.job_ticket_number !== affectedTicket) return j;
        const fixComment = {
          id: `com-${Date.now()}`,
          text: `[QC RESOLUTION - FIXED]: ${cleanNotes}`,
          author: activeUser.full_name,
          stage: j.current_stage,
          timestamp: new Date().toISOString()
        };
        return {
          ...j,
          qc_flagged: remainingOpen.length > 0,
          comments: [...(j.comments || []), fixComment],
          last_note: `QC Fixed: ${cleanNotes}`,
          notes: `QC Fixed: ${cleanNotes}`
        };
      }));

      if (remainingOpen.length === 0) {
        setPrepressJobs(prev => prev.map(p => p.job_ticket_number === affectedTicket ? { ...p, qc_flagged: false } : p));
        setFinishingOps(prev => prev.map(f => f.job_ticket_number === affectedTicket ? { ...f, qc_flagged: false } : f));
      }

      addAlert({
        alert_type: 'TaskAlert',
        severity: 'Info',
        message: `[QC FIXED] Job ${affectedTicket} marked Fixed by ${activeUser.full_name}. Production cleared to proceed.`,
      });
    }
  };

  // Universal Rewind Job Stage / Return for QC Rework
  const rewindJobStage = (jobId, targetStage, returnReason = '') => {
    const canonicalStage = normalizeStage(targetStage);
    const cleanReason = (returnReason || 'Job sent back from QC for rework / plate remake / correction.').trim();
    let targetTicket = null;
    let targetJob = null;

    // Rewind job in jobOrders pipeline
    setJobOrders(prev => prev.map(j => {
      if (j.id === jobId || j.job_ticket_number === jobId) {
        targetJob = j;
        targetTicket = j.job_ticket_number;
        const returnComment = {
          id: `com-${Date.now()}`,
          text: `[RETURNED FROM QC to ${STAGE_CONFIG[canonicalStage]?.label || canonicalStage}]: ${cleanReason}`,
          author: activeUser.full_name,
          stage: canonicalStage,
          timestamp: new Date().toISOString()
        };
        return {
          ...j,
          current_stage: canonicalStage,
          qc_flagged: true,
          returned_from_qc: true,
          last_qc_action: 'SentBack',
          last_qc_return_reason: cleanReason,
          comments: [...(j.comments || []), returnComment],
          last_note: `[RETURNED FROM QC]: ${cleanReason}`,
          notes: `[RETURNED FROM QC]: ${cleanReason}`
        };
      }
      return j;
    }));

    const ticket = targetTicket || jobId;
    const jobObj = targetJob || jobOrders.find(j => j.id === jobId || j.job_ticket_number === ticket);
    if (jobObj) {
      setWorkstationLogs(prev => [{
        id: `log-${Date.now()}`,
        job_order_id: jobObj.id,
        job_ticket_number: jobObj.job_ticket_number,
        operator_user_id: activeUser.id,
        operator_name: activeUser.full_name,
        workstation_stage: canonicalStage,
        machine_name: jobObj.assigned_press_machine,
        started_at: new Date().toISOString(),
        completed_at: null,
        good_impressions: jobObj.print_quantity,
        waste_sheets_logged: 0,
        hours_worked: 0,
        operator_notes: `[PIPELINE REWOUND BY QC]: Returned to ${STAGE_CONFIG[canonicalStage]?.label || canonicalStage}. Instructions: ${cleanReason}`,
      }, ...prev]);
    }

    // If returning to Pre-press, update prepressJobs
    if (canonicalStage === STAGES.PREPRESS) {
      setPrepressJobs(prev => prev.map(p => {
        if (p.job_ticket_number === ticket || p.id === ticket) {
          return {
            ...p,
            current_stage: canonicalStage,
            customer_approval_status: 'RevisionRequested',
            production_release_authorized: false,
            returned_from_qc: true,
            last_note: `[RETURNED FROM QC]: ${cleanReason}`,
            notes: `[RETURNED FROM QC]: ${cleanReason}`
          };
        }
        return p;
      }));
    }

    // If returning to Finishing, reset finishingOps status to In-Progress
    if (canonicalStage === STAGES.FINISHING) {
      setFinishingOps(prev => prev.map(f => {
        if (f.job_ticket_number === ticket || f.id === ticket) {
          return {
            ...f,
            current_stage: canonicalStage,
            status: 'In-Progress',
            returned_from_qc: true,
            moved_to_qc: false
          };
        }
        return f;
      }));
    }

    // If returning to Quotation / Costing
    if (canonicalStage === STAGES.QUOTATION) {
      setEnquiries(prev => prev.map(e => {
        if (e.enquiry_no === ticket || e.id === ticket || (e.dn_no && `SO-2026-${e.dn_no}` === ticket) || (jobObj && e.customer_name === jobObj.customer_name)) {
          return {
            ...e,
            current_stage: canonicalStage,
            costing_status: 'Costing In-Progress',
            support_notes: `[RETURNED FROM PIPELINE]: ${cleanReason}`
          };
        }
        return e;
      }));
    }

    // If returning away from Dispatch, remove from routeJobs
    if (canonicalStage !== STAGES.DISPATCH) {
      setRouteJobs(prev => prev.filter(r => r.job_no !== ticket && r.id !== jobId));
    }

    addAlert({
      alert_type: 'RushOrderAlert',
      severity: 'Critical',
      message: `[JOB RETURNED FROM QC] Job ${ticket} sent back to [${STAGE_CONFIG[canonicalStage]?.label || canonicalStage}] for rework. Reason: ${cleanReason}`,
    });

    addNotificationLog({
      title: `Job ${ticket} Rewound by QC`,
      message: `Returned to ${STAGE_CONFIG[canonicalStage]?.label || canonicalStage} stage. Reason: ${cleanReason}`,
      channel: 'App',
      type: 'Rework',
      status: 'Sent'
    });
  };

  // Send Back Job Card Up Production Pipeline / Back a Station
  const sendBackJobFromQC = (issueId, targetStage, returnReason = '') => {
    const cleanReason = (returnReason || 'Job sent back from QC for rework / plate remake / color correction.').trim();
    let targetTicket = null;

    setIssues(prev => prev.map(iss => {
      if (iss.id === issueId) {
        targetTicket = iss.job_ticket_number;
        return {
          ...iss,
          resolved: true,
          resolution_type: 'SentBack',
          return_stage: targetStage,
          resolution_notes: cleanReason,
          resolved_at: new Date().toISOString(),
          resolved_by: activeUser.full_name
        };
      }
      return iss;
    }));

    if (targetTicket) {
      rewindJobStage(targetTicket, targetStage, cleanReason);
    }
  };

  // 9. Dispatch & Delivery
  const createDispatchRecord = (jobId, dispatchData) => {
    const job = jobOrders.find(j => j.id === jobId);
    if (!job) return;

    const newDispatch = {
      ...dispatchData,
      id: `disp-${Date.now()}`,
      job_order_id: jobId,
      job_ticket_number: job.job_ticket_number,
      customer_name: job.customer_name,
      delivery_status: 'Delivered',
      dispatched_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    };

    setDispatchRecords(prev => [newDispatch, ...prev]);
    advanceJobStage(jobId, 'Delivered', `Dispatched via ${dispatchData.dispatch_method}`);

    // If balance was collected
    if (dispatchData.balance_collected && job.balance_due > 0) {
      recordPaymentForJob(jobId, job.balance_due, dispatchData.payment_method || 'Cash', 'DELIVERY-BAL-COLL');
    }
  };

  // 10. Billing, Invoices & Payment Receipts
  const generateInvoiceForJob = (jobId, invoiceType = 'GST_Tax_Invoice') => {
    const job = jobOrders.find(j => j.id === jobId);
    if (!job) return null;

    const quote = quotes.find(q => q.id === job.quote_id);
    const subtotal = quote ? quote.raw_material_cost + quote.press_runtime_cost + quote.finishing_cost : 25000;
    const rushFee = job.is_rush_order ? (quote?.rush_surcharge_amount || 4500) : 0;
    const taxable = subtotal + rushFee;

    const isGst = invoiceType === 'GST_Tax_Invoice';
    const cgst = isGst ? taxable * 0.06 : 0;
    const sgst = isGst ? taxable * 0.06 : 0;
    const grandTotal = taxable + cgst + sgst;
    const balanceDue = grandTotal - (job.advance_paid || 0);

    const invNumber = `INV-2026-${String(invoices.length + 893).padStart(4, '0')}`;

    const newInv = {
      id: `inv-${Date.now()}`,
      invoice_number: invNumber,
      job_order_id: jobId,
      job_ticket_number: job.job_ticket_number,
      customer_id: job.customer_id,
      customer_name: job.customer_name,
      invoice_type: invoiceType,
      hsn_code: '49111010 (Offset Commercial Print)',
      subtotal: subtotal,
      rush_fee_amount: rushFee,
      taxable_amount: taxable,
      cgst_percent: isGst ? 6 : 0,
      cgst_amount: cgst,
      sgst_percent: isGst ? 6 : 0,
      sgst_amount: sgst,
      igst_amount: 0,
      grand_total: grandTotal,
      advance_paid: job.advance_paid || 0,
      balance_due: Math.max(0, balanceDue),
      payment_status: balanceDue <= 0 ? 'Paid' : (job.advance_paid > 0 ? 'Partial' : 'Unpaid'),
      due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      issued_at: new Date().toISOString(),
    };

    setInvoices(prev => [newInv, ...prev]);

    // Update customer balance in CRM
    setCustomers(custPrev => custPrev.map(c => {
      if (c.id === job.customer_id) {
        return {
          ...c,
          current_balance: c.current_balance + Math.max(0, balanceDue),
        };
      }
      return c;
    }));

    addAlert({
      alert_type: 'PaymentAlert',
      severity: 'Info',
      message: `[INVOICE GENERATED] ${invNumber} for ${job.customer_name} (Total: Rs ${grandTotal.toLocaleString()}).`,
    });

    return newInv;
  };

  const recordPayment = (invoiceId, amount, method, refNo) => {
    const inv = invoices.find(i => i.id === invoiceId || i.invoice_number === invoiceId || i.job_ticket_number === invoiceId);
    if (!inv) return;

    const receipt = {
      id: `rec-${Date.now()}`,
      invoice_id: invoiceId,
      invoice_number: inv.invoice_number,
      customer_name: inv.customer_name,
      amount_paid: Number(amount),
      payment_method: method,
      transaction_ref: refNo || `TXN-${Date.now().toString().slice(-6)}`,
      payment_date: new Date().toISOString(),
      receipt_type: 'Settlement Receipt',
    };
    setPaymentReceipts(prev => [receipt, ...prev]);

    // Update invoice balance
    setInvoices(prev => prev.map(i => {
      if (i.id !== invoiceId && i.invoice_number !== invoiceId && i.id !== inv.id) return i;
      const newBal = Math.max(0, i.balance_due - Number(amount));
      const status = newBal <= 0 ? 'Paid' : 'Partial';
      return {
        ...i,
        balance_due: newBal,
        payment_status: status,
      };
    }));

    // Update jobOrders balance_due
    setJobOrders(prev => prev.map(j => {
      if (j.id === inv.job_order_id || j.job_ticket_number === inv.job_ticket_number) {
        const newBal = Math.max(0, (j.balance_due || 0) - Number(amount));
        return {
          ...j,
          balance_due: newBal,
        };
      }
      return j;
    }));

    // Update routeJobs COD amount
    setRouteJobs(prev => prev.map(r => {
      if (r.job_no === inv.job_ticket_number || r.id === inv.job_order_id) {
        const newBal = Math.max(0, (r.cod_amount || 0) - Number(amount));
        return {
          ...r,
          cod_amount: newBal,
        };
      }
      return r;
    }));

    // Update customer CRM balance
    setCustomers(custPrev => custPrev.map(c => {
      if (c.id === inv.customer_id) {
        return {
          ...c,
          current_balance: Math.max(0, c.current_balance - Number(amount)),
        };
      }
      return c;
    }));

    addAlert({
      alert_type: 'PaymentAlert',
      severity: 'Info',
      message: `[PAYMENT RECEIVED] Rs ${Number(amount).toLocaleString()} collected for Invoice ${inv.invoice_number}.`,
    });
  };

  const recordPaymentForJob = (jobId, amount, method, refNo) => {
    const inv = invoices.find(i => i.job_order_id === jobId);
    if (inv) {
      recordPayment(inv.id, amount, method, refNo);
    } else {
      const job = jobOrders.find(j => j.id === jobId);
      const receipt = {
        id: `rec-${Date.now()}`,
        invoice_id: `job-${jobId}`,
        invoice_number: job?.job_ticket_number || 'Direct Payment',
        customer_name: job?.customer_name || 'Walk-in Customer',
        amount_paid: Number(amount),
        payment_method: method,
        transaction_ref: refNo || `PAY-${Date.now().toString().slice(-6)}`,
        payment_date: new Date().toISOString(),
        receipt_type: 'Direct Settlement',
      };
      setPaymentReceipts(prev => [receipt, ...prev]);
    }
  };

  const recordBookingAdvance = (bookingId, amount, paymentMethod = 'UPI', transactionRef = '', paymentNotes = '') => {
    const targetBooking = salesBookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    const adv = (amount !== undefined && amount !== null && !isNaN(Number(amount)) && Number(amount) > 0)
      ? Number(amount)
      : (targetBooking.advance_required || 0);

    const bookedOrder = {
      ...targetBooking,
      advance_received: adv,
      balance_pending: Math.max(0, targetBooking.order_total - adv),
      booking_status: 'Booked',
      production_release: true,
      payment_mode: paymentMethod,
      transaction_ref: transactionRef,
      payment_notes: paymentNotes
    };

    setSalesBookings(prev => prev.map(b => b.id === bookingId ? bookedOrder : b));

    // 1. Move job to Pre-Press window (prepressJobs)
    const matchedEnq = enquiries.find(e =>
      e.id === bookedOrder.enquiry_id ||
      e.enquiry_no === bookedOrder.enquiry_id ||
      (bookedOrder.customer_po_ref && e.dn_no && `DN-${e.dn_no}` === bookedOrder.customer_po_ref) ||
      (bookedOrder.customer_po_ref && (e.enquiry_no === bookedOrder.customer_po_ref || e.id === bookedOrder.customer_po_ref)) ||
      (bookedOrder.customer_name && e.customer_name === bookedOrder.customer_name)
    );
    const resolvedDesigner = (bookedOrder.prepress && bookedOrder.prepress !== '-' && bookedOrder.prepress !== 'Unassigned')
      ? bookedOrder.prepress
      : (matchedEnq?.prepress && matchedEnq.prepress !== '-' ? matchedEnq.prepress : 'Aruna');

    const resolvedMachine = bookedOrder.assigned_press_machine ||
      bookedOrder.target_machine ||
      matchedEnq?.assigned_press_machine ||
      matchedEnq?.target_machine ||
      resolveDefaultPressMachine({ ...bookedOrder, ...matchedEnq });

    const existingPrep = prepressJobs.find(p => p.job_ticket_number === bookedOrder.booking_number);
    if (!existingPrep) {
      addPrepressJob({
        job_ticket_number: bookedOrder.booking_number,
        customer_name: bookedOrder.customer_name,
        job_title: bookedOrder.job_title || `${bookedOrder.customer_name} Commercial Order`,
        artwork_type: 'Party File with Editing',
        assigned_designer: resolvedDesigner,
        revision_count: 1,
        current_version: 'V1',
        proof_shared_channel: bookedOrder.confirmation_channel || 'WhatsApp',
        proof_shared_date: new Date().toISOString().split('T')[0],
        customer_approval_status: 'PendingReview',
        production_release_authorized: false,
        ctp_plates_generated: 4,
        assigned_press_machine: resolvedMachine,
        notes: `Released from Commercial Desk with Advance Payment (${paymentMethod}: ${transactionRef || 'Recorded'})`
      });
    } else {
      updatePrepressJob(existingPrep.id, {
        assigned_designer: resolvedDesigner,
        assigned_press_machine: existingPrep.assigned_press_machine || resolvedMachine
      });
    }

    // 2. Add or update job in jobOrders with current_stage: 'Pre-Press'
    const isRush = (bookedOrder.is_rush_order === true) ||
                   (bookedOrder.priority === 'Urgent') ||
                   (matchedEnq?.priority === 'Urgent') ||
                   (matchedEnq?.is_rush_order === true);
    const orderPriority = isRush ? 'Urgent' : (bookedOrder.priority || matchedEnq?.priority || 'Normal');
    const queuePos = isRush ? 1 : (jobOrders.length + 1);

    const existingJob = jobOrders.find(j => j.job_ticket_number === bookedOrder.booking_number);
    if (!existingJob) {
      const newJob = {
        id: `job-${Date.now()}`,
        job_ticket_number: bookedOrder.booking_number,
        quote_id: bookedOrder.quote_id || `q-${Date.now()}`,
        customer_id: bookedOrder.customer_id || 'cust-generic',
        customer_name: bookedOrder.customer_name,
        job_title: bookedOrder.job_title || `${bookedOrder.customer_name} Commercial Order`,
        production_type: 'Offset',
        print_quantity: bookedOrder.print_quantity || matchedEnq?.quantity || 5000,
        paper_details: bookedOrder.paper_details || matchedEnq?.paper_spec || '300 GSM Art Card (20" x 30")',
        color_spec: bookedOrder.color_spec || matchedEnq?.color_spec || '4/4 Front & Back (Process CMYK)',
        finishing_spec: bookedOrder.finishing_spec || matchedEnq?.finishing_requirements || 'Thermal Matte Lamination, Die-Punch & Pasting',
        current_stage: STAGES.PREPRESS,
        priority: orderPriority,
        is_rush_order: isRush,
        queue_position: queuePos,
        total_cost: bookedOrder.order_total,
        balance_due: bookedOrder.balance_pending,
        advance_paid: adv,
        assigned_press_machine: resolvedMachine,
        created_at: new Date().toISOString(),
        target_completion_date: new Date(Date.now() + 86400000 * 2).toISOString()
      };
      setJobOrders(prev => [newJob, ...prev]);
    } else {
      setJobOrders(prev => prev.map(j => j.job_ticket_number === bookedOrder.booking_number ? {
        ...j,
        current_stage: STAGES.PREPRESS,
        priority: orderPriority,
        is_rush_order: isRush,
        advance_paid: adv,
        balance_due: bookedOrder.balance_pending,
        assigned_press_machine: j.assigned_press_machine || resolvedMachine
      } : j));
    }

    // 3. Record a payment receipt for the advance if paid
    if (adv > 0) {
      const receipt = {
        id: `rec-${Date.now()}`,
        invoice_id: bookedOrder.booking_number,
        receipt_number: `REC-ADV-${Date.now().toString().slice(-6)}`,
        customer_name: bookedOrder.customer_name,
        amount_paid: adv,
        payment_method: paymentMethod || 'UPI',
        transaction_ref: transactionRef || `${paymentMethod}-${Date.now().toString().slice(-6)}`,
        payment_date: new Date().toISOString(),
        receipt_type: 'Booking Advance',
        notes: paymentNotes || ''
      };
      setPaymentReceipts(prev => [receipt, ...prev]);
    }

    addAlert({
      alert_type: 'CommercialAlert',
      severity: 'Success',
      message: `[ORDER BOOKED] ${bookedOrder.booking_number} (${bookedOrder.customer_name}) booked & released. Job moved to Pre-Press!`,
    });

    // 4. Update status & stage in Commercial Desk enquiries view
    setEnquiries(prev => prev.map(e => {
      const isMatch = (bookedOrder.enquiry_id && e.id === bookedOrder.enquiry_id) ||
        (bookedOrder.booking_number && e.dn_no && `SO-2026-${e.dn_no}` === bookedOrder.booking_number) ||
        (bookedOrder.booking_number && (e.id === bookedOrder.booking_number || `SO-2026-${e.id.replace(/\D/g, '')}` === bookedOrder.booking_number)) ||
        (bookedOrder.customer_name && e.customer_name?.toLowerCase().trim() === bookedOrder.customer_name?.toLowerCase().trim());
      if (isMatch) {
        return {
          ...e,
          advance: (Number(e.advance) || 0) + adv,
          payment_mode: paymentMethod,
          transaction_ref: transactionRef,
          current_stage: STAGES.PREPRESS,
          status: 'Booked'
        };
      }
      return e;
    }));
  };

  // 11. Customer Feedback & Closure
  const recordFeedback = (jobTicketNumber, customerName, stars, notes) => {
    const newFb = {
      id: `fb-${Date.now()}`,
      job_ticket_number: jobTicketNumber,
      customer_name: customerName,
      rating_stars: Number(stars),
      feedback_notes: notes,
      created_at: new Date().toISOString(),
    };
    setFeedbackList(prev => [newFb, ...prev]);

    // Mark job as completed
    setJobOrders(prev => prev.map(j => j.job_ticket_number === jobTicketNumber ? {
      ...j,
      current_stage: 'Completed'
    } : j));

    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Info',
      message: `[CSAT FEEDBACK RECORDED] ${stars} Stars for Job ${jobTicketNumber}. Order formally closed.`,
    });
  };

  // 12. Tasks & Alerts
  const toggleTask = (taskId) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !t.is_completed } : t));
  };

  const addTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      assigned_to_user_id: activeUser.id,
      assigned_to_name: activeUser.full_name,
      is_completed: false,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addAlert = (alertData) => {
    const newAlt = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      is_read: false,
    };
    setAlerts(prev => [newAlt, ...prev]);
  };

  const markAlertRead = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
  };

  const clearAllAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  // Reset demo data
  const resetToDefaultData = () => {
    localStorage.clear();
    setCustomers(INITIAL_CUSTOMERS);
    setInventory(INITIAL_INVENTORY);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setQuotes(INITIAL_QUOTES);
    setDesignProofs(INITIAL_DESIGN_PROOFS);
    setJobOrders(INITIAL_JOB_ORDERS);
    setWorkstationLogs(INITIAL_WORKSTATION_LOGS);
    setMaterialReservations(INITIAL_MATERIAL_RESERVATIONS);
    setIssues(INITIAL_ISSUES);
    setDispatchRecords(INITIAL_DISPATCH);
    setInvoices(INITIAL_INVOICES);
    setPaymentReceipts(INITIAL_PAYMENT_RECEIPTS);
    setFeedbackList(INITIAL_CUSTOMER_FEEDBACK);
    setTasks(INITIAL_TASKS);
    setAlerts(INITIAL_ALERTS);
    setMachines(INITIAL_MACHINES);
    setEnquiries(INITIAL_ENQUIRIES);
    setDispatchRoutes(INITIAL_DISPATCH_ROUTES);
    setRouteJobs(INITIAL_ROUTE_JOBS);
    setVehicles(INITIAL_VEHICLES);
    setTripSheets(INITIAL_TRIP_SHEETS);
    setOwnerMetrics(INITIAL_OWNER_METRICS);
    setCostingRequests(INITIAL_COSTING_REQUESTS);
    setSalesBookings(INITIAL_SALES_BOOKINGS);
    setPrepressJobs(INITIAL_PREPRESS_JOBS);
    setFinishingOps(INITIAL_FINISHING_OPS);
    setAssociates(INITIAL_ASSOCIATES);
    setOutsourceChallans(INITIAL_OUTSOURCE_CHALLANS);
    setExcessStock(INITIAL_EXCESS_STOCK);
    setCustomerRejections(INITIAL_CUSTOMER_REJECTIONS);
    setNotificationsLog(INITIAL_NOTIFICATIONS_LOG);
    setMasterData(INITIAL_MASTER_DATA);
    setSelectedDate(getTodayFormattedDate());
    setIsManualDate(false);
    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Info',
      message: '[DATABASE RESTORED] Impress MIS demo database restored to default factory state.',
    });
  };

  // Clear all current jobs in all stages and start fresh
  const clearAllPipelineJobs = () => {
    setEnquiries([]);
    setCostingRequests([]);
    setQuotes([]);
    setSalesBookings([]);
    setPrepressJobs([]);
    setDesignProofs([]);
    setJobOrders([]);
    setWorkstationLogs([]);
    setMaterialReservations([]);
    setFinishingOps([]);
    setIssues([]);
    setDispatchRecords([]);
    setRouteJobs([]);
    setTripSheets([]);
    setInvoices([]);
    setPaymentReceipts([]);
    setFeedbackList([]);
    setCustomerRejections([]);
    setExcessStock([]);
    setOutsourceChallans([]);
    setPurchaseRequests([]);
    setTasks([]);
    setNotificationsLog([]);
    setAlerts([]);

    const pipelineKeys = [
      'enquiries', 'costing', 'quotes', 'sales_bookings', 'prepress_jobs',
      'proofs', 'jobs', 'logs', 'reservations', 'finishing_ops',
      'issues', 'dispatch', 'route_jobs', 'trip_sheets', 'invoices',
      'receipts', 'feedback', 'customer_rejections', 'excess_stock',
      'outsource_challans', 'po', 'tasks', 'notifications_log', 'alerts'
    ];
    pipelineKeys.forEach(k => {
      localStorage.setItem(`${STORAGE_KEY}_${k}`, JSON.stringify([]));
    });

    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Info',
      message: '[FRESH PIPELINE] All jobs across all stages cleared. Ready for fresh test run.'
    });
  };

  // One-time automatic clean pipeline initialization
  useEffect(() => {
    const isCleaned = localStorage.getItem(`${STORAGE_KEY}_fresh_pipeline_v1`);
    if (!isCleaned) {
      clearAllPipelineJobs();
      localStorage.setItem(`${STORAGE_KEY}_fresh_pipeline_v1`, 'true');
    }
  }, []);

  // Central Authoritative Rush Status Resolver
  const resolveJobRushStatus = (entity) => {
    if (!entity) return false;
    if (entity.job_ticket_number === 'JT-2026-001') return true;
    if (entity.is_rush_order === true || entity.priority === 'Urgent') return true;

    const matchedEnq = enquiries.find(e =>
      e.enquiry_no === entity.job_ticket_number ||
      e.id === entity.job_ticket_number ||
      (e.dn_no && `SO-2026-${e.dn_no}` === entity.job_ticket_number) ||
      (entity.customer_name && e.customer_name?.toLowerCase().trim() === entity.customer_name?.toLowerCase().trim())
    );
    if (matchedEnq?.priority === 'Urgent' || matchedEnq?.is_rush_order === true) return true;

    const matchedBooking = salesBookings.find(b =>
      b.booking_number === entity.job_ticket_number ||
      (entity.customer_name && b.customer_name?.toLowerCase().trim() === entity.customer_name?.toLowerCase().trim())
    );
    if (matchedBooking?.priority === 'Urgent' || matchedBooking?.is_rush_order === true) return true;

    const matchedJob = jobOrders.find(j => j.job_ticket_number === entity.job_ticket_number);
    if (matchedJob?.priority === 'Urgent' || matchedJob?.is_rush_order === true) return true;

    return false;
  };

  return (
    <AppContext.Provider
      value={{
        resolveJobRushStatus,
        activeUser,
        switchUser,
        activeTab,
        setActiveTab,
        roles: INITIAL_ROLES,
        users: INITIAL_USERS,
        customers,
        addCustomer,
        inventory,
        setInventory,
        deductPaperInventory,
        purchaseRequests,
        createPurchaseRequest,
        receivePurchaseOrder,
        transferStock,
        quotes,
        createQuote,
        approveQuoteAndBookOrder,
        designProofs,
        updateDesignProof,
        jobOrders,
        setJobOrders,
        updateJobOrder,
        addJobComment,
        bumpJobToTop,
        advanceJobStage,
        workstationLogs,
        materialReservations,
        issues,
        reportIssue,
        resolveIssue,
        dispatchRecords,
        createDispatchRecord,
        invoices,
        generateInvoiceForJob,
        paymentReceipts,
        recordPayment,
        recordPaymentForJob,
        feedbackList,
        recordFeedback,
        tasks,
        toggleTask,
        addTask,
        alerts,
        addAlert,
        markAlertRead,
        clearAllAlerts,
        machines,
        enquiries,
        addEnquiry,
        updateEnquiry,
        toggleStarEnquiry,
        resetToDefaultData,
        clearAllPipelineJobs,
        selectedJobForModal,
        setSelectedJobForModal,
        selectedInvoiceForModal,
        setSelectedInvoiceForModal,
        selectedQuoteForModal,
        setSelectedQuoteForModal,
        qrModalData,
        setQrModalData,
        // PDF 18 Modules & Planned Screens States
        dispatchRoutes,
        routeJobs,
        updateRouteJob,
        vehicles,
        tripSheets,
        createTripSheet,
        updateJobDeliveryStatus,
        completeTripSheet,
        selectedTripSheetForModal,
        setSelectedTripSheetForModal,
        ownerMetrics,
        costingRequests,
        addCostingRequest,
        updateCostingRequest,
        salesBookings,
        addSalesBooking,
        updateSalesBooking,
        recordBookingAdvance,
        prepressJobs,
        addPrepressJob,
        updatePrepressJob,
        finishingOps,
        addFinishingOp,
        updateFinishingOp,
        associates,
        outsourceChallans,
        addOutsourceChallan,
        updateOutsourceChallan,
        excessStock,
        addExcessStock,
        customerRejections,
        addCustomerRejection,
        updateCustomerRejection,
        notificationsLog,
        addNotificationLog,
        masterData,
        updateMasterData,
        controlGates,
        isControlGatesModalOpen,
        setIsControlGatesModalOpen,
        isMasterEnquiryModalOpen,
        setIsMasterEnquiryModalOpen,
        selectedDate,
        setSelectedDate: handleSetSelectedDate,
        selectedSourceFilter,
        setSelectedSourceFilter,
        activeBranch,
        setActiveBranch,
        activeSubTab,
        setActiveSubTab,
        navigateToTab,
        estimatorViewMode,
        setEstimatorViewMode,
        // QC Flag Module Integration
        isQCFlagModalOpen,
        setIsQCFlagModalOpen,
        qcFlagModalJob,
        setQcFlagModalJob,
        qcFlagSourceTerminal,
        setQcFlagSourceTerminal,
        openQCFlagModal,
        closeQCFlagModal,
        raiseQCFlag,
        markQCFlagFixed,
        sendBackJobFromQC,
        rewindJobStage,
        // Canonical Stage Constants & Normalization
        STAGES,
        CANONICAL_STAGES,
        STAGE_CONFIG,
        STAGE_DROPDOWN_OPTIONS,
        normalizeStage,
        getNextStage,
        getPrevStage,
        getStageDisplay,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
