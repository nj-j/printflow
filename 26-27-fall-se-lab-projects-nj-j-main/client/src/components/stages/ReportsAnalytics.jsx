import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Boxes,
  Printer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsAnalytics = () => {
  const { jobOrders, invoices, machines, inventory, workstationLogs } = useApp();

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.grand_total || 0), 0);
  const totalScrapSheets = workstationLogs.reduce((sum, l) => sum + (l.waste_sheets_logged || 0), 0);

  const categoryBreakdown = [
    { category: 'Commercial Brochures', share: '38%', revenue: '₹1,45,000', margin: '28%' },
    { category: 'Carton Box Packaging', share: '29%', revenue: '₹1,12,000', margin: '32%' },
    { category: 'Publication Textbooks', share: '21%', revenue: '₹82,000', margin: '18%' },
    { category: 'Business Cards & Leaflets', share: '12%', revenue: '₹46,000', margin: '35%' },
  ];

  return (
    <div className="stage-page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stage 11: Production Intelligence, Reports & Business Analytics</h1>
          <p className="page-subtitle">
            Visual analytics on peak production windows, machine utilization efficiency, paper scrap rates, and product line profit margins.
          </p>
        </div>
      </div>

      {/* Top 4 Performance Badges */}
      <div className="kpi-metrics-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box bg-blue-light text-primary">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average Gross Profit Margin</span>
            <div className="kpi-value text-primary">27.4%</div>
            <span className="kpi-sub text-success font-medium">↑ 3.2% vs last month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-emerald-light text-success">
            <Printer size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Heidelberg Press OEE</span>
            <div className="kpi-value text-success">84.2%</div>
            <span className="kpi-sub text-muted">11,000 IPH average speed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-amber-light text-warning">
            <Boxes size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Scrap Logged</span>
            <div className="kpi-value text-warning">{totalScrapSheets} <span className="text-xs font-normal text-muted">Sheets</span></div>
            <span className="kpi-sub text-success font-medium">Well within 10% tolerance</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box bg-purple-light text-purple-600">
            <Clock size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average Order Turnaround</span>
            <div className="kpi-value">22.5 <span className="text-xs font-normal text-muted">Hours</span></div>
            <span className="kpi-sub text-danger font-medium">Rush jobs avg: 6.8 hrs</span>
          </div>
        </div>
      </div>

      {/* Two Column Visual Analytics Grid */}
      <div className="reports-two-col-grid">
        {/* Machine Utilization Efficiency */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Printer size={18} className="text-primary" /> Machine Capacity & Runtime Efficiency
            </h3>
          </div>

          <div className="chart-bar-list">
            {[
              { name: 'Ryobi 32 (Offset - Ramamurthy Nagar Branch)', utilization: 84, color: '#2563eb', hours: '13.5 hrs / day' },
              { name: 'Ryobi 660 (Offset - Ramamurthy Nagar Branch)', utilization: 88, color: '#16a34a', hours: '14.2 hrs / day' },
              { name: 'Lithrone 26 (Komori - Ramamurthy Nagar Branch)', utilization: 76, color: '#0284c7', hours: '12.0 hrs / day' },
              { name: 'Konica Minolta C4080 (Digital Color - Kalkere Branch)', utilization: 92, color: '#7c3aed', hours: '15.5 hrs / day' },
              { name: 'KM2100 Black (Digital Mono - Byrathi)', utilization: 94, color: '#0f172a', hours: '16.0 hrs / day' },
            ].map(item => (
              <div key={item.name} className="bar-metric-row">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-bold">{item.utilization}% ({item.hours})</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${item.utilization}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profitability Matrix by Category */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <DollarSign size={18} className="text-success" /> Job Profitability & Revenue Breakdown
            </h3>
          </div>

          <table className="compact-table">
            <thead>
              <tr>
                <th>Job Category</th>
                <th>Revenue Share</th>
                <th>Total Volume</th>
                <th className="text-right">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdown.map(row => (
                <tr key={row.category}>
                  <td className="font-semibold text-xs">{row.category}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: row.share }}></div>
                      </div>
                      <span className="text-xs">{row.share}</span>
                    </div>
                  </td>
                  <td className="text-xs font-bold">{row.revenue}</td>
                  <td className="text-right font-bold text-success text-xs">{row.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
