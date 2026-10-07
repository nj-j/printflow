import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CommunicationHub = () => {
  const { quotes, jobOrders, customers, invoices } = useApp();

  const [selectedTemplate, setSelectedTemplate] = useState('quote_sent');
  const [selectedRecipient, setSelectedRecipient] = useState(customers[0]?.id || '');
  const [customNotes, setCustomNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const customer = customers.find(c => c.id === selectedRecipient) || customers[0];

  const generateMessage = () => {
    switch (selectedTemplate) {
      case 'quote_sent':
        return `Hello ${customer?.contactPerson || customer?.company_name},\n\nThank you for reaching out to JOSCO PRINTERS! We have prepared your official offset print quotation. Please review the specifications and let us know your approval.\n\nBest Regards,\nSales Team | Josco Printers\nPhone: +91 80 2839 4000`;
      case 'proof_ready':
        return `Dear ${customer?.company_name},\n\nYour digital pre-press proof is ready for review. Please inspect color tones, bleed, and spelling before we expose the CTP plates.\n\nSign off online or reply to this message.\nPre-Press Dept | Josco Printers`;
      case 'rush_update':
        return `[PRIORITY UPDATE]: Your rush print job has been fast-tracked and is currently running on our Heidelberg 4-Color offset press. Target dispatch is on schedule for today!\n\nJosco Printers Production Desk`;
      case 'ready_for_pickup':
        return `Great news! Your print order is completed, quality inspected, and ready for dispatch/pick-up. Delivery Challan generated.\n\nThank you for choosing JOSCO PRINTERS!`;
      case 'payment_reminder':
        return `Dear Accounts Team at ${customer?.company_name},\n\nThis is a gentle reminder regarding the outstanding balance of Rs ${customer?.current_balance?.toLocaleString()} with Josco Printers. Kindly arrange payment settlement.\n\nAccounts Dept | Josco Printers`;
      default:
        return '';
    }
  };

  const messageText = generateMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phoneClean = (customer?.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phoneClean}?text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cross-Cutting: Communication Hub & Notification Center</h1>
          <p className="page-subtitle">
            Generate automated WhatsApp and Email customer notifications for quote dispatches, proof approvals, rush job updates, and payment alerts.
          </p>
        </div>
      </div>

      <div className="communication-two-col-layout">
        {/* Left: Message Generator */}
        <div className="card flex-1">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Automated Multi-Channel Message Composer
            </h3>
          </div>

          <div className="p-4">
            <div className="form-group">
              <label>Select Customer Recipient:</label>
              <select
                className="form-control"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company_name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Notification Template:</label>
              <div className="template-pills-grid">
                {[
                  { id: 'quote_sent', label: '[Quote] Quotation Sent' },
                  { id: 'proof_ready', label: '[Proof] Design Proof Ready' },
                  { id: 'rush_update', label: '[Rush] Urgent Job Fast-Track Update' },
                  { id: 'ready_for_pickup', label: '[Dispatch] Order Ready for Dispatch' },
                  { id: 'payment_reminder', label: '[Accounts] Payment Reminder' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`template-pill ${selectedTemplate === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedTemplate(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="flex justify-between">
                <span>Preview Formatted Message:</span>
                <span className="text-xs text-muted">Ready to send via WhatsApp / Email</span>
              </label>
              <textarea
                className="form-control font-mono text-xs bg-slate-50"
                rows="8"
                value={messageText}
                readOnly
              ></textarea>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button className="btn btn-secondary flex items-center gap-1" onClick={handleCopy}>
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard' : 'Copy Text'}
              </button>
              <button
                className="btn btn-success flex items-center gap-1 font-bold"
                onClick={handleOpenWhatsApp}
              >
                <Send size={14} /> Send via WhatsApp Direct <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Internal Communication Channels & Escalation Matrix */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Phone size={18} className="text-primary" /> Shop Floor Handover Contacts
            </h3>
          </div>

          <div className="p-4">
            <div className="contact-card-item">
              <strong>Pre-Press & CTP Lead</strong>
              <div className="text-xs text-slate-700">Kiran Verma | Ext: 102</div>
              <div className="text-xxs text-muted">kodak.ctp@joscoprinters.com</div>
            </div>

            <div className="contact-card-item mt-2">
              <strong>Offset Press In-Charge</strong>
              <div className="text-xs text-slate-700">Rajesh Nair | Ext: 104</div>
              <div className="text-xxs text-muted">pressfloor@joscoprinters.com</div>
            </div>

            <div className="contact-card-item mt-2">
              <strong>Finishing & QC Supervisor</strong>
              <div className="text-xs text-slate-700">Anil Kumar | Ext: 106</div>
              <div className="text-xxs text-muted">bindery@joscoprinters.com</div>
            </div>

            <div className="contact-card-item mt-2">
              <strong>Accounts & Billing Officer</strong>
              <div className="text-xs text-slate-700">Sunita Rao | Ext: 108</div>
              <div className="text-xxs text-muted">accounts@joscoprinters.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
