import { cn } from '@/lib/utils';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray';

const VARIANT_MAP: Record<string, BadgeVariant> = {
  // Appointment status
  PENDING: 'blue', CONFIRMED: 'green', COMPLETED: 'gray',
  CANCELLED: 'red', NO_SHOW: 'yellow',
  // Prescription status
  ACTIVE: 'green', ON_HOLD: 'yellow',
  // Lab Status
  RESULTED: 'blue', REVIEWED: 'green',
  // Result flags
  NORMAL: 'green', LOW: 'yellow', HIGH: 'yellow',
  CRITICAL_LOW: 'red', CRITICAL_HIGH: 'red',
  // Urgency
  EMERGENT: 'red',
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({ label, variant, dot = true, className }: BadgeProps) {
  const v: BadgeVariant = variant ?? VARIANT_MAP[label] ?? 'gray';
  return (
    <span className={cn(`badge badge-${v}`, className)}>
      {dot && <span className="badge-dot" />}
      {label}
    </span>
  );
}
