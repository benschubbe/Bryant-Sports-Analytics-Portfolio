"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Events</h1>
      <p className="text-sm text-bryant-gray-500">
        Plan and manage club events, workshops, and speaker sessions.
      </p>
      <DemoBox
        title="No events yet"
        description="Upcoming club events like speaker sessions, workshops, and meetups will appear here."
        icon={CalendarDays}
      />
    </div>
  );
}
