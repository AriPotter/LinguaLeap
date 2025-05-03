import React from 'react';
import Link from 'next/link';
import { MessageSquareHeart } from 'lucide-react'; // Example icon
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-4 flex items-center">
          <MessageSquareHeart className="mr-2 h-6 w-6 text-primary" /> {/* App Logo */}
          <span className="font-bold">LinguaLeap</span>
        </Link>
        {/* Add Navigation Links if needed */}
        <div>
          {/* TODO: Replace with actual authentication logic */}
          <Button variant="outline">Sign-in</Button>
        </div>
      </div>
    </header>
  );
}
