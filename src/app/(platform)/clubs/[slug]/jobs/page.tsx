"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Briefcase,
  Plus,
  ExternalLink,
  Search,
  BookmarkPlus,
  Globe,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";
import { timeAgo } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  roleType: string;
  experienceLevel: string;
  location?: string | null;
  remote: boolean;
  url?: string | null;
  createdAt?: string;
}

interface SearchLink {
  platform: string;
  url: string;
  icon: string;
}

interface JobLinksData {
  searchLinks: SearchLink[];
  suggestedSearchTerms: string[];
  roleTypes: string[];
  domain: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "bg-[#0A66C2] hover:bg-[#004182] text-white",
  indeed: "bg-[#2164F3] hover:bg-[#1A4FBF] text-white",
  handshake: "bg-[#FF7043] hover:bg-[#E64A19] text-white",
};

export default function ClubJobsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobLinks, setJobLinks] = useState<JobLinksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackSuccess, setTrackSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, linksRes] = await Promise.all([
          fetch(`/api/clubs/${slug}/jobs`, { cache: "no-store" }),
          fetch(`/api/clubs/${slug}/job-links`, { cache: "no-store" }),
        ]);
        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (linksRes.ok) setJobLinks(await linksRes.json());
      } catch {
        // Failed to load
      } finally {
        setFetchLoading(false);
      }
    }
    loadData();
  }, [slug]);

  const [form, setForm] = useState({
    title: "",
    company: "",
    url: "",
    notes: "",
  });

  function resetForm() {
    setForm({ title: "", company: "", url: "", notes: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          description: form.notes || "Saved from job board",
          roleType: "OTHER",
          experienceLevel: "INTERN",
          url: form.url || null,
        }),
      });
      if (res.ok) {
        const job = await res.json();
        setJobs((prev) => [job, ...prev]);
        resetForm();
        setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save job.");
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTrackApplication(job: Job) {
    setTrackLoading(true);
    setTrackSuccess(null);
    try {
      const res = await fetch("/api/my/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: job.title,
          company: job.company,
          url: job.url || "",
          clubSlug: slug,
          notes: job.description,
        }),
      });
      if (res.ok) {
        setTrackSuccess(job.id);
        setTrackingJobId(null);
        setTimeout(() => setTrackSuccess(null), 3000);
      }
    } catch {
      // Failed
    } finally {
      setTrackLoading(false);
    }
  }

  function openGoogleJobSearch(term: string) {
    const query = encodeURIComponent(`site:linkedin.com/jobs ${term}`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Job Board</h1>
        </div>
        <div className="py-12 text-center text-bryant-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-bryant-gray-900">Job Board</h1>
        <p className="text-sm text-bryant-gray-500">
          Discover job and internship opportunities relevant to your club.
          Search across platforms or save jobs to track your applications.
        </p>
      </div>

      {/* Quick Search Section */}
      {jobLinks && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-bryant-gold" />
            <h2 className="text-lg font-semibold text-bryant-gray-900">Quick Search</h2>
            {jobLinks.domain !== "General" && (
              <Badge variant="sport">{jobLinks.domain}</Badge>
            )}
          </div>
          <p className="mb-4 text-sm text-bryant-gray-500">
            Search for {jobLinks.domain.toLowerCase()} jobs across major platforms:
          </p>
          <div className="flex flex-wrap gap-3">
            {jobLinks.searchLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  PLATFORM_COLORS[link.icon] || "bg-bryant-gray-700 hover:bg-bryant-gray-800 text-white"
                }`}
              >
                <Globe className="h-4 w-4" />
                {link.platform}
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Suggested Search Terms */}
      {jobLinks && jobLinks.suggestedSearchTerms.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Tag className="h-4 w-4 text-bryant-gold" />
            <h2 className="text-lg font-semibold text-bryant-gray-900">Suggested Search Terms</h2>
          </div>
          <p className="mb-3 text-sm text-bryant-gray-500">
            Click a term to search LinkedIn job listings on Google:
          </p>
          <div className="flex flex-wrap gap-2">
            {jobLinks.suggestedSearchTerms.map((term) => (
              <button
                key={term}
                onClick={() => openGoogleJobSearch(term)}
                className="inline-flex items-center gap-1.5 rounded-full border border-bryant-gray-200 bg-white px-3 py-1.5 text-sm text-bryant-gray-700 transition-all hover:border-bryant-gold hover:bg-bryant-gold/5 hover:text-bryant-gold"
              >
                <Search className="h-3 w-3" />
                {term}
              </button>
            ))}
          </div>
          {jobLinks.roleTypes.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-bryant-gray-400 uppercase tracking-wide">
                Common Role Types
              </p>
              <div className="flex flex-wrap gap-1.5">
                {jobLinks.roleTypes.map((role) => (
                  <Badge key={role} variant="technique">{role}</Badge>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Divider */}
      <div className="border-t border-bryant-gray-200" />

      {/* Saved Jobs Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="h-4 w-4 text-bryant-gold" />
            <h2 className="text-lg font-semibold text-bryant-gray-900">Saved Jobs</h2>
            {jobs.length > 0 && (
              <Badge variant="default">{jobs.length}</Badge>
            )}
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Job
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Track Success Alert */}
        {trackSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Job added to your application tracker! View it in My Applications.
          </div>
        )}

        {/* Modal Form */}
        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            resetForm();
          }}
          title="Add Job"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Job Title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Sports Data Analyst Intern"
            />
            <Input
              label="Company"
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Company name"
            />
            <Input
              label="Job Posting URL"
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
            />
            <Textarea
              label="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any notes about the position..."
              rows={3}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={loading}>
                Save Job
              </Button>
            </div>
          </form>
        </Modal>

        {/* Jobs list */}
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-bryant-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-bryant-gray-600">{job.company}</p>
                      {job.description && job.description !== "Saved from job board" && (
                        <p className="mt-1 text-sm text-bryant-gray-500 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-bryant-gray-200 px-3 py-1.5 text-xs font-medium text-bryant-gray-700 transition-colors hover:border-bryant-gold hover:text-bryant-gold"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Posting
                        </a>
                      )}
                      <Button
                        variant={trackSuccess === job.id ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleTrackApplication(job)}
                        disabled={trackLoading || trackSuccess === job.id}
                      >
                        {trackSuccess === job.id ? "Tracked!" : "Track Application"}
                      </Button>
                    </div>
                  </div>
                  {job.createdAt && (
                    <p className="mt-2 text-xs text-bryant-gray-400">
                      Added {timeAgo(new Date(job.createdAt))}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <DemoBox
            title="No saved jobs yet"
            description="Use the quick search links above to find opportunities, then add them here to share with your club."
            icon={Briefcase}
          />
        )}
      </section>
    </div>
  );
}
