"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  FolderOpen,
  Eye,
  Filter,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

interface ShowcaseProject {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  tools: string;
  domain: string;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    image: string | null;
    headline: string | null;
  };
  club: {
    name: string;
    slug: string;
    color: string | null;
    domain: string | null;
  } | null;
}

export default function ShowcasePage() {
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [domains, setDomains] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchProjects() {
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (domainFilter) params.set("domain", domainFilter);
        const res = await fetch(`/api/showcase/projects?${params}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: ShowcaseProject[] = await res.json();
          setProjects(data);

          const uniqueDomains = new Set<string>();
          for (const p of data) {
            if (p.club?.domain) uniqueDomains.add(p.club.domain);
            try {
              const parsed = JSON.parse(p.domain);
              if (Array.isArray(parsed)) {
                parsed.forEach((d: string) => uniqueDomains.add(d));
              }
            } catch {
              // ignore
            }
          }
          setDomains([...uniqueDomains].sort());
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(fetchProjects, search ? 300 : 0);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, domainFilter]);

  function parseJsonArray(value: string): string[] {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Sort projects by views descending
  const sortedProjects = [...projects].sort((a, b) => b.views - a.views);
  const featuredProjects = sortedProjects.slice(0, 3);
  const allProjects = sortedProjects;

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-bryant-gold" />
          <h1 className="text-4xl font-extrabold text-bryant-black">
            Student Project Showcase
          </h1>
          <p className="mt-2 text-lg text-bryant-gray-500">
            Real projects built by Bryant students — browse, discover, get
            inspired
          </p>
        </div>

        {/* Featured Projects */}
        {!loading && featuredProjects.length > 0 && !search && !domainFilter && (
          <section className="mb-12">
            <div className="mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-bryant-gold" />
              <h2 className="text-lg font-bold text-bryant-black">
                Most Viewed
              </h2>
            </div>
            <div className="space-y-4">
              {featuredProjects.map((project) => {
                const tools = parseJsonArray(project.tools);
                return (
                  <Card
                    key={project.id}
                    className="group overflow-hidden transition-all hover:shadow-lg hover:border-bryant-gold/40"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {project.club?.color && (
                        <div
                          className="w-full sm:w-1.5 h-1.5 sm:h-auto shrink-0 rounded-t-xl sm:rounded-t-none sm:rounded-l-xl"
                          style={{ backgroundColor: project.club.color }}
                        />
                      )}
                      <CardContent className="flex-1 py-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold text-bryant-black group-hover:text-bryant-gold transition-colors">
                              {project.title}
                            </h3>

                            <div className="mt-2 flex items-center gap-3 text-sm text-bryant-gray-400">
                              <div className="flex items-center gap-2">
                                {project.author.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={project.author.image}
                                    alt={project.author.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bryant-gold/20 text-[10px] font-bold text-bryant-gold">
                                    {project.author.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </div>
                                )}
                                <Link
                                  href={`/profiles/${project.author.id}`}
                                  className="font-medium text-bryant-gray-600 hover:text-bryant-gold transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {project.author.name}
                                </Link>
                              </div>
                              {project.club && (
                                <span className="flex items-center gap-1.5">
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
                            </div>

                            {project.abstract && (
                              <p className="mt-3 text-sm leading-relaxed text-bryant-gray-500">
                                {project.abstract}
                              </p>
                            )}

                            {tools.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {tools.map((tool) => (
                                  <Badge key={tool} variant="tool">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                            <Badge variant="default" className="text-xs">
                              <Eye className="mr-1 h-3 w-3" />
                              {project.views.toLocaleString()} views
                            </Badge>
                            <Link
                              href={
                                project.club
                                  ? `/clubs/${project.club.slug}/projects`
                                  : "#"
                              }
                              className="text-sm font-medium text-bryant-gold hover:underline"
                            >
                              View Project{" "}
                              <ArrowRight className="inline h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-bryant-black">
            {search || domainFilter ? "Search Results" : "All Projects"}
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
              <input
                type="text"
                placeholder="Search by title, tools, or author..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-lg border border-bryant-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-bryant-black placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
              />
            </div>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-bryant-gray-200 bg-white py-2.5 pl-10 pr-8 text-sm text-bryant-black focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold sm:w-48"
              >
                <option value="">All Domains</option>
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="py-20 text-center text-bryant-gray-400">
            Loading projects...
          </div>
        ) : allProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <FolderOpen className="mx-auto mb-4 h-12 w-12 text-bryant-gray-300" />
              <h3 className="text-lg font-semibold text-bryant-gray-700">
                {search || domainFilter
                  ? "No projects match your search"
                  : "No public projects yet"}
              </h3>
              <p className="mt-2 text-sm text-bryant-gray-500 max-w-md mx-auto">
                {search || domainFilter
                  ? "Try broadening your search terms or removing filters."
                  : "Projects will appear here once students publish their work. Check back soon."}
              </p>
              {(search || domainFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setDomainFilter("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allProjects.map((project) => {
              const tools = parseJsonArray(project.tools);
              return (
                <Link
                  key={project.id}
                  href={
                    project.club
                      ? `/clubs/${project.club.slug}/projects`
                      : "#"
                  }
                >
                  <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-bryant-gold/40">
                    {project.club?.color && (
                      <div
                        className="h-1.5 rounded-t-xl"
                        style={{
                          backgroundColor: project.club.color,
                        }}
                      />
                    )}
                    <CardContent className="py-5">
                      <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors line-clamp-2">
                        {project.title}
                      </h3>

                      {project.abstract && (
                        <p className="mt-2 text-sm text-bryant-gray-500 line-clamp-2">
                          {project.abstract}
                        </p>
                      )}

                      {/* Author and club */}
                      <div className="mt-3 flex items-center gap-2 text-xs text-bryant-gray-400">
                        <Link
                          href={`/profiles/${project.author.id}`}
                          className="hover:text-bryant-gold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {project.author.name}
                        </Link>
                        {project.club && (
                          <>
                            <span className="text-bryant-gray-300">|</span>
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
                          </>
                        )}
                      </div>

                      {/* Tools */}
                      {tools.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
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

                      {/* Views */}
                      <div className="mt-3 flex items-center justify-between text-xs text-bryant-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {project.views.toLocaleString()} views
                        </span>
                        <span>{timeAgo(new Date(project.createdAt))}</span>
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
