import React, { useState } from 'react';
import {
  Receipt,
  DollarSign,
  QrCode,
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Search,
  Eye
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
    setActiveSubTab
  } = useApp();

  const currentSubTab = activeSubTab || 'invoices';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI_QR');
  const [payRef, setPayRef] = useState('');

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.grand_total || 0), 0);
  const totalCollected = paymentReceipts.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balance_due || 0), 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.job_ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    if (currentSubTab === 'receipts') {
      return matchesSearch && inv.payment_status === 'Paid';
    }
    if (currentSubTab === 'ar_aging') {
      return matchesSearch && (inv.balance_due || 0) > 0;
    }
    const matchesStatus = selectedStatusFilter === 'All' || inv.payment_status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    recordPayment(payInvoiceId, Number(payAmount), payMethod, payRef);
    setShowPaymentModal(false);
    setPayAmount('');
    setPayRef('');
  };

  const handleOpenQrForInvoice = (inv) => {
    setQrModalData({
      amount: inv.balance_due,
      title: `Balance Payment for ${inv.invoice_number}`,
      orderNumber: inv.invoice_number,
      invoiceId: inv.id,
      customerName: inv.customer_name,
    });
  };

  const pendingInvoicesCount = invoices.filter(i => i.payment_status !== 'Paid').length;

  const subTabs = [
    {
      id: 'invoices',
      label: 'GST Invoicing (HSN 49111010)',
      icon: Receipt,
      badge: `${invoices.length} Invoices`,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'receipts',
      label: 'Receipts & Advances',
      icon: CheckCircle2,
      badge: `${paymentReceipts.length} Receipts`,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'ar_aging',
      label: 'AR Aging Analysis',
      icon: Clock,
      badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Consolidated Module Header with Sub-Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 shadow-2xs select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#001523] text-white flex items-center justify-center font-bold text-sm shadow-xs font-mono">
              09
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Finance & Billing</h1>
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

      <div className="stage-page-container">
        {/* AR Aging Breakdown Card */}
        {currentSubTab === 'ar_aging' && (
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
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-light text-primary">
            <Receipt size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Invoiced Billed</span>
            <div className="kpi-value">₹{totalInvoiced.toLocaleString()}</div>
            <span className="kpi-sub text-muted">{invoices.length} Invoices Issued</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-light text-success">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Collections Received</span>
            <div className="kpi-value text-success">₹{totalCollected.toLocaleString()}</div>
            <span className="kpi-sub text-success font-medium">{paymentReceipts.length} Receipts Logged</span>
          </div>
        </div>

        <div className="kpi-card">
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

      <div className="billing-two-col-layout">
        {/* Left: Invoices Grid */}
        <div className="card flex-1">
          <div className="card-header">
            <div className="flex items-center gap-3">
              <h3 className="card-title flex items-center gap-2">
                <Receipt size={18} className="text-primary" /> Tax Invoices Ledger
              </h3>
              <div className="category-filter-pills">
                {['All', 'Paid', 'Partial', 'Unpaid'].map(status => (
                  <button
                    key={status}
                    className={`cat-pill ${selectedStatusFilter === status ? 'active' : ''}`}
                    onClick={() => setSelectedStatusFilter(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
            <div className="search-input-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
                {filteredInvoices.map(inv => {
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
                            <>
                              <button
                                className="btn btn-xs btn-info"
                                onClick={() => handleOpenQrForInvoice(inv)}
                                title="Collect via Dynamic UPI QR"
                              >
                                <QrCode size={12} />
                              </button>
                              <button
                                className="btn btn-xs btn-success"
                                onClick={() => {
                                  setPayInvoiceId(inv.id);
                                  setPayAmount(String(inv.balance_due));
                                  setShowPaymentModal(true);
                                }}
                                title="Record Manual Payment"
                              >
                                + Pay
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Payment Receipts & Daily Collection Log */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <DollarSign size={18} className="text-success" /> Payment Receipts Audit Trail
            </h3>
            <span className="badge badge-success">Settlements</span>
          </div>

          <div className="receipts-list-wrapper">
            {paymentReceipts.map(rec => (
              <div key={rec.id} className="receipt-card-item text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-success">₹{rec.amount_paid?.toLocaleString()}</span>
                  <span className="badge badge-secondary text-xxs">{rec.payment_method}</span>
                </div>
                <div className="font-semibold text-xs mt-1">{rec.customer_name}</div>
                <div className="text-xxs text-muted mt-0.5">
                  Ref: <strong>{rec.invoice_number}</strong> | Type: {rec.receipt_type}
                </div>
                <div className="text-xxs text-muted">
                  Txn ID: {rec.transaction_ref}
                </div>
                <div className="text-xxs text-muted mt-0.5">
                  {new Date(rec.payment_date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Payment Settlement Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-container max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Record Payment Settlement</h3>
              <button className="modal-close-btn" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRecordPaymentSubmit} className="p-4">
              <div className="form-group">
                <label>Settlement Amount (₹):</label>
                <input
                  type="number"
                  className="form-control font-bold text-lg text-success"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Payment Mode:</label>
                <select
                  className="form-control"
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option value="UPI_QR">UPI Dynamic QR</option>
                  <option value="Cash">Cash Counter Receipt</option>
                  <option value="Cheque">Cheque / Bank Draft</option>
                  <option value="BankWire">NEFT / RTGS Wire</option>
                  <option value="CreditCard">Credit / Debit Card</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bank Reference / Cheque No / Txn Ref:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ICICI/260828/998811 or CHQ-445566"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
