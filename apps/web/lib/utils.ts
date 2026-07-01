import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

/** Merges Tailwind class names safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a date as "Jan 12, 2025" */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

/** Format a datetime as "Jan 12, 2025 at 14:30" */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, "MMM d, yyyy 'at' HH:mm");
}

/** "2 hours ago", "3 days ago", etc. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/** Calculate age from date of birth */
export function calculateAge(dob: Date | string): number {
  const d = typeof dob === 'string' ? new Date(dob) : dob;
  return Math.floor(
    (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );
}

/** Capitalise first letter of each word */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Generate a short MRN: MRN-YYYYMM-XXXX */
export function generateMRN(): string {
  const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
  const randomHex = Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0')
    .toUpperCase();
  return `MRN-${dateStr}-${randomHex}`;
}

/** Map a role string to a friendly display label */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'System Administrator',
  DOCTOR: 'Physician',
  NURSE: 'Nurse',
  PATIENT: 'Patient',
  RECEPTIONIST: 'Receptionist',
  LAB_TECH: 'Lab Technician',
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

/** Map a role to its primary dashboard URL */
export function getRoleDashboardUrl(role: string): string {
  const map: Record<string, string> = {
    ADMIN: '/admin',
    DOCTOR: '/doctor/patients',
    NURSE: '/nurse/patients',
    PATIENT: '/patient',
    RECEPTIONIST: '/receptionist/patients',
    LAB_TECH: '/lab/orders',
  };
  return map[role] ?? '/unauthorized';
}

/** Truncate a string to a max length, appending ellipsis */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

/** Deep-clone a plain object via JSON (safe for serialisable data only) */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
