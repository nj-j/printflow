import React from 'react';
import { Modal } from './Modal';
import {
  Layers,
  Clock,
  Printer,
  FileText,
  Calculator,
  User,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RushBadge } from './RushBadge';

/**
 * Standardized Technical Job Engineering Spec Sheet Modal
 * Usable across Enquiry Intake, Quotation Estimator, Pre-Press Studio, and Press Terminal.
 */
export const TechnicalSpecSheetModal = ({
  isOpen,
  onClose,
  entity,
  onOpenQuoteEstimator = null
}) => {
  const { resolveJobRushStatus, jobOrders } = useApp();

  if (!isOpen || !entity) return null;

  // Cross-reference linked job order if entity is an enquiry or prepress job
  const matchedJob = jobOrders?.find(j => 
    j.job_ticket_number === entity.job_ticket_number ||
    j.job_ticket_number === entity.enquiry_no ||
    (entity.dn_no && entity.dn_no !== '-' && j.job_ticket_number === `SO-2026-${entity.dn_no}`) ||
    (entity.customer_name && j.customer_name?.toLowerCase().trim() === entity.customer_name?.toLowerCase().trim())
  );

  const active = matchedJob || entity;
  const isUrgent = resolveJobRushStatus(active);

  // Reference numbers
  const refNumber = entity.job_ticket_number || 
    (entity.dn_no && entity.dn_no !== '-' ? `DN-${entity.dn_no}` : (entity.enquiry_no || entity.id || 'JOB-REF'));

  const jobTitle = entity.job_title || entity.job_name || entity.job_specification || active.job_title || 'Commercial Print Job';
  const customerName = entity.customer_name || active.customer_name || 'Customer';

  // Engineering specs resolution
  const quantity = entity.quantity || active.print_quantity || 1000;
  const paperStock = entity.paper || active.paper_details || '300 GSM Premium Art Card';
  const sheetDimensions = entity.size || 'A4 (210 x 297 mm)';
  
  // Colors resolution
  let colorsText = '4/4 Front & Back Process CMYK';
  if (entity.color) {
    const pt = entity.printing_type ? ` (${entity.printing_type})` : '';
    colorsText = `${entity.color}${pt}`;
  } else if (active.color_spec) {
    colorsText = active.color_spec;
  }

  // Machine resolution
  const assignedMachine = entity.target_machine || active.assigned_press_machine || 
    (Number(quantity) > 5000 ? 'Komori Lithrone 26 (Ramamurthy Nagar Plant)' : 'Ryobi 660 (Ramamurthy Nagar Plant)');

  // Finishing resolution
  let finishingText = 'Thermal Matte Lamination, 3-Side Trim';
  if (Array.isArray(entity.finishing) && entity.finishing.length > 0) {
    finishingText = entity.finishing.join(', ');
  } else if (typeof entity.finishing === 'string' && entity.finishing.trim()) {
    finishingText = entity.finishing.trim();
  } else if (active.finishing_spec) {
    finishingText = active.finishing_spec;
  }
  if (entity.other_finishing?.trim()) {
    finishingText = `${finishingText}, ${entity.other_finishing.trim()}`;
  }

  // Prepress / Staff
  const assignedStaff = entity.prepress || entity.assigned_designer || entity.quote_assigned_to || active.assigned_designer || 'Aruna';

  // Target Date / SLA
  const targetDate = entity.expected_delivery || entity.required_date || active.target_completion_date || entity.date;
  const formattedDate = targetDate
    ? new Date(targetDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Standard 48-72h';

  // Special Notes
  const specialNotes = entity.remarks || entity.job_brief || active.last_note || active.notes || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Technical Spec Sheet — ${refNumber}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs select-none">
        {/* Header / Summary Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Job Order Details
            </span>
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              {jobTitle}
            </h4>
            <p className="text-slate-600 font-medium text-[11px]">{customerName}</p>
          </div>
          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Stage: {entity.current_stage || active.current_stage || 'Quotation'}
            </span>
            {isUrgent ? (
              <RushBadge size="sm" />
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                Priority: {entity.priority || 'Normal'}
              </span>
            )}
            <span className="text-slate-500 font-semibold text-[10px] flex items-center gap-1 font-mono">
              <Clock size={11} className="text-blue-600" /> Target SLA: {formattedDate}
            </span>
          </div>
        </div>

        {/* Technical Specifications Matrix Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 text-xs flex items-center gap-1.5 border-b border-slate-200">
            <Layers size={14} className="text-blue-600" />
            <span>Job Engineering & Prepress Specifications</span>
          </div>
          <table className="w-full text-left text-[11px]">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white">
                <td className="py-2 px-3 font-semibold text-slate-500 w-1/3">Print Quantity:</td>
                <td className="py-2 px-3 font-bold text-blue-900 font-mono">
                  {Number(quantity).toLocaleString('en-IN')} Copies
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-500">Sheet Dimensions / Size:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{sheetDimensions}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2 px-3 font-semibold text-slate-500">Paper Substrate / Stock:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{paperStock}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-500">Color Inks:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{colorsText}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2 px-3 font-semibold text-slate-500">Assigned Press Machine:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{assignedMachine}</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-500">Plate Exposure / CTP:</td>
                <td className="py-2 px-3 font-medium text-slate-800">4 CTP Thermal Plates (2400 DPI)</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2 px-3 font-semibold text-slate-500">Screen Ruling:</td>
                <td className="py-2 px-3 font-medium text-slate-800">175 LPI Conventional Screening</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="py-2 px-3 font-semibold text-slate-500">Post-Press Bindery:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{finishingText}</td>
              </tr>
              <tr className="bg-white">
                <td className="py-2 px-3 font-semibold text-slate-500">Assigned In-charge:</td>
                <td className="py-2 px-3 font-medium text-slate-800">{assignedStaff}</td>
              </tr>
              {entity.amount > 0 && (
                <tr className="bg-blue-50/40">
                  <td className="py-2 px-3 font-semibold text-blue-900">Quoted Commercial Value:</td>
                  <td className="py-2 px-3 font-bold text-blue-900 font-mono">
                    ₹ {Number(entity.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Special Instructions / Notes Banner */}
        {specialNotes && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
            <div className="text-[10px] font-bold uppercase text-amber-800 mb-0.5">
              Special Job Notes / Client Brief
            </div>
            <p className="italic">"{specialNotes}"</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
          <div>
            {onOpenQuoteEstimator && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuoteEstimator(entity);
                }}
                className="btn btn-sm btn-primary cursor-pointer flex items-center gap-1.5 font-bold"
                title="Launch cost estimation calculator with these auto-filled specs"
              >
                <Calculator size={13} />
                <span>Open Quote Estimator</span>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-outline cursor-pointer font-bold text-slate-700"
          >
            Close Spec Sheet
          </button>
        </div>
      </div>
    </Modal>
  );
};
