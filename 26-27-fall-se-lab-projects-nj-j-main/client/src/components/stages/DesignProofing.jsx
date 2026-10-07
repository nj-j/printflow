import React, { useState } from 'react';
import {
  Palette,
  CheckCircle2,
  XCircle,
  FileCheck,
  Upload,
  Layers,
  Sparkles,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DesignProofing = () => {
  const { designProofs, updateDesignProof, setActiveTab } = useApp();
  const [selectedProofId, setSelectedProofId] = useState(designProofs[0]?.id || '');
  const [feedbackText, setFeedbackText] = useState('');

  const activeProof = designProofs.find(p => p.id === selectedProofId) || designProofs[0];

  const handleToggleChecklist = (field) => {
    if (!activeProof) return;
    const updates = { [field]: !activeProof[field] };
    updateDesignProof(activeProof.id, updates, activeProof.client_approval_status);
  };

  const handleApproveProof = () => {
    if (!activeProof) return;
    updateDesignProof(
      activeProof.id,
      { checklist_cmyk: true, checklist_dpi: true, checklist_bleed: true, checklist_overprint: true, checklist_fonts: true },
      'Approved',
      feedbackText || 'Customer signed off final proof. Released to CTP Plate Making.'
    );
    setFeedbackText('');
  };

  const handleRequestRevision = () => {
    if (!activeProof) return;
    updateDesignProof(
      activeProof.id,
      { revision_round: (activeProof.revision_round || 1) + 1 },
      'RevisionRequested',
      feedbackText || 'Revision requested on color tones / text corrections.'
    );
    setFeedbackText('');
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage 3: Design & Pre-Press Proofing Studio</h1>
          <p className="page-subtitle">
            Pre-flight verification checklist, designer assignment, digital proofing approval gate, and automatic release to CTP Plate Making.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setActiveTab('production')}>
            View Plate Making in Kanban <ArrowRight size={14} className="inline" />
          </button>
        </div>
      </div>

      <div className="design-proofing-layout">
        {/* Left: Proofs Queue */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Palette size={18} className="text-primary" /> Proofing Queue
            </h3>
            <span className="badge badge-primary">{designProofs.length} Items</span>
          </div>

          <div className="proofs-list">
            {designProofs.map(proof => {
              const isApproved = proof.client_approval_status === 'Approved';
              const isRevision = proof.client_approval_status === 'RevisionRequested';
              const isSelected = activeProof?.id === proof.id;

              return (
                <div
                  key={proof.id}
                  className={`proof-item-card cursor-pointer ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedProofId(proof.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="ticket-tag font-bold">{proof.job_ticket_number}</span>
                    <span className={`status-pill status-${isApproved ? 'approved' : (isRevision ? 'rejected' : 'draft')}`}>
                      {proof.client_approval_status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mt-1">{proof.job_title}</h4>
                  <div className="text-xs text-muted mt-1">
                    Designer: <strong>{proof.designer_name}</strong> | Round: <strong>{proof.revision_round}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Proof Inspection & 5-Point Pre-flight Checklist */}
        {activeProof ? (
          <div className="card flex-1">
            <div className="card-header">
              <div>
                <span className="ticket-tag font-bold mr-2">{activeProof.job_ticket_number}</span>
                <h3 className="card-title inline">{activeProof.job_title}</h3>
                <p className="card-subtitle mt-1">
                  Assigned Pre-Press Lead: <strong>{activeProof.designer_name}</strong> | Revision Round: <strong>{activeProof.revision_round} / 3 Max</strong>
                </p>
              </div>
              <span className={`badge ${activeProof.client_approval_status === 'Approved' ? 'badge-success' : 'badge-warning'}`}>
                {activeProof.client_approval_status}
              </span>
            </div>

            {/* Proofing Canvas / Graphic Preview */}
            <div className="proof-canvas-container">
              <div className="proof-preview-box">
                <div className="proof-graphic-placeholder">
                  <FileCheck size={48} className="text-primary mb-2" />
                  <div className="font-bold text-sm">{activeProof.proof_file_name}</div>
                  <span className="text-xs text-muted">High-Res Imposed PDF (175 LPI Screening Ready)</span>
                  <div className="mt-2 flex gap-2 justify-center">
                    <button className="btn btn-xs btn-secondary">Download PDF</button>
                    <button className="btn btn-xs btn-primary">Zoom Imposition</button>
                  </div>
                </div>
              </div>

              {/* 5-Point Technical Pre-Flight Checklist */}
              <div className="preflight-checklist-card">
                <h4 className="checklist-heading flex items-center gap-2">
                  <ShieldCheck size={16} className="text-success" /> Pre-Flight Production Quality Checklist
                </h4>
                <p className="text-xs text-muted mb-3">
                  All 5 technical parameters must pass before plate exposure on Kodak Trendsetter CTP:
                </p>

                <div className="checklist-items-grid">
                  <div
                    className={`checklist-item-box ${activeProof.checklist_cmyk ? 'passed' : 'pending'}`}
                    onClick={() => handleToggleChecklist('checklist_cmyk')}
                  >
                    <input type="checkbox" checked={!!activeProof.checklist_cmyk} readOnly />
                    <div>
                      <span className="checklist-item-title">1. CMYK Color Space</span>
                      <p className="text-xxs text-muted">No RGB images / Spot Pantone verified</p>
                    </div>
                  </div>

                  <div
                    className={`checklist-item-box ${activeProof.checklist_dpi ? 'passed' : 'pending'}`}
                    onClick={() => handleToggleChecklist('checklist_dpi')}
                  >
                    <input type="checkbox" checked={!!activeProof.checklist_dpi} readOnly />
                    <div>
                      <span className="checklist-item-title">2. 300+ DPI Resolution</span>
                      <p className="text-xxs text-muted">Raster graphics check for zero pixelation</p>
                    </div>
                  </div>

                  <div
                    className={`checklist-item-box ${activeProof.checklist_bleed ? 'passed' : 'pending'}`}
                    onClick={() => handleToggleChecklist('checklist_bleed')}
                  >
                    <input type="checkbox" checked={!!activeProof.checklist_bleed} readOnly />
                    <div>
                      <span className="checklist-item-title">3. 3mm Bleed & Quiet Zone</span>
                      <p className="text-xxs text-muted">Crop marks and spine safety margin</p>
                    </div>
                  </div>

                  <div
                    className={`checklist-item-box ${activeProof.checklist_overprint ? 'passed' : 'pending'}`}
                    onClick={() => handleToggleChecklist('checklist_overprint')}
                  >
                    <input type="checkbox" checked={!!activeProof.checklist_overprint} readOnly />
                    <div>
                      <span className="checklist-item-title">4. Overprint & Trapping</span>
                      <p className="text-xxs text-muted">100% Black text overprint, no white knockouts</p>
                    </div>
                  </div>

                  <div
                    className={`checklist-item-box ${activeProof.checklist_fonts ? 'passed' : 'pending'}`}
                    onClick={() => handleToggleChecklist('checklist_fonts')}
                  >
                    <input type="checkbox" checked={!!activeProof.checklist_fonts} readOnly />
                    <div>
                      <span className="checklist-item-title">5. Embedded Fonts / Outlines</span>
                      <p className="text-xxs text-muted">All typography vectorized into curves</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Review Feedback & Decision Gate */}
            <div className="proof-decision-gate mt-4">
              <label className="font-bold text-xs">Customer Sign-Off Feedback / Revision Remarks:</label>
              <textarea
                className="form-control mt-1"
                rows="2"
                placeholder="Enter client review feedback or approval notes..."
                value={feedbackText || activeProof.client_feedback || ''}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>

              <div className="flex gap-2 justify-end mt-3">
                <button
                  type="button"
                  className="btn btn-warning flex items-center gap-1"
                  onClick={handleRequestRevision}
                >
                  <XCircle size={16} /> Request Revision (Round {(activeProof.revision_round || 1) + 1})
                </button>
                <button
                  type="button"
                  className="btn btn-success flex items-center gap-1 font-bold"
                  onClick={handleApproveProof}
                >
                  <CheckCircle2 size={16} /> Final Customer Sign-Off & Release to CTP Plates
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="card flex-1 p-8 text-center text-muted">
            Select a job proof from the left queue to inspect.
          </div>
        )}
      </div>
    </div>
  );
};
