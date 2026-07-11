'use client';

import { Activity, Clock } from 'lucide-react';
import { AuditLogEntry } from '@/app/actions/audit';

interface AuditTrailTableProps {
  logs: AuditLogEntry[];
}

export default function AuditTrailTable({ logs }: AuditTrailTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Aktivitas Terkini (Audit Trail)</h2>
            <p className="text-sm text-slate-500">Pantau pergerakan data sistem secara real-time</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Waktu</th>
              <th className="px-6 py-4 font-semibold">Aksi</th>
              <th className="px-6 py-4 font-semibold">Pelaku</th>
              <th className="px-6 py-4 font-semibold">Basecamp Terkait</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="w-4 h-4" />
                      {log.waktu}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{log.aksi}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.pelaku === 'Sistem' || log.pelaku === 'Sistem Cron' ? 'bg-slate-100 text-slate-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.pelaku}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.basecamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Belum ada aktivitas tercatat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
