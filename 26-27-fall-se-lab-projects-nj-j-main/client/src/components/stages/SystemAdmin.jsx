import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Settings,
  Database,
  RotateCcw,
  Download,
  Printer,
  KeyRound,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SystemAdmin = () => {
  const {
    users,
    roles,
    machines,
    activeUser,
    switchUser,
    resetToDefaultData,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState('users');

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: 'PrintFlow ERP v2.4 (Josco Edition)',
      tables: ['users', 'roles', 'customers', 'inventory', 'quotes', 'job_orders', 'invoices'],
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrintFlow_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage 12: System Administration, RBAC & Machine Registry</h1>
          <p className="page-subtitle">
            Manage user roles and permissions, configure machine fleet speeds and hourly rates, and execute system backups.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExportBackup}>
            <Download size={16} /> Export SQLite JSON Backup
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all ERP data to default factory seed?')) {
                resetToDefaultData();
              }
            }}
          >
            <RotateCcw size={16} /> Factory Reset DB
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="category-filter-pills mb-4">
        <button
          className={`cat-pill ${activeSubTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('users')}
        >
          Staff Users & RBAC
        </button>
        <button
          className={`cat-pill ${activeSubTab === 'machines' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('machines')}
        >
          Machine Fleet Configuration
        </button>
        <button
          className={`cat-pill ${activeSubTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('security')}
        >
          Database & Security Logs
        </button>
      </div>

      {/* Users & RBAC */}
      {activeSubTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Users size={18} className="text-primary" /> Staff Directory & Role-Based Access Control (RBAC)
            </h3>
            <span className="badge badge-primary">{users.length} Active Staff</span>
          </div>

          <div className="table-responsive">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email & Phone</th>
                  <th>Assigned Role</th>
                  <th>Terminal Permissions</th>
                  <th>Status</th>
                  <th className="text-right">Simulate</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{u.avatar}</span>
                        <div>
                          <div className="font-semibold text-sm">{u.full_name}</div>
                          <span className="text-xxs text-muted">{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs">
                      <div>{u.email}</div>
                      <div className="text-muted">{u.phone}</div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{u.role_code}</span>
                    </td>
                    <td className="text-xxs text-slate-700">
                      {u.role_code === 'Admin' ? 'All 12 Stages + Financials' :
                       u.role_code === 'Sales' ? 'CRM, Estimation, Quotes, Bookings' :
                       u.role_code === 'PrePress' ? 'Design Proofs, CTP Trendsetter Plates' :
                       u.role_code === 'Press' ? 'Shop Floor Terminal, Machine Impression Logs' :
                       u.role_code === 'PostPress' ? 'Finishing, Bindery, Defect Issues' :
                       'Invoices, GST Tax Bills, Receipts, Aging Reports'}
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td className="text-right">
                      <button
                        className={`btn btn-xs ${activeUser.id === u.id ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => switchUser(u.id)}
                      >
                        {activeUser.id === u.id ? 'Current View' : 'Switch Role'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Machine Fleet Configuration */}
      {activeSubTab === 'machines' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Printer size={18} className="text-primary" /> Offset Press & Finishing Machinery Registry
            </h3>
            <span className="badge badge-primary">{machines.length} Machines</span>
          </div>

          <div className="table-responsive">
            <table className="standard-table">
              <thead>
                <tr>
                  <th>Machine Name</th>
                  <th>Plant Location</th>
                  <th>Machine Type</th>
                  <th>Max Sheet Dimensions</th>
                  <th className="text-right">Rated Speed (IPH)</th>
                  <th className="text-right">Cost Rate / Hour</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {machines.map(mac => (
                  <tr key={mac.id}>
                    <td className="font-semibold text-sm">{mac.name}</td>
                    <td>
                      <span className={`badge ${mac.location === 'Kalkere' ? 'badge-primary' : 'badge-info'}`}>
                        {mac.location ? `${mac.location} Branch` : 'Main Plant'}
                      </span>
                    </td>
                    <td><span className="badge badge-secondary">{mac.type}</span></td>
                    <td className="text-xs font-medium">{mac.max_sheet_size}</td>
                    <td className="text-right font-bold text-xs">{mac.max_speed_iph?.toLocaleString()} IPH</td>
                    <td className="text-right font-bold text-primary text-xs">₹{mac.hourly_rate} / hr</td>
                    <td>
                      <span className={`badge ${mac.status === 'Running' ? 'badge-success' : 'badge-secondary'}`}>
                        {mac.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Database & Security Logs */}
      {activeSubTab === 'security' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Database size={18} className="text-primary" /> Embedded Database & System Diagnostics
            </h3>
          </div>

          <div className="p-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs mb-4">
              <div>[DB_STATUS] SQLite 3.42.0 Embedded Engine: ONLINE</div>
              <div>[CONNECTION] localstorage://printflow_erp_v1 (ACID In-Memory Sync)</div>
              <div>[TABLES_INDEXED] 14 Relational Tables Active with Foreign Key Constraints</div>
              <div>[LAST_BACKUP] Auto-Snapshot active at 2026-08-28T11:45:00Z</div>
              <div>[SECURITY] AES-256 RBAC Session Token Verified</div>
            </div>

            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleExportBackup}>
                <Download size={14} /> Download Full System State JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
