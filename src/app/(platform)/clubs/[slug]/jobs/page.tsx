"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubJobsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Job Board</h1>
      <p className="text-sm text-bryant-gray-500">
        Browse job and internship opportunities relevant to your club.
      </p>
      <DemoBox
        title="No jobs posted yet"
        description="Job and internship listings shared by alumni and partners will appear here."
        icon={Briefcase}
      />
    </div>
  );
}
