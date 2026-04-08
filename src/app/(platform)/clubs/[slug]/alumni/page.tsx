"use client";

import React from "react";
import { Users } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubAlumniPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Alumni Directory</h1>
      <p className="text-sm text-bryant-gray-500">
        Stay connected with club alumni and their career journeys.
      </p>
      <DemoBox
        title="No alumni listed yet"
        description="Club alumni profiles and their current roles will be displayed here."
        icon={Users}
      />
    </div>
  );
}
