import React from 'react';
import { MessageSquareHeart } from 'lucide-react'; // Example icon

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <MessageSquareHeart className="mr-2 h-6 w-6 text-primary" /> {/* App Logo */}
          <span className="font-bold">LinguaLeap</span>
        </div>
        {/* Add Navigation Links if needed */}
      </div>
    </header>
  );
}
