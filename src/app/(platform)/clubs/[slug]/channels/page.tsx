"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Hash, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
}

const channelTypeOptions = [
  { value: "SPORT", label: "Sport" },
  { value: "CLASS", label: "Class" },
  { value: "CLUB", label: "Club" },
  { value: "GENERAL", label: "General" },
];

export default function ClubChannelsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", type: "GENERAL" });

  function resetForm() {
    setForm({ name: "", description: "", type: "GENERAL" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const channel = await res.json();
        setChannels((prev) => [channel, ...prev]);
        resetForm();
        setShowForm(false);
      } else {
        // API may not exist yet — store locally as fallback
        const localChannel: Channel = {
          id: crypto.randomUUID(),
          ...form,
        };
        setChannels((prev) => [localChannel, ...prev]);
        resetForm();
        setShowForm(false);
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Channels</h1>
          <p className="text-sm text-bryant-gray-500">
            Organize conversations into topic-based channels for your club.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Create Channel
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create Channel">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Channel Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. nfl-analytics"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this channel about?"
            rows={3}
          />
          <Select
            label="Type"
            options={channelTypeOptions}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Channel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Channels list */}
      {channels.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.id} className="cursor-pointer hover:border-bryant-gold transition-colors">
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-bryant-gold" />
                  <h3 className="text-sm font-semibold text-bryant-gray-900">{channel.name}</h3>
                </div>
                {channel.description && (
                  <p className="text-sm text-bryant-gray-600 line-clamp-2 mb-2">{channel.description}</p>
                )}
                <Badge variant="default">{channel.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No channels yet"
          description="Create topic channels for focused discussions within your club community."
          icon={Hash}
        />
      )}
    </div>
  );
}
