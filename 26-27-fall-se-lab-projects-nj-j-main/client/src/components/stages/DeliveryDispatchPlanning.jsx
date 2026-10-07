import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Calendar,
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
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TripSheetModal } from '../common/TripSheetModal';

export const DeliveryDispatchPlanning = () => {
  const {
    dispatchRoutes,
    routeJobs,
    updateRouteJob,
    vehicles,
    createTripSheet
  } = useApp();

  const [selectedRouteId, setSelectedRouteId] = useState('route-1');
  const [selectedJobIds, setSelectedJobIds] = useState(['JO-1024', 'JO-1025', 'JO-1026', 'JO-1027']);
  const [selectedDriver, setSelectedDriver] = useState('Ramesh');
  const [selectedVehicle, setSelectedVehicle] = useState('KA 03 AB 1234');
  const [tripDate, setTripDate] = useState('2026-06-19');
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [createdTrip, setCreatedTrip] = useState(null);

  const selectedRoute = dispatchRoutes.find(r => r.id === selectedRouteId) || dispatchRoutes[0];
  const filteredJobs = routeJobs.filter(j => j.route_id === selectedRouteId);

  const toggleSelectJob = (jobNo) => {
    setSelectedJobIds(prev =>
      prev.includes(jobNo) ? prev.filter(id => id !== jobNo) : [...prev, jobNo]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobIds.length === filteredJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(filteredJobs.map(j => j.job_no));
    }
  };

  const selectedJobsList = filteredJobs.filter(j => selectedJobIds.includes(j.job_no));
  const selectedQty = selectedJobsList.reduce((acc, curr) => acc + curr.route_qty, 0);
  const totalCodAmount = selectedJobsList.reduce((acc, curr) => acc + curr.cod_amount, 0);

  const handleCreateTripSheet = () => {
    if (selectedJobIds.length === 0) {
      alert('Please select at least one job to create a Trip Sheet.');
      return;
    }

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

    setCreatedTrip(trip);
    setIsTripModalOpen(true);
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

        <div className="flex flex-wrap items-center gap-2.5 font-medium">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 font-mono text-[11px]">
            <Calendar size={13} className="text-slate-400" />
            <span>03-Jun-2025</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
            <span className="text-slate-400 text-[10px] block">Location</span>
            <span className="font-semibold">All Locations</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-[11px]">
            <span className="text-slate-400 text-[10px] block">View</span>
            <span className="font-semibold">All Routes</span>
          </div>

          <button className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-semibold text-xs transition">
            Route Master
          </button>

          <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded shadow-xs transition">
            Refresh
          </button>
        </div>
      </div>

      {/* Route Wise Dispatch Queue (Page 9 top cards) */}
      <div>
        <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
          Route Wise Dispatch Queue
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {dispatchRoutes.map(route => {
            const isSelected = selectedRouteId === route.id;
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
                    <div className="font-extrabold text-slate-900">{route.jobs_count}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Qty</div>
                    <div className="font-extrabold text-slate-900">{route.total_qty.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Amt (₹)</div>
                    <div className="font-extrabold text-slate-900">{(route.total_amount / 1000).toFixed(1)}k</div>
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

            <div className="flex items-center gap-4 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Jobs: <b>{filteredJobs.filter(j => j.status === 'Pending').length}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending Qty: <b>{filteredJobs.reduce((acc, j) => acc + j.balance, 0).toLocaleString()}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Selected Qty: <b>{selectedQty.toLocaleString()}</b>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-2.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedJobIds.length === filteredJobs.length && filteredJobs.length > 0}
                      onChange={selectAllJobs}
                      className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-2.5 w-24">Job No</th>
                  <th className="p-2.5 w-36">Customer</th>
                  <th className="p-2.5 w-28">Product</th>
                  <th className="p-2.5 text-right w-20">Route Qty</th>
                  <th className="p-2.5 text-right w-20">Dispatched</th>
                  <th className="p-2.5 text-right w-20">Balance</th>
                  <th className="p-2.5 text-right w-24">COD (₹)</th>
                  <th className="p-2.5 text-center w-20">ACK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400">
                      No jobs queued for this route.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => {
                    const isChecked = selectedJobIds.includes(job.job_no);
                    return (
                      <tr
                        key={job.id}
                        onClick={() => toggleSelectJob(job.job_no)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition ${isChecked ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectJob(job.job_no)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{job.job_no}</td>
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer matching Page 9 */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Total Jobs: <b>{filteredJobs.length}</b></span>
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
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Route Jobs</div>
                <div className="text-base font-extrabold text-slate-700">{filteredJobs.length}</div>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-[10px] text-amber-700 uppercase font-bold">COD Amount</div>
                <div className="text-base font-extrabold text-amber-800">₹ {totalCodAmount.toLocaleString()}</div>
              </div>
            </div>

            {/* Gate 7 Enforced Notification */}
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-[11px] text-emerald-800">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>[Gate 7 Verified]: 100% Payment Gate / Credit Bill Authorization Active.</span>
            </div>
          </div>

          {/* Primary Create Trip Sheet CTA matching Page 9 */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <button
              onClick={handleCreateTripSheet}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <Printer size={15} />
              <span>Create Trip Sheet</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
              A trip sheet will be created for {selectedRoute.name} with the selected jobs and vehicle details.
            </p>
          </div>
        </div>
      </div>

      {/* Global Printable Trip Sheet Modal */}
      {isTripModalOpen && createdTrip && (
        <TripSheetModal
          trip={createdTrip}
          jobs={selectedJobsList}
          onClose={() => setIsTripModalOpen(false)}
        />
      )}
    </div>
  );
};
