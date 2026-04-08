"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Map, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface LearningPath {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function ClubLearningPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [form, setForm] = useState({ title: "", description: "" });

  function resetForm() {
    setForm({ title: "", description: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return;
    const path: LearningPath = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setPaths((prev) => [path, ...prev]);
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Learning Paths</h1>
          <p className="text-sm text-bryant-gray-500">
            Structured learning paths curated for your club's domain.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Create Path
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create Learning Path">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Intro to Sports Analytics"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe this learning path, goals, and resources..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Path
            </Button>
          </div>
        </form>
      </Modal>

      {/* Paths list */}
      {paths.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {paths.map((path) => (
            <Card key={path.id}>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-bryant-gold" />
                  <h3 className="text-sm font-semibold text-bryant-gray-900">{path.title}</h3>
                </div>
                {path.description && (
                  <p className="text-sm text-bryant-gray-600 line-clamp-3">{path.description}</p>
                )}
                <p className="text-xs text-bryant-gray-400 mt-2">
                  Created {new Date(path.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No learning paths yet"
          description="Curated learning paths with courses, resources, and milestones will appear here."
          icon={Map}
        />
      )}
    </div>
  );
}
