"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  FolderOpen,
  MessageSquare,
  ExternalLink,
  GitBranch,
  Globe,
  GraduationCap,
  Calendar,
  Eye,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials, timeAgo } from "@/lib/utils";

interface ProfileClub {
  id: string;
  role: string;
  club: {
    name: string;
    slug: string;
    domain: string | null;
    color: string | null;
  };
}

interface ProfileProject {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  tools: string;
  views: number;
  createdAt: string;
  club: {
    name: string;
    slug: string;
    color: string | null;
  } | null;
}

interface ProfilePost {
  id: string;
  content: string;
  createdAt: string;
  club: {
    name: string;
    slug: string;
    color: string | null;
  } | null;
  _count: { comments: number };
}

interface UserProfile {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  bio: string | null;
  classYear: string | null;
  concentration: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  personalUrl: string | null;
  memberships: ProfileClub[];
  projects: ProfileProject[];
  posts: ProfilePost[];
}

function parseTools(tools: string): string[] {
  try {
    const parsed = JSON.parse(tools);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/profiles/${userId}`);
        if (res.ok) {
          setProfile(await res.json());
        } else if (res.status === 404) {
          setError("User not found");
        } else {
          setError("Failed to load profile");
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bryant-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="py-20 text-center text-bryant-gray-400">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-bryant-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Link
            href="/employers"
            className="inline-flex items-center gap-2 text-sm text-bryant-gray-500 hover:text-bryant-black transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-lg font-semibold text-bryant-gray-700">
                {error || "User not found"}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const initials = getInitials(profile.name);
  const featuredProject = profile.projects[0] || null;
  const otherProjects = profile.projects.slice(1);
  const recentPosts = profile.posts.slice(0, 5);

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Link
          href="/employers"
          className="inline-flex items-center gap-2 text-sm text-bryant-gray-500 hover:text-bryant-black transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>

        {/* Profile Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-bryant-gray-200">
          {/* Gold accent bar */}
          <div className="h-2 bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />
          <div className="px-8 py-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-bryant-gold/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bryant-gold/10 text-3xl font-bold text-bryant-gold ring-4 ring-bryant-gold/20">
                  {initials}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <h1 className="text-3xl font-extrabold text-bryant-black">
                    {profile.name}
                  </h1>
                  {profile.headline && (
                    <Badge
                      variant="success"
                      className="whitespace-nowrap"
                    >
                      <Sparkles className="mr-1 h-3 w-3" />
                      Open to opportunities
                    </Badge>
                  )}
                </div>
                {profile.headline && (
                  <p className="mt-1 text-lg text-bryant-gray-500">
                    {profile.headline}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-bryant-gray-400 sm:justify-start">
                  {profile.concentration && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4" />
                      {profile.concentration}
                    </span>
                  )}
                  {profile.classYear && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Class of {profile.classYear}
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-4 text-sm leading-relaxed text-bryant-gray-500">
                    {profile.bio}
                  </p>
                )}
                {/* Social links */}
                <div className="mt-5 flex items-center justify-center gap-2 sm:justify-start">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-bryant-gray-200 px-3 py-1.5 text-sm text-bryant-gray-500 transition-all hover:border-bryant-gold hover:text-bryant-gold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-bryant-gray-200 px-3 py-1.5 text-sm text-bryant-gray-500 transition-all hover:border-bryant-gold hover:text-bryant-gold"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {profile.personalUrl && (
                    <a
                      href={profile.personalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-bryant-gray-200 px-3 py-1.5 text-sm text-bryant-gray-500 transition-all hover:border-bryant-gold hover:text-bryant-gold"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Club Memberships — Compact row */}
        {profile.memberships.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {profile.memberships.map((m) => (
              <Link key={m.id} href={`/clubs/${m.club.slug}/dashboard`}>
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-bryant-gray-200 bg-white px-3 py-1.5 text-sm transition-all hover:shadow-sm hover:border-bryant-gold/40"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: m.club.color || "#C5A44E",
                    }}
                  />
                  <span className="font-medium text-bryant-gray-700">
                    {m.club.name}
                  </span>
                  <Badge
                    variant={
                      m.role === "PRESIDENT"
                        ? "success"
                        : m.role === "OFFICER"
                          ? "warning"
                          : "sport"
                    }
                  >
                    {m.role}
                  </Badge>
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="space-y-8">
          {/* Featured Project */}
          {featuredProject && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-bryant-black">
                <FolderOpen className="h-5 w-5 text-bryant-gold" />
                Featured Project
              </h2>
              <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-bryant-gold/40">
                <div className="flex flex-col sm:flex-row">
                  {featuredProject.club?.color && (
                    <div
                      className="w-full sm:w-1.5 h-1.5 sm:h-auto shrink-0 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl"
                      style={{
                        backgroundColor: featuredProject.club.color,
                      }}
                    />
                  )}
                  <CardContent className="flex-1 py-6">
                    <h3 className="text-xl font-bold text-bryant-black group-hover:text-bryant-gold transition-colors">
                      {featuredProject.title}
                    </h3>
                    {featuredProject.abstract && (
                      <p className="mt-2 text-sm leading-relaxed text-bryant-gray-500">
                        {featuredProject.abstract}
                      </p>
                    )}
                    {parseTools(featuredProject.tools).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {parseTools(featuredProject.tools).map((tool) => (
                          <Badge key={tool} variant="tool">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-bryant-gray-400">
                        {featuredProject.club && (
                          <span className="flex items-center gap-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  featuredProject.club.color || "#C5A44E",
                              }}
                            />
                            {featuredProject.club.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {featuredProject.views} views
                        </span>
                        <span>
                          {timeAgo(new Date(featuredProject.createdAt))}
                        </span>
                      </div>
                      {featuredProject.club && (
                        <Link
                          href={`/clubs/${featuredProject.club.slug}/projects`}
                          className="text-sm font-medium text-bryant-gold hover:underline"
                        >
                          View Project{" "}
                          <ArrowRight className="inline h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </section>
          )}

          {/* All Projects */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-bryant-black">
              {featuredProject ? "More Projects" : "Projects"}
            </h2>
            {otherProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {otherProjects.map((project) => {
                  const tools = parseTools(project.tools);
                  return (
                    <Card
                      key={project.id}
                      className="group transition-all hover:shadow-md hover:border-bryant-gold/40"
                    >
                      {project.club?.color && (
                        <div
                          className="h-1 rounded-t-xl"
                          style={{
                            backgroundColor: project.club.color,
                          }}
                        />
                      )}
                      <CardContent className="py-4">
                        <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors line-clamp-2">
                          {project.title}
                        </h3>
                        {project.abstract && (
                          <p className="mt-1 text-sm text-bryant-gray-500 line-clamp-2">
                            {project.abstract}
                          </p>
                        )}
                        {tools.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tools.slice(0, 4).map((tool) => (
                              <Badge key={tool} variant="tool">
                                {tool}
                              </Badge>
                            ))}
                            {tools.length > 4 && (
                              <Badge variant="default">
                                +{tools.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-bryant-gray-400">
                          {project.club && (
                            <span className="flex items-center gap-1">
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    project.club.color || "#C5A44E",
                                }}
                              />
                              {project.club.name}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {project.views} views
                          </span>
                          <span>
                            {timeAgo(new Date(project.createdAt))}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : !featuredProject ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <FolderOpen className="mx-auto mb-2 h-8 w-8 text-bryant-gray-300" />
                  <p className="text-sm text-bryant-gray-500">
                    No public projects yet
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </section>

          {/* Recent Activity */}
          {recentPosts.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-bryant-black">
                Recent Activity
              </h2>
              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="transition-all hover:shadow-sm">
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{
                            backgroundColor: post.club?.color || "#C5A44E",
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-bryant-black line-clamp-2">
                            {post.content}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-bryant-gray-400">
                            {post.club && (
                              <span>{post.club.name}</span>
                            )}
                            <span>
                              {timeAgo(new Date(post.createdAt))}
                            </span>
                            {post._count?.comments > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post._count.comments}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
