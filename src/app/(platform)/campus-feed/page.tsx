"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  FolderOpen,
  Calendar,
  UserPlus,
  Activity,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBox } from "@/components/club/demo-box";
import { timeAgo } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: "post" | "project" | "event" | "member_joined";
  title: string;
  detail: string;
  authorName: string;
  createdAt: string;
  club: {
    name: string;
    slug: string;
    color: string | null;
    domain: string | null;
  };
}

interface Club {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  domain: string | null;
}

interface ClubReport {
  summary: string;
  stats: {
    posts: number;
    projects: number;
    members: number;
  };
}

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  post: MessageSquare,
  project: FolderOpen,
  event: Calendar,
  member_joined: UserPlus,
};

function getActivityIcon(type: string) {
  return activityIcons[type] || Activity;
}

export default function CampusFeedPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [reports, setReports] = useState<Record<string, ClubReport | null>>({});
  const [loadingReports, setLoadingReports] = useState(true);

  // Fetch feed
  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/feed");
        if (res.ok) {
          const data = await res.json();
          setFeedItems(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoadingFeed(false);
      }
    }
    fetchFeed();
  }, []);

  // Fetch clubs then reports
  useEffect(() => {
    async function fetchClubsAndReports() {
      try {
        const res = await fetch("/api/clubs");
        if (!res.ok) return;
        const clubData: Club[] = await res.json();
        const limited = clubData.slice(0, 5);
        setClubs(limited);

        const reportEntries = await Promise.all(
          limited.map(async (club) => {
            try {
              const r = await fetch(`/api/clubs/${club.slug}/report`);
              if (r.ok) {
                const report = await r.json();
                return [club.slug, report] as const;
              }
            } catch {
              // skip
            }
            return [club.slug, null] as const;
          })
        );
        const reportMap: Record<string, ClubReport | null> = {};
        for (const [slug, report] of reportEntries) {
          reportMap[slug] = report;
        }
        setReports(reportMap);
      } catch {
        // silently fail
      } finally {
        setLoadingReports(false);
      }
    }
    fetchClubsAndReports();
  }, []);

  const hasReports = Object.values(reports).some((r) => r !== null);

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bryant-black">Campus Feed</h1>
          <p className="mt-1 text-bryant-gray-500">
            See what&apos;s happening across all clubs at Bryant
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            {loadingFeed ? (
              // Skeleton cards
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="py-5">
                      <div className="animate-pulse space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-bryant-gray-200" />
                          <div className="h-4 w-32 rounded bg-bryant-gray-200" />
                          <div className="h-5 w-20 rounded-full bg-bryant-gray-200" />
                        </div>
                        <div className="h-5 w-3/4 rounded bg-bryant-gray-200" />
                        <div className="h-4 w-full rounded bg-bryant-gray-200" />
                        <div className="h-4 w-1/2 rounded bg-bryant-gray-200" />
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-24 rounded bg-bryant-gray-200" />
                          <div className="h-3 w-16 rounded bg-bryant-gray-200" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : feedItems.length === 0 ? (
              <DemoBox
                title="No activity yet"
                description="Activity from clubs will appear here as members post, create projects, and host events."
                icon={Activity}
              />
            ) : (
              feedItems.map((item) => {
                const Icon = getActivityIcon(item.type);
                const accentColor = item.club.color || "#C4972F";
                return (
                  <Link
                    key={item.id}
                    href={`/clubs/${item.club.slug}/dashboard`}
                  >
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-bryant-gold/40">
                      <CardContent className="py-5">
                        {/* Club name + color dot + domain badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="inline-block h-3 w-3 rounded-full shrink-0"
                            style={{ backgroundColor: accentColor }}
                          />
                          <span className="text-sm font-medium text-bryant-gray-700">
                            {item.club.name}
                          </span>
                          {item.club.domain && (
                            <Badge variant="domain">{item.club.domain}</Badge>
                          )}
                        </div>

                        {/* Activity type icon + title */}
                        <div className="flex items-start gap-2 mb-1">
                          <Icon className="h-4 w-4 text-bryant-gray-400 mt-0.5 shrink-0" />
                          <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        {/* Detail text */}
                        {item.detail && (
                          <p className="text-sm text-bryant-gray-500 line-clamp-2 ml-6">
                            {item.detail}
                          </p>
                        )}

                        {/* Author + timestamp */}
                        <div className="mt-3 ml-6 flex items-center gap-2 text-xs text-bryant-gray-400">
                          <span>{item.authorName}</span>
                          <span>&middot;</span>
                          <span>{timeAgo(item.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </div>

          {/* Sidebar (1 col) */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-bryant-black">
              Weekly Club Reports
            </h2>

            {loadingReports ? (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="py-4">
                      <div className="animate-pulse space-y-2">
                        <div className="h-4 w-32 rounded bg-bryant-gray-200" />
                        <div className="h-3 w-full rounded bg-bryant-gray-200" />
                        <div className="h-3 w-3/4 rounded bg-bryant-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-bryant-gray-200" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : !hasReports ? (
              <DemoBox
                title="No reports yet"
                description="Weekly reports will appear here summarizing each club's activity."
                icon={FileText}
              />
            ) : (
              clubs.map((club) => {
                const report = reports[club.slug];
                if (!report) return null;
                const accentColor = club.color || "#C4972F";
                return (
                  <Card key={club.slug} className="overflow-hidden">
                    {/* Colored accent bar */}
                    <div
                      className="h-1.5"
                      style={{ backgroundColor: accentColor }}
                    />
                    <CardContent className="py-4">
                      <h3 className="font-semibold text-bryant-black text-sm">
                        {club.name}
                      </h3>
                      <p className="mt-1 text-sm text-bryant-gray-500 line-clamp-3">
                        {report.summary}
                      </p>
                      <div className="mt-3 text-xs text-bryant-gray-400">
                        {report.stats.posts} posts &middot;{" "}
                        {report.stats.projects} projects &middot;{" "}
                        {report.stats.members} members
                      </div>
                      <Link
                        href={`/clubs/${club.slug}/dashboard`}
                        className="mt-2 inline-block text-xs font-medium text-bryant-gold hover:text-bryant-gold-light transition-colors"
                      >
                        View Club &rarr;
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
