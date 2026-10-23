/**
 * stageConstants.js
 * Centralized Single Source of Truth for Print ERP Workflow Stages.
 * Eliminates redundant raw string identifiers and keyword collisions.
 */

export const STAGES = {
  QUOTATION: 'Quotation',
  PREPRESS: 'Prepress',
  PRESS: 'Press',
  FINISHING: 'Finishing',
  QC: 'QualityControl',
  DISPATCH: 'Dispatch',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

// Canonical 6-stage operational pipeline for Kanban and Planning
export const CANONICAL_STAGES = [
  { id: STAGES.QUOTATION, label: '1. Quotation', color: '#2563eb', badgeClass: 'bg-blue-100 text-blue-800' },
  { id: STAGES.PREPRESS, label: '2. Prepress', color: '#8b5cf6', badgeClass: 'bg-purple-100 text-purple-800' },
  { id: STAGES.PRESS, label: '3. Press', color: '#f59e0b', badgeClass: 'bg-amber-100 text-amber-800' },
  { id: STAGES.FINISHING, label: '4. Finishing', color: '#10b981', badgeClass: 'bg-emerald-100 text-emerald-800' },
  { id: STAGES.QC, label: '5. Quality Control', color: '#0d9488', badgeClass: 'bg-teal-100 text-teal-800' },
  { id: STAGES.DISPATCH, label: '6. Dispatch', color: '#06b6d4', badgeClass: 'bg-cyan-100 text-cyan-800' },
];

// Rich UI Display Configuration per Stage
export const STAGE_CONFIG = {
  [STAGES.QUOTATION]: {
    id: STAGES.QUOTATION,
    label: 'Order Desk & Costing',
    shortLabel: 'Costing',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    number: '1',
  },
  [STAGES.PREPRESS]: {
    id: STAGES.PREPRESS,
    label: 'Pre-Press Studio',
    shortLabel: 'Pre-Press',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    number: '2',
  },
  [STAGES.PRESS]: {
    id: STAGES.PRESS,
    label: 'Press / Printing',
    shortLabel: 'Press',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    number: '3',
  },
  [STAGES.FINISHING]: {
    id: STAGES.FINISHING,
    label: 'Finishing & Bindery',
    shortLabel: 'Finishing',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    number: '4',
  },
  [STAGES.QC]: {
    id: STAGES.QC,
    label: 'QC & Packaging',
    shortLabel: 'QC & Packing',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    number: '5',
  },
  [STAGES.DISPATCH]: {
    id: STAGES.DISPATCH,
    label: 'Delivery & Dispatch',
    shortLabel: 'Dispatch',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    number: '6',
  },
  [STAGES.COMPLETED]: {
    id: STAGES.COMPLETED,
    label: 'Delivered / Closed',
    shortLabel: 'Delivered',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
    number: '7',
  },
  [STAGES.CANCELLED]: {
    id: STAGES.CANCELLED,
    label: 'Cancelled',
    shortLabel: 'Cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    number: '-',
  },
};

// Dropdown options for UI forms & Order Desk table selects
export const STAGE_DROPDOWN_OPTIONS = [
  { id: STAGES.QUOTATION, label: 'Order Desk' },
  { id: STAGES.PREPRESS, label: 'Pre-Press' },
  { id: STAGES.PRESS, label: 'Press / Printing' },
  { id: STAGES.FINISHING, label: 'Finishing' },
  { id: STAGES.QC, label: 'QC & Packing' },
  { id: STAGES.DISPATCH, label: 'Dispatch' },
  { id: STAGES.COMPLETED, label: 'Delivered' },
  { id: STAGES.CANCELLED, label: 'Cancelled' },
];

/**
 * Normalizes ANY raw or legacy stage string into a canonical STAGES enum value.
 * Handles hyphens, spaces, legacy machine terms ('PressRun', 'DesignProofing', 'FinishingQC', etc.)
 */
export const normalizeStage = (stage) => {
  if (!stage) return STAGES.QUOTATION;
  const s = String(stage).toLowerCase().trim();

  // 1. Direct match on canonical stage keys
  if (s === 'quotation') return STAGES.QUOTATION;
  if (s === 'prepress') return STAGES.PREPRESS;
  if (s === 'press') return STAGES.PRESS;
  if (s === 'finishing') return STAGES.FINISHING;
  if (s === 'qualitycontrol' || s === 'quality_control') return STAGES.QC;
  if (s === 'dispatch') return STAGES.DISPATCH;
  if (s === 'completed' || s === 'delivered') return STAGES.COMPLETED;
  if (s === 'cancelled' || s === 'void') return STAGES.CANCELLED;

  // 2. Closed / Delivered
  if (s.includes('deliver') || s.includes('complete') || s.includes('closed')) {
    return STAGES.COMPLETED;
  }
  if (s.includes('cancel')) {
    return STAGES.CANCELLED;
  }

  // 3. Prepress (CHECK BEFORE PRESS because 'pre-press' contains the word 'press'!)
  if (
    s.includes('pre-press') ||
    s.includes('prepress') ||
    s.includes('pre press') ||
    s.includes('pre_press') ||
    s.includes('design') ||
    s.includes('proof') ||
    s.includes('plate') ||
    s.includes('artwork') ||
    s.includes('prep')
  ) {
    return STAGES.PREPRESS;
  }

  // 4. Quality Control & Inspection
  if (
    s.includes('qc') ||
    s.includes('quality') ||
    s.includes('inspection')
  ) {
    return STAGES.QC;
  }

  // 5. Press / Printing (Only true press run stages)
  if (
    s.includes('pressrun') ||
    s.includes('printing') ||
    s.includes('print') ||
    s.includes('press')
  ) {
    return STAGES.PRESS;
  }

  // 6. Finishing & Bindery
  if (
    s.includes('finish') ||
    s.includes('bind') ||
    s.includes('cut') ||
    s.includes('lamina') ||
    s.includes('punch')
  ) {
    return STAGES.FINISHING;
  }

  // 7. Dispatch & Logistics
  if (
    s.includes('dispatch') ||
    s.includes('transit') ||
    s.includes('route') ||
    s.includes('shipping') ||
    s.includes('logist') ||
    s.includes('gate') ||
    s.includes('ready')
  ) {
    return STAGES.DISPATCH;
  }

  // 8. Order Desk / Quotation / Intake
  if (
    s.includes('quote') ||
    s.includes('cost') ||
    s.includes('order desk') ||
    s.includes('enquiry') ||
    s === 'booked' ||
    s.includes('intake') ||
    s.includes('awaiting')
  ) {
    return STAGES.QUOTATION;
  }

  return STAGES.QUOTATION;
};

/**
 * Calculates linear forward stage progression.
 */
export const getNextStage = (currentStage) => {
  const canonical = normalizeStage(currentStage);
  switch (canonical) {
    case STAGES.QUOTATION: return STAGES.PREPRESS;
    case STAGES.PREPRESS: return STAGES.PRESS;
    case STAGES.PRESS: return STAGES.FINISHING;
    case STAGES.FINISHING: return STAGES.QC;
    case STAGES.QC: return STAGES.DISPATCH;
    case STAGES.DISPATCH: return STAGES.COMPLETED;
    default: return null;
  }
};

/**
 * Calculates backward rewind stage progression (for QC returns/rewinds).
 */
export const getPrevStage = (currentStage) => {
  const canonical = normalizeStage(currentStage);
  switch (canonical) {
    case STAGES.DISPATCH: return STAGES.QC;
    case STAGES.QC: return STAGES.FINISHING;
    case STAGES.FINISHING: return STAGES.PRESS;
    case STAGES.PRESS: return STAGES.PREPRESS;
    case STAGES.PREPRESS: return STAGES.QUOTATION;
    default: return null;
  }
};

/**
 * Formats a stage for user-facing UI badge display.
 */
export const getStageDisplay = (stage) => {
  const canonical = normalizeStage(stage);
  return STAGE_CONFIG[canonical] || STAGE_CONFIG[STAGES.QUOTATION];
};
