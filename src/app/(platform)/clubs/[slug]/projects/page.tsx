"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layers, Plus, Code, ExternalLink, Eye, User, Upload, FileText, Image, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials, timeAgo } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  abstract?: string | null;
  content?: string | null;
  tools?: string | null;
  views?: number;
  githubUrl?: string | null;
  tableauUrl?: string | null;
  author?: { name?: string | null; image?: string | null };
  createdAt?: string;
}

export default function ClubProjectsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const clubName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/projects`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
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
    abstract: "",
    content: "",
    tools: "",
    githubUrl: "",
    tableauUrl: "",
  });
  const [files, setFiles] = useState<{ name: string; url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  function resetForm() {
    setForm({ title: "", abstract: "", content: "", tools: "", githubUrl: "", tableauUrl: "" });
    setFiles([]);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          setFiles((prev) => [...prev, { name: data.name, url: data.url, type: data.type }]);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error || `Failed to upload ${file.name}`);
        }
      } catch {
        setError(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        tools: form.tools ? form.tools.split(",").map((t) => t.trim()) : [],
        mediaUrls: JSON.stringify(files.map((f) => ({ name: f.name, url: f.url, type: f.type }))),
      };
      const res = await fetch(`/api/clubs/${slug}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects((prev) => [project, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

  // Alternating accent colors for tool badges
  const toolColors = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ];

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Projects</h1>
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
          <h1 className="text-2xl font-bold text-bryant-gray-900">Projects</h1>
          <p className="text-sm text-bryant-gray-500">
            Showcase analytics projects created by club members.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="New Project">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Project title"
          />
          <Textarea
            label="Abstract"
            value={form.abstract}
            onChange={(e) => setForm({ ...form, abstract: e.target.value })}
            placeholder="Brief summary of your project"
            rows={2}
          />
          <Textarea
            label="Content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Full project description and methodology..."
            rows={4}
          />
          <Input
            label="Tools (comma-separated)"
            value={form.tools}
            onChange={(e) => setForm({ ...form, tools: e.target.value })}
            placeholder="e.g. Python, R, Tableau"
          />
          <Input
            label="GitHub URL"
            type="url"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            placeholder="https://github.com/..."
          />
          <Input
            label="Tableau URL"
            type="url"
            value={form.tableauUrl}
            onChange={(e) => setForm({ ...form, tableauUrl: e.target.value })}
            placeholder="https://public.tableau.com/..."
          />

          {/* File Upload */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">
              Attachments
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bryant-gray-300 bg-bryant-gray-50 px-4 py-4 text-sm text-bryant-gray-500 transition-colors hover:border-bryant-gold hover:bg-bryant-gold/5">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Click to upload files (images, PDFs, CSV, Excel — max 5MB each)"}
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.csv,.xlsx,.pptx,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-bryant-gray-100 px-3 py-2 text-sm">
                    {file.type.startsWith("image/") ? (
                      <Image className="h-4 w-4 text-blue-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-bryant-gold shrink-0" />
                    )}
                    <span className="truncate flex-1 text-bryant-gray-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-bryant-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {projects.map((project) => {
            const tools = parseTools(project.tools);
            return (
              <Card key={project.id} className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-bryant-gold/40">
                {/* Gold accent bar */}
                <div className="h-1 bg-gradient-to-r from-bryant-gold to-amber-400" />
                <CardContent className="py-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-bryant-gray-900 mb-2 group-hover:text-bryant-gold transition-colors">
                    {project.title}
                  </h3>

                  {/* Abstract preview */}
                  {project.abstract && (
                    <p className="text-sm text-bryant-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {project.abstract}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    {project.author?.image ? (
                      <img
                        src={project.author.image}
                        alt={project.author.name || ""}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-bryant-gray-200 text-[10px] font-semibold text-bryant-gray-600">
                        {getInitials(project.author?.name || "?")}
                      </div>
                    )}
                    <span className="text-xs font-medium text-bryant-gray-700">
                      {project.author?.name || "Unknown"}
                    </span>
                    {project.createdAt && (
                      <span className="text-xs text-bryant-gray-400">
                        &middot; {timeAgo(new Date(project.createdAt))}
                      </span>
                    )}
                  </div>

                  {/* Tools as colored badges */}
                  {tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tools.map((tool, i) => (
                        <span
                          key={tool}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toolColors[i % toolColors.length]}`}
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer: views + links */}
                  <div className="flex items-center justify-between border-t border-bryant-gray-100 pt-3">
                    <div className="flex items-center gap-1 text-xs text-bryant-gray-400">
                      <Eye className="h-3.5 w-3.5" />
                      {project.views ?? 0} views
                    </div>
                    <div className="flex items-center gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-bryant-gold hover:underline">
                          <Code className="h-3.5 w-3.5" />
                          GitHub
                        </a>
                      )}
                      {project.tableauUrl && (
                        <a href={project.tableauUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-bryant-gold hover:underline">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Tableau
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-bryant-gray-200 py-16 text-center">
          <Layers className="mx-auto h-12 w-12 text-bryant-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-bryant-gray-700 mb-2">
            Be the first to showcase your work in {clubName}
          </h3>
          <p className="text-sm text-bryant-gray-400 mb-6 max-w-md mx-auto">
            Share your analytics projects, research, and visualizations with the club. Your work inspires others.
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Create First Project
          </Button>
        </div>
      )}
    </div>
  );
}
