"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    headline: "",
    bio: "",
    linkedinUrl: "",
    githubUrl: "",
    personalUrl: "",
  });

  function updateProfile(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-bryant-black">Settings</h1>
        <p className="mt-1 text-sm text-bryant-gray-500">
          Manage your account preferences and profile settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {[
            { label: "Profile", icon: User, active: true },
            { label: "Notifications", icon: Bell, active: false },
            { label: "Privacy", icon: Shield, active: false },
            { label: "Appearance", icon: Palette, active: false },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? "bg-bryant-gold/10 font-medium text-bryant-gold"
                  : "text-bryant-gray-500 hover:bg-bryant-gray-100"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Profile form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-bryant-black">Profile Information</h2>
              <p className="text-sm text-bryant-gray-500">
                Update your profile details visible to other members.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-5">
                <Input
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                />

                <Input
                  label="Headline"
                  placeholder="e.g. Sports Analytics Intern at ESPN"
                  value={profile.headline}
                  onChange={(e) => updateProfile("headline", e.target.value)}
                />

                <Textarea
                  label="Bio"
                  placeholder="Tell other members about yourself..."
                  value={profile.bio}
                  onChange={(e) => updateProfile("bio", e.target.value)}
                  rows={4}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="LinkedIn URL"
                    placeholder="https://linkedin.com/in/..."
                    value={profile.linkedinUrl}
                    onChange={(e) => updateProfile("linkedinUrl", e.target.value)}
                  />
                  <Input
                    label="GitHub URL"
                    placeholder="https://github.com/..."
                    value={profile.githubUrl}
                    onChange={(e) => updateProfile("githubUrl", e.target.value)}
                  />
                </div>

                <Input
                  label="Personal Website"
                  placeholder="https://..."
                  value={profile.personalUrl}
                  onChange={(e) => updateProfile("personalUrl", e.target.value)}
                />

                <div className="flex items-center gap-3">
                  <Button type="submit" loading={saving}>
                    Save Changes
                  </Button>
                  {saved && (
                    <span className="text-sm text-green-600">Profile updated!</span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
