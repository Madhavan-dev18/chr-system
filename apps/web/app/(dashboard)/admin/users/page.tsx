import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TopBar } from '@/components/layout/TopBar';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export const metadata = { title: 'Users — Admin' };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/unauthorized');

  const users = await prisma.user.findMany({
    where: { clinicId: session.user.clinicId!, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <>
      <TopBar title="Staff & Users" subtitle={`${users.length} accounts`}
        actions={
          <button className="btn btn-primary btn-sm" disabled title="Use TRPC or external tool to provision users for now">
            <UserPlus className="w-4 h-4" />Provision User
          </button>
        }
      />
      <div className="p-6">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>Email</th><th>Role</th><th>MFA Enabled</th>
                <th>Status</th><th>Created</th>
              </tr></thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="cursor-pointer hover:bg-surface-hover">
                    <td className="font-semibold text-foreground">{u.email}</td>
                    <td><span className="badge badge-accent">{u.role}</span></td>
                    <td>{u.mfaEnabled ? <span className="text-green-600">Yes</span> : <span className="text-muted">No</span>}</td>
                    <td>
                      {u.lockedUntil && new Date(u.lockedUntil) > new Date() 
                        ? <span className="text-red-500 font-semibold">Locked</span>
                        : <span className="text-green-600">Active</span>}
                    </td>
                    <td className="text-xs text-muted">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-10">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
