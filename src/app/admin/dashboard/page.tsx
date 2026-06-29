"use client";

import { useEffect, useState } from 'react';
import { UserTable } from '@/components/admin/user-table';
import { getAllUsers } from '@/lib/user';
import { User } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

function UserTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="border rounded-lg">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const usersFromDb = await getAllUsers();
      setUsers(usersFromDb);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View, search, and manage user health records.</p>
      </div>
      {loading ? <UserTableSkeleton /> : <UserTable users={users} />}
    </div>
  );
}
