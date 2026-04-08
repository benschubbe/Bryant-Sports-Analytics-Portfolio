"use client";

import React from "react";
import { useParams } from "next/navigation";
import { GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ClubAlumniPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bryant-gray-900">Alumni Directory</h1>
        <p className="text-sm text-bryant-gray-500">
          Stay connected with club alumni and their career journeys.
        </p>
      </div>

      {/* Info card */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bryant-gray-100">
              <GraduationCap className="h-7 w-7 text-bryant-gray-500" />
            </div>
            <h3 className="text-base font-semibold text-bryant-gray-800 mb-2">
              Alumni Network
            </h3>
            <p className="max-w-md text-sm text-bryant-gray-500">
              Alumni members will appear here as graduates update their profiles.
              Once listed, you can view their current roles, companies, and career
              paths to help build your professional network.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs text-bryant-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                0 alumni listed
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
