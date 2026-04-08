"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Tutorial {
  id: string;
  title: string;
  content: string;
  tool?: string;
  category?: string;
  createdAt: string;
}

export default function ClubTutorialsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    tool: "",
    category: "",
  });

  function resetForm() {
    setForm({ title: "", content: "", tool: "", category: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.content) return;
    const tutorial: Tutorial = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setTutorials((prev) => [tutorial, ...prev]);
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Tutorials</h1>
          <p className="text-sm text-bryant-gray-500">
            Step-by-step guides and tutorials created by club members.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Write Tutorial
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Write Tutorial">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Tutorial title"
          />
          <Textarea
            label="Content"
            required
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Write your tutorial content..."
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tool"
              value={form.tool}
              onChange={(e) => setForm({ ...form, tool: e.target.value })}
              placeholder="e.g. Python, R, Excel"
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Data Viz, Stats"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Publish Tutorial
            </Button>
          </div>
        </form>
      </Modal>

      {/* Tutorials list */}
      {tutorials.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id}>
              <CardContent>
                <h3 className="text-sm font-semibold text-bryant-gray-900 mb-1">{tutorial.title}</h3>
                <p className="text-sm text-bryant-gray-600 line-clamp-3 mb-2">{tutorial.content}</p>
                <div className="flex items-center gap-2">
                  {tutorial.tool && <Badge variant="tool">{tutorial.tool}</Badge>}
                  {tutorial.category && <Badge variant="domain">{tutorial.category}</Badge>}
                </div>
                <p className="text-xs text-bryant-gray-400 mt-2">
                  {new Date(tutorial.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No tutorials yet"
          description="Member-created tutorials and how-to guides will be listed here."
          icon={BookOpen}
        />
      )}
    </div>
  );
}
