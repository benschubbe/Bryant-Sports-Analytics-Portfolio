"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Users, Building2, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubsDirectoryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-bryant-gray-900">Bryant Club Hub</h1>
          <p className="mt-2 text-bryant-gray-500">
            Discover and join clubs across campus
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 text-bryant-gray-400" />
              </div>
              <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
              <p className="text-sm text-bryant-gray-500">Total Clubs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-bryant-gray-400" />
              </div>
              <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
              <p className="text-sm text-bryant-gray-500">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-bryant-gray-400" />
              </div>
              <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
              <p className="text-sm text-bryant-gray-500">Active This Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-bryant-gray-300 py-2.5 pl-9 pr-3 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold focus:ring-offset-0 transition-colors"
            />
          </div>
        </div>

        {/* Club Grid - DemoBox placeholder */}
        <DemoBox
          title="No clubs yet"
          description="Clubs will appear here once presidents register them. Each club gets its own portal with projects, events, feed, and more."
          icon={Building2}
        />

        {/* Register CTA */}
        <div className="mt-8 text-center">
          <Link href="/clubs/register">
            <Button variant="primary" size="lg">
              Register Your Club
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
