"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDays, Plus, FileText } from "lucide-react";
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

const estDateFormat = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const estTimeFormat = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
  });

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

  // Summary state
  const [summaryEventId, setSummaryEventId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summarySuccess, setSummarySuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/events`, { cache: "no-store" });
        if (res.ok) {
          const data: Event[] = await res.json();
          data.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setEvents(data);
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
        setEvents((prev) =>
          [...prev, event].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        );
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
                    {estDateFormat(event.startTime)}
                    {" — "}
                    {estTimeFormat(event.endTime)}
                  </span>
                  <span className="ml-1 rounded bg-bryant-gray-100 px-1 py-0.5 text-[10px] font-medium text-bryant-gray-500">
                    EST
                  </span>
                </div>
                <div className="mt-2">
                  {summarySuccess === event.id ? (
                    <p className="text-xs text-green-600">Summary posted to feed!</p>
                  ) : summaryEventId === event.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        className="w-full rounded-lg border border-bryant-gray-200 p-2 text-sm focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
                        rows={3}
                        placeholder="Write your event summary..."
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          loading={summaryLoading}
                          onClick={async () => {
                            if (!summaryText.trim()) return;
                            setSummaryLoading(true);
                            try {
                              const res = await fetch(`/api/clubs/${slug}/posts`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  content: `\u{1F4CB} Event Summary: ${event.title}\n\n${summaryText.trim()}`,
                                }),
                              });
                              if (res.ok) {
                                setSummarySuccess(event.id);
                                setSummaryEventId(null);
                                setSummaryText("");
                                setTimeout(() => setSummarySuccess(null), 3000);
                              }
                            } catch {
                              // Failed
                            } finally {
                              setSummaryLoading(false);
                            }
                          }}
                        >
                          Submit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSummaryEventId(null);
                            setSummaryText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSummaryEventId(event.id)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Add Summary
                    </Button>
                  )}
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
