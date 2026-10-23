import React from 'react';
import { Modal } from './Modal';
import { Printer, Zap, Clock, ShieldCheck, UserCheck, Layers, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STAGES, normalizeStage } from '../../utils/stageConstants';

export const JobTicketModal = () => {
  const { selectedJobForModal, setSelectedJobForModal, bumpJobToTop, advanceJobStage } = useApp();

  if (!selectedJobForModal) return null;

  const job = selectedJobForModal;
  const isUrgent = job.priority === 'Urgent' || job.is_rush_order;
  const currentCanonicalStage = normalizeStage(job.current_stage);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={!!selectedJobForModal}
      onClose={() => setSelectedJobForModal(null)}
      title={`Job Ticket / Production Job Card — ${job.job_ticket_number}`}
      maxWidth="max-w-4xl"
    >
      <div className="printable-job-card" id="printable-job-card">
        {/* Top Header */}
        <div className="job-card-header">
          <div className="company-branding">
            <h2>JOSCO PRINTERS</h2>
            <p className="subtitle">Industrial Offset & Commercial Printing Press</p>
            <p className="address">Peenya Industrial Area, Phase 2, Bangalore - 560058</p>
            <p className="contact">Phone: +91 80 2839 4000 | Email: production@joscoprinters.com</p>
          </div>
          <div className="ticket-meta-box">
            <div className="ticket-no-badge">
              <span>JOB CARD #</span>
              <h3>{job.job_ticket_number}</h3>
            </div>
            {isUrgent && (
              <div className="urgent-badge-glow">
                <Zap size={14} /> [URGENT RUSH ORDER]
              </div>
            )}
            <div className="barcode-sim">
              <div className="barcode-lines"></div>
              <span className="barcode-text">*{job.job_ticket_number}*</span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Core Specs Grid */}
        <div className="job-specs-grid">
          <div className="spec-item">
            <span className="spec-label">Customer Name:</span>
            <span className="spec-val font-semibold">{job.customer_name}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Job Title / Description:</span>
            <span className="spec-val font-semibold">{job.job_title}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Production Process:</span>
            <span className="spec-val">Industrial Offset Press (4-Color CMYK)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Print Quantity:</span>
            <span className="spec-val font-bold text-primary">{job.print_quantity?.toLocaleString()} Copies</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Assigned Press Machine:</span>
            <span className="spec-val font-semibold">{job.assigned_press_machine}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Target Completion / SLA:</span>
            <span className={`spec-val font-bold ${isUrgent ? 'text-danger' : 'text-slate-800'}`}>
              <Clock size={14} className="inline mr-1" />
              {new Date(job.target_completion_date).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Technical Specs Table */}
        <div className="ticket-section">
          <h4><Layers size={16} /> Technical Specifications</h4>
          <table className="tech-specs-table">
            <tbody>
              <tr>
                <td className="label-col">Paper Substrate:</td>
                <td>{job.paper_details || '130 GSM Gloss Art Paper (23" x 36")'}</td>
                <td className="label-col">Plate Exposure:</td>
                <td>4 CTP Thermal Plates (2400 DPI)</td>
              </tr>
              <tr>
                <td className="label-col">Color Inks:</td>
                <td>{job.color_spec || '4/4 Front & Back Process CMYK'}</td>
                <td className="label-col">Screen Ruling:</td>
                <td>175 LPI Conventional Screening</td>
              </tr>
              <tr>
                <td className="label-col">Post-Press Bindery:</td>
                <td colSpan="3">{job.finishing_spec || 'Thermal Matte Lamination, Folding, Center Pin Stitching, 3-Side Trim'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Shop Floor Stage Sign-Off Grid */}
        <div className="ticket-section">
          <h4><ShieldCheck size={16} /> Shop Floor Stage Sign-Off</h4>
          <table className="signoff-table">
            <thead>
              <tr>
                <th>Workflow Stage</th>
                <th>Workstation / Machine</th>
                <th>Operator</th>
                <th>Impressions / Waste</th>
                <th>Sign-off Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. Pre-Press & CTP</td>
                <td>Kodak Trendsetter Q800</td>
                <td>Kiran Verma</td>
                <td>4 Plates Exposed</td>
                <td><span className="badge-pass">[PASSED]</span></td>
              </tr>
              <tr>
                <td>2. Press Run</td>
                <td>{job.assigned_press_machine}</td>
                <td>{job.assigned_operator || 'Rajesh Nair'}</td>
                <td>{job.print_quantity} / 30 Waste</td>
                <td>
                  {currentCanonicalStage === STAGES.PRESS ? (
                    <span className="badge-warning font-bold">[IN PROGRESS]</span>
                  ) : currentCanonicalStage === STAGES.FINISHING || currentCanonicalStage === STAGES.QC || currentCanonicalStage === STAGES.DISPATCH || currentCanonicalStage === STAGES.COMPLETED ? (
                    <span className="badge-pass">[PASSED]</span>
                  ) : (
                    <span className="badge-pending">[PENDING]</span>
                  )}
                </td>
              </tr>
              <tr>
                <td>3. Finishing & Bindery</td>
                <td>Polar 115 Cutter / Laminator</td>
                <td>Anil Kumar</td>
                <td>Trimming & Packing</td>
                <td>
                  {currentCanonicalStage === STAGES.FINISHING ? (
                    <span className="badge-warning font-bold">[IN PROGRESS]</span>
                  ) : currentCanonicalStage === STAGES.QC || currentCanonicalStage === STAGES.DISPATCH || currentCanonicalStage === STAGES.COMPLETED ? (
                    <span className="badge-pass">[PASSED]</span>
                  ) : (
                    <span className="badge-pending">[PENDING]</span>
                  )}
                </td>
              </tr>
              <tr>
                <td>4. Final QC & Dispatch</td>
                <td>Dispatch Bay</td>
                <td>Logistics Team</td>
                <td>0 Defects Found</td>
                <td>
                  {currentCanonicalStage === STAGES.DISPATCH || currentCanonicalStage === STAGES.COMPLETED ? (
                    <span className="badge-pass">[PASSED]</span>
                  ) : currentCanonicalStage === STAGES.QC ? (
                    <span className="badge-warning font-bold">[IN PROGRESS]</span>
                  ) : (
                    <span className="badge-pending">[PENDING]</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Special Instructions & Urgent Notes */}
        <div className="special-notes-box">
          <strong>[SPECIAL PRODUCTION NOTES]:</strong>
          {job.last_note || job.notes ? (
            <p className="mt-1 text-slate-800 font-medium italic">
              "{job.last_note || job.notes}"
            </p>
          ) : isUrgent ? (
            <p className="text-danger font-medium mt-1">
              [CRITICAL PRIORITY] Last-minute rush order for Apex Healthcare Conference. Keep Heidelberg registration razor sharp and hand over immediately to cutting and lamination.
            </p>
          ) : (
            <p className="mt-1 text-muted">
              Maintain standard 175 LPI dot screening. Verify color density with spectrophotometer on sheet pull every 500 impressions.
            </p>
          )}
        </div>

        {/* Operator Signature Boxes */}
        <div className="signatures-grid">
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Pre-Press In-Charge</span>
          </div>
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Press Machine Operator</span>
          </div>
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Finishing Supervisor</span>
          </div>
          <div className="sign-box">
            <div className="sign-line"></div>
            <span>Final QC & Dispatch</span>
          </div>
        </div>

        {/* Action Buttons in Modal */}
        <div className="modal-actions-footer no-print">
          <button className="btn btn-secondary" onClick={() => setSelectedJobForModal(null)}>
            Close
          </button>
          {isUrgent && (
            <button
              className="btn btn-warning"
              onClick={() => {
                bumpJobToTop(job.id);
                setSelectedJobForModal(null);
              }}
            >
              <Zap size={16} /> Fast-Track Queue Rank
            </button>
          )}
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} /> Print Official Job Card
          </button>
        </div>
      </div>
    </Modal>
  );
};
