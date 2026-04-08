"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";
import { DOMAIN_OPTIONS as BASE_DOMAIN_OPTIONS } from "@/lib/constants";

const DOMAIN_OPTIONS = [
  { value: "", label: "Select a domain..." },
  ...BASE_DOMAIN_OPTIONS,
];

export default function ClubRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#C5A44E");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !domain) {
      setError("Club name and domain are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          domain,
          description: description.trim(),
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create club.");
      }

      const slug = slugify(name.trim());
      router.push(`/clubs/${slug}/dashboard`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bryant-gray-50">
      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-bryant-gray-900">Register Your Club</h1>
          <p className="mt-2 text-bryant-gray-500">
            Create a portal for your club in minutes
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-bryant-gray-900">Club Details</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Club Name"
                placeholder="e.g. Finance Club"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Select
                label="Domain / Category"
                options={DOMAIN_OPTIONS}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />

              <Textarea
                label="Description"
                placeholder="Tell prospective members what your club is about..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-bryant-gray-700">
                  Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-bryant-gray-200 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-28 rounded-lg border border-bryant-gray-200 px-3 text-sm text-bryant-gray-700 font-mono"
                    placeholder="#C5A44E"
                  />
                  <span className="text-xs text-bryant-gray-400">Click to pick a color</span>
                </div>
              </div>

              {error && (
                <p className="text-sm text-error">{error}</p>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
                Create Club
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
