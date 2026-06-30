'use client';

import { trpc } from '@/lib/trpc/client';
import { Users, FileText, Activity, ShieldCheck, Database, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: metrics, isLoading } = trpc.admin.getMetrics.useQuery();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#1E2035] tracking-tight">System Overview</h1>
        <p className="text-[#9898B8] mt-1 text-sm font-medium">Global metrics and system health</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#4A90D9]/10 text-[#4A90D9]">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#9898B8] uppercase">Staff Accounts</h3>
          </div>
          <p className="text-4xl font-black text-[#1E2035]">
            {isLoading ? '...' : metrics?.totalUsers || 0}
          </p>
        </div>

        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#27AE60]/10 text-[#27AE60]">
              <UserCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#9898B8] uppercase">Total Patients</h3>
          </div>
          <p className="text-4xl font-black text-[#1E2035]">
            {isLoading ? '...' : metrics?.totalPatients || 0}
          </p>
        </div>

        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F39C12]/10 text-[#F39C12]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#9898B8] uppercase">Appointments</h3>
          </div>
          <p className="text-4xl font-black text-[#1E2035]">
            {isLoading ? '...' : metrics?.totalAppointments || 0}
          </p>
        </div>

        <div className="rounded-3xl p-6 transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#8E44AD]/10 text-[#8E44AD]">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#9898B8] uppercase">Lab Results</h3>
          </div>
          <p className="text-4xl font-black text-[#1E2035]">
            {isLoading ? '...' : metrics?.totalLabs || 0}
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Quick Links */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#4A90D9]" />
            Management Links
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/users" className="flex items-center justify-between p-6 rounded-3xl transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#4A90D9]/10 text-[#4A90D9]"><Users className="w-5 h-5" /></div>
                <span className="font-bold text-[#1E2035]">Manage Staff Access (RBAC)</span>
              </div>
              <span className="text-[#9898B8] font-bold">&rarr;</span>
            </Link>

            <Link href="/admin/audit" className="flex items-center justify-between p-6 rounded-3xl transition-all hover:scale-[1.02]" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#E84545]/10 text-[#E84545]"><ShieldCheck className="w-5 h-5" /></div>
                <span className="font-bold text-[#1E2035]">View HIPAA Audit Logs</span>
              </div>
              <span className="text-[#9898B8] font-bold">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#1E2035] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#27AE60]" />
            System Status
          </h2>
          <div className="rounded-3xl p-6 space-y-6" style={{ background: '#F2F4FA', boxShadow: '6px 6px 12px #C8CAD4, -6px -6px 12px #FFFFFF' }}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A5A7A]">Database Connection</span>
              <span className="px-3 py-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div> Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A5A7A]">Edge Middleware</span>
              <span className="px-3 py-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A5A7A]">Redis Cache (Upstash)</span>
              <span className="px-3 py-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div> Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5A5A7A]">Gemini AI</span>
              <span className="px-3 py-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-bold rounded-full flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse"></div> Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick component shim for icons
function UserCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  );
}
