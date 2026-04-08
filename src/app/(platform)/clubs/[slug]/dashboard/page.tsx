"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  Layers,
  MessageSquare,
  Calendar,
  Plus,
  FileText,
  CalendarDays,
  Activity,
  Trophy,
  UserPlus,
  CheckCircle2,
  Crown,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials } from "@/lib/utils";

interface ClubStats {
  memberCount: number;
  projectCount: number;
  postCount: number;
  eventCount: number;
}

interface LeaderboardEntry {
  userId: string;
  name: string;
  image: string | null;
  role: string;
  postCount: number;
  projectCount: number;
  engagementScore: number;
}

export default function ClubDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const clubName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [stats, setStats] = useState<ClubStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [statsRes, leaderboardRes, membersRes] = await Promise.allSettled([
        fetch(`/api/clubs/${slug}/stats`),
        fetch(`/api/clubs/${slug}/leaderboard`),
        session?.user ? fetch(`/api/clubs/${slug}/members`) : Promise.resolve(null),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.ok) {
        setStats(await statsRes.value.json());
      }
      setLoadingStats(false);

      if (leaderboardRes.status === "fulfilled" && leaderboardRes.value?.ok) {
        setLeaderboard(await leaderboardRes.value.json());
      }
      setLoadingLeaderboard(false);

      // Check if current user is a member and get their role
      if (session?.user?.id && membersRes.status === "fulfilled" && membersRes.value?.ok) {
        const members = await membersRes.value.json();
        const me = members.find(
          (m: { user: { id: string }; role: string }) => m.user.id === session.user.id,
        );
        setIsMember(!!me);
        setMemberRole(me?.role ?? null);
      } else if (!session?.user) {
        setIsMember(false);
      }
    }
    fetchData();
  }, [slug, session]);

  async function handleJoin() {
    setJoining(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/clubs/${slug}/members`, {
        method: "POST",
      });
      if (res.ok) {
        setIsMember(true);
        // Refresh stats
        const statsRes = await fetch(`/api/clubs/${slug}/stats`);
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setJoinError("Please sign in to join this club.");
        } else if (res.status === 409) {
          setIsMember(true);
        } else {
          setJoinError(data.error || "Failed to join. Please try again.");
        }
      }
    } catch {
      setJoinError("Failed to join. Please try again.");
    } finally {
      setJoining(false);
    }
  }

  async function handleLeave() {
    setLeaving(true);
    setJoinError("");
    try {
      const res = await fetch(`/api/clubs/${slug}/members/leave`, {
        method: "POST",
      });
      if (res.ok) {
        setIsMember(false);
        setMemberRole(null);
        // Refresh stats
        const statsRes = await fetch(`/api/clubs/${slug}/stats`);
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        const data = await res.json();
        setJoinError(data.error || "Failed to leave. Please try again.");
      }
    } catch {
      setJoinError("Failed to leave. Please try again.");
    } finally {
      setLeaving(false);
    }
  }

  const roleIcon = (role: string) => {
    if (role === "PRESIDENT") return <Crown className="h-3.5 w-3.5 text-bryant-gold" />;
    if (role === "OFFICER") return <Shield className="h-3.5 w-3.5 text-blue-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header + Join Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">
            Welcome to {clubName}
          </h1>
          <p className="text-sm text-bryant-gray-500">
            Your club dashboard at a glance
          </p>
        </div>
        {isMember === false && (
          <Button onClick={handleJoin} loading={joining} size="lg">
            <UserPlus className="h-4 w-4" />
            Join Club
          </Button>
        )}
        {isMember === true && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Member
            </div>
            {memberRole !== "PRESIDENT" && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleLeave}
                loading={leaving}
              >
                Leave Club
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Join error */}
      {joinError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {joinError}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Members", value: stats?.memberCount, icon: Users, bg: "from-blue-50 to-indigo-50", iconColor: "text-blue-500" },
          { label: "Projects", value: stats?.projectCount, icon: Layers, bg: "from-amber-50 to-orange-50", iconColor: "text-amber-500" },
          { label: "Posts", value: stats?.postCount, icon: MessageSquare, bg: "from-green-50 to-emerald-50", iconColor: "text-green-500" },
          { label: "Events", value: stats?.eventCount, icon: Calendar, bg: "from-purple-50 to-violet-50", iconColor: "text-purple-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className={`py-5 text-center bg-gradient-to-br ${stat.bg}`}>
              <div className="flex items-center justify-center mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-bryant-gray-900">
                {loadingStats ? "..." : stat.value ?? "\u2014"}
              </p>
              <p className="text-sm text-bryant-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-bryant-gold" />
              <h2 className="text-lg font-semibold text-bryant-gray-900">Member Leaderboard</h2>
            </div>
          </CardHeader>
          <CardContent>
            {loadingLeaderboard ? (
              <div className="py-6 text-center text-bryant-gray-400">Loading...</div>
            ) : leaderboard.length === 0 ? (
              <DemoBox
                title="No activity yet"
                description="Member engagement scores will appear here as members post and create projects."
                icon={Trophy}
              />
            ) : (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-bryant-gray-50 ${
                      idx === 0 ? "bg-bryant-gold/5 ring-1 ring-bryant-gold/10" : ""
                    }`}
                  >
                    {/* Rank */}
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? "bg-bryant-gold text-white"
                          : idx === 1
                            ? "bg-bryant-gray-300 text-white"
                            : idx === 2
                              ? "bg-amber-600 text-white"
                              : "bg-bryant-gray-100 text-bryant-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* Avatar */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bryant-gray-200 text-xs font-semibold text-bryant-gray-600">
                      {getInitials(entry.name)}
                    </div>

                    {/* Name + role */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-bryant-gray-900 truncate">
                          {entry.name}
                        </span>
                        {roleIcon(entry.role)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-bryant-gray-400">
                        <span>{entry.postCount} posts</span>
                        <span>{entry.projectCount} projects</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span className="text-sm font-bold text-bryant-gold">
                        {entry.engagementScore}
                      </span>
                      <p className="text-[10px] text-bryant-gray-400">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-bryant-gray-900">Quick Actions</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/clubs/${slug}/projects`} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 py-3 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
                <Plus className="h-4 w-4 text-bryant-gold" />
                Create Project
              </Button>
            </Link>
            <Link href={`/clubs/${slug}/feed`} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 py-3 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
                <FileText className="h-4 w-4 text-bryant-gold" />
                New Post
              </Button>
            </Link>
            <Link href={`/clubs/${slug}/events`} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 py-3 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
                <CalendarDays className="h-4 w-4 text-bryant-gold" />
                Plan Event
              </Button>
            </Link>
            <Link href={`/clubs/${slug}/members`} className="block">
              <Button variant="outline" className="w-full justify-start gap-3 py-3 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
                <Users className="h-4 w-4 text-bryant-gold" />
                View Members
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
