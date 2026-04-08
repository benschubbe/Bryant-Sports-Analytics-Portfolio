"use client";

import React from "react";
import Link from "next/link";
import { Building2, Layers, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

export default function MyDashboardPage() {
  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bryant-gray-900">My Dashboard</h1>
          <p className="mt-2 text-bryant-gray-500">
            Your cross-club overview and recent activity
          </p>
        </div>

        <div className="space-y-8">
          {/* My Clubs */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-bryant-gray-900">My Clubs</h2>
              <Link href="/clubs">
                <Button variant="outline" size="sm">Browse Clubs</Button>
              </Link>
            </div>
            <DemoBox
              title="No clubs joined yet"
              description="Clubs you've joined will appear here with quick links to each portal."
              icon={Building2}
            />
          </div>

          {/* My Recent Projects */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-bryant-gray-900">My Recent Projects</h2>
            <DemoBox
              title="No projects yet"
              description="Your projects across all clubs."
              icon={Layers}
            />
          </div>

          {/* My Recent Posts */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-bryant-gray-900">My Recent Posts</h2>
            <DemoBox
              title="No posts yet"
              description="Your posts across all clubs."
              icon={MessageSquare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
