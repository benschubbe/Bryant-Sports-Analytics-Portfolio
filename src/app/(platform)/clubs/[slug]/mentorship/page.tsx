"use client";

import React from "react";
import { UserPlus } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubMentorshipPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Mentorship</h1>
      <p className="text-sm text-bryant-gray-500">
        Connect with mentors and mentees within your club community.
      </p>
      <DemoBox
        title="No mentorship pairings yet"
        description="Mentorship connections between experienced members and newcomers will be managed here."
        icon={UserPlus}
      />
    </div>
  );
}
