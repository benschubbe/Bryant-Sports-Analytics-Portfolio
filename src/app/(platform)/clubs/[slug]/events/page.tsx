"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export default function ClubEventsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/events`, { cache: "no-store" });
        if (res.ok) {
          setEvents(await res.json());
        }
      } catch {
        // Failed
      } finally {
        setFetchLoading(false);
      }
    }
    loadData();
  }, [slug]);

  function resetForm() {
    setTitle("");
    setDetails("");
    setStartTime("");
    setEndTime("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;
    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after start time.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: details.trim() || null,
          type: "MEETUP",
          startTime,
          endTime,
        }),
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
        <div><h1 className="text-2xl font-bold text-bryant-gray-900">Events</h1></div>
        <div className="py-12 text-center text-bryant-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Events</h1>
          <p className="text-sm text-bryant-gray-500">
            Club events, workshops, and meetups.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Create Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Guest Speaker: Data in the NBA"
          />
          <Textarea
            label="Details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe the event — what it's about, who should attend, what to bring, location, any links, etc."
            rows={6}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start"
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              label="End"
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="py-4">
                <h3 className="font-semibold text-bryant-gray-900">{event.title}</h3>
                {event.description && (
                  <p className="mt-2 text-sm text-bryant-gray-600 whitespace-pre-wrap">{event.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-bryant-gray-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>
                    {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}{" "}
                    {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No events yet"
          description="Upcoming club events will appear here."
          icon={CalendarDays}
        />
      )}
    </div>
  );
}
