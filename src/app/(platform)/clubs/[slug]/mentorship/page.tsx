"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface MentorshipEntry {
  id: string;
  role: string;
  cadence: string;
  createdAt: string;
}

const cadenceOptions = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "AD_HOC", label: "Ad Hoc" },
  { value: "ASYNC", label: "Async" },
];

export default function ClubMentorshipPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [entries, setEntries] = useState<MentorshipEntry[]>([]);
  const [form, setForm] = useState({ role: "MENTEE", cadence: "MONTHLY" });

  function resetForm() {
    setForm({ role: "MENTEE", cadence: "MONTHLY" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: MentorshipEntry = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Mentorship</h1>
          <p className="text-sm text-bryant-gray-500">
            Connect with mentors and mentees within your club community.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => { setForm({ ...form, role: "MENTEE" }); setShowForm(true); }}>
            <UserPlus className="h-4 w-4" />
            Find Mentor
          </Button>
          <Button variant="outline" onClick={() => { setForm({ ...form, role: "MENTOR" }); setShowForm(true); }}>
            <Users className="h-4 w-4" />
            Become Mentor
          </Button>
        </div>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={form.role === "MENTOR" ? "Become a Mentor" : "Find a Mentor"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">Role</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "MENTEE" })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.role === "MENTEE"
                    ? "border-bryant-gold bg-bryant-gold/10 text-bryant-gold"
                    : "border-bryant-gray-300 text-bryant-gray-700 hover:bg-bryant-gray-50"
                }`}
              >
                Mentee
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "MENTOR" })}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  form.role === "MENTOR"
                    ? "border-bryant-gold bg-bryant-gold/10 text-bryant-gold"
                    : "border-bryant-gray-300 text-bryant-gray-700 hover:bg-bryant-gray-50"
                }`}
              >
                Mentor
              </button>
            </div>
          </div>
          <Select
            label="Preferred Cadence"
            options={cadenceOptions}
            value={form.cadence}
            onChange={(e) => setForm({ ...form, cadence: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Entries list */}
      {entries.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-bryant-gray-200 flex items-center justify-center">
                      {entry.role === "MENTOR" ? (
                        <Users className="h-4 w-4 text-bryant-gray-500" />
                      ) : (
                        <UserPlus className="h-4 w-4 text-bryant-gray-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-bryant-gray-900">You</span>
                  </div>
                  <Badge variant={entry.role === "MENTOR" ? "success" : "technique"}>
                    {entry.role}
                  </Badge>
                </div>
                <p className="text-xs text-bryant-gray-500">
                  Cadence: {entry.cadence.replace("_", " ")}
                </p>
                <p className="text-xs text-bryant-gray-400 mt-1">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No mentorship pairings yet"
          description="Mentorship connections between experienced members and newcomers will be managed here."
          icon={UserPlus}
        />
      )}
    </div>
  );
}
