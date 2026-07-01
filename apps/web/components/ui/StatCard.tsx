import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'accent' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  delta?: { value: number; label: string };
  className?: string;
}

const COLOR_MAP = {
  accent:  { icon: 'text-accent',  bg: 'bg-accent-muted'  },
  blue:    { icon: 'text-blue',    bg: 'bg-blue-muted'    },
  green:   { icon: 'text-green',   bg: 'bg-green-muted'   },
  yellow:  { icon: 'text-yellow',  bg: 'bg-yellow-muted'  },
  red:     { icon: 'text-red',     bg: 'bg-red-muted'     },
  purple:  { icon: 'text-purple',  bg: 'bg-purple-muted'  },
};

export function StatCard({ label, value, icon: Icon, color = 'blue', delta, className }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className={cn('metric-card', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>
        {delta && (
          <span className={cn(
            'text-xs font-bold',
            delta.value >= 0 ? 'text-green' : 'text-red'
          )}>
            {delta.value >= 0 ? '+' : ''}{delta.value}% {delta.label}
          </span>
        )}
      </div>
      <p className="metric-value">{value}</p>
      <p className="metric-label mt-1">{label}</p>
    </div>
  );
}
