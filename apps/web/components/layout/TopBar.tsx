'use client';

import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { NotificationBell } from './NotificationBell';

type TopBarProps = {
  userName: string;
  userRole: string;
};

export function TopBar({ userName, userRole }: TopBarProps) {
  return (
    <header className="h-20 w-full flex items-center justify-between px-8 bg-[#EEF0F5] z-10 shrink-0">
      
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div 
          className="flex items-center px-4 py-2.5 rounded-2xl w-full"
          style={{
            background: '#EEF0F5',
            boxShadow: 'inset 4px 4px 8px #C8CAD4, inset -4px -4px 8px #FFFFFF',
          }}
        >
          <Search className="w-5 h-5 text-[#9898B8] mr-3" />
          <input 
            type="text" 
            placeholder="Search patients, appointments, or records..." 
            className="bg-transparent border-none outline-none w-full text-sm font-medium text-[#1E2035] placeholder:text-[#9898B8]"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6 ml-8">
        
        {/* Notification Bell */}
        <NotificationBell />

        {/* User Dropdown */}
        <div 
          className="flex items-center gap-4 px-4 py-2.5 rounded-2xl cursor-pointer transition-all hover:bg-[#F2F4FA]/50"
          style={{
            background: '#EEF0F5',
            boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4A90D9]/10 text-[#4A90D9]">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1E2035]">{userName}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#9898B8]">{userRole}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-[#9898B8] ml-2" />
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 group"
          style={{
            background: '#EEF0F5',
            boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
          }}
          title="Sign out"
        >
          <LogOut className="w-5 h-5 text-[#E84545]" />
        </button>

      </div>
    </header>
  );
}
