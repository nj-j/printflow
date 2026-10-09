import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  CreditCard,
  CheckCircle2,
  DollarSign,
  Building2,
  FileText,
  Calendar,
  Smartphone,
  Banknote,
  Receipt,
  User,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DynamicQrModal = () => {
  const { qrModalData, setQrModalData, recordPayment, recordPaymentForJob, recordBookingAdvance } = useApp();

  const [collectedAmount, setCollectedAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('UPI'); // UPI, Cheque, Bank Transfer, Cash, Card
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Mode-specific fields
  const [upiRef, setUpiRef] = useState('');
  const [upiApp, setUpiApp] = useState('Google Pay');

  const [chequeNo, setChequeNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeDate, setChequeDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [bankRef, setBankRef] = useState('');
  const [senderBank, setSenderBank] = useState('');

  const [cashVoucher, setCashVoucher] = useState('');
  const [cashReceivedBy, setCashReceivedBy] = useState('Front Desk / Counter');

  const [cardAuth, setCardAuth] = useState('');
  const [cardLast4, setCardLast4] = useState('');

  const [remarks, setRemarks] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (qrModalData) {
      setCollectedAmount(qrModalData.amount || qrModalData.advanceRequired || 0);
      setSelectedMethod('UPI');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setUpiRef('');
      setUpiApp('Google Pay');
      setChequeNo('');
      setBankName('');
      setChequeDate(new Date().toISOString().split('T')[0]);
      setBankRef('');
      setSenderBank('');
      setCashVoucher('');
      setCashReceivedBy('Front Desk / Counter');
      setCardAuth('');
      setCardLast4('');
      setRemarks('');
      setErrorMessage('');
      setIsSuccess(false);
    }
  }, [qrModalData]);

  if (!qrModalData) return null;

  const {
    amount = 0,
    title = 'Collect Advance Payment',
    orderNumber = '',
    jobId = '',
    invoiceId = '',
    bookingId = '',
    customerName = '',
    jobTitle = '',
    orderTotal = null
  } = qrModalData;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const numericAmount = Number(collectedAmount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    let finalRef = '';

    if (selectedMethod === 'UPI') {
      if (!upiRef.trim()) {
        setErrorMessage('Please enter the UPI Transaction ID / 12-digit UTR reference number.');
        return;
      }
      finalRef = `UPI-${upiRef.trim()} (${upiApp})`;
    } else if (selectedMethod === 'Cheque') {
      if (!chequeNo.trim()) {
        setErrorMessage('Please enter the Cheque Number.');
        return;
      }
      if (!bankName.trim()) {
        setErrorMessage('Please enter the Issuing Bank Name for the cheque.');
        return;
      }
      finalRef = `CHQ-${chequeNo.trim()} (${bankName.trim()}${chequeDate ? ' dt ' + chequeDate : ''})`;
    } else if (selectedMethod === 'Bank Transfer') {
      if (!bankRef.trim()) {
        setErrorMessage('Please enter the Bank UTR / NEFT reference number.');
        return;
      }
      finalRef = `NEFT-${bankRef.trim()}${senderBank.trim() ? ' (' + senderBank.trim() + ')' : ''}`;
    } else if (selectedMethod === 'Cash') {
      finalRef = cashVoucher.trim() ? `CASH-${cashVoucher.trim()}` : `CASH-RCPT-${Date.now().toString().slice(-6)}`;
    } else if (selectedMethod === 'Card') {
      if (!cardAuth.trim()) {
        setErrorMessage('Please enter the Card POS Transaction / Auth code.');
        return;
      }
      finalRef = `CARD-${cardAuth.trim()}${cardLast4.trim() ? ' (x-' + cardLast4.trim() + ')' : ''}`;
    }

    setIsSuccess(true);

    setTimeout(() => {
      if (bookingId) {
        recordBookingAdvance(bookingId, numericAmount, selectedMethod, finalRef, remarks);
      } else if (invoiceId) {
        recordPayment(invoiceId, numericAmount, selectedMethod, finalRef);
      } else if (jobId) {
        recordPaymentForJob(jobId, numericAmount, selectedMethod, finalRef);
      }
      setIsSuccess(false);
      setQrModalData(null);
    }, 400);
  };

  const paymentModes = [
    { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: Smartphone },
    { id: 'Cheque', label: 'Cheque', icon: FileText },
    { id: 'Bank Transfer', label: 'Bank Transfer (NEFT/RTGS)', icon: Building2 },
    { id: 'Cash', label: 'Cash', icon: Banknote },
    { id: 'Card', label: 'Card / POS', icon: CreditCard }
  ];

  return (
    <Modal
      isOpen={!!qrModalData}
      onClose={() => setQrModalData(null)}
      title="Record Advance / Payment Intake"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="p-1 space-y-4 text-xs">
        {/* Order Dossier Summary Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">Order Reference</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {orderNumber || 'SO-PENDING'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Name</span>
              <span className="font-bold text-slate-900 text-sm">
                {customerName || 'Walk-in Customer'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {jobTitle && (
              <div className="flex-1 min-w-[200px]">
                <span className="text-[10px] text-slate-400 font-semibold block">Job Title / Scope:</span>
                <span className="font-medium text-slate-700 truncate block max-w-sm" title={jobTitle}>
                  {jobTitle}
                </span>
              </div>
            )}
            {orderTotal && (
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block">Total Order Value:</span>
                <span className="font-mono font-bold text-slate-800">
                  ₹ {Number(orderTotal).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Amount & Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Advance Amount Received (₹) <span className="text-red-500">*</span> :
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 font-mono font-bold text-slate-400">₹</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={collectedAmount}
                onChange={(e) => setCollectedAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-700 focus:outline-none focus:border-emerald-500 bg-white shadow-2xs"
                placeholder="Amount"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Payment Date <span className="text-red-500">*</span> :
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Mode of Payment Selector */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Select Mode of Payment <span className="text-red-500">*</span> :
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
            {paymentModes.map(m => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(m.id);
                    setErrorMessage('');
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition cursor-pointer gap-1 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="text-[11px] leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Mode-Specific Fields */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 pb-1 border-b border-slate-200">
            <Receipt size={13} className="text-blue-600" />
            <span>Recording Details for {selectedMethod} Payment</span>
          </div>

          {/* 1. UPI Mode */}
          {selectedMethod === 'UPI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI Transaction ID / UTR No <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  required
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  placeholder="e.g. 412891028491 (12-digit UTR)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  UPI App / Platform :
                </label>
                <select
                  value={upiApp}
                  onChange={(e) => setUpiApp(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="Google Pay">Google Pay (GPay)</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="BHIM UPI">BHIM UPI</option>
                  <option value="WhatsApp Pay">WhatsApp Pay</option>
                  <option value="Cred">Cred</option>
                  <option value="Direct Bank UPI">Direct Bank UPI</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* 2. Cheque Mode */}
          {selectedMethod === 'Cheque' && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cheque Number <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    required
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    placeholder="e.g. 004812 (6-digit Cheque No)"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Issuing Bank Name <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI, ICICI Bank..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cheque Date :
                </label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="w-full sm:w-1/2 px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* 3. Bank Transfer (NEFT / RTGS / IMPS) */}
          {selectedMethod === 'Bank Transfer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank UTR / Transaction Ref No <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  required
                  value={bankRef}
                  onChange={(e) => setBankRef(e.target.value)}
                  placeholder="e.g. ICICR5202606010012"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sender Bank Name :
                </label>
                <input
                  type="text"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="e.g. Axis Bank / Kotak Bank"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* 4. Cash Mode */}
          {selectedMethod === 'Cash' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cash Receipt / Voucher No (Optional) :
                </label>
                <input
                  type="text"
                  value={cashVoucher}
                  onChange={(e) => setCashVoucher(e.target.value)}
                  placeholder="e.g. CR-0482"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cash Collected By :
                </label>
                <input
                  type="text"
                  value={cashReceivedBy}
                  onChange={(e) => setCashReceivedBy(e.target.value)}
                  placeholder="e.g. Front Desk / Cashier"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* 5. Card / POS Mode */}
          {selectedMethod === 'Card' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Card POS Auth Code / RRN <span className="text-red-500">*</span> :
                </label>
                <input
                  type="text"
                  required
                  value={cardAuth}
                  onChange={(e) => setCardAuth(e.target.value)}
                  placeholder="e.g. 994821 (POS Auth / RRN)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Card Last 4 Digits (Optional) :
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 4321"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-mono font-medium focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Remarks / Notes */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Payment Remarks / Notes (Optional) :
          </label>
          <input
            type="text"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Advance received at order booking desk..."
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs font-medium focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="flex items-center gap-1.5 p-2 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-semibold animate-in fade-in">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            className="btn btn-sm btn-secondary font-semibold"
            onClick={() => setQrModalData(null)}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSuccess}
            className={`btn btn-sm font-bold flex items-center gap-1.5 px-4 py-2 text-xs transition shadow-md ${
              isSuccess ? 'bg-emerald-600 text-white' : 'btn-primary'
            }`}
          >
            <CheckCircle2 size={15} />
            <span>{isSuccess ? 'Payment Recorded!' : `Confirm Advance Payment (₹${Number(collectedAmount).toLocaleString()})`}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AdvancePaymentModal = DynamicQrModal;
