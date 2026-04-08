"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  ExternalLink,
  ChevronDown,
  FileText,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";
import { formatDate } from "@/lib/utils";

interface ApplicationJob {
  id: string;
  title: string;
  company: string;
  url: string | null;
  club: { name: string; slug: string; color: string | null } | null;
}

interface Application {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  job: ApplicationJob;
}

const STATUS_OPTIONS = [
  { value: "INTERESTED", label: "Interested" },
  { value: "APPLIED", label: "Applied" },
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_COLORS: Record<string, string> = {
  INTERESTED: "bg-gray-100 text-gray-700",
  APPLIED: "bg-blue-100 text-blue-700",
  PHONE_SCREEN: "bg-purple-100 text-purple-700",
  INTERVIEW: "bg-yellow-100 text-yellow-800",
  OFFER: "bg-green-100 text-green-700",
  ACCEPTED: "bg-green-200 text-green-800",
  REJECTED: "bg-red-100 text-red-700",
};

function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const [form, setForm] = useState({
    jobTitle: "",
    company: "",
    url: "",
    notes: "",
  });

  useEffect(() => {
    async function loadApplications() {
      try {
        const res = await fetch("/api/my/applications", { cache: "no-store" });
        if (res.ok) {
          setApplications(await res.json());
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    loadApplications();
  }, []);

  function resetForm() {
    setForm({ jobTitle: "", company: "", url: "", notes: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobTitle || !form.company) return;
    setError("");
    setFormLoading(true);
    try {
      const res = await fetch("/api/my/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const app = await res.json();
        setApplications((prev) => [app, ...prev]);
        resetForm();
        setShowForm(false);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleStatusChange(appId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/my/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? updated : a)),
        );
      }
    } catch {
      // Failed
    }
  }

  async function handleNotesUpdate(appId: string) {
    try {
      const res = await fetch(`/api/my/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? updated : a)),
        );
        setEditingNotes(null);
        setNotesValue("");
      }
    } catch {
      // Failed
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bryant-gray-50">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl font-bold text-bryant-black">My Applications</h1>
          <div className="py-12 text-center text-bryant-gray-400">
            Loading your applications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-bryant-black">
              My Applications
            </h1>
            <p className="text-sm text-bryant-gray-500">
              Track your job applications from interested to accepted. Update
              statuses as you progress through the hiring process.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Summary stats */}
        {applications.length > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-7">
            {STATUS_OPTIONS.map((s) => {
              const count = applications.filter(
                (a) => a.status === s.value,
              ).length;
              return (
                <div
                  key={s.value}
                  className="rounded-lg border border-bryant-gray-200 bg-white px-3 py-2 text-center"
                >
                  <p className="text-lg font-bold text-bryant-black">{count}</p>
                  <p className="text-xs text-bryant-gray-500">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Application Modal */}
        <Modal
          open={showForm}
          onClose={() => {
            setShowForm(false);
            resetForm();
          }}
          title="Add Application"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Job Title"
              required
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              placeholder="e.g. Data Analyst Intern"
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
              placeholder="Application notes, contacts, deadlines..."
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
              <Button variant="primary" type="submit" loading={formLoading}>
                Save
              </Button>
            </div>
          </form>
        </Modal>

        {/* Applications list */}
        {applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-bryant-black truncate">
                          {app.job.title}
                        </h3>
                        {app.job.club && (
                          <Link
                            href={`/clubs/${app.job.club.slug}/jobs`}
                            className="shrink-0"
                          >
                            <Badge variant="sport">{app.job.club.name}</Badge>
                          </Link>
                        )}
                      </div>
                      <p className="text-sm text-bryant-gray-600">
                        {app.job.company}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-bryant-gray-400">
                        <span>Added {formatDate(app.createdAt)}</span>
                        {app.job.url && (
                          <a
                            href={app.job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-bryant-gold hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Posting
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Status dropdown */}
                    <div className="shrink-0">
                      <div className="relative">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value)
                          }
                          className={`appearance-none rounded-lg px-3 py-1.5 pr-8 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-bryant-gold ${
                            STATUS_COLORS[app.status] || STATUS_COLORS.INTERESTED
                          }`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" />
                      </div>
                    </div>
                  </div>

                  {/* Notes section */}
                  <div className="mt-3 border-t border-bryant-gray-100 pt-3">
                    {editingNotes === app.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add notes..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleNotesUpdate(app.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNotes(null);
                              setNotesValue("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNotes(app.id);
                          setNotesValue(app.notes || "");
                        }}
                        className="flex items-center gap-1.5 text-xs text-bryant-gray-400 hover:text-bryant-gold transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        {app.notes ? (
                          <span className="text-bryant-gray-600">
                            {app.notes}
                          </span>
                        ) : (
                          "Add notes..."
                        )}
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <DemoBox
            title="No applications yet"
            description="Track your job applications by adding them here or from any club's job board."
            icon={Briefcase}
          />
        )}
      </div>
    </div>
  );
}
