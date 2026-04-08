"use client";

import React from "react";
import { Search } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubGalleryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Gallery</h1>
      <p className="text-sm text-bryant-gray-500">
        Browse all public projects and showcases from club members.
      </p>
      <DemoBox
        title="No gallery items yet"
        description="A visual gallery of club work, visualizations, and showcases will appear here."
        icon={Search}
      />
    </div>
  );
}
