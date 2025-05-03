'use client'; // Add 'use client' directive

import React from 'react';
import Link from 'next/link';
import { MessageSquareHeart, LogOut, UserCircle, Loader2 } from 'lucide-react'; // Updated icons
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth hook
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, loading, signInWithGoogle, signOut } = useAuth(); // Use the hook

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-4 flex items-center">
          <MessageSquareHeart className="mr-2 h-6 w-6 text-primary" />
          <span className="font-bold">LinguaLeap</span>
        </Link>

        <div>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" /> // Show loader while checking auth state
          ) : user ? (
            // User is logged in - Show Avatar and Dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>
                       {/* Display initials or a default icon */}
                       {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add other menu items like Profile, Settings if needed */}
                {/* <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem> */}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // User is logged out - Show Sign-in button
            <Button variant="outline" onClick={signInWithGoogle}>Sign in</Button>
          )}
        </div>
      </div>
    </header>
  );
}
