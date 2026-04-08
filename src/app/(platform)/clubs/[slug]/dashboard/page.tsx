"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, Layers, MessageSquare, Calendar, Plus, FileText, CalendarDays, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const clubName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-bryant-gray-900">
          Welcome to {clubName}
        </h1>
        <p className="text-sm text-bryant-gray-500">
          Your club dashboard at a glance
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-bryant-gray-400" />
            </div>
            <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
            <p className="text-sm text-bryant-gray-500">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Layers className="h-5 w-5 text-bryant-gray-400" />
            </div>
            <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
            <p className="text-sm text-bryant-gray-500">Projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MessageSquare className="h-5 w-5 text-bryant-gray-400" />
            </div>
            <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
            <p className="text-sm text-bryant-gray-500">Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5 text-bryant-gray-400" />
            </div>
            <p className="text-2xl font-bold text-bryant-gray-900">&mdash;</p>
            <p className="text-sm text-bryant-gray-500">Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-bryant-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardContent>
            <DemoBox
              title="No activity yet"
              description="Activity from your club members will appear here"
              icon={Activity}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-bryant-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/clubs/${slug}/projects`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </Link>
            <Link href={`/clubs/${slug}/feed`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4" />
                New Post
              </Button>
            </Link>
            <Link href={`/clubs/${slug}/events`} className="block">
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="h-4 w-4" />
                Plan Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
