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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

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
}

const popularSkills = [
  "Python",
  "SQL",
  "Tableau",
  "Excel",
  "R",
  "JavaScript",
  "React",
  "Machine Learning",
  "Financial Modeling",
  "Data Visualization",
];

const concentrations = [
  "Data Science",
  "Finance",
  "Accounting",
  "Marketing",
  "Information Systems",
  "Management",
  "Economics",
  "Actuarial Mathematics",
];

const classYears = ["2024", "2025", "2026", "2027", "2028"];

export default function EmployersPage() {
  const [skillsInput, setSkillsInput] = useState("");
  const [concentration, setConcentration] = useState("");
  const [classYear, setClassYear] = useState("");
  const [results, setResults] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!skillsInput && !concentration && !classYear) return;

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (skillsInput) params.set("skills", skillsInput);
      if (concentration) params.set("concentration", concentration);
      if (classYear) params.set("classYear", classYear);
      const res = await fetch(`/api/employers/search?${params}`);
      if (res.ok) {
        setResults(await res.json());
      }
    } catch {
      // Failed to search
    } finally {
      setLoading(false);
    }
  }

  function handleSkillClick(skill: string) {
    setSkillsInput(skill);
  }

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-bryant-gold" />
          <h1 className="text-4xl font-extrabold text-bryant-black">
            Find Bryant Talent
          </h1>
          <p className="mt-2 text-lg text-bryant-gray-500">
            Search students by the tools and skills they&apos;ve actually used
            in projects
          </p>
        </div>

        {/* Popular Skills */}
        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-bryant-gray-500">
            Popular skills
          </p>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => handleSkillClick(skill)}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                  skillsInput === skill
                    ? "bg-bryant-gold text-white"
                    : "bg-white text-bryant-gray-600 border border-bryant-gray-200 hover:border-bryant-gold hover:text-bryant-gold"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="py-6">
            <form onSubmit={handleSearch}>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">
                    Skills / Tools
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bryant-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Python, Tableau, financial modeling"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      className="block w-full rounded-lg border border-bryant-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-bryant-black placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">
                    Concentration
                  </label>
                  <select
                    value={concentration}
                    onChange={(e) => setConcentration(e.target.value)}
                    className="block w-full appearance-none rounded-lg border border-bryant-gray-200 bg-white py-2.5 px-3 text-sm text-bryant-black focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
                  >
                    <option value="">Any</option>
                    {concentrations.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">
                    Class Year
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={classYear}
                      onChange={(e) => setClassYear(e.target.value)}
                      className="block w-full appearance-none rounded-lg border border-bryant-gray-200 bg-white py-2.5 px-3 text-sm text-bryant-black focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
                    >
                      <option value="">Any</option>
                      {classYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button type="submit" loading={loading}>
                  <Search className="h-4 w-4" />
                  Search Candidates
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center text-bryant-gray-400">
            Searching...
          </div>
        ) : searched && results.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-bryant-gray-300" />
              <h3 className="text-lg font-semibold text-bryant-gray-700">
                No candidates found
              </h3>
              <p className="mt-2 text-sm text-bryant-gray-500 max-w-md mx-auto">
                Try different skills, a broader concentration, or remove the
                class year filter.
              </p>
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-bryant-gray-400">
              {results.length} candidate{results.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {results.map((candidate) => {
                const initials = getInitials(candidate.name);
                return (
                  <Link key={candidate.id} href={`/profiles/${candidate.id}`}>
                    <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-bryant-gold/40 mb-3">
                      <CardContent className="flex items-center gap-4 py-5">
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
                          <h3 className="font-semibold text-bryant-black group-hover:text-bryant-gold transition-colors">
                            {candidate.name}
                          </h3>
                          {candidate.headline && (
                            <p className="text-sm text-bryant-gray-500 line-clamp-1">
                              {candidate.headline}
                            </p>
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
                              {candidate.projectCount} project
                              {candidate.projectCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                          {candidate.tools.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {candidate.tools.slice(0, 6).map((tool) => (
                                <Badge key={tool} variant="tool">
                                  {tool}
                                </Badge>
                              ))}
                              {candidate.tools.length > 6 && (
                                <Badge variant="default">
                                  +{candidate.tools.length - 6}
                                </Badge>
                              )}
                            </div>
                          )}
                          {candidate.clubs.length > 0 && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-bryant-gray-400">
                              <Building2 className="h-3 w-3 shrink-0" />
                              {candidate.clubs.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-bryant-gray-400 group-hover:text-bryant-gold"
                          >
                            View Profile
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
