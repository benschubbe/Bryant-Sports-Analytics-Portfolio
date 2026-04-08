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
  Calendar,
  ChevronRight,
  BarChart3,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [clubsRes, projectsRes, postsRes] = await Promise.all([
          fetch("/api/my/clubs"),
          fetch("/api/my/projects"),
          fetch("/api/my/feed"),
        ]);

        if (clubsRes.ok) setClubs(await clubsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
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

  const totalProjects = projects.length;
  const totalPosts = posts.length;
  const totalClubs = clubs.length;
  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);

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
        {/* Profile header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bryant-gold/20 text-lg font-bold text-bryant-gold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-bryant-black">{userName}</h1>
            <p className="text-sm text-bryant-gray-500">
              {session?.user?.email} · Member of {totalClubs} club{totalClubs !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Clubs", value: totalClubs, icon: Building2 },
            { label: "Projects", value: totalProjects, icon: Layers },
            { label: "Posts", value: totalPosts, icon: MessageSquare },
            { label: "Project Views", value: totalViews, icon: BarChart3 },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bryant-gold/10">
                  <stat.icon className="h-5 w-5 text-bryant-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-bryant-black">{stat.value}</p>
                  <p className="text-xs text-bryant-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          {/* My Clubs */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-bryant-black">My Clubs</h2>
              <Link href="/clubs">
                <Button variant="outline" size="sm">Browse Clubs</Button>
              </Link>
            </div>
            {clubs.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {clubs.map((m) => (
                  <Link key={m.id} href={`/clubs/${m.club.slug}/dashboard`}>
                    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-bryant-gold/40">
                      <div
                        className="h-1 rounded-t-xl"
                        style={{ backgroundColor: m.club.color || "#C5A44E" }}
                      />
                      <CardContent className="flex items-center gap-3 py-4">
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
                          <div className="flex items-center gap-2 text-xs text-bryant-gray-400">
                            <Badge variant={m.role === "PRESIDENT" ? "success" : m.role === "OFFICER" ? "warning" : "sport"}>
                              {m.role}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {m.club._count.memberships}
                            </span>
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {m.club._count.projects}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-bryant-gray-300 group-hover:text-bryant-gold transition-colors" />
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

          {/* My Projects */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-bryant-black">My Projects</h2>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 10).map((project) => (
                  <Card key={project.id}>
                    <CardContent className="flex items-center gap-4 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bryant-gray-100">
                        <Layers className="h-5 w-5 text-bryant-gray-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-bryant-black truncate">{project.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-bryant-gray-400">
                          {project.club && (
                            <Link
                              href={`/clubs/${project.club.slug}/projects`}
                              className="flex items-center gap-1 hover:text-bryant-gold"
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: project.club.color || "#C5A44E" }}
                              />
                              {project.club.name}
                            </Link>
                          )}
                          <span>{project.views} views</span>
                          <span>{timeAgo(new Date(project.createdAt))}</span>
                        </div>
                      </div>
                      {project.abstract && (
                        <p className="hidden text-sm text-bryant-gray-500 line-clamp-1 lg:block max-w-xs">
                          {project.abstract}
                        </p>
                      )}
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

          {/* My Posts */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-bryant-black">My Posts</h2>
            {posts.length > 0 ? (
              <div className="space-y-3">
                {posts.slice(0, 10).map((post) => (
                  <Card key={post.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: post.club?.color || "#C5A44E" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-bryant-black line-clamp-2">{post.content}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-bryant-gray-400">
                            {post.club && (
                              <Link
                                href={`/clubs/${post.club.slug}/feed`}
                                className="hover:text-bryant-gold"
                              >
                                {post.club.name}
                              </Link>
                            )}
                            <span>{timeAgo(new Date(post.createdAt))}</span>
                            {post._count?.comments ? (
                              <span>{post._count.comments} comments</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <DemoBox
                title="No posts yet"
                description="Post in any club's feed to see your activity here."
                icon={MessageSquare}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
