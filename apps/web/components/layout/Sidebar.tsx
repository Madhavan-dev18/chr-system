'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Users, Calendar, FileText, Activity, FlaskConical,
  Pill, LayoutDashboard, ShieldCheck, LogOut, Bell,
  ClipboardList, UserCog, ChevronRight,
} from 'lucide-react';
import { cn, getRoleLabel } from '@/lib/utils';
import type { Role } from '@chr/db';

interface NavItem { label: string; href: string; icon: React.ElementType }

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Patients', href: '/admin/patients', icon: Users },
    { label: 'Users', href: '/admin/users', icon: UserCog },
    { label: 'Audit Logs', href: '/admin/audit', icon: ClipboardList },
  ],
  DOCTOR: [
    { label: 'My Patients', href: '/doctor/patients', icon: Users },
    { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { label: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill },
    { label: 'Lab Orders', href: '/doctor/labs', icon: FlaskConical },
  ],
  NURSE: [
    { label: 'Patients', href: '/nurse/patients', icon: Users },
    { label: 'Record Vitals', href: '/nurse/patients/record', icon: Activity },
  ],
  RECEPTIONIST: [
    { label: 'Patients', href: '/receptionist/patients', icon: Users },
    { label: 'Appointments', href: '/receptionist/appointments', icon: Calendar },
  ],
  LAB_TECH: [
    { label: 'Lab Orders', href: '/lab/orders', icon: FlaskConical },
  ],
  PATIENT: [
    { label: 'My Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'My Records', href: '/patient/records', icon: FileText },
  ],
};

interface SidebarProps {
  role: Role;
  email: string;
  notificationCount?: number;
}

export function Sidebar({ role, email, notificationCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role] ?? [];

  const isActive = (href: string) => {
    if (href === '/admin' || href === '/doctor' || href === '/nurse') {
      return pathname === href;
    }
    if (!pathname) return false;
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 bg-surface flex flex-col z-40"
      style={{ boxShadow: 'var(--shadow-sidebar)' }}
    >
      {/* Brand */}
      <div className="p-5 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-accent-sm shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-foreground text-base leading-tight">CHR System</p>
            <p className="text-2xs text-muted font-semibold uppercase tracking-wider">{getRoleLabel(role)}</p>
          </div>
        </div>
      </div>

      <hr className="divider mx-4 my-0" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-link group', active && 'active')}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-accent' : 'text-muted group-hover:text-foreground-secondary')} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-accent opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <hr className="divider mx-4 my-0" />

      {/* Bottom actions */}
      <div className="p-3 space-y-1">
        <Link href={`/${role.toLowerCase()}/notifications`} className="nav-link relative">
          <Bell className="w-4 h-4 text-muted" />
          <span className="flex-1">Notifications</span>
          {notificationCount > 0 && (
            <span className="min-w-5 h-5 rounded-full bg-accent text-white text-2xs font-bold flex items-center justify-center px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="nav-link w-full text-left hover:text-red"
        >
          <LogOut className="w-4 h-4 text-muted" />
          <span className="flex-1">Sign Out</span>
        </button>
      </div>

      {/* User info */}
      <div className="px-4 pb-4">
        <div className="card-inset">
          <p className="text-xs text-muted font-semibold truncate">{email}</p>
          <p className="text-2xs text-muted/60 mt-0.5">{getRoleLabel(role)}</p>
        </div>
      </div>
    </aside>
  );
}
