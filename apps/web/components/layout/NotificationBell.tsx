'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifications, refetch } = trpc.notifications.list.useQuery({ unreadOnly: true, limit: 10 });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => refetch(),
  });
  const markAllMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications?.length || 0;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95 group"
        style={{
          background: '#EEF0F5',
          boxShadow: '4px 4px 8px #C8CAD4, -4px -4px 8px #FFFFFF',
        }}
      >
        <Bell className="w-5 h-5 text-[#5A5A7A] group-hover:text-[#FF6B35] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 flex h-3 w-3 items-center justify-center rounded-full bg-[#E84545] text-[8px] font-bold text-white shadow-[0px_2px_4px_rgba(232,69,69,0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-4 w-80 rounded-3xl z-50 overflow-hidden"
          style={{
            background: '#EEF0F5',
            boxShadow: '8px 8px 16px #C8CAD4, -8px -8px 16px #FFFFFF',
          }}
        >
          <div className="p-4 border-b border-[#C8CAD4]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#1E2035]">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllMutation.mutate()}
                className="text-[10px] uppercase font-bold text-[#4A90D9] hover:underline"
                disabled={markAllMutation.isPending}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-[#9898B8] mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium text-[#9898B8]">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-[#C8CAD4]/20">
                {notifications?.map((n: any) => (
                  <div key={n.id} className="p-4 hover:bg-[#F2F4FA] transition-colors flex gap-3">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#1E2035] mb-1">{n.title}</p>
                      <p className="text-xs text-[#5A5A7A] line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-[#9898B8] mt-2 uppercase font-bold">
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button 
                      onClick={() => markAsReadMutation.mutate({ id: n.id })}
                      className="text-[#9898B8] hover:text-[#27AE60] transition-colors self-start"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
