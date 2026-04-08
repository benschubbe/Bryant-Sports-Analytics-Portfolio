"use client";

import React, { useState } from "react";
import { Search, Layers, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubProjectsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-bryant-gray-900">Projects</h1>
        <Link href={`/clubs/${slug}/projects/new`}>
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Search / Filter */}
      <Card>
        <CardContent className="py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-bryant-gray-300 py-2 pl-9 pr-3 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold focus:ring-offset-0 transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      {/* Projects placeholder */}
      <DemoBox
        title="No projects yet"
        description="Club member projects will be showcased here. Add your first project to get started."
        icon={Layers}
      />
    </div>
  );
}
