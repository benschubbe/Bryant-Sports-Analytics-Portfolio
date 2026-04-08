"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubChallengesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Challenges</h1>
      <p className="text-sm text-bryant-gray-500">
        Compete in weekly and monthly skill-building challenges.
      </p>
      <DemoBox
        title="No challenges yet"
        description="Club challenges and competitions will appear here. Test your skills against fellow members."
        icon={Trophy}
      />
    </div>
  );
}
