import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import {
  FileText,
  Printer,
  User,
  Phone,
  Mail,
  Layers,
  Calendar,
  DollarSign,
  CheckSquare,
  Square,
  PrinterIcon,
  Save,
  Clock,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FLEET_MACHINE_OPTIONS, resolveDefaultPressMachine } from '../../utils/machineRouting';

export const STANDARD_SIZES = [
  'A4 (210 x 297 mm)',
  'A5 (148 x 210 mm)',
  'A3 (297 x 420 mm)',
  'A6 (105 x 148 mm)',
  '12" x 18" (Digital Sheet)',
  '13" x 19" (Digital Super B)',
  '10" x 15" (Demi 1/4)',
  '18" x 23" (Crown Sheet)',
  '20" x 30" (Double Crown)',
  'Visiting Card (3.5" x 2")',
  'Custom / Other'
];

export const STANDARD_PAPER_OPTIONS = [
  '300 GSM Premium Art Card',
  '350 GSM Art Card',
  '250 GSM Art Card',
  '170 GSM Matte Art Paper',
  '130 GSM Gloss Art Paper',
  '100 GSM Bond Paper',
  '80 GSM Sunshine Maplitho',
  '70 GSM Maplitho Paper',
  '250 GSM Duplex Board',
  '300 GSM Cyber XL Board',
  'Self-Adhesive Chromo Sticker Sheet',
  'PVC Non-Tearable Sheet',
  'Kraft Paper 120 GSM',
  'Butter Paper / Tracing Paper',
  'Metallic / Textured Specialty Paper'
];

export const EnquiryFormModal = ({ isOpen, onClose, enquiryData = null, onSaveEnquiry }) => {
  const { customers, users } = useApp();

  // Form State initialized from enquiryData or defaults
  const [enquiryNo, setEnquiryNo] = useState(enquiryData?.enquiry_no || `ENQ-${Date.now().toString().slice(-6)}`);
  const [enquiryDate, setEnquiryDate] = useState(enquiryData?.date || new Date().toISOString().split('T')[0]);

  // 1. Customer Details
  const [customerName, setCustomerName] = useState(enquiryData?.customer_name || '');
  const [phone, setPhone] = useState(enquiryData?.phone?.replace(/\D/g, '').slice(-10) || '');
  const [phoneError, setPhoneError] = useState('');
  const [altPhone, setAltPhone] = useState(enquiryData?.alt_phone?.replace(/\D/g, '').slice(-10) || '');
  const [altPhoneError, setAltPhoneError] = useState('');
  const [customerType, setCustomerType] = useState(enquiryData?.customer_type || 'New'); // New, Repeat
  const [email, setEmail] = useState(enquiryData?.email || '');
  const [source, setSource] = useState(enquiryData?.source || 'Walk-in'); // Walk-in, Phone, WhatsApp, Reference, Other
  const [otherSource, setOtherSource] = useState('');

  // 2. Job Details
  const [jobTitle, setJobTitle] = useState(enquiryData?.job_name || enquiryData?.job_title || enquiryData?.job_specification || '');
  const [jobTypes, setJobTypes] = useState(enquiryData?.job_types || ['Offset Printing']);
  const [otherJobType, setOtherJobType] = useState('');
  const [jobBrief, setJobBrief] = useState(enquiryData?.job_brief || '');

  // 3. Specifications - Dropdown with Custom describe option
  const initialSizeIsStandard = STANDARD_SIZES.filter(s => s !== 'Custom / Other').includes(enquiryData?.size);
  const [sizeOption, setSizeOption] = useState(() => {
    if (!enquiryData?.size) return 'A4 (210 x 297 mm)';
    return initialSizeIsStandard ? enquiryData.size : 'Custom / Other';
  });
  const [customSize, setCustomSize] = useState(() => {
    if (!enquiryData?.size) return '';
    return initialSizeIsStandard ? '' : enquiryData.size;
  });

  const [quantity, setQuantity] = useState(enquiryData?.quantity || 1000);
  const [materialPaper, setMaterialPaper] = useState(enquiryData?.paper || '300 GSM Art Card');
  const [isPaperDropdownOpen, setIsPaperDropdownOpen] = useState(false);
  const paperDropdownRef = useRef(null);

  // Close paper dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paperDropdownRef.current && !paperDropdownRef.current.contains(event.target)) {
        setIsPaperDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPaperOptions = STANDARD_PAPER_OPTIONS.filter(opt =>
    opt.toLowerCase().includes((materialPaper || '').toLowerCase())
  );
  const [printingType, setPrintingType] = useState(enquiryData?.printing_type || 'Double Side'); // Single Side, Double Side
  const [colorType, setColorType] = useState(enquiryData?.color || 'Color'); // B/W, Color
  const [finishingOptions, setFinishingOptions] = useState(enquiryData?.finishing || ['Lamination (Matte / Gloss)']);
  const existingOtherFinishing = enquiryData?.other_finishing || 
    enquiryData?.finishing?.find(f => typeof f === 'string' && f.startsWith('Other: '))?.replace('Other: ', '') || '';
  const [otherFinishing, setOtherFinishing] = useState(existingOtherFinishing);

  // 4. Design Status
  const [designStatus, setDesignStatus] = useState(enquiryData?.design_status || 'Ready to Print'); // Ready to Print, Needs Editing, Design Required
  const [designLanguage, setDesignLanguage] = useState('English');
  const [contentGiven, setContentGiven] = useState('Yes');
  const [referenceShared, setReferenceShared] = useState('Yes');
  const [designNotes, setDesignNotes] = useState('');

  // 5. Delivery Details
  const [requiredByDate, setRequiredByDate] = useState(enquiryData?.required_date || new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0]);
  const [urgency, setUrgency] = useState(enquiryData?.urgency || 'Normal'); // Normal, Urgent
  const [deliveryMode, setDeliveryMode] = useState(enquiryData?.delivery_mode || 'Pickup'); // Pickup, Delivery
  const [deliveryAddress, setDeliveryAddress] = useState(enquiryData?.address || '');

  // 6. Assignment & Stage (Internal)
  const [quoteAssignedTo, setQuoteAssignedTo] = useState(enquiryData?.quote_assigned_to || 'Krishnamani');
  const [currentStage, setCurrentStage] = useState(enquiryData?.current_stage || 'Order Desk');
  const [prepressAssignedTo, setPrepressAssignedTo] = useState(enquiryData?.prepress || 'Aruna');
  const [vendorOutsource, setVendorOutsource] = useState(enquiryData?.vendor || '');
  const [assignedPressMachine, setAssignedPressMachine] = useState(enquiryData?.assigned_press_machine || enquiryData?.target_machine || '');
  const [remarks, setRemarks] = useState(enquiryData?.remarks || '');

  // Synchronize form fields whenever enquiryData changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (enquiryData) {
        setEnquiryNo(enquiryData.enquiry_no || enquiryData.id || `ENQ-${Date.now().toString().slice(-6)}`);
        setEnquiryDate(enquiryData.date || new Date().toISOString().split('T')[0]);
        setCustomerName(enquiryData.customer_name || '');
        setPhone(enquiryData.phone?.replace(/\D/g, '').slice(-10) || '');
        setPhoneError('');
        setAltPhone(enquiryData.alt_phone?.replace(/\D/g, '').slice(-10) || '');
        setAltPhoneError('');
        setCustomerType(enquiryData.customer_type || 'New');
        setEmail(enquiryData.email || '');
        setSource(enquiryData.source || 'Walk-in');
        setOtherSource('');
        setJobTitle(enquiryData.job_name || enquiryData.job_title || enquiryData.job_specification || '');
        setJobTypes(enquiryData.job_types || ['Offset Printing']);
        setOtherJobType(enquiryData.other_job_type || '');
        setJobBrief(enquiryData.job_brief || '');
        
        const standardMatch = STANDARD_SIZES.filter(s => s !== 'Custom / Other').includes(enquiryData.size);
        setSizeOption(enquiryData.size ? (standardMatch ? enquiryData.size : 'Custom / Other') : 'A4 (210 x 297 mm)');
        setCustomSize(enquiryData.size && !standardMatch ? enquiryData.size : '');
        
        setQuantity(enquiryData.quantity || 1000);
        setMaterialPaper(enquiryData.paper || '300 GSM Art Card');
        setPrintingType(enquiryData.printing_type || 'Double Side');
        setColorType(enquiryData.color || 'Color');
        setFinishingOptions(enquiryData.finishing || ['Lamination (Matte / Gloss)']);
        setOtherFinishing(enquiryData.other_finishing || '');
        setDesignStatus(enquiryData.design_status || 'Ready to Print');
        setRequiredByDate(enquiryData.required_date || enquiryData.expected_delivery || new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0]);
        setUrgency(enquiryData.urgency || 'Normal');
        setDeliveryMode(enquiryData.delivery_mode || 'Pickup');
        setDeliveryAddress(enquiryData.address || '');
        setQuoteAssignedTo(enquiryData.quote_assigned_to || 'Krishnamani');
        setCurrentStage(enquiryData.current_stage || 'Order Desk');
        setPrepressAssignedTo(enquiryData.prepress || 'Aruna');
        setVendorOutsource(enquiryData.vendor || '');
        setAssignedPressMachine(enquiryData.assigned_press_machine || enquiryData.target_machine || '');
        setRemarks(enquiryData.remarks || '');
      } else {
        setEnquiryNo(`ENQ-${Date.now().toString().slice(-6)}`);
        setEnquiryDate(new Date().toISOString().split('T')[0]);
        setCustomerName('');
        setPhone('');
        setPhoneError('');
        setAltPhone('');
        setAltPhoneError('');
        setCustomerType('New');
        setEmail('');
        setSource('Walk-in');
        setOtherSource('');
        setJobTitle('');
        setJobTypes(['Offset Printing']);
        setOtherJobType('');
        setJobBrief('');
        setSizeOption('A4 (210 x 297 mm)');
        setCustomSize('');
        setQuantity(1000);
        setMaterialPaper('300 GSM Art Card');
        setPrintingType('Double Side');
        setColorType('Color');
        setFinishingOptions(['Lamination (Matte / Gloss)']);
        setOtherFinishing('');
        setDesignStatus('Ready to Print');
        setRequiredByDate(new Date(Date.now() + 3*24*3600*1000).toISOString().split('T')[0]);
        setUrgency('Normal');
        setDeliveryMode('Pickup');
        setDeliveryAddress('');
        setQuoteAssignedTo('Krishnamani');
        setCurrentStage('Order Desk');
        setPrepressAssignedTo('Aruna');
        setVendorOutsource('');
        setAssignedPressMachine('');
        setRemarks('');
      }
    }
  }, [isOpen, enquiryData]);

  // Phone Validation Logic (10 digits mobile number)
  const validatePhoneNumber = (value, isRequired = true) => {
    const digits = (value || '').replace(/\D/g, '');
    if (!digits) {
      return isRequired ? 'Phone number is required (10 digits)' : '';
    }
    if (digits.length !== 10) {
      return `Must be an actual 10-digit number (${digits.length}/10)`;
    }
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return 'Must be a valid 10-digit mobile number starting with 6, 7, 8, or 9';
    }
    return '';
  };

  const handlePhoneChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 12 && raw.startsWith('91')) {
      raw = raw.slice(2);
    }
    const val = raw.slice(0, 10);
    setPhone(val);
    if (val.length === 10) {
      setPhoneError(validatePhoneNumber(val, true));
    } else if (phoneError) {
      setPhoneError(validatePhoneNumber(val, true));
    }
  };

  const handlePhoneBlur = () => {
    setPhoneError(validatePhoneNumber(phone, true));
  };

  const handleAltPhoneChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length === 12 && raw.startsWith('91')) {
      raw = raw.slice(2);
    }
    const val = raw.slice(0, 10);
    setAltPhone(val);
    if (val.length === 10) {
      setAltPhoneError(validatePhoneNumber(val, false));
    } else if (altPhoneError) {
      setAltPhoneError(validatePhoneNumber(val, false));
    }
  };

  const handleAltPhoneBlur = () => {
    if (altPhone) {
      setAltPhoneError(validatePhoneNumber(altPhone, false));
    } else {
      setAltPhoneError('');
    }
  };

  const toggleCheckbox = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handlePrintForm = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Validate Phone Number (must be actual 10 digits)
    const phoneErr = validatePhoneNumber(phone, true);
    if (phoneErr) {
      setPhoneError(phoneErr);
      return;
    }
    if (altPhone) {
      const altErr = validatePhoneNumber(altPhone, false);
      if (altErr) {
        setAltPhoneError(altErr);
        return;
      }
    }

    // 2. Resolve Size (dropdown or custom describe)
    const resolvedSize = (sizeOption === 'Custom / Other' || sizeOption === 'Other')
      ? (customSize.trim() || 'Custom Size')
      : sizeOption;

    // 3. Resolve Finishing & Job Types if Other is specified
    const resolvedFinishing = finishingOptions.map(f => {
      if (f === 'Other' && otherFinishing.trim()) {
        return `Other: ${otherFinishing.trim()}`;
      }
      return f;
    });

    const resolvedJobTypes = jobTypes.map(t => {
      if (t === 'Other' && otherJobType.trim()) {
        return `Other: ${otherJobType.trim()}`;
      }
      return t;
    });

    const finalJobTitle = (jobTitle || '').trim() || (jobBrief || '').trim() || (resolvedJobTypes.length > 0 ? resolvedJobTypes.join(', ') : `${quantity} nos ${resolvedSize}`);

    const finalMachine = assignedPressMachine
      ? assignedPressMachine
      : resolveDefaultPressMachine({
          quantity,
          production_type: resolvedJobTypes[0] || 'Offset',
          printing_type: printingType,
          color: colorType,
          job_specification: finalJobTitle,
          job_name: finalJobTitle
        });

    if (onSaveEnquiry) {
      onSaveEnquiry({
        enquiry_no: enquiryNo,
        date: enquiryDate,
        customer_name: customerName,
        phone,
        alt_phone: altPhone,
        customer_type: customerType,
        email,
        source: source === 'Other' ? otherSource : source,
        job_name: finalJobTitle,
        job_title: finalJobTitle,
        job_types: resolvedJobTypes,
        other_job_type: otherJobType,
        job_brief: jobBrief,
        job_specification: finalJobTitle,
        size: resolvedSize,
        quantity,
        paper: materialPaper,
        printing_type: printingType,
        color: colorType,
        finishing: resolvedFinishing,
        other_finishing: otherFinishing,
        design_status: designStatus,
        required_date: requiredByDate,
        expected_delivery: requiredByDate,
        urgency,
        delivery_mode: deliveryMode,
        address: deliveryAddress,
        estimated_amount: enquiryData?.estimated_amount || 0,
        discount: enquiryData?.discount || 0,
        final_quote: enquiryData?.final_quote || 0,
        gst: enquiryData?.gst || 0,
        amount: enquiryData?.amount || 0,
        costing_status: enquiryData?.costing_status || 'Awaiting Costing',
        total_amount: enquiryData?.total_amount || 0,
        quote_assigned_to: quoteAssignedTo,
        current_stage: currentStage,
        prepress: prepressAssignedTo,
        vendor: vendorOutsource,
        assigned_press_machine: finalMachine,
        target_machine: finalMachine,
        remarks,
        advance: enquiryData?.advance || 0,
        payment_mode: enquiryData?.payment_mode || 'UPI',
        balance: enquiryData?.balance || 0,
        payment_terms: enquiryData?.payment_terms || 'Advance + Balance',
        status: enquiryData?.status || 'Enquiry',
        next_followup: enquiryData?.next_followup || ''
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={enquiryData ? `Josco Printers — Edit Job / Enquiry (${enquiryData.enquiry_no || enquiryData.id})` : "Josco Printers — New Enquiry Form (For Quotation)"}
      maxWidth="max-w-4xl"
    >
      <div className="printable-enquiry-form-wrapper p-4 bg-white">
        {/* Sub-header badge */}
        <div className="no-print flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
          <span className="badge badge-primary text-xs font-semibold">
            {enquiryData ? 'Edit Master Job Record' : 'Master Customer Enquiry Form'}
          </span>
        </div>

        {/* Physical Form Printable Header */}
        <div className="enquiry-form-header flex justify-between items-start mb-4">
          <div className="company-logo-section">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-sans">JOSCO</h1>
            <div className="text-xs font-extrabold tracking-widest text-primary uppercase">PRINTERS</div>
          </div>
          <div className="form-title-section text-center">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
              {enquiryData ? 'EDIT JOB / ENQUIRY FORM' : 'NEW ENQUIRY FORM'}
            </h2>
            <div className="text-xs font-bold text-red-600 uppercase tracking-wider">(FOR QUOTATION)</div>
          </div>
          <div className="enquiry-meta-box border border-slate-300 rounded p-2 text-xs text-right min-w-[200px]">
            <div className="flex justify-between gap-2 my-0.5">
              <span className="font-bold">Enquiry No. :</span>
              <input
                type="text"
                className="border-b border-slate-400 text-right font-mono font-bold w-28 text-xs focus:outline-none"
                value={enquiryNo}
                onChange={(e) => setEnquiryNo(e.target.value)}
              />
            </div>
            <div className="flex justify-between gap-2 my-0.5">
              <span className="font-bold">Date :</span>
              <input
                type="date"
                className="border-b border-slate-400 text-right font-bold w-28 text-xs focus:outline-none"
                value={enquiryDate}
                onChange={(e) => setEnquiryDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 10-Section Form Grid */}
        <form onSubmit={handleSubmit} className="enquiry-sections-grid text-xs space-y-4">
          {/* Row 1: Section 1 (Customer Details) & Section 2 (Job Details) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. CUSTOMER DETAILS */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-900 text-white font-bold px-3 py-1.5 uppercase text-xs">
                1. CUSTOMER DETAILS
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Customer Name :</label>
                  <input
                    type="text"
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-semibold"
                    placeholder="Company or Individual Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                {/* Phone Number with 10-digit check */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="w-32 font-bold text-slate-700 flex items-center justify-between">
                      <span>Phone Number :</span>
                    </label>
                    <div className="flex-1 relative flex items-center">
                      <span className="text-slate-500 font-mono text-xs font-semibold mr-1.5">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className={`flex-1 border-b ${
                          phoneError ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                        } focus:border-primary outline-none py-0.5 font-mono font-bold tracking-wider`}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={handlePhoneChange}
                        onBlur={handlePhoneBlur}
                        required
                      />
                      {phone && (
                        <span className={`text-[10px] font-mono font-bold ml-1.5 px-1 rounded ${
                          phone.length === 10 && !phoneError
                            ? 'text-emerald-700 bg-emerald-100 font-extrabold'
                            : 'text-slate-500 bg-slate-100'
                        }`}>
                          {phone.length}/10
                        </span>
                      )}
                    </div>
                  </div>
                  {phoneError && (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold pl-32">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{phoneError}</span>
                    </div>
                  )}
                </div>

                {/* Alternate Phone Number (Optional, but checked for 10-digits if entered) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="w-32 font-bold text-slate-700">Alternate No. :</label>
                    <div className="flex-1 relative flex items-center">
                      <span className="text-slate-500 font-mono text-xs font-semibold mr-1.5">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        className={`flex-1 border-b ${
                          altPhoneError ? 'border-red-500 bg-red-50/40' : 'border-slate-300'
                        } focus:border-primary outline-none py-0.5 font-mono`}
                        placeholder="Optional 10-digit number"
                        value={altPhone}
                        onChange={handleAltPhoneChange}
                        onBlur={handleAltPhoneBlur}
                      />
                      {altPhone && (
                        <span className={`text-[10px] font-mono font-bold ml-1.5 px-1 rounded ${
                          altPhone.length === 10 && !altPhoneError
                            ? 'text-emerald-700 bg-emerald-100'
                            : 'text-slate-500 bg-slate-100'
                        }`}>
                          {altPhone.length}/10
                        </span>
                      )}
                    </div>
                  </div>
                  {altPhoneError && (
                    <div className="flex items-center gap-1 text-[11px] text-red-600 font-semibold pl-32">
                      <AlertCircle size={12} className="shrink-0" />
                      <span>{altPhoneError}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 py-1">
                  <label className="w-32 font-bold text-slate-700">Category :</label>
                  {['Retail', 'Reseller', 'Corporate'].map(cat => (
                    <label key={cat} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="customerCategory"
                        checked={(enquiryData?.customer_category || 'Retail') === cat}
                        onChange={() => {}}
                      />
                      <span className="font-semibold">{cat}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-4 py-1">
                  <label className="w-32 font-bold text-slate-700">Customer Type :</label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      checked={customerType === 'New'}
                      onChange={() => setCustomerType('New')}
                    />
                    <span>New</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      checked={customerType === 'Repeat'}
                      onChange={() => setCustomerType('Repeat')}
                    />
                    <span>Repeat</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Email (Optional) :</label>
                  <input
                    type="email"
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-3">
                    <label className="w-32 font-bold text-slate-700">Source :</label>
                    {['Walk-in', 'Phone', 'WhatsApp', 'Reference', 'Other'].map(src => (
                      <label key={src} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="source"
                          checked={source === src}
                          onChange={() => setSource(src)}
                        />
                        <span>{src}</span>
                      </label>
                    ))}
                  </div>
                  {source === 'Other' && (
                    <div className="pl-32 pt-0.5">
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs focus:border-primary outline-none bg-slate-50 font-medium"
                        placeholder="Specify other lead source..."
                        value={otherSource}
                        onChange={(e) => setOtherSource(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. JOB DETAILS */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-emerald-800 text-white font-bold px-3 py-1.5 uppercase text-xs">
                2. JOB DETAILS
              </div>
              <div className="p-3 space-y-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Job Name / Title <span className="text-red-500">*</span> :
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 outline-none bg-white"
                    placeholder="e.g. Annual Report 2026, Wedding Cards, Product Catalog..."
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Job Type (Tick All That Apply) :</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                    {[
                      'Visiting Card', 'Flex / Banner', 'Stickers',
                      'Offset Printing', 'Digital Print', 'Book / Brochure',
                      'Letterhead', 'Pamphlet / Flyer', 'Other'
                    ].map(type => (
                      <label key={type} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobTypes.includes(type)}
                          onChange={() => toggleCheckbox(jobTypes, setJobTypes, type)}
                        />
                        <span className="text-xxs">{type}</span>
                      </label>
                    ))}
                  </div>
                  {jobTypes.includes('Other') && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="w-full border border-emerald-300 rounded px-2.5 py-1 text-xs focus:border-primary outline-none bg-emerald-50/60 font-medium"
                        placeholder="Specify other job type..."
                        value={otherJobType}
                        onChange={(e) => setOtherJobType(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                <div className="pt-1">
                  <label className="font-bold text-slate-700 block mb-1">Job Specification (Brief) :</label>
                  <textarea
                    rows="3"
                    className="w-full border border-slate-300 rounded p-1.5 focus:border-primary outline-none"
                    placeholder="Enter detailed job brief, pages, binding preferences, and special notes..."
                    value={jobBrief}
                    onChange={(e) => setJobBrief(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Section 3 (Specifications) & Section 4 (Design Status) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. SPECIFICATIONS */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-purple-800 text-white font-bold px-3 py-1.5 uppercase text-xs">
                3. SPECIFICATIONS
              </div>
              <div className="p-3 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <label className="w-36 font-bold text-slate-700">Size / Dimension :</label>
                    <select
                      className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-medium bg-transparent cursor-pointer"
                      value={sizeOption}
                      onChange={(e) => setSizeOption(e.target.value)}
                    >
                      {STANDARD_SIZES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {(sizeOption === 'Custom / Other' || sizeOption === 'Other') && (
                    <div className="flex items-center gap-2 pl-36">
                      <input
                        type="text"
                        className="flex-1 border border-amber-300 rounded px-2.5 py-1 text-xs focus:border-primary outline-none bg-amber-50/60 font-medium"
                        placeholder="Describe custom size (e.g. 8.5 x 11 inch, 220 x 110 mm, custom die cut)..."
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-36 font-bold text-slate-700">Quantity :</label>
                  <input
                    type="number"
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-36 font-bold text-slate-700">Material / Paper :</label>
                  <div className="relative flex-1" ref={paperDropdownRef}>
                    <div className="flex items-center border-b border-slate-300 focus-within:border-primary">
                      <input
                        type="text"
                        className="w-full bg-transparent outline-none py-0.5 text-xs font-semibold text-slate-800 pr-6"
                        placeholder="Choose paper or type to search..."
                        value={materialPaper}
                        onChange={(e) => {
                          setMaterialPaper(e.target.value);
                          setIsPaperDropdownOpen(true);
                        }}
                        onFocus={() => setIsPaperDropdownOpen(true)}
                      />
                      <button
                        type="button"
                        onClick={() => setIsPaperDropdownOpen(prev => !prev)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        tabIndex={-1}
                        title="Choose paper stock from list"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isPaperDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                      </button>
                    </div>

                    {/* Searchable Dropdown Menu */}
                    {isPaperDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-50 max-h-52 overflow-y-auto py-1 divide-y divide-slate-100">
                        {filteredPaperOptions.length > 0 ? (
                          filteredPaperOptions.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setMaterialPaper(opt);
                                setIsPaperDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 transition flex items-center justify-between cursor-pointer ${
                                materialPaper === opt ? 'bg-purple-50 text-purple-900 font-bold' : 'text-slate-700 font-medium'
                              }`}
                            >
                              <span>{opt}</span>
                              {materialPaper === opt && <Check size={12} className="text-purple-600" />}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xxs text-slate-500 italic flex flex-col gap-0.5">
                            <span>No standard paper matching &ldquo;{materialPaper}&rdquo;</span>
                            <span className="text-purple-700 font-semibold not-italic">Using custom paper: &ldquo;{materialPaper}&rdquo;</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">Printing Type :</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="printType"
                        checked={printingType === 'Single Side'}
                        onChange={() => setPrintingType('Single Side')}
                      />
                      <span>Single Side</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="printType"
                        checked={printingType === 'Double Side'}
                        onChange={() => setPrintingType('Double Side')}
                      />
                      <span>Double Side</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">Color :</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="colorType"
                        checked={colorType === 'B/W'}
                        onChange={() => setColorType('B/W')}
                      />
                      <span>B/W</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="colorType"
                        checked={colorType === 'Color'}
                        onChange={() => setColorType('Color')}
                      />
                      <span>Color</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Finishing (Tick All That Apply) :</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-50 p-2 rounded border border-slate-200">
                    {[
                      'Lamination (Matte / Gloss)', 'Spot UV', 'Foiling', 'Cutting / Half Cut',
                      'Binding', 'Eyelets / Mounting', 'Embossing', 'Other'
                    ].map(f => (
                      <label key={f} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={finishingOptions.includes(f)}
                          onChange={() => toggleCheckbox(finishingOptions, setFinishingOptions, f)}
                        />
                        <span className="text-xxs">{f}</span>
                      </label>
                    ))}
                  </div>
                  {finishingOptions.includes('Other') && (
                    <div className="mt-2">
                      <input
                        type="text"
                        className="w-full border border-purple-300 rounded px-2.5 py-1 text-xs focus:border-primary outline-none bg-purple-50/60 font-medium"
                        placeholder="Type other finishing specifications (e.g. Creasing, Window Lamination, Drip-off UV)..."
                        value={otherFinishing}
                        onChange={(e) => setOtherFinishing(e.target.value)}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. DESIGN STATUS */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-blue-800 text-white font-bold px-3 py-1.5 uppercase text-xs">
                4. DESIGN STATUS
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">File / Design Status :</span>
                  {['Ready to Print', 'Needs Editing', 'Design Required'].map(st => (
                    <label key={st} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="designStatus"
                        checked={designStatus === st}
                        onChange={() => setDesignStatus(st)}
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2 mt-2">
                  <div className="text-xxs font-bold text-slate-600 uppercase">If Design Required :</div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 font-bold text-slate-700">Language :</label>
                    <input
                      type="text"
                      className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5"
                      value={designLanguage}
                      onChange={(e) => setDesignLanguage(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Content Given :</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="cg" checked={contentGiven === 'Yes'} onChange={() => setContentGiven('Yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="cg" checked={contentGiven === 'No'} onChange={() => setContentGiven('No')} />
                        <span>No</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Reference Shared :</span>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="rs" checked={referenceShared === 'Yes'} onChange={() => setReferenceShared('Yes')} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="rs" checked={referenceShared === 'No'} onChange={() => setReferenceShared('No')} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-1">
                    <label className="font-bold text-slate-700 block mb-0.5">Design Preference / Notes :</label>
                    <input
                      type="text"
                      className="w-full border-b border-slate-300 focus:border-primary outline-none py-0.5"
                      placeholder="Special design instructions..."
                      value={designNotes}
                      onChange={(e) => setDesignNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Section 5 (Delivery Details), Section 6 (Assignment), Section 7 (Remarks) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 5. DELIVERY DETAILS */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-emerald-700 text-white font-bold px-3 py-1.5 uppercase text-xs">
                5. DELIVERY DETAILS
              </div>
              <div className="p-3 space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <label className="w-28 font-bold text-slate-700">Required By Date :</label>
                  <input
                    type="date"
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold"
                    value={requiredByDate}
                    onChange={(e) => setRequiredByDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">Urgency :</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="urg" checked={urgency === 'Normal'} onChange={() => setUrgency('Normal')} />
                    <span>Normal</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-red-600 font-bold">
                    <input type="radio" name="urg" checked={urgency === 'Urgent'} onChange={() => setUrgency('Urgent')} />
                    <span>Urgent (Same/Next Day)</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">Delivery Mode :</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="dm" checked={deliveryMode === 'Pickup'} onChange={() => setDeliveryMode('Pickup')} />
                    <span>Pickup</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="dm" checked={deliveryMode === 'Delivery'} onChange={() => setDeliveryMode('Delivery')} />
                    <span>Delivery</span>
                  </label>
                </div>
                <div className="pt-1">
                  <label className="font-bold text-slate-700 block mb-0.5">Delivery Address :</label>
                  <input
                    type="text"
                    className="w-full border-b border-slate-300 focus:border-primary outline-none py-0.5"
                    placeholder="Full shipping address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 6. ASSIGNMENT (Internal) */}
            <div className="section-card border border-slate-300 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-slate-800 text-white font-bold px-3 py-1.5 uppercase text-xs">
                6. ASSIGNMENT (INTERNAL)
              </div>
              <div className="p-3 space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Assigned To :</label>
                  <select
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold"
                    value={quoteAssignedTo}
                    onChange={(e) => setQuoteAssignedTo(e.target.value)}
                  >
                    <option value="Krishnamani">Krishnamani</option>
                    <option value="Nicey">Nicey</option>
                    <option value="Pavithra">Pavithra</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Current Stage :</label>
                  <select
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold text-primary"
                    value={currentStage}
                    onChange={(e) => setCurrentStage(e.target.value)}
                  >
                    <option value="Order Desk">Order Desk</option>
                    <option value="Costing">Costing</option>
                    <option value="Pre-Press">Pre-Press</option>
                    <option value="Press / Printing">Press / Printing</option>
                    <option value="Finishing">Finishing</option>
                    <option value="QC & Packing">QC & Packing</option>
                    <option value="Dispatch">Dispatch</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Prepress Assigned :</label>
                  <select
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold"
                    value={prepressAssignedTo}
                    onChange={(e) => setPrepressAssignedTo(e.target.value)}
                  >
                    <option value="Kiran Verma">Kiran Verma</option>
                    <option value="Aruna">Aruna</option>
                    <option value="Karthik">Karthik</option>
                    <option value="Girish">Girish</option>
                    <option value="Anand">Anand</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Vendor Outsource :</label>
                  <input
                    type="text"
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5"
                    placeholder="Vendor name if outsourced"
                    value={vendorOutsource}
                    onChange={(e) => setVendorOutsource(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 font-bold text-slate-700">Target Machine :</label>
                  <select
                    className="flex-1 border-b border-slate-300 focus:border-primary outline-none py-0.5 font-bold text-slate-800"
                    value={assignedPressMachine}
                    onChange={(e) => setAssignedPressMachine(e.target.value)}
                  >
                    <option value="">Auto-Assign (Based on Qty & Specs)</option>
                    {FLEET_MACHINE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.name}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 7. REMARKS */}
            <div className="section-card border border-purple-300 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-purple-900 text-white font-bold px-3 py-1.5 uppercase text-xs">
                7. REMARKS
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <textarea
                  rows="6"
                  className="w-full flex-1 border border-slate-300 rounded p-2 text-xs focus:border-primary outline-none resize-none"
                  placeholder="Enter overall remarks, special client preferences, packaging requirements..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Bottom Form Action Buttons */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-4 border-t border-slate-200 bg-slate-50 p-3 rounded-xl shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">
              {enquiryData
                ? 'Review job details above and save to update this job enquiry.'
                : 'Review all sections above and save to register this enquiry in Commercial Desk.'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary flex items-center gap-1.5 px-3 py-1.5 cursor-pointer font-semibold shadow-2xs hover:shadow-xs"
                onClick={handlePrintForm}
              >
                <PrinterIcon size={14} />
                <span>Print Blank / Filled Form</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary flex items-center gap-1.5 px-4 py-1.5 bg-[#002b41] hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer shadow-2xs hover:shadow-xs"
                onClick={handleSubmit}
              >
                <Save size={14} />
                <span>{enquiryData ? 'Update Job Record' : 'Save Enquiry Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};
