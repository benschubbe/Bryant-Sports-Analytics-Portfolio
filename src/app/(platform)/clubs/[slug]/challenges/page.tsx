"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Trophy, Plus, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Challenge {
  id: string;
  title: string;
  description?: string;
  datasetUrl?: string;
  startDate: string;
  endDate: string;
}

export default function ClubChallengesPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    datasetUrl: "",
    startDate: "",
    endDate: "",
  });

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/challenges/generate`, {
        method: "POST",
      });
      if (res.ok) {
        const challenge = await res.json();
        setChallenges((prev) => [challenge, ...prev]);
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  }

  function resetForm() {
    setForm({ title: "", description: "", datasetUrl: "", startDate: "", endDate: "" });
  }

  function isActive(endDate: string): boolean {
    return new Date(endDate) >= new Date();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/challenges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const challenge = await res.json();
        setChallenges((prev) => [challenge, ...prev]);
        resetForm();
        setShowForm(false);
      } else {
        // API may not exist — store locally
        const localChallenge: Challenge = { id: crypto.randomUUID(), ...form };
        setChallenges((prev) => [localChallenge, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } catch {
      const localChallenge: Challenge = { id: crypto.randomUUID(), ...form };
      setChallenges((prev) => [localChallenge, ...prev]);
      resetForm();
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Challenges</h1>
          <p className="text-sm text-bryant-gray-500">
            Compete in weekly and monthly skill-building challenges.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerate} loading={generating}>
            <Trophy className="h-4 w-4" />
            Generate Weekly Challenge
          </Button>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        </div>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create Challenge">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Challenge title"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the challenge, rules, and goals..."
            rows={3}
          />
          <Input
            label="Dataset URL"
            type="url"
            value={form.datasetUrl}
            onChange={(e) => setForm({ ...form, datasetUrl: e.target.value })}
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Challenge
            </Button>
          </div>
        </form>
      </Modal>

      {/* Challenges list */}
      {challenges.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-bryant-gray-900">{challenge.title}</h3>
                  {isActive(challenge.endDate) ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="error">Ended</Badge>
                  )}
                </div>
                {challenge.description && (
                  <p className="text-sm text-bryant-gray-600 line-clamp-2 mb-2">{challenge.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-bryant-gray-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No challenges yet"
          description="Club challenges and competitions will appear here. Test your skills against fellow members."
          icon={Trophy}
        />
      )}
    </div>
  );
}
