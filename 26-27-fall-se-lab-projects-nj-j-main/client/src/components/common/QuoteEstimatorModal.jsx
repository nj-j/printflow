import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import {
  Calculator,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Printer,
  Layers,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Tag,
  User,
  Phone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TechnicalSpecSheetModal } from './TechnicalSpecSheetModal';

export const QuoteEstimatorModal = ({ isOpen, onClose, enquiry, onApplyQuote }) => {
  const { customers, createQuote, activeUser } = useApp();
  const [isSpecSheetOpen, setIsSpecSheetOpen] = useState(false);

  // Try to parse quantity from job_specification or default
  const parseQuantityFromSpec = (spec) => {
    if (!spec) return 1000;
    const match = spec.match(/(\d+[\d,]*)\s*(nos|pcs|sheets|copies|qty)/i);
    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 0) return num;
    }
    return 1000;
  };

  // Form states initialized from enquiry
  const [jobTitle, setJobTitle] = useState('');
  const [printCategory, setPrintCategory] = useState('Brochure');
  const [quantity, setQuantity] = useState(1000);
  const [paperType, setPaperType] = useState('130 GSM Gloss Art Paper');
  const [paperRatePerReam, setPaperRatePerReam] = useState(1450);
  const [sheetSize, setSheetSize] = useState('23" x 36"');
  const [colorFront, setColorFront] = useState(4);
  const [colorBack, setColorBack] = useState(4);
  const [targetMachine, setTargetMachine] = useState('Lithrone 26');
  const [finishingSpec, setFinishingSpec] = useState('Thermal Matte Lamination, 3-Side Trim');
  const [finishingCostManual, setFinishingCostManual] = useState(0);
  const [wasteMarginPercent, setWasteMarginPercent] = useState(10);
  const [priority, setPriority] = useState('Normal');
  const [profitMarginPercent, setProfitMarginPercent] = useState(25);
  const [saveToRegister, setSaveToRegister] = useState(true);

  // Sync state whenever selected enquiry changes
  useEffect(() => {
    if (enquiry) {
      const title = enquiry.job_name || enquiry.job_title || enquiry.job_specification || 'Commercial Print Job';
      setJobTitle(title);

      // 1. Quantity: structured field first, fallback to regex parse
      const initialQty = Number(enquiry.quantity) > 0 
        ? Number(enquiry.quantity) 
        : parseQuantityFromSpec(enquiry.job_specification);
      setQuantity(initialQty);

      // 2. Guess print category from job specifications, name, and brief
      const spec = `${enquiry.job_specification || ''} ${enquiry.job_name || ''} ${enquiry.job_brief || ''}`.toLowerCase();
      if (spec.includes('sticker') || spec.includes('label')) setPrintCategory('Stickers');
      else if (spec.includes('book') || spec.includes('pages') || spec.includes('publication') || spec.includes('catalogue')) setPrintCategory('Book');
      else if (spec.includes('card') || spec.includes('visiting') || spec.includes('vc') || spec.includes('tag')) setPrintCategory('Cards');
      else if (spec.includes('letter') || spec.includes('bill') || spec.includes('stationery')) setPrintCategory('Stationery');
      else if (spec.includes('box') || spec.includes('packaging') || spec.includes('carton')) setPrintCategory('Packaging');
      else if (spec.includes('poster')) setPrintCategory('Poster');
      else if (spec.includes('flyer') || spec.includes('leaflet') || spec.includes('pamphlet')) setPrintCategory('Flyer');
      else setPrintCategory('Brochure');

      // 3. Colors from structured enquiry fields (enquiry.color, enquiry.printing_type)
      const printingType = (enquiry.printing_type || '').toLowerCase();
      const isSingleSide = printingType.includes('single') || printingType.includes('1-side') || spec.includes('s/s') || spec.includes('single side') || spec.includes('1+0');
      const colorStr = (enquiry.color || '').toLowerCase();

      if (colorStr.includes('single color') || colorStr.includes('black') || spec.includes('1+1') || spec.includes('b/w')) {
        setColorFront(1);
        setColorBack(isSingleSide ? 0 : 1);
      } else if (colorStr.includes('2-color') || spec.includes('2+0') || spec.includes('2+2')) {
        setColorFront(2);
        setColorBack(isSingleSide ? 0 : 2);
      } else {
        setColorFront(4);
        setColorBack(isSingleSide ? 0 : 4);
      }

      // 4. Paper Substrate from structured enquiry.paper
      const paperStr = (enquiry.paper || '').toLowerCase();
      if (paperStr.includes('300') || spec.includes('300') || paperStr.includes('art card')) {
        setPaperType('300 GSM Premium Art Card');
        setPaperRatePerReam(2200);
      } else if (paperStr.includes('170') || spec.includes('170')) {
        setPaperType('170 GSM Matte Art Paper');
        setPaperRatePerReam(1750);
      } else if (paperStr.includes('cromo') || paperStr.includes('sticker') || spec.includes('cromo') || spec.includes('sticker')) {
        setPaperType('Self-Adhesive Chromo Sticker Sheet');
        setPaperRatePerReam(1850);
      } else if (paperStr.includes('80') || paperStr.includes('maplitho') || paperStr.includes('bond') || spec.includes('maplitho') || spec.includes('bond')) {
        setPaperType('80 GSM Sunshine Maplitho');
        setPaperRatePerReam(980);
      } else if (paperStr.includes('250') || spec.includes('250') || paperStr.includes('duplex')) {
        setPaperType('250 GSM Duplex Board');
        setPaperRatePerReam(1900);
      } else {
        setPaperType('130 GSM Gloss Art Paper');
        setPaperRatePerReam(1450);
      }

      // 5. Sheet Size from structured enquiry.size
      const sizeStr = (enquiry.size || '').toLowerCase();
      if (sizeStr.includes('12" x 18"') || sizeStr.includes('12 x 18') || sizeStr.includes('digital sheet')) {
        setSheetSize('12" x 18"');
      } else if (sizeStr.includes('18" x 23"') || sizeStr.includes('crown')) {
        setSheetSize('18" x 23"');
      } else if (sizeStr.includes('20" x 30"') || sizeStr.includes('demy')) {
        setSheetSize('20" x 30"');
      } else if (sizeStr.includes('28" x 40"')) {
        setSheetSize('28" x 40"');
      } else {
        setSheetSize('23" x 36"');
      }

      // 6. Target Machine suggestion
      const jobTypes = Array.isArray(enquiry.job_types) ? enquiry.job_types.join(' ').toLowerCase() : String(enquiry.job_types || '').toLowerCase();
      if (jobTypes.includes('digital') || initialQty <= 500) {
        setTargetMachine('KMC4080 Digital');
      } else if (initialQty >= 5000) {
        setTargetMachine('Lithrone 26');
      } else {
        setTargetMachine('Ryobi 660');
      }

      // 7. Finishing & Bindery from structured enquiry.finishing array / string
      let finishingText = '';
      if (Array.isArray(enquiry.finishing) && enquiry.finishing.length > 0) {
        finishingText = enquiry.finishing.join(', ');
      } else if (typeof enquiry.finishing === 'string' && enquiry.finishing.trim()) {
        finishingText = enquiry.finishing.trim();
      }
      if (enquiry.other_finishing?.trim()) {
        finishingText = finishingText ? `${finishingText}, ${enquiry.other_finishing.trim()}` : enquiry.other_finishing.trim();
      }
      if (finishingText) {
        setFinishingSpec(finishingText);
      } else {
        setFinishingSpec('Thermal Matte Lamination, 3-Side Trim');
      }

      // 8. Priority / Turnaround from structured enquiry.urgency / enquiry.priority
      const urgencyStr = (enquiry.urgency || enquiry.priority || '').toLowerCase();
      if (urgencyStr.includes('urgent') || urgencyStr.includes('rush') || urgencyStr.includes('express')) {
        setPriority('Urgent');
      } else if (urgencyStr.includes('high')) {
        setPriority('High');
      } else {
        setPriority('Normal');
      }
    }
  }, [enquiry]);

  // Adjust paper rate when paperType changes
  const handlePaperTypeChange = (val) => {
    setPaperType(val);
    if (val.includes('300 GSM')) setPaperRatePerReam(2200);
    else if (val.includes('170 GSM')) setPaperRatePerReam(1750);
    else if (val.includes('130 GSM')) setPaperRatePerReam(1450);
    else if (val.includes('Chromo')) setPaperRatePerReam(1850);
    else if (val.includes('80 GSM')) setPaperRatePerReam(980);
    else if (val.includes('250 GSM')) setPaperRatePerReam(1900);
  };

  // Real-time calculation logic
  const upsPerSheet = printCategory === 'Cards' ? 24 : (printCategory === 'Stickers' ? 16 : (printCategory === 'Book' ? 8 : 4));
  const netSheets = Math.ceil(quantity / upsPerSheet);
  const grossSheets = Math.ceil(netSheets * (1 + wasteMarginPercent / 100));
  const reamsRequired = Math.max(0.2, Number((grossSheets / 500).toFixed(2)));
  const paperCost = Math.round(reamsRequired * paperRatePerReam);

  const plateCount = colorFront + colorBack;
  const plateRate = targetMachine.includes('Digital') ? 0 : 260;
  const plateCost = plateCount * plateRate;

  const inkCost = targetMachine.includes('Digital')
    ? Math.round(quantity * (colorFront + colorBack) * 0.8)
    : Math.round(quantity * (colorFront + colorBack) * 0.45);

  const impressionCount = Math.ceil(grossSheets * (colorFront > 0 ? 1 : 0) + (colorBack > 0 ? grossSheets : 0));
  const hourlyRate = targetMachine.includes('Lithrone') ? 1800 : (targetMachine.includes('Ryobi') ? 1400 : 1200);
  const pressRuntimeHours = Math.max(1.0, Number((impressionCount / 4000).toFixed(1)));
  const pressRuntimeCost = targetMachine.includes('Digital') ? 0 : Math.round(pressRuntimeHours * hourlyRate);

  const calculatedFinishingCost = finishingCostManual > 0
    ? finishingCostManual
    : Math.round(quantity * 0.6 + 500);

  const rawMaterialCost = paperCost + plateCost + inkCost;
  const wasteMarginCost = Math.round((rawMaterialCost * wasteMarginPercent) / 100);
  const baseCost = rawMaterialCost + wasteMarginCost + pressRuntimeCost + calculatedFinishingCost;

  const rushSurchargeAmount = priority === 'Urgent'
    ? Math.round(baseCost * 0.25)
    : (priority === 'High' ? Math.round(baseCost * 0.10) : 0);

  const totalEstimatedPrice = Math.round((baseCost + rushSurchargeAmount) * (1 + profitMarginPercent / 100));
  const unitPrice = quantity > 0 ? (totalEstimatedPrice / quantity).toFixed(2) : '0.00';

  const handleApply = (e) => {
    e.preventDefault();
    if (!enquiry) return;

    // Call onApplyQuote callback with the new amount and calculation metadata
    if (onApplyQuote) {
      onApplyQuote(totalEstimatedPrice, {
        quantity,
        paperType,
        sheetSize,
        colorSpec: `${colorFront}/${colorBack} CMYK`,
        targetMachine,
        finishingSpec,
        totalEstimatedPrice,
        plateCount,
        priority,
        jobTitle,
        saveToRegister
      });
    }

    onClose();
  };

  if (!isOpen || !enquiry) return null;

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <Calculator className="text-blue-600" size={20} />
          <span>Cost Estimator & Quote Generator</span>
        </div>
      }
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleApply} className="space-y-4 text-xs">
        {/* Target Enquiry Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <User size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{enquiry.customer_name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {enquiry.source || 'Walk-in'}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-mono text-xs flex items-center gap-1">
                  <Phone size={11} className="text-slate-400" /> {enquiry.phone || 'No phone'}
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5 max-w-xl truncate">
                <strong className="text-slate-700">Spec:</strong> {enquiry.job_specification}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSpecSheetOpen(true)}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
              title="Pop out technical job engineering specification sheet"
            >
              <FileText size={13} className="text-blue-600" />
              <span>Job Spec Sheet</span>
            </button>
            <div className="text-right pl-2 border-l border-blue-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Amount</span>
              <div className="text-base font-black font-mono text-slate-700">
                {enquiry.amount > 0 ? `₹ ${Number(enquiry.amount).toLocaleString('en-IN')}` : '— Not Quoted'}
              </div>
            </div>
          </div>
        </div>

        {/* Estimation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Job Title / Scope */}
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Job Title / Scope:</label>
            <input
              type="text"
              className="form-control text-xs w-full font-medium"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
            />
          </div>

          {/* Job Category */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Print Category:</label>
            <select
              className="form-control text-xs w-full font-semibold"
              value={printCategory}
              onChange={(e) => setPrintCategory(e.target.value)}
            >
              <option value="Brochure">Brochure / Catalogue</option>
              <option value="Book">Booklet / Publication</option>
              <option value="Packaging">Packaging / Carton Box</option>
              <option value="Cards">Visiting Cards / Tags</option>
              <option value="Stickers">Stickers / Labels</option>
              <option value="Flyer">Single Sheet Flyer / Leaflet</option>
              <option value="Poster">Commercial Poster</option>
              <option value="Stationery">Letterhead / Cash Bill</option>
            </select>
          </div>

          {/* Quantity & Preset Buttons */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Quantity (pcs / nos):</label>
            <div className="space-y-1">
              <input
                type="number"
                className="form-control text-xs w-full font-bold font-mono text-blue-700"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                min="1"
                required
              />
              <div className="flex gap-1">
                {[500, 1000, 2500, 5000].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition ${
                      quantity === qty
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {qty >= 1000 ? `${qty / 1000}k` : qty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Paper Type & GSM */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Paper Stock & GSM:</label>
            <select
              className="form-control text-xs w-full font-semibold"
              value={paperType}
              onChange={(e) => handlePaperTypeChange(e.target.value)}
            >
              <option value="130 GSM Gloss Art Paper">130 GSM Gloss Art Paper (₹1,450/rm)</option>
              <option value="170 GSM Matte Art Paper">170 GSM Matte Art Paper (₹1,750/rm)</option>
              <option value="300 GSM Premium Art Card">300 GSM Premium Art Card (₹2,200/rm)</option>
              <option value="80 GSM Sunshine Maplitho">80 GSM Sunshine Maplitho (₹980/rm)</option>
              <option value="250 GSM Duplex Board">250 GSM Duplex Board (₹1,900/rm)</option>
              <option value="Self-Adhesive Chromo Sticker Sheet">Chromo Sticker Sheet (₹1,850/rm)</option>
            </select>
          </div>

          {/* Sheet Size */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Parent Sheet Size:</label>
            <select
              className="form-control text-xs w-full font-semibold"
              value={sheetSize}
              onChange={(e) => setSheetSize(e.target.value)}
            >
              <option value='23" x 36"'>23" x 36" (Double Demy)</option>
              <option value='20" x 30"'>20" x 30" (Demy)</option>
              <option value='18" x 23"'>18" x 23" (Crown)</option>
              <option value='28" x 40"'>28" x 40" (Double Crown)</option>
              <option value='12" x 18"'>12" x 18" (Digital Sheet)</option>
            </select>
          </div>

          {/* Color Front & Back */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Colors (Front / Back):</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Front:</span>
                <select
                  className="form-control text-xs w-full"
                  value={colorFront}
                  onChange={(e) => setColorFront(Number(e.target.value))}
                >
                  <option value={4}>4 (CMYK)</option>
                  <option value={1}>1 (B/W)</option>
                  <option value={2}>2 (Pantone)</option>
                  <option value={5}>5 (CMYK+1)</option>
                  <option value={0}>0 (None)</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500 font-bold">Back:</span>
                <select
                  className="form-control text-xs w-full"
                  value={colorBack}
                  onChange={(e) => setColorBack(Number(e.target.value))}
                >
                  <option value={4}>4 (CMYK)</option>
                  <option value={1}>1 (B/W)</option>
                  <option value={2}>2 (Pantone)</option>
                  <option value={5}>5 (CMYK+1)</option>
                  <option value={0}>0 (Blank)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Machine */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Press / Machine:</label>
            <select
              className="form-control text-xs w-full font-semibold"
              value={targetMachine}
              onChange={(e) => setTargetMachine(e.target.value)}
            >
              <option value="Lithrone 26">Lithrone 26 (Komori 4-Color - Ramamurthy Nagar)</option>
              <option value="Ryobi 32">Ryobi 32 (Offset - Ramamurthy Nagar Plant)</option>
              <option value="Ryobi 660">Ryobi 660 (Offset - Ramamurthy Nagar Plant)</option>
              <option value="KMC4080 Digital">Konica Minolta C4080 (Digital Color)</option>
              <option value="KM2100 Black">Konica Minolta 2100 (Digital Mono)</option>
            </select>
          </div>

          {/* Turnaround / Priority */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Priority / Turnaround:</label>
            <select
              className={`form-control text-xs w-full font-bold ${
                priority === 'Urgent' ? 'text-red-700 bg-red-50 border-red-300' : ''
              }`}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Normal">Normal (2-3 Days Turnaround)</option>
              <option value="High">High Priority (+10% Surcharge)</option>
              <option value="Urgent">Urgent / Express (+25% Surcharge)</option>
            </select>
          </div>

          {/* Finishing Specs */}
          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Finishing & Bindery Operations:</label>
            <input
              type="text"
              className="form-control text-xs w-full"
              value={finishingSpec}
              onChange={(e) => setFinishingSpec(e.target.value)}
              placeholder="e.g. Thermal Matte Lamination, Center Pin Stitching, 3-Side Trim"
            />
          </div>

          {/* Wastage Slider */}
          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Wastage Allowance:</span>
              <span className="text-blue-600">{wasteMarginPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={wasteMarginPercent}
              onChange={(e) => setWasteMarginPercent(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>5% (Minimal)</span>
              <span>10% (Standard)</span>
              <span>20% (Complex)</span>
            </div>
          </div>
        </div>

        {/* Real-time Math Cost Breakdown Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-blue-600" />
              Live Cost Breakdown ({quantity.toLocaleString('en-IN')} pcs)
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Markup: <strong className="text-slate-800">{profitMarginPercent}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Paper ({reamsRequired} Rms)</span>
              <span className="font-mono font-bold text-slate-800">₹{paperCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Plates ({plateCount} CTP)</span>
              <span className="font-mono font-bold text-slate-800">₹{plateCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Ink & Consumables</span>
              <span className="font-mono font-bold text-slate-800">₹{inkCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Press Runtime</span>
              <span className="font-mono font-bold text-slate-800">₹{pressRuntimeCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Post-Press Finishing</span>
              <span className="font-mono font-bold text-slate-800">₹{calculatedFinishingCost.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 block">Wastage ({wasteMarginPercent}%)</span>
              <span className="font-mono font-bold text-slate-800">₹{wasteMarginCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {rushSurchargeAmount > 0 && (
            <div className="flex justify-between items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200">
              <span>Rush Turnaround Surcharge ({priority === 'Urgent' ? '+25%' : '+10%'}):</span>
              <span className="font-mono">+ ₹{rushSurchargeAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          {/* Grand Calculated Total Banner */}
          <div className="bg-blue-600 text-white p-3 rounded-xl flex items-center justify-between shadow-md">
            <div>
              <span className="text-[11px] uppercase font-bold text-blue-100 tracking-wider block">
                Calculated Customer Quotation Price
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono">
                  ₹ {totalEstimatedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  (₹{unitPrice} per unit)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-blue-100 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveToRegister}
                  onChange={(e) => setSaveToRegister(e.target.checked)}
                  className="rounded accent-blue-800"
                />
                <span>Also log in CRM Quote Register</span>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            className="btn btn-sm btn-secondary font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-sm btn-primary font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition px-4 py-2 text-xs"
          >
            <CheckCircle2 size={15} />
            Update Enquiry Amount to ₹{totalEstimatedPrice.toLocaleString('en-IN')}
          </button>
        </div>
      </form>
    </Modal>

    <TechnicalSpecSheetModal
      isOpen={isSpecSheetOpen}
      onClose={() => setIsSpecSheetOpen(false)}
      entity={enquiry}
    />
  </>
  );
};
