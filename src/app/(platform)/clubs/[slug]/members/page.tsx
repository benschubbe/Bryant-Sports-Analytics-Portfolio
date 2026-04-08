"use client";

import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubMembersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Members</h1>

      {/* Search */}
      <Card>
        <CardContent className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-bryant-gray-300 py-2 pl-9 pr-3 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold focus:ring-offset-0 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <DemoBox
        title="No members yet"
        description="Club members and their roles will be listed here."
        icon={Users}
      />
    </div>
  );
}
