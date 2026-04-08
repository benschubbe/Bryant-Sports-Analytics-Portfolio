"use client";

import { ClipboardList } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bryant-black">Applications</h1>
        <p className="mt-1 text-sm text-bryant-gray-500">
          Track your job and internship applications from this club&apos;s job board.
        </p>
      </div>

      <DemoBox
        title="No applications yet"
        description="When you apply to jobs posted on this club's job board, your applications and their statuses will be tracked here."
        icon={ClipboardList}
      />
    </div>
  );
}
