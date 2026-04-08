"use client";

import React from "react";
import { Hash } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubChannelsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Channels</h1>
      <p className="text-sm text-bryant-gray-500">
        Organize conversations into topic-based channels for your club.
      </p>
      <DemoBox
        title="No channels yet"
        description="Create topic channels for focused discussions within your club community."
        icon={Hash}
      />
    </div>
  );
}
