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
  Flag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripSheetModal } from '../common/TripSheetModal';

export const DeliveryDispatchPlanning = () => {
  const {
    dispatchRoutes,
    routeJobs,
    updateRouteJob,
    vehicles,
    tripSheets,
    createTripSheet,
    jobOrders,
    openQCFlagModal,
    issues
  } = useApp();

  const [selectedRouteId, setSelectedRouteId] = useState('route-1');
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('Ramesh');
  const [selectedVehicle, setSelectedVehicle] = useState('KA 03 AB 1234');
  const [tripDate, setTripDate] = useState('2026-06-19');
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);
  const [createdTripJobs, setCreatedTripJobs] = useState([]);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'dispatched'

  const selectedRoute = dispatchRoutes.find(r => r.id === selectedRouteId) || dispatchRoutes[0];

  const isJobOnTrip = (job) => {
    return Boolean(
      job.assigned_to_trip ||
      job.status === 'In-Transit' ||
      job.status === 'Delivered' ||
      job.ack_status === 'Dispatched' ||
      job.trip_id
    );
  };

  const pendingJobs = routeJobs.filter(j => j.route_id === selectedRouteId && !isJobOnTrip(j));
  const dispatchedJobs = routeJobs.filter(j => j.route_id === selectedRouteId && isJobOnTrip(j));
  const filteredJobs = viewMode === 'pending' ? pendingJobs : dispatchedJobs;

  const toggleSelectJob = (jobNo) => {
    if (viewMode !== 'pending') return;
    setSelectedJobIds(prev =>
      prev.includes(jobNo) ? prev.filter(id => id !== jobNo) : [...prev, jobNo]
    );
  };

  const selectAllJobs = () => {
    if (viewMode !== 'pending') return;
    if (selectedJobIds.length === pendingJobs.length && pendingJobs.length > 0) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(pendingJobs.map(j => j.job_no));
    }
  };

  const selectedJobsList = pendingJobs.filter(j => selectedJobIds.includes(j.job_no));
  const selectedQty = selectedJobsList.reduce((acc, curr) => acc + (curr.balance || curr.route_qty), 0);
  const totalCodAmount = selectedJobsList.reduce((acc, curr) => acc + curr.cod_amount, 0);

  const handleCreateTripSheet = () => {
    if (selectedJobIds.length === 0) {
      alert('Please select at least one pending job to create a Trip Sheet.');
      return;
    }

    const currentSelectedJobs = pendingJobs.filter(j => selectedJobIds.includes(j.job_no));

    const trip = createTripSheet({
      route_id: selectedRoute.id,
      route_name: selectedRoute.name,
      driver_name: selectedDriver,
      vehicle_reg: selectedVehicle,
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
      {/* Top Header matching Page 9 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Delivery Workspace • Dispatch Planning</h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Group route-wise job quantities and assign selected jobs to one vehicle
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedJobIds([])}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer text-xs self-start sm:self-auto"
          title="Refresh dispatch queue and reset selection"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Route Wise Dispatch Queue (Page 9 top cards) */}
      <div>
        <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
          Route Wise Dispatch Queue
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {dispatchRoutes.map(route => {
            const isSelected = selectedRouteId === route.id;
            const rPendingJobs = routeJobs.filter(j => j.route_id === route.id && !isJobOnTrip(j));
            const jobsCount = rPendingJobs.length;
            const totalQty = rPendingJobs.reduce((acc, j) => acc + (j.balance || j.route_qty), 0);
            const totalAmount = rPendingJobs.reduce((acc, j) => acc + j.cod_amount, 0);
            return (
              <div
                key={route.id}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  setSelectedJobIds([]);
                }}
                className={`bg-white rounded-xl p-3 border cursor-pointer transition shadow-xs ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-2 truncate">
                  <MapPin size={13} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                  <span className="truncate">{route.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-mono text-center border-t border-slate-100 pt-2">
                  <div>
                    <div className="text-slate-400 text-[10px]">Jobs</div>
                    <div className="font-extrabold text-slate-900">{jobsCount}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Qty</div>
                    <div className="font-extrabold text-slate-900">{totalQty.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Amt (₹)</div>
                    <div className="font-extrabold text-slate-900">{(totalAmount / 1000).toFixed(1)}k</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split: Selected Route Table (Left) + Vehicle Assignment (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Selected Route Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Selected Route</span>
              <h2 className="text-sm font-bold text-slate-900">{selectedRoute.name}</h2>
            </div>

            <div className="flex items-center gap-2">
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
                  <span>Pending Queue</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    pendingJobs.length > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {pendingJobs.length}
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
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    dispatchedJobs.length > 0 ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {dispatchedJobs.length}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5 w-10 text-center">
                    {viewMode === 'pending' ? (
                      <input
                        type="checkbox"
                        checked={selectedJobIds.length === pendingJobs.length && pendingJobs.length > 0}
                        onChange={selectAllJobs}
                        className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">#</span>
                    )}
                  </th>
                  <th className="p-2.5 w-24">Job No</th>
                  <th className="p-2.5 w-36">Customer</th>
                  <th className="p-2.5 w-28">Product</th>
                  <th className="p-2.5 text-right w-20">Route Qty</th>
                  <th className="p-2.5 text-right w-20">Dispatched</th>
                  <th className="p-2.5 text-right w-20">Balance</th>
                  <th className="p-2.5 text-right w-24">COD (₹)</th>
                  <th className="p-2.5 text-center w-20">ACK</th>
                  <th className="p-2.5 text-center w-28">
                    {viewMode === 'pending' ? 'QC Action' : 'Trip Manifest'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-2">
                        <CheckCircle2 size={32} className="text-emerald-500" />
                        <span className="font-bold text-slate-800 text-sm">
                          {viewMode === 'pending'
                            ? `All Jobs for ${selectedRoute.name} Dispatched`
                            : 'No Jobs Currently on Trip Sheets'}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {viewMode === 'pending'
                            ? `There are no pending jobs awaiting delivery on ${selectedRoute.name}. All jobs have been assigned to trip sheets and dispatched.`
                            : 'When you create a trip sheet, assigned jobs will be archived here.'}
                        </p>
                        {viewMode === 'pending' && dispatchedJobs.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setViewMode('dispatched')}
                            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition border border-slate-300 cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Truck size={13} className="text-blue-600" />
                            <span>View {dispatchedJobs.length} Dispatched Jobs on Trip Sheets</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job, idx) => {
                    const isChecked = selectedJobIds.includes(job.job_no);
                    const isFlagged = job.qc_flagged || issues?.some(i => (i.job_ticket_number === job.job_no || i.job_order_id === job.id) && !i.resolved);

                    return (
                      <tr
                        key={job.id}
                        onClick={() => toggleSelectJob(job.job_no)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/30' : ''
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
                          <div className="flex items-center gap-1.5">
                            <span>{job.job_no}</span>
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
                        <td className="p-2.5 text-slate-600">{job.product}</td>
                        <td className="p-2.5 text-right font-mono">{job.route_qty.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono text-slate-500">{job.dispatched.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-amber-700">{job.balance.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">₹ {job.cod_amount.toLocaleString()}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                              job.ack_status === 'Confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : job.ack_status === 'Dispatched'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {job.ack_status}
                          </span>
                        </td>
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          {viewMode === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => {
                                const matchedJob = jobOrders.find(j => j.job_ticket_number === job.job_no);
                                openQCFlagModal(matchedJob || {
                                  id: job.id,
                                  job_ticket_number: job.job_no,
                                  customer_name: job.customer,
                                  job_title: job.product,
                                  current_stage: 'DispatchReady'
                                }, 'Delivery & Dispatch');
                              }}
                              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer mx-auto"
                              title="Raise QC Flag on delivery item"
                            >
                              <Flag size={10} className="text-amber-600" />
                              <span>QC Flag</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              {job.trip_number && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const foundTrip = tripSheets.find(t => t.trip_number === job.trip_number || t.id === job.trip_id);
                                    if (foundTrip) {
                                      setCreatedTrip(foundTrip);
                                      setCreatedTripJobs(routeJobs.filter(j => foundTrip.selected_job_ids?.includes(j.job_no)));
                                      setIsTripModalOpen(true);
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-mono font-bold transition cursor-pointer"
                                  title="View Trip Sheet modal"
                                >
                                  {job.trip_number}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRecallJob(job)}
                                className="text-[10px] text-slate-400 hover:text-rose-600 underline font-mono cursor-pointer"
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

          {/* Table Footer matching Page 9 */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>
              {viewMode === 'pending' ? 'Pending Jobs' : 'Dispatched Jobs'}: <b>{filteredJobs.length}</b>
            </span>
            <span>1 - {filteredJobs.length} of {filteredJobs.length} items</span>
          </div>
        </div>

        {/* Right: Vehicle Assignment Pane (Page 9 right card) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                <Truck size={15} className="text-amber-500" />
                <span>Vehicle Assignment</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Step 2 of 2</span>
            </div>

            {/* Driver Select */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Driver</label>
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Ramesh">Ramesh (Primary Fleet)</option>
                <option value="Suresh Kumar">Suresh Kumar (Heavy Van)</option>
                <option value="Manjunath">Manjunath (Electric Loader)</option>
              </select>
            </div>

            {/* Vehicle Select */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.reg_no}>
                    {v.reg_no} — {v.vehicle_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Date */}
            <div className="space-y-1">
              <label className="text-slate-600 font-medium block">Trip Date</label>
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="w-full h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Jobs</div>
                <div className="text-base font-extrabold text-slate-900">{selectedJobIds.length}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Selected Qty</div>
                <div className="text-base font-extrabold text-blue-700">{selectedQty.toLocaleString()}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Pending Route Jobs</div>
                <div className="text-base font-extrabold text-slate-700">{pendingJobs.length}</div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] text-amber-700 uppercase font-bold">COD Amount</div>
                <div className="text-base font-extrabold text-amber-800">₹ {totalCodAmount.toLocaleString()}</div>
              </div>
            </div>


          </div>

          {/* Primary Create Trip Sheet CTA matching Page 9 */}
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
              Creating a trip sheet assigns selected jobs to vehicle and removes them from the pending queue.
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
        />
      )}
    </div>
  );
};
