"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Layers, Plus, Code, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Project {
  id: string;
  title: string;
  abstract?: string | null;
  content?: string | null;
  tools?: string | null;
  githubUrl?: string | null;
  tableauUrl?: string | null;
  author?: { name?: string | null };
  createdAt?: string;
}

export default function ClubProjectsPage() {
  const params = useParams();
  const slug = params.slug as string;

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

  function resetForm() {
    setForm({ title: "", abstract: "", content: "", tools: "", githubUrl: "", tableauUrl: "" });
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

      {/* Projects list */}
      {projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent>
                <h3 className="text-sm font-semibold text-bryant-gray-900 mb-1">{project.title}</h3>
                {project.abstract && (
                  <p className="text-sm text-bryant-gray-600 line-clamp-2 mb-2">{project.abstract}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {parseTools(project.tools).map((tool) => (
                    <Badge key={tool} variant="tool">{tool}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-bryant-gray-500">
                  {project.author?.name && <span>by {project.author.name}</span>}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-bryant-gold hover:underline">
                      <Code className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {project.tableauUrl && (
                    <a href={project.tableauUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-bryant-gold hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Tableau
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No projects yet"
          description="Club member projects will be showcased here. Add your first project to get started."
          icon={Layers}
        />
      )}
    </div>
  );
}
