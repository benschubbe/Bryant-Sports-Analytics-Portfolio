"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Building2,
  FolderOpen,
  Calendar,
  ChevronRight,
  Plus,
  BarChart3,
  Code,
  DollarSign,
  Shield,
  Megaphone,
  Wrench,
  MessageSquare,
  Palette,
  Heart,
  Briefcase,
  Rss,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  domain: string | null;
  color: string | null;
  isActive: boolean;
  _count: {
    memberships: number;
    projects: number;
    posts: number;
    events: number;
  };
}

const domainIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Sports Analytics": BarChart3,
  "Computer Science": Code,
  "Finance": DollarSign,
  "Cybersecurity": Shield,
  "Marketing": Megaphone,
  "Engineering": Wrench,
  "Debate": MessageSquare,
  "Arts": Palette,
  "Community Service": Heart,
  "Business": Briefcase,
};

function getDomainIcon(domain: string | null) {
  if (!domain) return Building2;
  return domainIcons[domain] || Building2;
}

export default function ClubsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchClubs() {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        const res = await fetch(`/api/clubs?${params}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setClubs(data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // silently fail for other errors
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(fetchClubs, search ? 300 : 0);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search]);

  const totalMembers = clubs.reduce((sum, c) => sum + (c._count?.memberships || 0), 0);

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-bryant-black">Bryant Club Hub</h1>
            <p className="mt-1 text-bryant-gray-500">
              Discover and join clubs across campus
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/campus-feed">
              <Button variant="outline" size="lg">
                <Rss className="mr-2 h-4 w-4" />
                Campus Feed
              </Button>
            </Link>
            <Link href="/clubs/register">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Register a Club
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bryant-gold/10">
                <Building2 className="h-5 w-5 text-bryant-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bryant-black">{clubs.length}</p>
                <p className="text-xs text-bryant-gray-500">Active Clubs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bryant-gold/10">
                <Users className="h-5 w-5 text-bryant-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bryant-black">{totalMembers}</p>
                <p className="text-xs text-bryant-gray-500">Total Members</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bryant-gold/10">
                <FolderOpen className="h-5 w-5 text-bryant-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-bryant-black">
                  {clubs.reduce((sum, c) => sum + (c._count?.projects || 0), 0)}
                </p>
                <p className="text-xs text-bryant-gray-500">Total Projects</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
            <input
              type="text"
              placeholder="Search clubs by name or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-lg border border-bryant-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-bryant-black placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
            />
          </div>
        </div>

        {/* Club Grid */}
        {loading ? (
          <div className="py-20 text-center text-bryant-gray-400">Loading clubs...</div>
        ) : clubs.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-bryant-gray-300" />
              <h3 className="text-lg font-semibold text-bryant-gray-700">
                {search ? "No clubs match your search" : "No clubs registered yet"}
              </h3>
              <p className="mt-2 text-sm text-bryant-gray-500 max-w-md mx-auto">
                {search
                  ? "Try a different search term."
                  : "Be the first to register your club! Each club gets its own portal with projects, events, a feed, job board, and more."}
              </p>
              {!search && (
                <Link href="/clubs/register" className="mt-6 inline-block">
                  <Button>Register Your Club</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => {
              const Icon = getDomainIcon(club.domain);
              const accentColor = club.color || "#C4972F";
              return (
                <Link key={club.id} href={`/clubs/${club.slug}/dashboard`}>
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-bryant-gold/40">
                    {/* Color bar */}
                    <div
                      className="h-1.5 rounded-t-xl"
                      style={{ backgroundColor: accentColor }}
                    />
                    <CardContent className="py-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${accentColor}20` }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: accentColor }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors truncate">
                            {club.name}
                          </h3>
                          {club.domain && (
                            <Badge variant="sport" className="mt-1">
                              {club.domain}
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-bryant-gray-300 group-hover:text-bryant-gold transition-colors shrink-0 mt-1" />
                      </div>

                      {club.description && (
                        <p className="mt-3 text-sm text-bryant-gray-500 line-clamp-2">
                          {club.description}
                        </p>
                      )}

                      {/* Stats row */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-bryant-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {club._count?.memberships || 0} members
                        </span>
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {club._count?.projects || 0} projects
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {club._count?.events || 0} events
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
