"use client";

import Link from "next/link";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  pageTitle: string;
}

export function Topbar({ pageTitle }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const initials = getInitials(session?.user?.name || "U");

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-bryant-gray-200 bg-white px-6">
      {/* Left: Page title */}
      <h2 className="text-lg font-semibold text-bryant-black">{pageTitle}</h2>

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

        {/* Sign out */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 text-bryant-gray-500 transition-colors hover:bg-bryant-gray-100"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>

        {/* User avatar — links to personal dashboard */}
        <Link href="/my" className="group" title="My Dashboard">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session?.user?.name || "User"} className="h-9 w-9 rounded-full object-cover ring-2 ring-transparent group-hover:ring-bryant-gold transition-all" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bryant-gold/20 text-sm font-semibold text-bryant-gold ring-2 ring-transparent group-hover:ring-bryant-gold transition-all">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
