import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  Flag,
  AlertTriangle,
  Printer,
  Palette,
  Scissors,
  Truck,
  ShieldAlert,
  Layers,
  User,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QCFlagModal = () => {
  const {
    isQCFlagModalOpen,
    closeQCFlagModal,
    qcFlagModalJob,
    qcFlagSourceTerminal,
    raiseQCFlag,
    activeUser
  } = useApp();

  const [defectCategory, setDefectCategory] = useState('Color Mismatch & Density Variation');
  const [severity, setSeverity] = useState('Major');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isQCFlagModalOpen) {
      setDefectCategory('Color Mismatch & Density Variation');
      setSeverity('Major');
      setDescription('');
      setReporterName(activeUser?.full_name || 'Terminal Operator');
      setIsSubmitted(false);
    }
  }, [isQCFlagModalOpen, activeUser]);

  if (!isQCFlagModalOpen || !qcFlagModalJob) return null;

  const job = qcFlagModalJob;
  const ticketNumber = job.job_ticket_number || job.job_no || 'JT-2026';
  const customerName = job.customer_name || job.customer || 'Customer';
  const jobTitle = job.job_title || job.product || 'Print Job';
  const currentStage = job.current_stage || qcFlagSourceTerminal;

  const getTerminalIcon = (terminal) => {
    const t = (terminal || '').toLowerCase();
    if (t.includes('prepress') || t.includes('proof') || t.includes('design') || t.includes('pre-press')) {
      return <Palette size={14} className="text-purple-600" />;
    }
    if (t.includes('press') || t.includes('print')) {
      return <Printer size={14} className="text-blue-600" />;
    }
    if (t.includes('finish') || t.includes('bind')) {
      return <Scissors size={14} className="text-teal-600" />;
    }
    if (t.includes('dispatch') || t.includes('delivery')) {
      return <Truck size={14} className="text-amber-600" />;
    }
    return <Layers size={14} className="text-slate-600" />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    raiseQCFlag({
      jobId: job.id,
      jobTicketNumber: ticketNumber,
      customerName: customerName,
      jobTitle: jobTitle,
      terminal: qcFlagSourceTerminal,
      defectCategory: defectCategory,
      severity: severity,
      description: description.trim(),
      reportedBy: reporterName
    });

    setIsSubmitted(true);
    setTimeout(() => {
      closeQCFlagModal();
    }, 900);
  };

  return (
    <Modal
      isOpen={isQCFlagModalOpen}
      onClose={closeQCFlagModal}
      title={`Raise Quality Control Flag — ${ticketNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="p-1 space-y-4 text-xs select-none">
        {/* Terminal and Job Context Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-white text-slate-900 border border-slate-300 px-2 py-0.5 rounded shadow-2xs">
                {ticketNumber}
              </span>
              <span className="font-bold text-slate-900 text-xs truncate max-w-[280px]">
                {customerName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 shadow-2xs">
              {getTerminalIcon(qcFlagSourceTerminal)}
              <span>Reporting Station: <b className="text-slate-900">{qcFlagSourceTerminal}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400 font-mono text-[10px] block">JOB TITLE / PRODUCT:</span>
              <span className="font-semibold text-slate-800">{jobTitle}</span>
            </div>
            <div>
              <span className="text-slate-400 font-mono text-[10px] block">CURRENT WORKSTATION STAGE:</span>
              <span className="font-mono font-bold text-blue-700">{currentStage}</span>
            </div>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2 animate-in fade-in">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-sm text-slate-900">QC Flag Successfully Logged!</h4>
            <p className="text-slate-500 text-xs">
              This issue has been immediately routed to the Quality Control (QC) Module and station supervisor.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Defect Category & Severity in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                  Defect Category / Flaw Type:
                </label>
                <select
                  value={defectCategory}
                  onChange={(e) => setDefectCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 cursor-pointer"
                >
                  <option value="Color Mismatch & Density Variation">Color Mismatch & Density Variation</option>
                  <option value="Registration Error & Plate Shift">Registration Error & Plate Shift</option>
                  <option value="Ink Smear / Streaks / Hickeys">Ink Smear / Streaks / Hickeys</option>
                  <option value="Trim, Bleed & Cutting Misalignment">Trim, Bleed & Cutting Misalignment</option>
                  <option value="Lamination Bubbles / Wrinkling / Peeling">Lamination Bubbles / Wrinkling / Peeling</option>
                  <option value="Creasing, Folding & Binding Defect">Creasing, Folding & Binding Defect</option>
                  <option value="Substrate / Paper Flaw / Damage">Substrate / Paper Flaw / Damage</option>
                  <option value="Quantity Shortage / Excessive Waste">Quantity Shortage / Excessive Waste</option>
                  <option value="Barcode / QR / Typography Error">Barcode / QR / Typography Error</option>
                  <option value="Packaging / Dispatch Damage">Packaging / Dispatch Damage</option>
                  <option value="Other Quality Defect">Other Quality Defect</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-[11px]">
                  Defect Severity:
                </label>
                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {[
                    { id: 'Minor', label: 'Minor', color: 'border-blue-300 text-blue-700', activeBg: 'bg-blue-600 text-white border-blue-600' },
                    { id: 'Major', label: 'Major', color: 'border-amber-300 text-amber-700', activeBg: 'bg-amber-600 text-white border-amber-600' },
                    { id: 'Critical', label: 'Critical', color: 'border-rose-300 text-rose-700', activeBg: 'bg-rose-600 text-white border-rose-600' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSeverity(lvl.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono border transition cursor-pointer text-center ${
                        severity === lvl.id
                          ? `${lvl.activeBg} shadow-2xs`
                          : `bg-white ${lvl.color} hover:bg-slate-50`
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-[11px] flex items-center justify-between">
                <span>Defect Description & Workstation Observations:</span>
                <span className="text-[10px] text-slate-400 font-normal">Be specific with sheet count / plate #</span>
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact defect: e.g. Form 2 Cyan plate has a 2mm drag streak, delta-E color variation exceeded 3.5, excessive trimming cut into artwork..."
                required
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
              />
            </div>

            {/* Reporter Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Reported By (Operator / Inspector Name):
              </label>
              <div className="relative">
                <User size={13} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Information alert */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert size={15} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <b>Workflow Impact:</b> Raising this QC Flag immediately marks the job card with an active defect badge, sends an urgent alert to the Quality Control desk, and enables resolution or pipeline rewind.
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeQCFlagModal}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Flag size={13} />
                <span>Submit & Raise QC Flag</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
