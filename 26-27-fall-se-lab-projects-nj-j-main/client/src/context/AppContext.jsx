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

const AppContext = createContext(null);

const STORAGE_KEY = 'PRINTFLOW_ERP_STATE_V1';

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
      case 'finishing_qc':
      case 'finishing':
        return 'bindery';
      case 'associates':
        return 'outsourced';
      case 'qc_packing':
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
        return 'executive_oee';
      case 'notifications':
        return 'notifications';
      case 'config':
        return 'config';
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
    else if (tabId === 'finishing') { targetTab = 'finishing_qc'; targetSubTab = 'bindery'; }
    else if (tabId === 'associates') { targetTab = 'finishing_qc'; targetSubTab = 'outsourced'; }
    else if (tabId === 'qc_packing') { targetTab = 'finishing_qc'; targetSubTab = 'qc_inspection'; }
    else if (tabId === 'procurement') { targetTab = 'inventory'; targetSubTab = 'purchase_orders'; }
    else if (tabId === 'rejections') { targetTab = 'dispatch'; targetSubTab = 'returns'; }
    else if (tabId === 'owner_dashboard' || tabId === 'dashboard') { targetTab = 'admin_analytics'; targetSubTab = 'executive_oee'; }
    else if (tabId === 'notifications') { targetTab = 'admin_analytics'; targetSubTab = 'notifications'; }
    else if (tabId === 'config') { targetTab = 'admin_analytics'; targetSubTab = 'config'; }
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
    else if (tabId === 'finishing') { targetTab = 'finishing_qc'; if (!targetSubTab) targetSubTab = 'bindery'; }
    else if (tabId === 'associates') { targetTab = 'finishing_qc'; if (!targetSubTab) targetSubTab = 'outsourced'; }
    else if (tabId === 'qc_packing') { targetTab = 'finishing_qc'; if (!targetSubTab) targetSubTab = 'qc_inspection'; }
    else if (tabId === 'procurement') { targetTab = 'inventory'; if (!targetSubTab) targetSubTab = 'purchase_orders'; }
    else if (tabId === 'rejections') { targetTab = 'dispatch'; if (!targetSubTab) targetSubTab = 'returns'; }
    else if (tabId === 'owner_dashboard' || tabId === 'dashboard') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'executive_oee'; }
    else if (tabId === 'notifications') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'notifications'; }
    else if (tabId === 'config') { targetTab = 'admin_analytics'; if (!targetSubTab) targetSubTab = 'config'; }

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
    return saved ? JSON.parse(saved) : INITIAL_JOB_ORDERS;
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
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = INITIAL_ENQUIRIES.filter(ie => !existingIds.has(ie.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
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
  const [selectedDate, setSelectedDate] = useState('03-06-2025');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('All Sources');
  const [activeBranch, setActiveBranch] = useState('Plant #01 • Kalkere');

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

  const addSalesBooking = (bookingData) => {
    const newBooking = {
      ...bookingData,
      id: `sb-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setSalesBookings(prev => [newBooking, ...prev]);
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
  };

  const createTripSheet = (tripData) => {
    const newTrip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      trip_number: `TS-2026-0${tripSheets.length + 43}`,
      created_at: new Date().toISOString()
    };
    setTripSheets(prev => [newTrip, ...prev]);
    // Mark assigned route jobs as in-transit
    if (tripData.selected_job_ids?.length) {
      setRouteJobs(prev => prev.map(j => {
        if (tripData.selected_job_ids.includes(j.job_no)) {
          return { ...j, status: 'In-Transit', ack_status: 'Dispatched' };
        }
        return j;
      }));
    }
    return newTrip;
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
      assigned_press_machine: 'Heidelberg Speedmaster SM 74 (4-Color)',
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
    setJobOrders(prev => prev.map(job => job.id === jobId ? { ...job, ...updates } : job));
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
    const numHours = Number(hoursWorked) || 0;
    const cleanNotes = (notes || '').trim();

    setJobOrders(prev => prev.map(job => {
      if (job.id !== jobId) return job;

      const currentTotalHours = (job.total_hours_worked || 0) + numHours;
      const newCommentObj = cleanNotes ? {
        id: `com-${Date.now()}`,
        text: cleanNotes,
        author: activeUser.full_name,
        hours_logged: numHours,
        stage: nextStage,
        timestamp: new Date().toISOString()
      } : null;
      const updatedComments = newCommentObj ? [...(job.comments || []), newCommentObj] : (job.comments || []);

      // When advancing into PressRun, trigger Phase 2 Material Deduction
      if (nextStage === 'PressRun') {
        setMaterialReservations(resPrev => resPrev.map(res => {
          if (res.job_order_id === jobId && !res.is_deducted) {
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
        current_stage: nextStage,
        total_hours_worked: currentTotalHours,
        comments: updatedComments,
        last_comment: cleanNotes || job.last_comment,
        last_note: cleanNotes || job.last_note || job.notes,
        notes: cleanNotes || job.notes,
      };
    }));

    // Add workstation log
    const targetJob = jobOrders.find(j => j.id === jobId);
    if (targetJob) {
      const newLog = {
        id: `log-${Date.now()}`,
        job_order_id: jobId,
        job_ticket_number: targetJob.job_ticket_number,
        operator_user_id: activeUser.id,
        operator_name: activeUser.full_name,
        workstation_stage: nextStage,
        machine_name: targetJob.assigned_press_machine,
        started_at: new Date().toISOString(),
        completed_at: nextStage === 'Completed' ? new Date().toISOString() : null,
        good_impressions: targetJob.print_quantity,
        waste_sheets_logged: nextStage === 'PressRun' ? 30 : 5,
        hours_worked: numHours,
        operator_notes: notes || `Advanced to ${nextStage} by ${activeUser.full_name}`,
      };
      setWorkstationLogs(prev => [newLog, ...prev]);

      addAlert({
        alert_type: 'TaskAlert',
        severity: 'Info',
        message: `Stage Progression: Job ${targetJob.job_ticket_number} moved to [${nextStage}] stage.${numHours > 0 ? ` (${numHours} hrs logged)` : ''}`,
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

      // If approved, advance corresponding job to PlateMaking
      if (status === 'Approved') {
        const job = jobOrders.find(j => j.job_ticket_number === p.job_ticket_number);
        if (job) {
          advanceJobStage(job.id, 'PlateMaking', 'Design proof signed off. Ready for CTP.');
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
      reported_by_name: activeUser.full_name,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    setIssues(prev => [newIssue, ...prev]);

    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Warning',
      message: `[QUALITY ISSUE LOGGED] [${newIssue.issue_type}] on Job ${newIssue.job_ticket_number}.`,
    });
  };

  const resolveIssue = (issueId) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, resolved: true } : i));
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
    const inv = invoices.find(i => i.id === invoiceId);
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
      if (i.id !== invoiceId) return i;
      const newBal = Math.max(0, i.balance_due - Number(amount));
      const status = newBal <= 0 ? 'Paid' : 'Partial';
      return {
        ...i,
        balance_due: newBal,
        payment_status: status,
      };
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
    addAlert({
      alert_type: 'TaskAlert',
      severity: 'Info',
      message: '[DATABASE RESTORED] Impress MIS demo database restored to default factory state.',
    });
  };

  return (
    <AppContext.Provider
      value={{
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
        selectedTripSheetForModal,
        setSelectedTripSheetForModal,
        ownerMetrics,
        costingRequests,
        addCostingRequest,
        updateCostingRequest,
        salesBookings,
        addSalesBooking,
        updateSalesBooking,
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
        setSelectedDate,
        selectedSourceFilter,
        setSelectedSourceFilter,
        activeBranch,
        setActiveBranch,
        activeSubTab,
        setActiveSubTab,
        navigateToTab,
        estimatorViewMode,
        setEstimatorViewMode,
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
