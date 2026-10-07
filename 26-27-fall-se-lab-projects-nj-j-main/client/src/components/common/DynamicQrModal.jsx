import React, { useState } from 'react';
import { Modal } from './Modal';
import { QrCode, CheckCircle2, Copy, Check, Sparkles, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DynamicQrModal = () => {
  const { qrModalData, setQrModalData, recordPayment, recordPaymentForJob } = useApp();
  const [copied, setCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI_QR');

  if (!qrModalData) return null;

  const { amount = 0, title = 'Advance / Balance Payment', orderNumber = '', jobId = '', invoiceId = '', customerName = '' } = qrModalData;
  const upiId = 'joscoprinters.erp@icici';
  const upiUrl = `upi://pay?pa=${upiId}&pn=JoscoPrinters&am=${amount}&cu=INR&tn=${encodeURIComponent(orderNumber || title)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      if (invoiceId) {
        recordPayment(invoiceId, amount, selectedMethod, `UPI-${Date.now().toString().slice(-6)}`);
      } else if (jobId) {
        recordPaymentForJob(jobId, amount, selectedMethod, `UPI-${Date.now().toString().slice(-6)}`);
      }
      setPaymentSuccess(false);
      setQrModalData(null);
    }, 1200);
  };

  return (
    <Modal
      isOpen={!!qrModalData}
      onClose={() => setQrModalData(null)}
      title="Dynamic Payment QR Code (UPI & Instant Settlement)"
      maxWidth="max-w-md"
    >
      <div className="qr-modal-content">
        <div className="qr-header-banner">
          <div className="qr-badge">
            <Sparkles size={14} className="animate-spin" /> Instant Dynamic QR
          </div>
          <h4>{title}</h4>
          <p className="text-muted">Order / Job Ref: <strong>{orderNumber || 'Pending'}</strong></p>
          {customerName && <p className="text-sm">Billed to: <strong>{customerName}</strong></p>}
        </div>

        <div className="qr-amount-box">
          <span className="qr-amount-label">Payable Amount:</span>
          <span className="qr-amount-value">₹{Number(amount).toLocaleString()}</span>
        </div>

        {/* Dynamic SVG QR Code Simulation */}
        <div className="qr-code-wrapper">
          <div className="qr-code-frame">
            <svg viewBox="0 0 200 200" className="qr-svg-graphic" width="180" height="180">
              <rect width="200" height="200" fill="#ffffff" rx="10" />
              {/* Corner squares */}
              <rect x="15" y="15" width="45" height="45" fill="#0f172a" rx="4" />
              <rect x="23" y="23" width="29" height="29" fill="#ffffff" rx="2" />
              <rect x="29" y="29" width="17" height="17" fill="#0f172a" rx="1" />

              <rect x="140" y="15" width="45" height="45" fill="#0f172a" rx="4" />
              <rect x="148" y="23" width="29" height="29" fill="#ffffff" rx="2" />
              <rect x="154" y="29" width="17" height="17" fill="#0f172a" rx="1" />

              <rect x="15" y="140" width="45" height="45" fill="#0f172a" rx="4" />
              <rect x="23" y="148" width="29" height="29" fill="#ffffff" rx="2" />
              <rect x="29" y="154" width="17" height="17" fill="#0f172a" rx="1" />

              {/* Data matrix pattern */}
              <rect x="70" y="20" width="12" height="12" fill="#0f172a" />
              <rect x="90" y="20" width="12" height="12" fill="#0f172a" />
              <rect x="110" y="20" width="12" height="12" fill="#0f172a" />
              <rect x="70" y="40" width="25" height="10" fill="#0f172a" />
              <rect x="105" y="40" width="20" height="10" fill="#0f172a" />

              <rect x="20" y="70" width="15" height="15" fill="#0f172a" />
              <rect x="45" y="70" width="20" height="10" fill="#0f172a" />
              <rect x="75" y="70" width="50" height="12" fill="#2563eb" />
              <rect x="135" y="70" width="45" height="10" fill="#0f172a" />

              <rect x="20" y="95" width="30" height="12" fill="#0f172a" />
              <rect x="60" y="90" width="20" height="20" fill="#0f172a" />
              {/* Logo in center */}
              <circle cx="100" cy="100" r="18" fill="#2563eb" />
              <text x="100" y="105" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">JP</text>
              <rect x="125" y="90" width="20" height="20" fill="#0f172a" />
              <rect x="155" y="95" width="25" height="12" fill="#0f172a" />

              <rect x="20" y="115" width="45" height="12" fill="#0f172a" />
              <rect x="75" y="118" width="50" height="12" fill="#2563eb" />
              <rect x="135" y="115" width="45" height="12" fill="#0f172a" />

              <rect x="70" y="145" width="25" height="15" fill="#0f172a" />
              <rect x="105" y="145" width="30" height="15" fill="#0f172a" />
              <rect x="145" y="145" width="35" height="15" fill="#0f172a" />

              <rect x="70" y="170" width="45" height="15" fill="#0f172a" />
              <rect x="125" y="170" width="55" height="15" fill="#0f172a" />
            </svg>
          </div>
          <div className="qr-scan-text">
            <span>Scan with GPay / PhonePe / Paytm / BHIM</span>
          </div>
        </div>

        <div className="upi-id-row">
          <span className="upi-label">UPI VPA:</span>
          <span className="upi-address">{upiId}</span>
          <button className="copy-btn" onClick={handleCopyUpi}>
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="payment-method-selector">
          <label>Payment Channel:</label>
          <div className="method-pills">
            {['UPI_QR', 'Cash', 'Cheque', 'BankWire'].map(method => (
              <button
                key={method}
                type="button"
                className={`method-pill ${selectedMethod === method ? 'active' : ''}`}
                onClick={() => setSelectedMethod(method)}
              >
                {method.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setQrModalData(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-primary ${paymentSuccess ? 'btn-success' : ''}`}
            onClick={handleSimulatePaymentSuccess}
            disabled={paymentSuccess}
          >
            {paymentSuccess ? (
              <>
                <CheckCircle2 size={18} /> Payment Verified!
              </>
            ) : (
              <>
                <CreditCard size={18} /> Confirm & Record Payment
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
