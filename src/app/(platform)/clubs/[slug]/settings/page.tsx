"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DOMAIN_OPTIONS } from "@/lib/constants";

function isValidHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

export default function ClubSettingsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const clubName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const [name, setName] = useState(clubName);
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#C5A44E");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isValidHex(color)) {
      setError("Invalid hex color. Use format #RGB or #RRGGBB.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, description, color }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings.");
      }
      setSuccess("Settings saved successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-bryant-gray-900">Club Settings</h1>
      <p className="text-sm text-bryant-gray-500">
        Only club presidents and officers can edit these settings.
      </p>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-bryant-gray-900">General</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Club Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Domain / Category"
              options={DOMAIN_OPTIONS}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />

            <Textarea
              label="Description"
              placeholder="Describe your club..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <Input
              label="Accent Color (hex)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg border border-bryant-gray-200"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-bryant-gray-500">Color preview</span>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
