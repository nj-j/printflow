import React from 'react';
import {
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
  Clock,
  Bell,
  CheckCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationAutomation = () => {
  const { notificationsLog } = useApp();

  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-4 text-xs select-none">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Send size={20} className="text-[#002b41]" />
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Notification & Communication Automation Module
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Automated WhatsApp and Email triggers across Order Booking, Prepress Proofs, Ready-to-Ship, and Reviews
          </p>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 uppercase font-mono">Sent-Message Audit Log</span>
          <span className="text-[11px] font-mono text-slate-500">{notificationsLog.length} Total Dispatched</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-mono uppercase tracking-wider border-b border-slate-200">
                <th className="p-2.5">Recipient & Contact</th>
                <th className="p-2.5 w-28">Channel</th>
                <th className="p-2.5 w-48">Trigger Event</th>
                <th className="p-2.5">Message Content</th>
                <th className="p-2.5 text-center w-24">Status</th>
                <th className="p-2.5 w-24">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {notificationsLog.map(notif => (
                <tr key={notif.id} className="hover:bg-slate-50 transition">
                  <td className="p-2.5">
                    <div className="font-bold text-slate-900">{notif.recipient_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{notif.recipient_contact}</div>
                  </td>
                  <td className="p-2.5 text-[11px] text-slate-600 font-mono">{notif.channel}</td>
                  <td className="p-2.5 font-semibold text-blue-700">{notif.trigger_event}</td>
                  <td className="p-2.5 text-slate-600 text-[11px] leading-relaxed max-w-md">{notif.message_content}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1">
                      <CheckCheck size={11} /> {notif.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-[10px] font-mono text-slate-500">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
