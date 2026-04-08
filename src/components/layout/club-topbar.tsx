"use client";

import { Search, Bell, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";

interface ClubTopbarProps {
  clubName: string;
  pageTitle: string;
}

export function ClubTopbar({ clubName, pageTitle }: ClubTopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const initials = getInitials(session?.user?.name || "U");

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-bryant-gray-200 bg-white px-6">
      {/* Left: Club name + page title */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-bryant-gray-500">{clubName}</span>
        <ChevronDown className="h-3.5 w-3.5 text-bryant-gray-400" />
        <span className="text-bryant-gray-300">/</span>
        <h2 className="text-lg font-semibold text-bryant-black">{pageTitle}</h2>
      </div>

      {/* Right: Search, notifications, avatar */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-56 rounded-lg border border-bryant-gray-200 bg-bryant-gray-50 pl-9 pr-3 text-sm text-bryant-black placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
          />
        </div>

        {/* Notification bell */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-bryant-gray-500 transition-colors hover:bg-bryant-gray-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 text-bryant-gray-500 transition-colors hover:bg-bryant-gray-100"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>

        {/* User avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bryant-gold/20 text-sm font-semibold text-bryant-gold">
          {initials}
        </div>
      </div>
    </header>
  );
}
