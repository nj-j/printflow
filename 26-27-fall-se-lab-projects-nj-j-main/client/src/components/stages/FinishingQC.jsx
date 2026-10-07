import React, { useState } from 'react';
import {
  Scissors,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FinishingQC = () => {
  const {
    jobOrders,
    issues,
    reportIssue,
    resolveIssue,
    advanceJobStage,
    setSelectedJobForModal,
    setActiveTab,
  } = useApp();

  const finishingJobs = jobOrders.filter(j => j.current_stage === 'FinishingQC');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedJobIdForIssue, setSelectedJobIdForIssue] = useState(finishingJobs[0]?.id || '');
  const [issueType, setIssueType] = useState('ColorMismatch');
  const [issueSeverity, setIssueSeverity] = useState('Medium');
  const [issueDescription, setIssueDescription] = useState('');

  const handleReportIssue = (e) => {
    e.preventDefault();
    const job = jobOrders.find(j => j.id === selectedJobIdForIssue);
    reportIssue({
      job_order_id: selectedJobIdForIssue,
      job_ticket_number: job?.job_ticket_number || 'General',
      issue_type: issueType,
      severity: issueSeverity,
      description: issueDescription,
    });
    setIssueDescription('');
    setShowIssueModal(false);
  };

  const handlePassQCAndReadyDispatch = (jobId) => {
    advanceJobStage(jobId, 'DispatchReady', 'Passed 100% Quality Inspection. Packed and ready for dispatch.');
    setActiveTab('dispatch');
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage 7: Finishing, Bindery & Quality Control</h1>
          <p className="page-subtitle">
            Manage cutting, thermal lamination, folding, binding, packaging, final quality sign-offs, and shop floor defect issue tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-warning" onClick={() => setShowIssueModal(true)}>
            <AlertTriangle size={16} /> Log Defect / Issue
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('dispatch')}>
            Go to Stage 8: Dispatch <ArrowRight size={14} className="inline" />
          </button>
        </div>
      </div>

      <div className="finishing-two-col-layout">
        {/* Left: Active Finishing Jobs */}
        <div className="card flex-1">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Scissors size={18} className="text-primary" /> Bindery & Finishing Queue
            </h3>
            <span className="badge badge-primary">{finishingJobs.length} In Progress</span>
          </div>

          <div className="finishing-jobs-list">
            {finishingJobs.length === 0 ? (
              <div className="p-8 text-center text-muted">
                No jobs currently in Finishing & Bindery stage.
              </div>
            ) : (
              finishingJobs.map(job => {
                const isUrgent = job.priority === 'Urgent' || job.is_rush_order;
                return (
                  <div key={job.id} className={`finishing-job-card ${isUrgent ? 'urgent-border-pulse' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="ticket-tag font-bold">{job.job_ticket_number}</span>
                        {isUrgent && <span className="badge badge-danger">[URGENT]</span>}
                      </div>
                      <span className="text-xs text-muted">
                        Due: <strong className={isUrgent ? 'text-danger' : 'text-primary'}>{new Date(job.target_completion_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                    </div>

                    <h4 className="font-semibold text-base mt-2">{job.job_title}</h4>
                    <p className="text-xs text-muted">{job.customer_name} | Qty: {job.print_quantity?.toLocaleString()} pcs</p>

                    <div className="finishing-specs-box mt-3 p-3 bg-secondary-light rounded-lg">
                      <div className="text-xs font-bold text-primary mb-1">Required Bindery Operations:</div>
                      <p className="text-xs font-medium text-slate-800">{job.finishing_spec}</p>
                    </div>

                    {/* QC Sign-off Gate */}
                    <div className="mt-4 flex justify-between items-center">
                      <button
                        className="btn btn-xs btn-secondary"
                        onClick={() => setSelectedJobForModal(job)}
                      >
                        Inspect Job Card
                      </button>
                      <button
                        className="btn btn-success font-bold flex items-center gap-1"
                        onClick={() => handlePassQCAndReadyDispatch(job.id)}
                      >
                        <ShieldCheck size={16} /> QC Passed - Ready for Dispatch
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Quality Issue & Defect Register */}
        <div className="card w-1/3">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <AlertTriangle size={18} className="text-warning" /> Quality & Defect Issue Register
            </h3>
            <span className="badge badge-warning">{issues.filter(i => !i.resolved).length} Open</span>
          </div>

          <div className="issues-list-wrapper">
            {issues.map(iss => (
              <div key={iss.id} className={`issue-card-item ${iss.resolved ? 'resolved' : 'unresolved'}`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-primary">{iss.job_ticket_number}</span>
                  <span className={`badge ${iss.resolved ? 'badge-success' : 'badge-danger'}`}>
                    {iss.resolved ? 'Resolved' : `${iss.severity} ${iss.issue_type}`}
                  </span>
                </div>
                <p className="text-xs font-medium mt-1">{iss.description}</p>
                <div className="flex justify-between items-center mt-2 text-xxs text-muted">
                  <span>Reported by: {iss.reported_by_name}</span>
                  {!iss.resolved && (
                    <button
                      className="btn btn-xxs btn-success"
                      onClick={() => resolveIssue(iss.id)}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Defect Issue Modal */}
      {showIssueModal && (
        <div className="modal-backdrop" onClick={() => setShowIssueModal(false)}>
          <div className="modal-container max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Log Production Defect / Quality Issue</h3>
              <button className="modal-close-btn" onClick={() => setShowIssueModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReportIssue} className="p-4">
              <div className="form-group">
                <label>Job Ticket #:</label>
                <select
                  className="form-control"
                  value={selectedJobIdForIssue}
                  onChange={(e) => setSelectedJobIdForIssue(e.target.value)}
                >
                  {jobOrders.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.job_ticket_number} — {j.job_title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Defect Category:</label>
                  <select
                    className="form-control"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option value="ColorMismatch">Color Tone Mismatch</option>
                    <option value="FinishingDefect">Lamination / Crease Defect</option>
                    <option value="Shortage">Paper Sheet Shortage</option>
                    <option value="Complaint">Customer Complaint</option>
                    <option value="Rejection">Batch Rejection</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Severity:</label>
                  <select
                    className="form-control"
                    value={issueSeverity}
                    onChange={(e) => setIssueSeverity(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Issue Description & Corrective Action:</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-actions-footer mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setShowIssueModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Log Issue in Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
