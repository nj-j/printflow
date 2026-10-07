import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle2, DollarSign, QrCode, FileText, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvoiceModal = () => {
  const { selectedInvoiceForModal, setSelectedInvoiceForModal, setQrModalData, customers } = useApp();

  if (!selectedInvoiceForModal) return null;

  const inv = selectedInvoiceForModal;
  const customer = customers.find(c => c.id === inv.customer_id) || {};
  const isGst = inv.invoice_type === 'GST_Tax_Invoice';

  const handlePrint = () => {
    window.print();
  };

  const handleOpenQrPay = () => {
    setQrModalData({
      amount: inv.balance_due,
      title: `Balance Payment for ${inv.invoice_number}`,
      orderNumber: inv.invoice_number,
      invoiceId: inv.id,
      customerName: inv.customer_name,
    });
  };

  return (
    <Modal
      isOpen={!!selectedInvoiceForModal}
      onClose={() => setSelectedInvoiceForModal(null)}
      title={`Tax Invoice — ${inv.invoice_number}`}
      maxWidth="max-w-4xl"
    >
      <div className="printable-invoice" id="printable-invoice">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h2>JOSCO PRINTERS</h2>
            <p className="tagline">Quality Offset & Commercial Print Packaging</p>
            <p>Plot 12-A, Peenya Industrial Area, Phase 2, Bangalore - 560058</p>
            <p><strong>GSTIN:</strong> 29AAACJ1234F1Z8 | <strong>PAN:</strong> AAACJ1234F</p>
            <p><strong>Email:</strong> accounts@joscoprinters.com | <strong>Phone:</strong> +91 80 2839 4000</p>
          </div>
          <div className="invoice-type-box">
            <span className="doc-title">{isGst ? 'TAX INVOICE' : 'COMMERCIAL BILL'}</span>
            <div className="inv-meta-table">
              <div><strong>Invoice No:</strong> <span>{inv.invoice_number}</span></div>
              <div><strong>Invoice Date:</strong> <span>{new Date(inv.issued_at).toLocaleDateString()}</span></div>
              <div><strong>Job Ticket Ref:</strong> <span>{inv.job_ticket_number}</span></div>
              <div><strong>Due Date:</strong> <span>{inv.due_date}</span></div>
              <div><strong>Status:</strong> <span className={`status-tag status-${inv.payment_status?.toLowerCase()}`}>{inv.payment_status}</span></div>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Bill To & Ship To */}
        <div className="parties-grid">
          <div className="party-card">
            <h4>Billed To (Customer Details):</h4>
            <p className="party-name font-bold">{inv.customer_name}</p>
            <p>{customer.contact_person && `Attn: ${customer.contact_person}`}</p>
            <p>{customer.address || 'Commercial Customer Address'}</p>
            <p><strong>Phone:</strong> {customer.phone || '+91 98450 12345'}</p>
            <p><strong>GSTIN:</strong> {customer.gstin || 'Unregistered Consumer'}</p>
            <p><strong>State Code:</strong> 29 (Karnataka)</p>
          </div>
          <div className="party-card">
            <h4>Dispatch & Delivery Info:</h4>
            <p><strong>Place of Supply:</strong> Karnataka (29)</p>
            <p><strong>Delivery Method:</strong> Local Dispatch / Hand Delivery</p>
            <p><strong>Payment Terms:</strong> 60% Advance, Balance on Delivery</p>
            <p><strong>Bank:</strong> ICICI Bank, Peenya Branch</p>
            <p><strong>A/C No:</strong> 002305012345 (Current)</p>
            <p><strong>IFSC:</strong> ICIC0000023</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="invoice-items-table-wrapper">
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description of Goods / Services</th>
                <th>HSN / SAC</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Rate (₹)</th>
                <th className="text-right">Taxable Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <strong>Custom Offset Commercial Printing & Binding</strong>
                  <div className="text-xs text-muted">Job Reference: {inv.job_ticket_number}</div>
                </td>
                <td>{inv.hsn_code || '49111010'}</td>
                <td className="text-center">1 Job</td>
                <td className="text-right">{inv.subtotal?.toLocaleString()}</td>
                <td className="text-right">{inv.subtotal?.toLocaleString()}</td>
              </tr>
              {inv.rush_fee_amount > 0 && (
                <tr className="rush-fee-row">
                  <td>2</td>
                  <td>
                    <strong>[RUSH SURCHARGE] Last-Minute Express / Rush Turnaround Fee</strong>
                    <div className="text-xs text-danger">Priority 12-hour Fast-Track offset scheduling fee</div>
                  </td>
                  <td>9988</td>
                  <td className="text-center">1 Flat</td>
                  <td className="text-right">{inv.rush_fee_amount?.toLocaleString()}</td>
                  <td className="text-right">{inv.rush_fee_amount?.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total & Tax Breakdown */}
        <div className="invoice-summary-grid">
          <div className="tax-summary-box">
            <h4>GST Tax Analysis</h4>
            {isGst ? (
              <table className="tax-table">
                <thead>
                  <tr>
                    <th>Tax Type</th>
                    <th>Rate</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Central GST (CGST)</td>
                    <td>6.0%</td>
                    <td>₹{inv.cgst_amount?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>State GST (SGST)</td>
                    <td>6.0%</td>
                    <td>₹{inv.sgst_amount?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Integrated GST (IGST)</td>
                    <td>0.0%</td>
                    <td>₹0.00</td>
                  </tr>
                  <tr className="font-bold border-t">
                    <td>Total Tax</td>
                    <td>12.0%</td>
                    <td>₹{((inv.cgst_amount || 0) + (inv.sgst_amount || 0)).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-muted text-sm italic">Non-GST Invoice under composition / small-scale exemption scheme.</p>
            )}
          </div>

          <div className="grand-totals-card">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>₹{inv.subtotal?.toLocaleString()}</span>
            </div>
            {inv.rush_fee_amount > 0 && (
              <div className="total-line text-danger">
                <span>Rush Order Fee:</span>
                <span>₹{inv.rush_fee_amount?.toLocaleString()}</span>
              </div>
            )}
            <div className="total-line">
              <span>Total Taxable:</span>
              <span>₹{inv.taxable_amount?.toLocaleString()}</span>
            </div>
            {isGst && (
              <div className="total-line">
                <span>Total GST (12%):</span>
                <span>₹{((inv.cgst_amount || 0) + (inv.sgst_amount || 0)).toLocaleString()}</span>
              </div>
            )}
            <div className="total-line grand-total-line">
              <span>Grand Total:</span>
              <span>₹{inv.grand_total?.toLocaleString()}</span>
            </div>
            <div className="total-line text-success">
              <span>Advance Paid:</span>
              <span>- ₹{inv.advance_paid?.toLocaleString()}</span>
            </div>
            <div className="total-line balance-due-line">
              <span>Balance Payable:</span>
              <span>₹{inv.balance_due?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Declaration & Signature */}
        <div className="invoice-footer">
          <div className="terms-box">
            <strong>Terms & Conditions:</strong>
            <ol>
              <li>Goods once printed and dispatched cannot be taken back or exchanged.</li>
              <li>Interest @ 18% p.a. will be charged on overdue payments beyond agreed credit term.</li>
              <li>Subject to Bangalore Jurisdiction only.</li>
            </ol>
          </div>
          <div className="auth-signature-box">
            <p>For <strong>JOSCO PRINTERS</strong></p>
            <div className="sign-spacer"></div>
            <p className="auth-sign">Authorized Signatory</p>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions-footer no-print">
          <button className="btn btn-secondary" onClick={() => setSelectedInvoiceForModal(null)}>
            Close
          </button>
          {inv.balance_due > 0 && (
            <button className="btn btn-success" onClick={handleOpenQrPay}>
              <QrCode size={16} /> Collect ₹{inv.balance_due?.toLocaleString()} via UPI QR
            </button>
          )}
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Tax Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
};
