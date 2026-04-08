"use client";

import React from "react";
import { Map } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubLearningPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Learning Paths</h1>
      <p className="text-sm text-bryant-gray-500">
        Structured learning paths curated for your club's domain.
      </p>
      <DemoBox
        title="No learning paths yet"
        description="Curated learning paths with courses, resources, and milestones will appear here."
        icon={Map}
      />
    </div>
  );
}
