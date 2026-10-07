import React from 'react';
import { Modal } from './Modal';
import { Printer, CheckCircle2, QrCode, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuoteModal = () => {
  const { selectedQuoteForModal, setSelectedQuoteForModal, approveQuoteAndBookOrder, setQrModalData } = useApp();

  if (!selectedQuoteForModal) return null;

  const quote = selectedQuoteForModal;
  const isUrgent = quote.priority === 'Urgent';
  const advanceAmount = Math.round((quote.total_estimated_price * (quote.advance_required_percent || 60)) / 100);

  const handlePrint = () => {
    window.print();
  };

  const handleBookOrder = () => {
    approveQuoteAndBookOrder(quote.id, advanceAmount, 'UPI_QR', quote.priority);
    setSelectedQuoteForModal(null);
  };

  const handleOpenAdvanceQr = () => {
    setQrModalData({
      amount: advanceAmount,
      title: `Advance (60%) for Quote ${quote.quote_number}`,
      orderNumber: quote.quote_number,
      customerName: quote.customer_name,
    });
  };

  return (
    <Modal
      isOpen={!!selectedQuoteForModal}
      onClose={() => setSelectedQuoteForModal(null)}
      title={`Cost Estimation & Quotation — ${quote.quote_number}`}
      maxWidth="max-w-4xl"
    >
      <div className="printable-quote" id="printable-quote">
        {/* Header */}
        <div className="quote-header">
          <div className="company-info">
            <h2>JOSCO PRINTERS</h2>
            <p className="tagline">Official Commercial Print Quotation & Estimate</p>
            <p>Peenya Industrial Area, Bangalore - 560058 | Email: sales@joscoprinters.com</p>
          </div>
          <div className="quote-meta-box">
            <div className="quote-number">
              <span>QUOTATION #</span>
              <h3>{quote.quote_number}</h3>
            </div>
            {isUrgent && (
              <div className="urgent-badge-glow">
                <Zap size={14} /> [URGENT PRIORITY ESTIMATE]
              </div>
            )}
            <p className="mt-1 text-sm"><strong>Valid Until:</strong> {quote.valid_until}</p>
          </div>
        </div>

        <hr className="divider" />

        {/* Customer & Quote Info */}
        <div className="parties-grid">
          <div className="party-card">
            <h4>Prepared For:</h4>
            <p className="font-bold text-base">{quote.customer_name}</p>
            <p>Attn: {quote.contact_person}</p>
            <p>Sales Executive: <strong>{quote.created_by_name}</strong></p>
          </div>
          <div className="party-card">
            <h4>Quotation Terms:</h4>
            <p><strong>Payment Mode:</strong> {quote.advance_required_percent}% Advance Booking</p>
            <p><strong>Lead Time:</strong> {isUrgent ? '12 - 24 Hours (Express)' : '2 - 3 Working Days'}</p>
            <p><strong>Taxation:</strong> GST @ 12% Extra as applicable</p>
          </div>
        </div>

        {/* Item Breakdown */}
        <div className="quote-items-section">
          <h4>Job Specifications & Cost Composition</h4>
          <table className="invoice-items-table">
            <thead>
              <tr>
                <th>Job Title / Scope</th>
                <th>Specifications (Paper, Colors, Finishing)</th>
                <th className="text-center">Quantity</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {quote.items?.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.job_title}</strong></td>
                  <td>
                    <div className="text-sm">{item.paper_type} ({item.paper_gsm} GSM)</div>
                    <div className="text-xs text-muted">Colors: {item.color_pages_front}/{item.color_pages_back} CMYK | Sheet: {item.sheet_size}</div>
                    <div className="text-xs text-primary">{item.finishing_specs}</div>
                  </td>
                  <td className="text-center font-bold">{item.print_quantity?.toLocaleString()}</td>
                  <td className="text-right font-bold">₹{item.item_subtotal?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Costing Engine Transparency Table */}
        <div className="costing-breakdown-card">
          <h4>Offset Costing Engine Analysis</h4>
          <div className="costing-grid">
            <div className="costing-metric">
              <span>Paper & Raw Material:</span>
              <strong>₹{quote.raw_material_cost?.toLocaleString()}</strong>
            </div>
            <div className="costing-metric">
              <span>Waste Allowance ({quote.waste_margin_percent}%):</span>
              <strong>₹{quote.waste_margin_cost?.toLocaleString()}</strong>
            </div>
            <div className="costing-metric">
              <span>Press Machine Runtime:</span>
              <strong>₹{quote.press_runtime_cost?.toLocaleString()}</strong>
            </div>
            <div className="costing-metric">
              <span>Post-Press & Binding:</span>
              <strong>₹{quote.finishing_cost?.toLocaleString()}</strong>
            </div>
            {quote.rush_surcharge_amount > 0 && (
              <div className="costing-metric text-danger">
                <span>[RUSH SURCHARGE]:</span>
                <strong>+ ₹{quote.rush_surcharge_amount?.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="quote-totals-wrapper">
          <div className="advance-alert-box">
            <span>Mandatory Advance to Book (60%):</span>
            <h3>₹{advanceAmount.toLocaleString()}</h3>
            <p className="text-xs text-muted">Order is released to Pre-Press upon advance confirmation.</p>
          </div>
          <div className="quote-grand-total">
            <span>Total Estimated Price:</span>
            <h2>₹{quote.total_estimated_price?.toLocaleString()}</h2>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions-footer no-print">
          <button className="btn btn-secondary" onClick={() => setSelectedQuoteForModal(null)}>
            Close
          </button>
          <button className="btn btn-info" onClick={handleOpenAdvanceQr}>
            <QrCode size={16} /> Collect Advance via QR
          </button>
          <button className="btn btn-success" onClick={handleBookOrder}>
            <CheckCircle2 size={16} /> Approve & Convert to Job Ticket
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Quote
          </button>
        </div>
      </div>
    </Modal>
  );
};
