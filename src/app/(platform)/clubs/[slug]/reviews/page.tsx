"use client";

import React from "react";
import { Star } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Peer Reviews</h1>
      <p className="text-sm text-bryant-gray-500">
        Give and receive feedback on projects and work within your club.
      </p>
      <DemoBox
        title="No reviews yet"
        description="Peer review requests and completed reviews will be listed here."
        icon={Star}
      />
    </div>
  );
}
