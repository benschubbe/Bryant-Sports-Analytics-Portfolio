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
        <Card className="mb-8">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bryant-gold/20 text-2xl font-bold text-bryant-gold">
                  {initials}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-bryant-black">
                  {profile.name}
                </h1>
                {profile.headline && (
                  <p className="mt-1 text-bryant-gray-500">
                    {profile.headline}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm text-bryant-gray-400 sm:justify-start">
                  {profile.concentration && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {profile.concentration}
                    </span>
                  )}
                  {profile.classYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Class of {profile.classYear}
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-3 text-sm text-bryant-gray-500">
                    {profile.bio}
                  </p>
                )}
                {/* Social links */}
                <div className="mt-4 flex items-center justify-center gap-3 sm:justify-start">
                  {profile.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-bryant-gray-400 hover:text-bryant-gold transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-bryant-gray-400 hover:text-bryant-gold transition-colors"
                    >
                      <GitBranch className="h-4 w-4" />
                      GitHub
                    </a>
                  )}
                  {profile.personalUrl && (
                    <a
                      href={profile.personalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-bryant-gray-400 hover:text-bryant-gold transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Clubs Section */}
          {profile.memberships.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-bryant-black">
                Clubs
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.memberships.map((m) => (
                  <Link key={m.id} href={`/clubs/${m.club.slug}/dashboard`}>
                    <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-bryant-gold/40">
                      <div
                        className="h-1 rounded-t-xl"
                        style={{
                          backgroundColor: m.club.color || "#C5A44E",
                        }}
                      />
                      <CardContent className="flex items-center gap-3 py-4">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${m.club.color || "#C5A44E"}20`,
                          }}
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
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-bryant-black">
              Projects
            </h2>
            {profile.projects.length > 0 ? (
              <div className="space-y-3">
                {profile.projects.map((project) => {
                  let tools: string[] = [];
                  try {
                    const parsed = JSON.parse(project.tools);
                    if (Array.isArray(parsed)) tools = parsed;
                  } catch {
                    // ignore
                  }
                  return (
                    <Card key={project.id}>
                      <CardContent className="py-4">
                        <h3 className="font-semibold text-bryant-black">
                          {project.title}
                        </h3>
                        {project.abstract && (
                          <p className="mt-1 text-sm text-bryant-gray-500 line-clamp-2">
                            {project.abstract}
                          </p>
                        )}
                        {tools.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tools.map((tool) => (
                              <Badge key={tool} variant="tool">
                                {tool}
                              </Badge>
                            ))}
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
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <FolderOpen className="mx-auto mb-2 h-8 w-8 text-bryant-gray-300" />
                  <p className="text-sm text-bryant-gray-500">
                    No public projects yet
                  </p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Recent Posts Section */}
          {profile.posts.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-bryant-black">
                Recent Posts
              </h2>
              <div className="space-y-3">
                {profile.posts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
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
                                {post._count.comments} comments
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
