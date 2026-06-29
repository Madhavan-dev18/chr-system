"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { handleSignOut } from "@/lib/user";
import { useRouter } from "next/navigation";

type DashboardHeaderProps = {
  user: {
    name: string;
    email: string;
  };
  isAdmin?: boolean;
};

export function DashboardHeader({ user, isAdmin = false }: DashboardHeaderProps) {
  const avatarFallback = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  const router = useRouter();

  const onLogout = async () => {
    await handleSignOut();
    const logoutPath = isAdmin ? "/" : "/";
    router.push(logoutPath);
  }

  return (
    <header
      data-sidebar="header"
      className="flex h-14 shrink-0 items-center justify-between border-b bg-glass px-4 md:px-6"
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="font-headline text-lg font-semibold tracking-tight">
          {isAdmin ? "Admin Dashboard" : "My Health Dashboard"}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {!isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
