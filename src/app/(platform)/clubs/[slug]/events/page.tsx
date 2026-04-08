"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Plus, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  location?: string | null;
  startTime: string;
  endTime: string;
}

const eventTypeOptions = [
  { value: "SPEAKER", label: "Speaker" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "MEETUP", label: "Meetup" },
  { value: "CAREER_FAIR", label: "Career Fair" },
  { value: "WATCH_PARTY", label: "Watch Party" },
];

export default function ClubEventsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/events`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
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
    description: "",
    type: "SPEAKER",
    location: "",
    startTime: "",
    endTime: "",
  });

  function resetForm() {
    setForm({ title: "", description: "", type: "SPEAKER", location: "", startTime: "", endTime: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.type || !form.startTime || !form.endTime) return;
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const event = await res.json();
        setEvents((prev) => [event, ...prev]);
        resetForm();
        setShowForm(false);
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError("Please sign in to create events.");
        } else if (res.status === 403) {
          setError("Only the club president or officers can create events.");
          setShowForm(false);
        } else {
          setError(data.error || "Failed to create event.");
        }
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
          <h1 className="text-2xl font-bold text-bryant-gray-900">Events</h1>
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
          <h1 className="text-2xl font-bold text-bryant-gray-900">Events</h1>
          <p className="text-sm text-bryant-gray-500">
            Plan and manage club events, workshops, and speaker sessions.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What is this event about?"
            rows={3}
          />
          <Select
            label="Type"
            options={eventTypeOptions}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          />
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Bello Center Room 201"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date/Time"
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <Input
              label="End Date/Time"
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              Create Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Events list */}
      {events.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-bryant-gray-900">{event.title}</h3>
                  <Badge variant="tool">{event.type.replace("_", " ")}</Badge>
                </div>
                {event.description && (
                  <p className="text-sm text-bryant-gray-600 mb-2 line-clamp-2">{event.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-bryant-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(event.startTime).toLocaleDateString()} {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No events yet"
          description="Upcoming club events like speaker sessions, workshops, and meetups will appear here."
          icon={CalendarDays}
        />
      )}
    </div>
  );
}
