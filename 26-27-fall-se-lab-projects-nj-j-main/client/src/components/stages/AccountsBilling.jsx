import React, { useState } from 'react';
import {
  Receipt,
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Search,
  Eye,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AccountsBilling = () => {
  const {
    invoices,
    paymentReceipts,
    recordPayment,
    setSelectedInvoiceForModal,
    setQrModalData,
    setActiveTab,
    activeSubTab,
    setActiveSubTab,
    jobOrders
  } = useApp();

  // Document Type Filter: 'invoices' (GST Invoicing) or 'receipts' (Receipts & Advances)
  const [docTypeFilter, setDocTypeFilter] = useState('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedReceiptFilter, setSelectedReceiptFilter] = useState('All');

  // Merge active job orders into invoices to ensure every booked / production / dispatched order with an advance or due balance is immediately represented
  const mergedInvoices = React.useMemo(() => {
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
        const taxable = Math.round(grandTotal / 1.12);
        const cgst = Math.round((grandTotal - taxable) / 2);
        const sgst = grandTotal - taxable - cgst;
        const invNumber = `INV-2026-${String(891 + (invoices || []).length + idx).padStart(4, '0')}`;

        extraInvoices.push({
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
        });
      }
    });

    return [...extraInvoices, ...(invoices || [])];
  }, [invoices, jobOrders]);

  const totalInvoiced = mergedInvoices.reduce((sum, i) => sum + (i.grand_total || 0), 0);
  const totalCollected = paymentReceipts.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
  const totalOutstanding = mergedInvoices.reduce((sum, i) => sum + (i.balance_due || 0), 0);

  // Filtered Invoices
  const filteredInvoices = mergedInvoices.filter(inv => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.job_ticket_number?.toLowerCase().includes(q);

    if (selectedStatusFilter === 'AR Aging') {
      return matchesSearch && (inv.balance_due || 0) > 0;
    }
    const matchesStatus = selectedStatusFilter === 'All' || inv.payment_status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Receipts
  const filteredReceipts = paymentReceipts.filter(rec => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      rec.customer_name?.toLowerCase().includes(q) ||
      rec.invoice_number?.toLowerCase().includes(q) ||
      rec.transaction_ref?.toLowerCase().includes(q) ||
      rec.payment_method?.toLowerCase().includes(q) ||
      rec.receipt_type?.toLowerCase().includes(q) ||
      (rec.receipt_number && rec.receipt_number.toLowerCase().includes(q)) ||
      rec.id?.toLowerCase().includes(q);

    if (selectedReceiptFilter === 'All') return matchesSearch;
    if (selectedReceiptFilter === 'Booking Advance') {
      return matchesSearch && rec.receipt_type === 'Booking Advance';
    }
    if (selectedReceiptFilter === 'Settlement Receipt') {
      return matchesSearch && (rec.receipt_type === 'Settlement Receipt' || rec.receipt_type === 'Direct Settlement');
    }
    return matchesSearch;
  });

  const handleOpenPayModal = (inv) => {
    setQrModalData({
      amount: inv.balance_due,
      title: 'Record Payment',
      orderNumber: inv.invoice_number,
      invoiceId: inv.id,
      customerName: inv.customer_name,
      jobTitle: inv.hsn_code,
      orderTotal: inv.grand_total,
    });
  };

  const pendingInvoicesCount = mergedInvoices.filter(i => i.payment_status !== 'Paid').length;

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header - Sub-tab menus moved to filter bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              09
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Finance & Billing</h1>
              <p className="text-[11px] text-slate-500 font-medium">GST tax invoicing, payment receipts & accounts receivable ledger</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stage-page-container">
        {/* AR Aging Breakdown Card */}
        {selectedStatusFilter === 'AR Aging' && docTypeFilter === 'invoices' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-slate-800 uppercase font-mono">
                Accounts Receivable Aging Analysis
              </h3>
              <span className="font-mono text-xs font-bold text-rose-600">
                Total Outstanding: ₹{totalOutstanding.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase">Current (0 - 15 Days)</div>
                <div className="text-base font-bold text-emerald-900 mt-1">₹42,500</div>
                <div className="text-[10px] text-emerald-600 mt-0.5">3 Corporate Accounts</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-[10px] font-mono text-blue-700 font-bold uppercase">16 - 30 Days</div>
                <div className="text-base font-bold text-blue-900 mt-1">₹18,200</div>
                <div className="text-[10px] text-blue-600 mt-0.5">2 Reseller Accounts</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] font-mono text-amber-800 font-bold uppercase">31 - 60 Days</div>
                <div className="text-base font-bold text-amber-900 mt-1">₹6,800</div>
                <div className="text-[10px] text-amber-700 mt-0.5">1 Retail Account</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-[10px] font-mono text-rose-700 font-bold uppercase">60+ Days (Overdue)</div>
                <div className="text-base font-bold text-rose-900 mt-1">₹0</div>
                <div className="text-[10px] text-rose-600 mt-0.5">0 Defaulters</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Financial Metrics */}
        <div className="kpi-metrics-grid">
          <div
            className={`kpi-card cursor-pointer transition ${docTypeFilter === 'invoices' ? 'ring-2 ring-blue-500/20 border-blue-400' : ''}`}
            onClick={() => {
              setDocTypeFilter('invoices');
              setSelectedStatusFilter('All');
            }}
            title="Click to view GST Invoices"
          >
            <div className="kpi-icon-box bg-blue-light text-primary">
              <Receipt size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Invoiced Billed</span>
              <div className="kpi-value">₹{totalInvoiced.toLocaleString()}</div>
              <span className="kpi-sub text-muted">{mergedInvoices.length} Invoices Issued</span>
            </div>
          </div>

          <div
            className={`kpi-card cursor-pointer transition ${docTypeFilter === 'receipts' ? 'ring-2 ring-emerald-500/20 border-emerald-400' : ''}`}
            onClick={() => {
              setDocTypeFilter('receipts');
              setSelectedReceiptFilter('All');
            }}
            title="Click to view Receipts & Advances"
          >
            <div className="kpi-icon-box bg-emerald-light text-success">
              <CheckCircle2 size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Collections Received</span>
              <div className="kpi-value text-success">₹{totalCollected.toLocaleString()}</div>
              <span className="kpi-sub text-success font-medium">{paymentReceipts.length} Receipts Logged</span>
            </div>
          </div>

          <div
            className="kpi-card cursor-pointer transition"
            onClick={() => {
              setDocTypeFilter('invoices');
              setSelectedStatusFilter(prev => prev === 'AR Aging' ? 'All' : 'AR Aging');
            }}
            title="Click to toggle AR Aging breakdown"
          >
            <div className="kpi-icon-box bg-amber-light text-warning">
              <Clock size={22} />
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Outstanding Receivables</span>
              <div className="kpi-value text-warning">₹{totalOutstanding.toLocaleString()}</div>
              <span className="kpi-sub text-muted">Aging in 0-30 Days bracket</span>
            </div>
          </div>
        </div>

        {/* Main Table Card (Invoices or Receipts) */}
        <div className="card w-full">
            <div className="card-header flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="card-title flex items-center gap-2">
                  {docTypeFilter === 'receipts' ? (
                    <>
                      <CheckCircle2 size={18} className="text-success" />
                      <span>Payment Receipts & Advances Ledger</span>
                    </>
                  ) : (
                    <>
                      <Receipt size={18} className="text-primary" />
                      <span>Tax Invoices Ledger</span>
                    </>
                  )}
                </h3>

                {/* Secondary Category Pills */}
                <div className="category-filter-pills">
                  {docTypeFilter === 'invoices' ? (
                    ['All', 'Paid', 'Partial', 'Unpaid', 'AR Aging'].map(status => (
                      <button
                        key={status}
                        className={`cat-pill ${selectedStatusFilter === status ? 'active' : ''}`}
                        onClick={() => setSelectedStatusFilter(status)}
                      >
                        {status}
                      </button>
                    ))
                  ) : (
                    ['All', 'Booking Advance', 'Settlement Receipt'].map(type => (
                      <button
                        key={type}
                        className={`cat-pill ${selectedReceiptFilter === type ? 'active' : ''}`}
                        onClick={() => setSelectedReceiptFilter(type)}
                      >
                        {type}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right: Filter Menus placed beside Search Invoice */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Filter Selector (Moved from Top Header) */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setDocTypeFilter('invoices');
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      docTypeFilter === 'invoices'
                        ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Receipt size={14} className={docTypeFilter === 'invoices' ? 'text-blue-600' : 'text-slate-500'} />
                    <span>GST Invoicing (HSN 49111010)</span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold bg-blue-100 text-blue-700">
                      {mergedInvoices.length} Invoices
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDocTypeFilter('receipts');
                      setSearchQuery('');
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      docTypeFilter === 'receipts'
                        ? 'bg-white text-[#001523] font-bold shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <CheckCircle2 size={14} className={docTypeFilter === 'receipts' ? 'text-emerald-600' : 'text-slate-500'} />
                    <span>Receipts & Advances</span>
                    <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {paymentReceipts.length} Receipts
                    </span>
                  </button>
                </div>

                {/* Search Invoice Input */}
                <div className="search-input-box">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder={docTypeFilter === 'receipts' ? "Search receipt or customer..." : "Search invoice or customer..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* View 1: Invoices Ledger Table */}
            {docTypeFilter === 'invoices' && (
              <div className="table-responsive">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th>Invoice No & Date</th>
                      <th>Customer & Job Ref</th>
                      <th className="text-right">Grand Total</th>
                      <th className="text-right">Advance Paid</th>
                      <th className="text-right">Balance Due</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <Receipt size={24} className="text-slate-400" />
                            <span className="font-semibold text-slate-700">No Invoices Found</span>
                            <span className="text-xxs text-slate-400">Try adjusting your search query or status filter</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map(inv => {
                        const isPaid = inv.payment_status === 'Paid';
                        const hasRush = inv.rush_fee_amount > 0;

                        return (
                          <tr key={inv.id}>
                            <td>
                              <div className="font-bold text-sm text-primary">{inv.invoice_number}</div>
                              <span className="text-xxs text-muted">{new Date(inv.issued_at).toLocaleDateString()}</span>
                              {hasRush && <span className="badge badge-danger text-xxxs ml-1">[RUSH FEE]</span>}
                            </td>
                            <td>
                              <div className="font-semibold text-xs">{inv.customer_name}</div>
                              <span className="ticket-tag text-xxs font-bold">{inv.job_ticket_number}</span>
                            </td>
                            <td className="text-right font-bold text-xs">
                              ₹{inv.grand_total?.toLocaleString()}
                            </td>
                            <td className="text-right text-xs text-success font-medium">
                              ₹{inv.advance_paid?.toLocaleString()}
                            </td>
                            <td className="text-right text-xs font-bold text-danger">
                              ₹{inv.balance_due?.toLocaleString()}
                            </td>
                            <td>
                              <span className={`status-pill status-${inv.payment_status?.toLowerCase()}`}>
                                {inv.payment_status}
                              </span>
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  className="btn btn-xs btn-secondary"
                                  onClick={() => setSelectedInvoiceForModal(inv)}
                                  title="View & Print GST Invoice"
                                >
                                  <Eye size={12} />
                                </button>
                                {!isPaid && (
                                  <button
                                    className="btn btn-xs btn-success"
                                    onClick={() => handleOpenPayModal(inv)}
                                    title="Record Payment Intake"
                                  >
                                    + Pay
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
            )}

            {/* View 2: Receipts & Advances Ledger Table */}
            {docTypeFilter === 'receipts' && (
              <div className="table-responsive">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th>Receipt Ref & Date</th>
                      <th>Customer & Reference</th>
                      <th>Receipt Type</th>
                      <th>Payment Mode</th>
                      <th>Txn ID / Ref</th>
                      <th className="text-right">Amount Received</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <CheckCircle2 size={24} className="text-slate-400" />
                            <span className="font-semibold text-slate-700">No Receipts Found</span>
                            <span className="text-xxs text-slate-400">Try adjusting your search query or filter</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReceipts.map(rec => (
                        <tr key={rec.id}>
                          <td>
                            <div className="font-bold text-xs text-primary font-mono">{rec.receipt_number || rec.id}</div>
                            <span className="text-xxs text-muted">{new Date(rec.payment_date).toLocaleDateString()}</span>
                          </td>
                          <td>
                            <div className="font-semibold text-xs text-slate-900">{rec.customer_name}</div>
                            <span className="ticket-tag text-xxs font-mono">{rec.invoice_number}</span>
                          </td>
                          <td>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.receipt_type === 'Booking Advance'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {rec.receipt_type}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-secondary text-xxs font-mono">
                              {rec.payment_method}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono text-xxs text-slate-600 font-semibold">{rec.transaction_ref}</span>
                            {rec.notes && <div className="text-[10px] text-slate-400 italic truncate max-w-[140px]">{rec.notes}</div>}
                          </td>
                          <td className="text-right font-bold text-xs text-success">
                            ₹{rec.amount_paid?.toLocaleString()}
                          </td>
                          <td>
                            <span className="status-pill status-paid text-xxxs">
                              Cleared
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              className="btn btn-xs btn-secondary"
                              onClick={() => window.print()}
                              title="Print Payment Voucher"
                            >
                              <Printer size={12} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
