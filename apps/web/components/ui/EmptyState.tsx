import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {Icon && <Icon className="empty-state-icon" />}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
