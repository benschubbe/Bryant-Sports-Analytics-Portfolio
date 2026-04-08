"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Building2,
  Users,
  FolderOpen,
  Calendar,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Club {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  color: string | null;
  _count: {
    memberships: number;
    projects: number;
    posts: number;
    events: number;
  };
}

interface ReportData {
  clubs: Club[];
  uniqueMembers: number;
}

export default function CampusReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/clubs");
        if (res.ok) {
          const result = await res.json();
          setData({
            clubs: result.clubs || result,
            uniqueMembers: result.uniqueMembers || 0,
          });
        }
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/reports/weekly");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `folio-weekly-report-${new Date().toISOString().split("T")[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // Failed
    } finally {
      setDownloading(false);
    }
  }

  const clubs = data?.clubs || [];
  const totalPosts = clubs.reduce((sum, c) => sum + (c._count?.posts || 0), 0);
  const totalProjects = clubs.reduce((sum, c) => sum + (c._count?.projects || 0), 0);
  const totalEvents = clubs.reduce((sum, c) => sum + (c._count?.events || 0), 0);

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 text-sm text-bryant-gray-500 hover:text-bryant-black transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clubs
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-bryant-black">
              Weekly Campus Report
            </h1>
            <p className="mt-1 text-bryant-gray-500">
              AI-generated summary of all club activity this week
            </p>
          </div>
          <Button onClick={handleDownload} loading={downloading} size="lg">
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>

        {/* Stats overview */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            { label: "Clubs", value: clubs.length, icon: Building2 },
            { label: "Members", value: data?.uniqueMembers || 0, icon: Users },
            { label: "Posts", value: totalPosts, icon: FileText },
            { label: "Projects", value: totalProjects, icon: FolderOpen },
            { label: "Events", value: totalEvents, icon: Calendar },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="py-4 text-center">
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-bryant-gold" />
                <p className="text-2xl font-bold text-bryant-black">
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-xs text-bryant-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Club activity cards */}
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-bryant-gold" />
          <h2 className="text-lg font-semibold text-bryant-black">Club Activity</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-bryant-gray-400">Loading...</div>
        ) : clubs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-bryant-gray-300" />
              <p className="text-sm text-bryant-gray-500">No clubs registered yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {clubs.map((club) => {
              const accentColor = club.color || "#C5A44E";
              const total = (club._count?.posts || 0) + (club._count?.projects || 0);
              return (
                <Link key={club.id} href={`/clubs/${club.slug}/dashboard`}>
                  <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-bryant-gold/40">
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: accentColor }} />
                    <CardContent className="flex items-center gap-4 py-4">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <Building2 className="h-5 w-5" style={{ color: accentColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors">
                            {club.name}
                          </h3>
                          {club.domain && <Badge variant="sport">{club.domain}</Badge>}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-bryant-gray-400">
                          <span>{club._count?.memberships || 0} members</span>
                          <span>{club._count?.posts || 0} posts</span>
                          <span>{club._count?.projects || 0} projects</span>
                          <span>{club._count?.events || 0} events</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-bryant-gold">{total}</p>
                        <p className="text-[10px] text-bryant-gray-400">this week</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Download CTA */}
        <div className="mt-10 rounded-xl bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-8 text-center">
          <FileText className="mx-auto mb-4 h-10 w-10 text-bryant-gold" />
          <h3 className="text-xl font-bold text-white">Get the Full Report</h3>
          <p className="mt-2 text-sm text-white/60">
            Download a professionally formatted PDF with club highlights, new projects, upcoming events, and AI recommendations.
          </p>
          <Button onClick={handleDownload} loading={downloading} size="lg" className="mt-6">
            <Download className="h-4 w-4" />
            Download Weekly PDF Report
          </Button>
        </div>
      </div>
    </div>
  );
}
