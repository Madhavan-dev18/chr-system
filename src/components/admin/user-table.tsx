"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import Link from "next/link";
import { User } from '@/lib/definitions';

export function UserTable({ users }: { users: User[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    const nameMatch = user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const healthIdMatch = user.healthId && user.healthId.includes(searchTerm);
    return nameMatch || healthIdMatch;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by name or Health ID..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="border rounded-lg hidden md:block">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Health ID</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {filteredUsers.map((user) => (
              <tr key={user.healthId} className="border-b transition-colors hover:bg.muted/50">
                <td className="p-4 align-middle font-medium">{user.name || 'N/A'}</td>
                <td className="p-4 align-middle font-mono text-muted-foreground">{user.healthId}</td>
                <td className="p-4 align-middle">{user.email}</td>
                <td className="p-4 align-middle text-right">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/admin/users/${user.healthId}`}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View User</span>
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="grid gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <Card key={user.healthId}>
            <CardHeader>
              <CardTitle className='text-lg'>{user.name || 'N/A'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-mono text-muted-foreground">
                <span className="font-sans text-foreground">Health ID: </span>{user.healthId}
              </p>
              <p className="text-sm text-muted-foreground">
                 <span className="font-sans text-foreground">Email: </span>{user.email}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                <Link href={`/admin/users/${user.healthId}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>


      {filteredUsers.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No users found.</p>
      )}
    </div>
  );
}