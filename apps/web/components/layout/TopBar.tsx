'use client';

import { Search, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="page-title text-xl truncate">{title}</h1>
          {subtitle && <p className="page-subtitle text-xs truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="btn btn-neu btn-icon"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4 text-muted', refreshing && 'animate-spin')} />
          </button>
          {actions}
        </div>
      </div>
    </header>
  );
}
