'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Calendar, 
  FileText, 
  Activity, 
  Pill, 
  FlaskConical, 
  Settings, 
  UserCircle 
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // Admin
  { title: 'Dashboard', href: '/admin', icon: Activity, roles: ['ADMIN'] },
  { title: 'User Management', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
  { title: 'Patient Directory', href: '/admin/patients', icon: UserCircle, roles: ['ADMIN'] },
  { title: 'Audit Logs', href: '/admin/audit', icon: FileText, roles: ['ADMIN'] },
  
  // Doctor
  { title: 'Dashboard', href: '/doctor', icon: Activity, roles: ['DOCTOR'] },
  { title: 'My Patients', href: '/doctor/patients', icon: Users, roles: ['DOCTOR'] },
  { title: 'Appointments', href: '/doctor/appointments', icon: Calendar, roles: ['DOCTOR'] },
  { title: 'Prescriptions', href: '/doctor/prescriptions', icon: Pill, roles: ['DOCTOR'] },
  { title: 'Lab Results', href: '/doctor/labs', icon: FlaskConical, roles: ['DOCTOR'] },
  
  // Nurse
  { title: 'Dashboard', href: '/nurse', icon: Activity, roles: ['NURSE'] },
  { title: 'Patient List', href: '/nurse/patients', icon: Users, roles: ['NURSE'] },
  { title: 'Vitals Entry', href: '/nurse/patients/record', icon: FileText, roles: ['NURSE'] },
  
  // Receptionist
  { title: 'Dashboard', href: '/receptionist', icon: Activity, roles: ['RECEPTIONIST'] },
  { title: 'Patient Registry', href: '/receptionist/patients', icon: Users, roles: ['RECEPTIONIST'] },
  { title: 'Appointments', href: '/receptionist/appointments', icon: Calendar, roles: ['RECEPTIONIST'] },
  
  // Lab Tech
  { title: 'Dashboard', href: '/lab', icon: Activity, roles: ['LAB_TECH'] },
  { title: 'Lab Orders', href: '/lab/orders', icon: FlaskConical, roles: ['LAB_TECH'] },
  
  // Patient Portal
  { title: 'My Portal', href: '/patient', icon: Activity, roles: ['PATIENT'] },
  { title: 'My Appointments', href: '/patient/appointments', icon: Calendar, roles: ['PATIENT'] },
  { title: 'My Records', href: '/patient/records', icon: FileText, roles: ['PATIENT'] },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const allowedItems = SIDEBAR_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside 
      className="w-64 h-screen flex flex-col pt-6 pb-6 px-4 shrink-0 transition-all z-10"
      style={{
        background: '#EEF0F5',
        boxShadow: '6px 0px 12px #C8CAD4',
      }}
    >
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center text-white font-bold shadow-[4px_4px_8px_#C8CAD4,-4px_-4px_8px_#FFFFFF]">
          CHR
        </div>
        <div>
          <h1 className="font-bold text-[#1E2035] tracking-tight">System</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#9898B8]">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {allowedItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold group",
                isActive 
                  ? "bg-[#F2F4FA] text-[#FF6B35] shadow-[inset_4px_4px_8px_#C8CAD4,inset_-4px_-4px_8px_#FFFFFF]" 
                  : "text-[#5A5A7A] hover:bg-[#F2F4FA]/50 hover:text-[#1E2035]"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "text-[#FF6B35]" : "text-[#9898B8] group-hover:text-[#4A90D9]"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-[#C8CAD4]/30 px-2">
        <Link 
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold text-[#5A5A7A] hover:bg-[#F2F4FA]/50 hover:text-[#1E2035] group"
        >
          <Settings className="w-5 h-5 text-[#9898B8] group-hover:text-[#1E2035]" strokeWidth={2} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
