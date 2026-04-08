"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  FolderOpen,
  Building2,
  GraduationCap,
  Calendar,
  ChevronRight,
  Sparkles,
  Send,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface RelevantProject {
  title: string;
  abstract: string | null;
  tools: string[];
}

interface CandidateResult {
  id: string;
  name: string;
  image: string | null;
  headline: string | null;
  concentration: string | null;
  classYear: string | null;
  projectCount: number;
  tools: string[];
  clubs: string[];
  relevanceScore?: number;
  relevantProjects?: RelevantProject[];
}

const examplePrompts = [
  "I need an intern who can build predictive models for sports teams using Python and machine learning",
  "Looking for someone with financial modeling experience in Excel and Python for our equity research team",
  "We need a marketing analytics intern who can build dashboards in Tableau and analyze social media data",
  "Seeking a full-stack developer intern familiar with React, Node.js, and PostgreSQL",
  "Need a data science intern who can work with NLP and sentiment analysis for our customer insights team",
];

export default function EmployersPage() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!prompt.trim() || prompt.trim().length < 10) return;

    setLoading(true);
    setSearched(true);
    setSummary("");
    setExtractedSkills([]);
    try {
      const res = await fetch("/api/employers/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.candidates || []);
        setExtractedSkills(data.skills || []);
        setSummary(data.summary || "");
      }
    } catch {
      setSummary("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-bryant-gold" />
          <h1 className="text-4xl font-extrabold text-bryant-black">
            Find Bryant Talent
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-bryant-gray-500">
            Describe the role and tasks your intern will work on. Our AI analyzes
            student projects to find candidates with the right experience.
          </p>
        </div>

        {/* Prompt Input */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-bryant-gold to-bryant-gold-light" />
          <CardContent className="py-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-bryant-gold shrink-0 mt-1" />
              <div>
                <h2 className="font-semibold text-bryant-black">Describe your ideal intern</h2>
                <p className="text-sm text-bryant-gray-500">
                  Tell us about the role, tasks, tools, and skills — we&apos;ll find students who&apos;ve built projects in those areas.
                </p>
              </div>
            </div>
            <form onSubmit={handleSearch}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. I need an intern who can build predictive models using Python and machine learning for our sports analytics team. They should be comfortable with data visualization in Tableau and working with large datasets..."
                rows={4}
                className="block w-full rounded-xl border border-bryant-gray-200 bg-white px-4 py-3 text-sm text-bryant-black placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold/20 resize-none transition-all"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-bryant-gray-400">
                  {prompt.length < 10 ? `${10 - prompt.length} more characters needed` : "Ready to search"}
                </p>
                <Button type="submit" loading={loading} disabled={prompt.trim().length < 10}>
                  <Send className="h-4 w-4" />
                  Find Candidates
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Example Prompts */}
        {!searched && (
          <div className="mb-8">
            <p className="mb-3 text-sm font-medium text-bryant-gray-500">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  onClick={() => setPrompt(example)}
                  className="rounded-xl border border-bryant-gray-200 bg-white px-3 py-2 text-left text-xs text-bryant-gray-600 transition-all hover:border-bryant-gold hover:shadow-sm"
                >
                  &ldquo;{example.slice(0, 60)}...&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Summary */}
        {summary && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-bryant-gold/30 bg-bryant-gold/5 px-5 py-4">
            <Sparkles className="h-5 w-5 text-bryant-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-bryant-gray-700">{summary}</p>
              {extractedSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {extractedSkills.map((skill) => (
                    <Badge key={skill} variant="tool">{skill}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-bryant-gray-200 border-t-bryant-gold" />
            <p className="text-bryant-gray-400">Analyzing your description and matching students...</p>
          </div>
        ) : searched && results.length === 0 && summary ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-bryant-gray-300" />
              <h3 className="text-lg font-semibold text-bryant-gray-700">
                No candidates found yet
              </h3>
              <p className="mt-2 text-sm text-bryant-gray-500 max-w-md mx-auto">
                Try a more detailed description, or check back as more students build projects on Folio.
              </p>
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-bryant-gray-500">
                {results.length} candidate{results.length !== 1 ? "s" : ""} matched
              </p>
              <p className="text-xs text-bryant-gray-400">Sorted by relevance</p>
            </div>
            <div className="space-y-4">
              {results.map((candidate) => {
                const initials = getInitials(candidate.name);
                return (
                  <Card key={candidate.id} className="group transition-all hover:shadow-lg hover:border-bryant-gold/40">
                    <CardContent className="py-5">
                      <div className="flex items-start gap-4">
                        {candidate.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="h-14 w-14 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bryant-gold/20 text-lg font-bold text-bryant-gold shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors">
                              {candidate.name}
                            </h3>
                            {candidate.relevanceScore && candidate.relevanceScore > 0 && (
                              <span className="rounded-full bg-bryant-gold/10 px-2 py-0.5 text-[10px] font-bold text-bryant-gold">
                                {candidate.relevanceScore} match{candidate.relevanceScore !== 1 ? "es" : ""}
                              </span>
                            )}
                          </div>
                          {candidate.headline && (
                            <p className="text-sm text-bryant-gray-500">{candidate.headline}</p>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-bryant-gray-400">
                            {candidate.concentration && (
                              <span className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {candidate.concentration}
                              </span>
                            )}
                            {candidate.classYear && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Class of {candidate.classYear}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {candidate.projectCount} project{candidate.projectCount !== 1 ? "s" : ""}
                            </span>
                            {candidate.clubs.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {candidate.clubs.join(", ")}
                              </span>
                            )}
                          </div>
                          {candidate.tools.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {candidate.tools.slice(0, 8).map((tool) => (
                                <Badge key={tool} variant="tool">{tool}</Badge>
                              ))}
                              {candidate.tools.length > 8 && (
                                <Badge variant="default">+{candidate.tools.length - 8}</Badge>
                              )}
                            </div>
                          )}

                          {/* Relevant Projects */}
                          {candidate.relevantProjects && candidate.relevantProjects.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-bryant-gray-500">Relevant projects:</p>
                              {candidate.relevantProjects.map((proj, idx) => (
                                <div key={idx} className="rounded-lg bg-bryant-gray-50 px-3 py-2">
                                  <p className="text-sm font-medium text-bryant-gray-700">{proj.title}</p>
                                  {proj.abstract && (
                                    <p className="text-xs text-bryant-gray-500 line-clamp-1 mt-0.5">{proj.abstract}</p>
                                  )}
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {proj.tools.slice(0, 5).map((t) => (
                                      <span key={t} className="text-[10px] text-bryant-gold">{t}</span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Link href={`/profiles/${candidate.id}`} className="shrink-0">
                          <Button variant="outline" size="sm">
                            View Profile
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
