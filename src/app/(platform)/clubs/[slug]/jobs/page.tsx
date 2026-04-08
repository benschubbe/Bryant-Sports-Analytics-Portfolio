"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Briefcase, Plus, MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

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

const roleTypeOptions = [
  { value: "ANALYST", label: "Analyst" },
  { value: "DATA_ENGINEER", label: "Data Engineer" },
  { value: "DATA_SCIENTIST", label: "Data Scientist" },
  { value: "SCOUT", label: "Scout" },
  { value: "RESEARCHER", label: "Researcher" },
  { value: "OTHER", label: "Other" },
];

const experienceLevelOptions = [
  { value: "INTERN", label: "Intern" },
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
];

export default function ClubJobsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/jobs`);
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
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
    description: "",
    roleType: "ANALYST",
    experienceLevel: "INTERN",
    location: "",
    remote: false,
    url: "",
  });

  function resetForm() {
    setForm({ title: "", company: "", description: "", roleType: "ANALYST", experienceLevel: "INTERN", location: "", remote: false, url: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const job = await res.json();
        setJobs((prev) => [job, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Job Board</h1>
          <p className="text-sm text-bryant-gray-500">
            Browse job and internship opportunities relevant to your club.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Post Job
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Post a Job">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Job Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Sports Data Analyst"
          />
          <Input
            label="Company"
            required
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="Company name"
          />
          <Textarea
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the role..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role Type"
              options={roleTypeOptions}
              value={form.roleType}
              onChange={(e) => setForm({ ...form, roleType: e.target.value })}
            />
            <Select
              label="Experience Level"
              options={experienceLevelOptions}
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            />
          </div>
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Boston, MA"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remote"
              checked={form.remote}
              onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              className="h-4 w-4 rounded border-bryant-gray-300 text-bryant-gold focus:ring-bryant-gold"
            />
            <label htmlFor="remote" className="text-sm text-bryant-gray-700">Remote position</label>
          </div>
          <Input
            label="Application URL"
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Post Job
            </Button>
          </div>
        </form>
      </Modal>

      {/* Jobs list */}
      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-semibold text-bryant-gray-900">{job.title}</h3>
                    <p className="text-sm text-bryant-gray-600">{job.company}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Badge variant="technique">{job.roleType.replace("_", " ")}</Badge>
                    <Badge variant="default">{job.experienceLevel}</Badge>
                  </div>
                </div>
                <p className="text-sm text-bryant-gray-600 mt-2 line-clamp-2">{job.description}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-bryant-gray-500">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.remote && <Badge variant="success">Remote</Badge>}
                  {job.url && (
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-bryant-gold hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Apply
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No jobs posted yet"
          description="Job and internship listings shared by alumni and partners will appear here."
          icon={Briefcase}
        />
      )}
    </div>
  );
}
