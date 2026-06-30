'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>('');
  const limit = 50;

  const { data, isLoading } = trpc.admin.getAuditLogs.useQuery({
    limit,
    offset: page * limit,
    action: actionFilter || undefined,
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <Link href="/admin" className="text-[#4A90D9] text-sm font-semibold hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">Audit Logs</h1>
          <p className="text-[#9898B8] mt-1 text-sm font-medium">Immutable record of all system events and PHI access (HIPAA)</p>
        </div>
      </header>

      <div className="rounded-3xl p-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
        
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 flex items-center px-4 py-2.5 rounded-2xl bg-[#EEF0F5] shadow-[inset_4px_4px_8px_#C8CAD4,inset_-4px_-4px_8px_#FFFFFF]">
            <Filter className="w-5 h-5 text-[#9898B8] mr-3" />
            <select 
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
              className="bg-transparent border-none outline-none w-full text-sm font-bold text-[#1E2035]"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE_PATIENT">CREATE_PATIENT</option>
              <option value="VIEW_RECORDS">VIEW_RECORDS</option>
              <option value="UPDATE_VITALS">UPDATE_VITALS</option>
              <option value="BOOK_APPOINTMENT">BOOK_APPOINTMENT</option>
              <option value="PRESCRIBE">PRESCRIBE</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[#9898B8] border-b border-[#C8CAD4]/30">
                <th className="pb-3 px-4 font-bold uppercase text-xs tracking-wider">Timestamp</th>
                <th className="pb-3 px-4 font-bold uppercase text-xs tracking-wider">User</th>
                <th className="pb-3 px-4 font-bold uppercase text-xs tracking-wider">Action</th>
                <th className="pb-3 px-4 font-bold uppercase text-xs tracking-wider">Resource / Entity</th>
                <th className="pb-3 px-4 font-bold uppercase text-xs tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C8CAD4]/20 text-[#1E2035]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-[#9898B8]">Loading logs...</td></tr>
              ) : data?.logs.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-[#9898B8]">No audit logs found.</td></tr>
              ) : (
                data?.logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-[#EEF0F5] transition-colors">
                    <td className="py-4 px-4 font-mono text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {log.user?.email || 'System'} <span className="text-[10px] bg-[#EEF0F5] px-2 py-0.5 rounded text-[#5A5A7A] ml-1">{log.user?.role || ''}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#4A90D9]/10 text-[#4A90D9]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-[#5A5A7A] font-mono text-xs break-all max-w-[200px]">
                      {log.resource} {log.resourceId ? `: ${log.resourceId}` : ''}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#9898B8]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total > limit && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#C8CAD4]/30">
            <span className="text-xs font-semibold text-[#9898B8]">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, data.total)} of {data.total}
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-[#EEF0F5] rounded-lg text-sm font-bold text-[#5A5A7A] disabled:opacity-50 shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] active:scale-95"
              >
                Previous
              </button>
              <button 
                disabled={(page + 1) * limit >= data.total}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-[#EEF0F5] rounded-lg text-sm font-bold text-[#5A5A7A] disabled:opacity-50 shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF] active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
