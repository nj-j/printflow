import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  FileCheck,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldCheck,
  User,
  Package,
  Flag,
  Search,
  Filter,
  AlertTriangle,
  IndianRupee,
  Layers,
  X,
  Calendar,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripSheetModal } from '../common/TripSheetModal';
import { RushBadge } from '../common/RushBadge';
import { STAGES, normalizeStage } from '../../utils/stageConstants';

export const DeliveryDispatchPlanning = () => {
  const {
    dispatchRoutes,
    routeJobs,
    updateRouteJob,
    vehicles,
    tripSheets,
    createTripSheet,
    updateJobDeliveryStatus,
    completeTripSheet,
    jobOrders,
    openQCFlagModal,
    issues,
    resolveJobRushStatus
  } = useApp();

  // Search, Filters & View Mode
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState('ALL');
  const [rushOnlyFilter, setRushOnlyFilter] = useState(false);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'dispatched'

  // Allocation & Trip Sheet form state
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [tripRunName, setTripRunName] = useState('Morning Delivery Run #1');
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles?.[0]?.reg_no || 'KA 03 AB 1234');
  const [selectedDriver, setSelectedDriver] = useState(vehicles?.[0]?.driver_name || 'Ramesh');
  const [tripDate, setTripDate] = useState('2026-06-19');

  // Modal State
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [createdTripJobs, setCreatedTripJobs] = useState([]);

  // Helper to determine destination area name from route data or job properties
  const getAreaName = (job) => {
    if (job.area) return job.area;
    if (job.destination_area) return job.destination_area;
    const route = dispatchRoutes?.find(r => r.id === job.route_id);
    if (route) {
      return route.name.replace(/^Route\s*\d+\s*[-–:]\s*/i, '').trim();
    }
    return 'Bengaluru Central';
  };

  const isJobOnTrip = (job) => {
    return Boolean(
      job.assigned_to_trip ||
      job.status === 'In-Transit' ||
      job.status === 'Delivered' ||
      job.ack_status === 'Dispatched' ||
      job.trip_id
    );
  };

  // Master queues across the entire plant (no route silos)
  // Ensure any jobOrders in STAGES.DISPATCH that are not yet in routeJobs are seamlessly included in the dispatch queue
  const mergedRouteJobs = React.useMemo(() => {
    const existingJobNos = new Set((routeJobs || []).map(r => r.job_no));
    const extraJobs = (jobOrders || [])
      .filter(j => normalizeStage(j.current_stage) === STAGES.DISPATCH && !existingJobNos.has(j.job_ticket_number))
      .map(j => {
        const isJobInTransit = j.delivery_status === 'In-Transit' || Boolean(j.trip_sheet_number);
        return {
          id: `rj-${j.id || j.job_ticket_number}`,
          route_id: 'route-1',
          job_no: j.job_ticket_number || j.id,
          customer: j.customer_name || 'Customer',
          product: j.job_title || j.job_name || 'Commercial Print Order',
          route_qty: Number(j.print_quantity || 1000),
          dispatched: isJobInTransit ? Number(j.print_quantity || 1000) : 0,
          balance: isJobInTransit ? 0 : Number(j.print_quantity || 1000),
          cod_amount: Number(j.balance_due || j.balance || 0),
          ack_status: isJobInTransit ? 'Dispatched' : 'Pending',
          status: isJobInTransit ? 'In-Transit' : 'Ready',
          area: j.delivery_area || j.area || 'Bengaluru Central',
          assigned_to_trip: isJobInTransit,
          trip_number: j.trip_sheet_number || null
        };
      });

    return [...extraJobs, ...(routeJobs || [])];
  }, [routeJobs, jobOrders]);

  const allPendingJobs = (mergedRouteJobs || []).filter(j => !isJobOnTrip(j));
  const allDispatchedJobs = (mergedRouteJobs || []).filter(j => isJobOnTrip(j));

  // Available unique areas for dropdown filter
  const availableAreas = Array.from(
    new Set((mergedRouteJobs || []).map(j => getAreaName(j)).filter(Boolean))
  ).sort();

  // KPI calculations
  const totalPendingUnits = allPendingJobs.reduce((acc, curr) => acc + (curr.balance || curr.route_qty || 0), 0);
  const totalCodPending = allPendingJobs.reduce((acc, curr) => acc + (curr.cod_amount || 0), 0);
  const rushPendingJobs = allPendingJobs.filter(job => {
    const matchedJob = jobOrders?.find(j => j.job_ticket_number === job.job_no);
    return resolveJobRushStatus(matchedJob || job);
  });
  const inTransitTripsCount = (tripSheets || []).filter(t => t.status !== 'Completed').length;
  const deliveredJobsCount = allDispatchedJobs.filter(j => j.status === 'Delivered' || j.ack_status === 'Delivered').length;
  const inTransitJobsCount = allDispatchedJobs.length - deliveredJobsCount;
  const activeVehiclesOnRoad = vehicles?.filter(v => v.status === 'On Trip')?.length || (inTransitJobsCount > 0 ? 1 : 0);

  // Filter pending jobs by search, area, and rush
  const filteredPendingJobs = allPendingJobs.filter(job => {
    const area = getAreaName(job);
    const matchesSearch = !searchTerm ||
      job.job_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedAreaFilter === 'ALL' || area === selectedAreaFilter;

    const matchedJob = jobOrders?.find(j => j.job_ticket_number === job.job_no);
    const isRush = resolveJobRushStatus(matchedJob || job);
    const matchesRush = !rushOnlyFilter || isRush;

    return matchesSearch && matchesArea && matchesRush;
  });

  // Filter dispatched jobs by search and area
  const filteredDispatchedJobs = allDispatchedJobs.filter(job => {
    const area = getAreaName(job);
    const matchesSearch = !searchTerm ||
      job.job_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.trip_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.ack_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedAreaFilter === 'ALL' || area === selectedAreaFilter;

    return matchesSearch && matchesArea;
  });

  const displayedJobs = viewMode === 'pending' ? filteredPendingJobs : filteredDispatchedJobs;

  // Selection handlers
  const toggleSelectJob = (jobNo) => {
    if (viewMode !== 'pending') return;
    setSelectedJobIds(prev =>
      prev.includes(jobNo) ? prev.filter(id => id !== jobNo) : [...prev, jobNo]
    );
  };

  const areAllDisplayedSelected = displayedJobs.length > 0 &&
    displayedJobs.every(j => selectedJobIds.includes(j.job_no));

  const toggleSelectAll = () => {
    if (viewMode !== 'pending') return;
    if (areAllDisplayedSelected) {
      const displayedNos = new Set(displayedJobs.map(j => j.job_no));
      setSelectedJobIds(prev => prev.filter(id => !displayedNos.has(id)));
    } else {
      const displayedNos = displayedJobs.map(j => j.job_no);
      setSelectedJobIds(prev => Array.from(new Set([...prev, ...displayedNos])));
    }
  };

  // Selected Jobs calculations for allocation panel
  const selectedJobsList = allPendingJobs.filter(j => selectedJobIds.includes(j.job_no));
  const selectedQty = selectedJobsList.reduce((acc, curr) => acc + (curr.balance || curr.route_qty || 0), 0);
  const totalCodAmount = selectedJobsList.reduce((acc, curr) => acc + (curr.cod_amount || 0), 0);

  // Group selected destinations
  const selectedDestinationBreakdown = selectedJobsList.reduce((acc, job) => {
    const area = getAreaName(job);
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const selectedVehicleObj = vehicles?.find(v => v.reg_no === selectedVehicle) || vehicles?.[0];
  const estimatedBoxes = Math.ceil(selectedQty / 250);
  const vehicleCapacityBoxes = selectedVehicleObj?.capacity_boxes || 60;
  const capacityPercent = Math.min(100, Math.round((estimatedBoxes / vehicleCapacityBoxes) * 100));

  const handleVehicleChange = (regNo) => {
    setSelectedVehicle(regNo);
    const matched = vehicles?.find(v => v.reg_no === regNo);
    if (matched?.driver_name) {
      setSelectedDriver(matched.driver_name);
    }
  };

  const handleCreateTripSheet = () => {
    if (selectedJobIds.length === 0) {
      alert('Please select at least one pending job to create a Trip Sheet.');
      return;
    }

    const currentSelectedJobs = allPendingJobs.filter(j => selectedJobIds.includes(j.job_no));

    const trip = createTripSheet({
      trip_run_name: tripRunName.trim() || 'Standard Delivery Run',
      route_name: tripRunName.trim() || 'Standard Delivery Run',
      route_id: 'unified',
      driver_name: selectedDriver,
      driver_phone: selectedVehicleObj?.driver_phone || '+91 98450 99881',
      vehicle_reg: selectedVehicle,
      vehicle_type: selectedVehicleObj?.vehicle_type || 'Commercial Van',
      trip_date: tripDate,
      selected_job_ids: selectedJobIds,
      total_qty: selectedQty,
      total_cod: totalCodAmount,
    });

    setCreatedTripJobs(currentSelectedJobs);
    setCreatedTrip(trip);
    setIsTripModalOpen(true);
    setSelectedJobIds([]);
  };

  const handleRecallJob = (job) => {
    if (updateRouteJob) {
      updateRouteJob(job.id, {
        status: 'Pending',
        ack_status: 'Pending',
        dispatched: 0,
        balance: job.route_qty,
        assigned_to_trip: false,
        trip_id: null,
        trip_number: null
      });
    }
  };

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Top Plant-Wide KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Pending Deliveries */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
            <Package size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              Pending Deliveries
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {allPendingJobs.length} <span className="text-xs font-normal text-slate-500">Orders</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {totalPendingUnits.toLocaleString()} units ready in plant
            </div>
          </div>
        </div>

        {/* Card 2: Rush Priority Orders */}
        <div
          onClick={() => {
            setViewMode('pending');
            setRushOnlyFilter(prev => !prev);
          }}
          className={`bg-white rounded-xl p-3.5 border shadow-xs flex items-center gap-3 cursor-pointer transition ${
            rushOnlyFilter ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20' : 'border-slate-200 hover:border-amber-300'
          }`}
          title="Click to toggle filter for rush priority orders only"
        >
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-amber-600 flex items-center gap-1">
              <span>Rush Priority Orders</span>
              {rushOnlyFilter && <span className="text-[9px] bg-amber-200 px-1 rounded font-bold">ACTIVE</span>}
            </div>
            <div className="text-lg font-black text-amber-800 tracking-tight">
              {rushPendingJobs.length} <span className="text-xs font-normal text-slate-500">Fast-Track</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              High priority dispatch required
            </div>
          </div>
        </div>

        {/* Card 3: Vehicles On Road / In-Transit */}
        <div
          onClick={() => setViewMode('dispatched')}
          className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 shadow-xs flex items-center gap-3 cursor-pointer transition"
          title="Click to view dispatched trip manifests"
        >
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <Truck size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              On Road / In-Transit
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {inTransitTripsCount} <span className="text-xs font-normal text-slate-500">Active Trips</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {inTransitJobsCount} on road • {deliveredJobsCount} delivered
            </div>
          </div>
        </div>

        {/* Card 4: Total COD to Collect */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg">
            <IndianRupee size={20} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">
              Total COD to Collect
            </div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              ₹ {totalCodPending.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Across all pending ready orders
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Unified Orders Queue (Left 8 Cols) + Universal Vehicle Allocation (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Master Dispatch Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header Controls & Filter Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                  Plant Queue
                </span>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>
                    {viewMode === 'pending'
                      ? 'Consolidated Dispatch Queue'
                      : 'Dispatched Orders & Active Trips'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-normal">
                    ({displayedJobs.length} {displayedJobs.length === 1 ? 'order' : 'orders'})
                  </span>
                </h2>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-200 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setViewMode('pending')}
                  className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'pending'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pending Ready</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      allPendingJobs.length > 0
                        ? 'bg-amber-100 text-amber-800 font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {allPendingJobs.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('dispatched')}
                  className={`px-2.5 py-1 rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'dispatched'
                      ? 'bg-white text-blue-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck size={12} className="text-blue-600" />
                  <span>On Trip / Dispatched</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      allDispatchedJobs.length > 0
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {allDispatchedJobs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Search and Secondary Filter Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search Job No, Customer, Product, Area..."
                  className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Area Selector Dropdown */}
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                <select
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Destination Areas</option>
                  {availableAreas.map(area => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rush Toggle Pill (in pending mode) */}
              {viewMode === 'pending' && (
                <button
                  type="button"
                  onClick={() => setRushOnlyFilter(prev => !prev)}
                  className={`h-8 px-2.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    rushOnlyFilter
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <AlertTriangle size={12} className={rushOnlyFilter ? 'text-white' : 'text-amber-500'} />
                  <span>Rush Only</span>
                  {rushPendingJobs.length > 0 && (
                    <span
                      className={`px-1 rounded text-[10px] font-mono ${
                        rushOnlyFilter ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rushPendingJobs.length}
                    </span>
                  )}
                </button>
              )}

              {/* Reset Filter Button */}
              {(searchTerm || selectedAreaFilter !== 'ALL' || rushOnlyFilter || selectedJobIds.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedAreaFilter('ALL');
                    setRushOnlyFilter(false);
                    setSelectedJobIds([]);
                  }}
                  className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ml-auto"
                  title="Reset filters and selection"
                >
                  <RefreshCw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5 w-10 text-center">
                    {viewMode === 'pending' ? (
                      <input
                        type="checkbox"
                        checked={areAllDisplayedSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        title="Select/Deselect all visible jobs"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">#</span>
                    )}
                  </th>
                  <th className="p-2.5 w-28">Job Ticket</th>
                  <th className="p-2.5 w-40">Customer</th>
                  <th className="p-2.5 w-32">Product</th>
                  <th className="p-2.5 w-32">Destination Area</th>
                  <th className="p-2.5 text-right w-20">Ready Qty</th>
                  <th className="p-2.5 text-right w-20">Dispatched</th>
                  <th className="p-2.5 text-right w-24">COD (₹)</th>
                  <th className="p-2.5 text-center w-20">ACK</th>
                  <th className="p-2.5 text-center w-28">
                    {viewMode === 'pending' ? 'QC Action' : 'Trip Manifest'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {displayedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-2">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <span className="font-bold text-slate-800 text-sm">
                          {viewMode === 'pending'
                            ? 'No Pending Jobs Matching Criteria'
                            : 'No Dispatched Jobs Matching Criteria'}
                        </span>
                        <p className="text-[11px] text-slate-500 text-center">
                          {viewMode === 'pending'
                            ? (searchTerm || selectedAreaFilter !== 'ALL' || rushOnlyFilter)
                              ? 'No pending orders match your active search or destination filters. Try clearing filters to see all available jobs.'
                              : 'All completed production print jobs have been dispatched into vehicle trip sheets.'
                            : 'No trip sheets currently match your filter criteria.'}
                        </p>
                        {(searchTerm || selectedAreaFilter !== 'ALL' || rushOnlyFilter) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedAreaFilter('ALL');
                              setRushOnlyFilter(false);
                            }}
                            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition border border-slate-300 cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        )}
                        {viewMode === 'pending' && allPendingJobs.length === 0 && allDispatchedJobs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setViewMode('dispatched')}
                            className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition border border-blue-200 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Truck size={13} />
                            <span>View {allDispatchedJobs.length} Dispatched Jobs on Active Trips</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedJobs.map((job, idx) => {
                    const isChecked = selectedJobIds.includes(job.job_no);
                    const isFlagged = job.qc_flagged || issues?.some(i => (i.job_ticket_number === job.job_no || i.job_order_id === job.id) && !i.resolved);
                    const matchedJob = jobOrders?.find(j => j.job_ticket_number === job.job_no);
                    const isRush = resolveJobRushStatus(matchedJob || job);
                    const areaName = getAreaName(job);

                    return (
                      <tr
                        key={job.id}
                        onClick={() => toggleSelectJob(job.job_no)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/40 ring-1 ring-blue-500/10' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          {viewMode === 'pending' ? (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectJob(job.job_no)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          ) : (
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">{idx + 1}</span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{job.job_no}</span>
                            {isRush && <RushBadge size="xs" />}
                            {job.trip_number && (
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[8px] bg-blue-100 text-blue-800 border border-blue-200">
                                {job.trip_number}
                              </span>
                            )}
                            {isFlagged && (
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[8px] bg-rose-600 text-white flex items-center gap-0.5 shadow-2xs">
                                <Flag size={8} /> QC
                              </span>
                            )}
                            {job.returned_from_qc && (
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[8px] bg-amber-100 text-amber-800 border border-amber-300">
                                REWORK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{job.customer}</td>
                        <td className="p-2.5 text-slate-600 truncate max-w-[150px]">{job.product}</td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <MapPin size={10} className="text-slate-400" />
                            <span>{areaName}</span>
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {(job.balance || job.route_qty).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-500">
                          {(job.dispatched || 0).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          ₹ {(job.cod_amount || 0).toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          {viewMode === 'pending' ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                job.ack_status === 'Confirmed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : job.ack_status === 'Dispatched'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {job.ack_status || 'Pending'}
                            </span>
                          ) : (
                            <div className="inline-flex items-center justify-center">
                              <select
                                value={(job.ack_status === 'Delivered' || job.status === 'Delivered') ? 'Delivered' : 'Dispatched'}
                                onChange={(e) => updateJobDeliveryStatus && updateJobDeliveryStatus(job.job_no, e.target.value)}
                                className={`h-6 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border cursor-pointer focus:outline-none transition shadow-2xs ${
                                  (job.ack_status === 'Delivered' || job.status === 'Delivered')
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                                }`}
                                title="Update delivery status between Dispatched and Delivered on completion of trip"
                              >
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">✓ Delivered</option>
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          {viewMode === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const matchedJob = jobOrders?.find(j => j.job_ticket_number === job.job_no);
                                openQCFlagModal(matchedJob || {
                                  id: job.id,
                                  job_ticket_number: job.job_no,
                                  customer_name: job.customer,
                                  job_title: job.product,
                                  current_stage: STAGES.DISPATCH
                                }, 'Delivery & Dispatch');
                              }}
                              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer mx-auto"
                              title="Raise QC Flag on delivery item"
                            >
                              <Flag size={10} className="text-amber-600" />
                              <span>QC Flag</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {job.trip_number && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const foundTrip = tripSheets.find(t => t.trip_number === job.trip_number || t.id === job.trip_id);
                                    if (foundTrip) {
                                      setCreatedTrip(foundTrip);
                                      setCreatedTripJobs(mergedRouteJobs.filter(j => foundTrip.selected_job_ids?.includes(j.job_no)));
                                      setIsTripModalOpen(true);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-mono font-bold transition cursor-pointer"
                                  title="View Trip Sheet manifest"
                                >
                                  {job.trip_number}
                                </button>
                              )}
                              {(job.ack_status === 'Delivered' || job.status === 'Delivered') ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono font-bold flex items-center gap-0.5">
                                  <CheckCircle2 size={10} className="text-emerald-600" />
                                  <span>Delivered</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateJobDeliveryStatus && updateJobDeliveryStatus(job.job_no, 'Delivered')}
                                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-300 rounded text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Mark order as Delivered on completion of trip"
                                >
                                  <CheckCircle2 size={10} className="text-emerald-600" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRecallJob(job)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 underline font-mono cursor-pointer ml-1"
                                title="Recall back to pending queue"
                              >
                                Recall
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
            <div>
              <span>
                {viewMode === 'pending' ? 'Ready for Dispatch' : 'Dispatched / In-Transit'}:{' '}
                <b className="text-slate-900">{displayedJobs.length}</b> orders
              </span>
              {selectedJobIds.length > 0 && viewMode === 'pending' && (
                <span className="ml-2 font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedJobIds.length} selected for allocation
                </span>
              )}
            </div>
            <span>
              Showing {displayedJobs.length} of{' '}
              {viewMode === 'pending' ? allPendingJobs.length : allDispatchedJobs.length} total orders
            </span>
          </div>
        </div>

        {/* Right: Universal Vehicle Allocation & Manifest Generator */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                <Truck size={15} className="text-amber-500" />
                <span>Vehicle Allocation & Trip Generator</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Universal Manifest</span>
            </div>

            {/* Trip Run Name */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Trip / Run Name</label>
              <input
                type="text"
                value={tripRunName}
                onChange={(e) => setTripRunName(e.target.value)}
                placeholder="e.g. Morning Delivery Run #1"
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Vehicle Select */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-slate-600 font-medium block">Vehicle</label>
                <span className="text-[10px] font-mono text-slate-400">
                  Cap: {vehicleCapacityBoxes} Boxes
                </span>
              </div>
              <select
                value={selectedVehicle}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {vehicles?.map(v => (
                  <option key={v.id} value={v.reg_no}>
                    {v.reg_no} — {v.vehicle_type} ({v.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Driver Select */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Assigned Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Ramesh">Ramesh (Primary Fleet Driver)</option>
                <option value="Suresh Kumar">Suresh Kumar (Heavy Van Driver)</option>
                <option value="Manjunath">Manjunath (Electric Loader Driver)</option>
                <option value="Anand">Anand (Industrial Delivery Specialist)</option>
              </select>
            </div>

            {/* Trip Date */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Scheduled Dispatch Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Selected Destinations Breakdown */}
            {selectedJobIds.length > 0 && Object.keys(selectedDestinationBreakdown).length > 0 && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-bold flex items-center justify-between">
                  <span>Destinations Included</span>
                  <span className="text-slate-400 font-normal">
                    {Object.keys(selectedDestinationBreakdown).length} areas
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedDestinationBreakdown).map(([area, count]) => (
                    <span
                      key={area}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-800 flex items-center gap-1 shadow-2xs"
                    >
                      <MapPin size={9} className="text-blue-600" />
                      <span>{area}</span>
                      <span className="font-mono text-slate-400">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity Bar */}
            {selectedJobIds.length > 0 && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-500 font-semibold">Estimated Vehicle Load</span>
                  <span className={`font-bold ${capacityPercent > 90 ? 'text-rose-600' : 'text-blue-700'}`}>
                    ~{estimatedBoxes} / {vehicleCapacityBoxes} Boxes ({capacityPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      capacityPercent > 90 ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Counters */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Orders</div>
                <div className="text-base font-extrabold text-slate-900">{selectedJobIds.length}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Units</div>
                <div className="text-base font-extrabold text-blue-700">{selectedQty.toLocaleString()}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Plant Pending</div>
                <div className="text-base font-extrabold text-slate-700">{allPendingJobs.length}</div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] text-amber-700 uppercase font-bold">Trip COD Total</div>
                <div className="text-base font-extrabold text-amber-800">₹ {totalCodAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Primary Create Trip Sheet CTA */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <button
              onClick={handleCreateTripSheet}
              disabled={selectedJobIds.length === 0}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer size={15} />
              <span>
                {selectedJobIds.length > 0
                  ? `Create Trip Sheet (${selectedJobIds.length} Jobs)`
                  : 'Select Jobs to Create Trip Sheet'}
              </span>
            </button>
            <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
              Consolidates any selection of orders across all areas into a single driver manifest & delivery trip sheet.
            </p>
          </div>
        </div>
      </div>

      {/* Global Printable Trip Sheet Modal */}
      {isTripModalOpen && createdTrip && (
        <TripSheetModal
          trip={createdTrip}
          jobs={createdTripJobs}
          onClose={() => setIsTripModalOpen(false)}
          onCompleteTrip={(tripRef) => {
            if (completeTripSheet) {
              completeTripSheet(tripRef);
            }
            setIsTripModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
