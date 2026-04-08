"use client";

import React, { useState, useEffect } from "react";
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

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#C5A44E");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load current club data
  useEffect(() => {
    async function loadClub() {
      try {
        const res = await fetch(`/api/clubs/${slug}`, { cache: "no-store" });
        if (res.ok) {
          const club = await res.json();
          setName(club.name || "");
          setDomain(club.domain || "");
          setDescription(club.description || "");
          setColor(club.color || "#C5A44E");
          setLogoUrl(club.logoUrl || "");
          setBannerUrl(club.bannerUrl || "");
        }
      } catch {
        // Failed to load
      } finally {
        setLoading(false);
      }
    }
    loadClub();
  }, [slug]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (color && !isValidHex(color)) {
      setError("Invalid hex color. Use format #RGB or #RRGGBB.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, description, color, logoUrl, bannerUrl }),
      });
      if (res.ok) {
        setSuccess("Settings saved successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError("Please sign in to edit club settings.");
        } else if (res.status === 403) {
          setError("Only the club president or officers can edit settings.");
        } else {
          setError(data.error || "Failed to save settings.");
        }
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-bryant-gray-900">Club Settings</h1>
        <div className="py-12 text-center text-bryant-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bryant-gray-900">Club Settings</h1>
        <p className="text-sm text-bryant-gray-500">
          Only club presidents and officers can edit these settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-bryant-gray-900">General</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Club Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setSuccess(""); }}
              required
            />

            <Select
              label="Domain / Category"
              options={[{ value: "", label: "Select a domain..." }, ...DOMAIN_OPTIONS]}
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setSuccess(""); }}
            />

            <Textarea
              label="Description"
              placeholder="Describe your club..."
              value={description}
              onChange={(e) => { setDescription(e.target.value); setSuccess(""); }}
              rows={4}
            />

            <div>
              <Input
                label="Accent Color (hex)"
                value={color}
                onChange={(e) => { setColor(e.target.value); setSuccess(""); }}
                placeholder="#C5A44E"
              />
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg border border-bryant-gray-200"
                  style={{ backgroundColor: isValidHex(color) ? color : "#ccc" }}
                />
                <span className="text-xs text-bryant-gray-500">Color preview</span>
              </div>
            </div>

            <Input
              label="Logo URL (optional)"
              type="url"
              value={logoUrl}
              onChange={(e) => { setLogoUrl(e.target.value); setSuccess(""); }}
              placeholder="https://example.com/logo.png"
            />

            <Input
              label="Banner URL (optional)"
              type="url"
              value={bannerUrl}
              onChange={(e) => { setBannerUrl(e.target.value); setSuccess(""); }}
              placeholder="https://example.com/banner.jpg"
            />

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
