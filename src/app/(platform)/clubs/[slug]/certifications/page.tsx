"use client";

import React from "react";
import { Award } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubCertificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Certifications</h1>
      <p className="text-sm text-bryant-gray-500">
        Track certification progress and achievements within your club.
      </p>
      <DemoBox
        title="No certifications yet"
        description="Certification paths and member achievements will be tracked here."
        icon={Award}
      />
    </div>
  );
}
