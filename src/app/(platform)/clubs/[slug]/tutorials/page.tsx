"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubTutorialsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Tutorials</h1>
      <p className="text-sm text-bryant-gray-500">
        Step-by-step guides and tutorials created by club members.
      </p>
      <DemoBox
        title="No tutorials yet"
        description="Member-created tutorials and how-to guides will be listed here."
        icon={BookOpen}
      />
    </div>
  );
}
