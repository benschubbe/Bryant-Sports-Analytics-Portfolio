"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Building2,
  Layers,
  MessageSquare,
  Users,
  FolderOpen,
  ChevronRight,
  BarChart3,
  Briefcase,
  Plus,
  Search,
  Eye,
  Download,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials, timeAgo } from "@/lib/utils";

interface ClubMembership {
  id: string;
  role: string;
  joinedAt: string;
  club: {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    color: string | null;
    _count: { memberships: number; projects: number; posts: number; events: number };
  };
}

interface MyProject {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  views: number;
  tools?: string | null;
  createdAt: string;
  club: { name: string; slug: string; color: string | null } | null;
}

interface MyPost {
  id: string;
  content: string;
  createdAt: string;
  club: { name: string; slug: string; color: string | null } | null;
  _count?: { comments: number };
}

export default function MyDashboardPage() {
  const { data: session } = useSession();
  const [clubs, setClubs] = useState<ClubMembership[]>([]);
  const [projects, setProjects] = useState<MyProject[]>([]);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [clubsRes, projectsRes, postsRes, appsRes] = await Promise.all([
          fetch("/api/my/clubs"),
          fetch("/api/my/projects"),
          fetch("/api/my/feed"),
          fetch("/api/my/applications"),
        ]);

        if (clubsRes.ok) setClubs(await clubsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (appsRes.ok) {
          const apps = await appsRes.json();
          setApplicationCount(Array.isArray(apps) ? apps.length : 0);
        }
        if (postsRes.ok) {
          const allPosts = await postsRes.json();
          // Filter to only my posts
          const myPosts = session?.user?.id
            ? allPosts.filter((p: { authorId: string }) => p.authorId === session.user.id)
            : [];
          setPosts(myPosts);
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      loadAll();
    }
  }, [session]);

  const userName = session?.user?.name || "User";
  const initials = getInitials(userName);

  const [autoMatchLoading, setAutoMatchLoading] = useState(false);
  const [autoMatchResult, setAutoMatchResult] = useState<string | null>(null);

  async function handleAutoMatch() {
    setAutoMatchLoading(true);
    setAutoMatchResult(null);
    try {
      const res = await fetch("/api/clubs/auto-match", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (data.matched && data.matched.length > 0) {
          setAutoMatchResult(`Joined: ${data.matched.map((c: { clubName: string }) => c.clubName).join(", ")}`);
          // Refresh clubs list
          const clubsRes = await fetch("/api/my/clubs");
          if (clubsRes.ok) setClubs(await clubsRes.json());
        } else if (data.alreadyMember && data.alreadyMember.length > 0) {
          setAutoMatchResult("You're already a member of all matching clubs.");
        } else {
          setAutoMatchResult(data.message || "No matching clubs found.");
        }
      } else {
        setAutoMatchResult("Failed to auto-match. Please try again.");
      }
    } catch {
      setAutoMatchResult("Failed to auto-match. Please try again.");
    } finally {
      setAutoMatchLoading(false);
    }
  }

  const totalProjects = projects.length;
  const totalPosts = posts.length;
  const totalClubs = clubs.length;
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);

  // Impact Score: (projects x 3) + (posts x 1) + (clubs x 5)
  const impactScore = totalProjects * 3 + totalPosts * 1 + totalClubs * 5;

  function parseTools(tools: unknown): string[] {
    if (!tools) return [];
    if (Array.isArray(tools)) return tools;
    if (typeof tools === "string") {
      try {
        const parsed = JSON.parse(tools);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return tools.split(",").map((t) => t.trim()).filter(Boolean);
      }
    }
    return [];
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bryant-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h1 className="text-3xl font-bold text-bryant-black">My Dashboard</h1>
          <div className="py-20 text-center text-bryant-gray-400">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* ── Profile Banner ── */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-bryant-black via-bryant-gray-800 to-bryant-black px-8 py-8">
          <div className="flex items-center gap-5">
            {session?.user?.image ? (
              <img src={session.user.image} alt={userName} className="h-16 w-16 rounded-full object-cover ring-2 ring-bryant-gold/40" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bryant-gold/20 text-xl font-bold text-bryant-gold ring-2 ring-bryant-gold/40">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{userName}</h1>
              <p className="text-sm text-white/60">
                {session?.user?.email} · Member of {totalClubs} club{totalClubs !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-white/40">Your Impact Score</p>
              <p className="text-4xl font-extrabold text-bryant-gold">{impactScore}</p>
            </div>
          </div>
        </div>

        {/* ── This Week: Delta Cards ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="py-5 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Layers className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-bryant-black">{totalProjects}</p>
                  <p className="text-xs text-bryant-gray-500">Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-bryant-black">{totalPosts}</p>
                  <p className="text-xs text-bryant-gray-500">Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5 bg-gradient-to-br from-purple-50 to-violet-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                  <Eye className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-bryant-black">{totalViews > 0 ? totalViews : "\u2014"}</p>
                  <p className="text-xs text-bryant-gray-500">Profile Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Link href="/my/applications">
            <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-bryant-gold/40 h-full">
              <CardContent className="py-5 bg-gradient-to-br from-blue-50 to-indigo-50 h-full">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-bryant-black">{applicationCount}</p>
                    <p className="text-xs text-bryant-gray-500 group-hover:text-bryant-gold transition-colors">Applications &rarr;</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* ── Quick Actions Row ── */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {clubs.length > 0 && (
            <Link href={`/clubs/${clubs[0].club.slug}/projects`}>
              <Button variant="outline" size="sm" className="gap-2 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
                <Plus className="h-4 w-4 text-bryant-gold" />
                Create Project
              </Button>
            </Link>
          )}
          <Link href="/jobs">
            <Button variant="outline" size="sm" className="gap-2 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
              <Briefcase className="h-4 w-4 text-bryant-gold" />
              Browse Jobs
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:border-bryant-gold/40 hover:bg-bryant-gold/5"
            onClick={handleAutoMatch}
            disabled={autoMatchLoading}
          >
            <Sparkles className="h-4 w-4 text-bryant-gold" />
            {autoMatchLoading ? "Matching..." : "Find Clubs for Me"}
          </Button>
          <Link href="/clubs">
            <Button variant="outline" size="sm" className="gap-2 hover:border-bryant-gold/40 hover:bg-bryant-gold/5">
              <Search className="h-4 w-4 text-bryant-gold" />
              Browse Clubs
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="gap-2 cursor-default opacity-50" disabled>
            <Download className="h-4 w-4 text-bryant-gray-400" />
            Download Resume
          </Button>
        </div>

        {autoMatchResult && (
          <div className="mb-6 rounded-lg border border-bryant-gold/30 bg-bryant-gold/10 px-4 py-3 text-sm text-bryant-black">
            {autoMatchResult}
          </div>
        )}

        <div className="space-y-10">

          {/* ── My Clubs ── */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-bryant-black">My Clubs</h2>
            {clubs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {clubs.map((m) => (
                  <Link key={m.id} href={`/clubs/${m.club.slug}/dashboard`}>
                    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-bryant-gold/40">
                      <div
                        className="h-1.5 rounded-t-xl"
                        style={{ backgroundColor: m.club.color || "#C5A44E" }}
                      />
                      <CardContent className="py-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${m.club.color || "#C5A44E"}20` }}
                          >
                            <Building2
                              className="h-5 w-5"
                              style={{ color: m.club.color || "#C5A44E" }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors truncate">
                              {m.club.name}
                            </h3>
                            <Badge variant={m.role === "PRESIDENT" ? "success" : m.role === "OFFICER" ? "warning" : "sport"} className="mt-0.5">
                              {m.role}
                            </Badge>
                          </div>
                          <ChevronRight className="h-4 w-4 text-bryant-gray-300 group-hover:text-bryant-gold transition-colors" />
                        </div>
                        <div className="flex items-center gap-4 text-xs text-bryant-gray-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {m.club._count.memberships} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FolderOpen className="h-3 w-3" />
                            {m.club._count.projects} projects
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {m.club._count.posts} posts
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="text-xs font-medium text-bryant-gold group-hover:underline">
                            View Club &rarr;
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <DemoBox
                title="No clubs joined yet"
                description="Browse clubs and join one to see your activity here."
                icon={Building2}
              />
            )}
          </section>

          {/* ── My Projects ── */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-bryant-black">My Projects</h2>
            {projects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.slice(0, 10).map((project) => (
                  <Card key={project.id} className="group transition-all hover:shadow-md hover:border-bryant-gold/40">
                    <CardContent className="py-5">
                      <h3 className="text-base font-semibold text-bryant-black mb-2 group-hover:text-bryant-gold transition-colors">
                        {project.title}
                      </h3>
                      {project.abstract && (
                        <p className="text-sm text-bryant-gray-500 line-clamp-3 mb-3">
                          {project.abstract}
                        </p>
                      )}
                      {parseTools(project.tools).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {parseTools(project.tools).map((tool) => (
                            <span
                              key={tool}
                              className="inline-flex items-center rounded-full bg-bryant-gold/10 px-2.5 py-0.5 text-xs font-medium text-bryant-gold"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-bryant-gray-400">
                        <div className="flex items-center gap-3">
                          {project.club && (
                            <Link
                              href={`/clubs/${project.club.slug}/projects`}
                              className="flex items-center gap-1 hover:text-bryant-gold"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: project.club.color || "#C5A44E" }}
                              />
                              {project.club.name}
                            </Link>
                          )}
                          <span>{timeAgo(new Date(project.createdAt))}</span>
                        </div>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {project.views} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <DemoBox
                title="No projects yet"
                description="Create a project in any of your clubs to see it tracked here."
                icon={Layers}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
