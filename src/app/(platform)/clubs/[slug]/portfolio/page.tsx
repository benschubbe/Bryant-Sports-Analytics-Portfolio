"use client";

import { FolderOpen } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubPortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bryant-black">Portfolio</h1>
        <p className="mt-1 text-sm text-bryant-gray-500">
          Showcase your work and build your professional profile within this club.
        </p>
      </div>

      <DemoBox
        title="Your club portfolio"
        description="Your projects, contributions, and achievements within this club will be displayed here. Add projects and participate in club activities to build your portfolio."
        icon={FolderOpen}
      />
    </div>
  );
}
