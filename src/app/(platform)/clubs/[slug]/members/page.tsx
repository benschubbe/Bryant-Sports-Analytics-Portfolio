"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, Crown, Shield, Star, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials } from "@/lib/utils";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    headline: string | null;
  };
}

const ROLE_ORDER = ["PRESIDENT", "VP", "TREASURER", "OFFICER", "MEMBER"];

const ROLE_CONFIG: Record<string, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "success" | "warning" | "error" | "domain" | "sport";
}> = {
  PRESIDENT: { label: "President", icon: Crown, variant: "success" },
  VP: { label: "Vice President", icon: Star, variant: "warning" },
  TREASURER: { label: "Treasurer", icon: Wallet, variant: "domain" },
  OFFICER: { label: "Officer", icon: Shield, variant: "warning" },
  MEMBER: { label: "Member", icon: Users, variant: "sport" },
};

const ASSIGNABLE_ROLES = [
  { value: "MEMBER", label: "Member" },
  { value: "OFFICER", label: "Officer" },
  { value: "VP", label: "Vice President" },
  { value: "TREASURER", label: "Treasurer" },
];

export default function ClubMembersPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [members, setMembers] = useState<Member[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isPresident = members.some(
    (m) => m.user.id === session?.user?.id && m.role === "PRESIDENT",
  );

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/members`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
        }
      } catch {
        // Failed to load
      } finally {
        setFetchLoading(false);
      }
    }
    loadData();
  }, [slug]);

  async function handleRoleChange(memberId: string, newRole: string) {
    setUpdating(memberId);
    setError("");
    try {
      const res = await fetch(`/api/clubs/${slug}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role: updated.role } : m)),
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to update role.");
      }
    } catch {
      setError("Failed to update role. Please try again.");
    } finally {
      setUpdating(null);
    }
  }

  // Sort members by role hierarchy
  const sorted = [...members].sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
  );

  const leadership = sorted.filter((m) => ["PRESIDENT", "VP", "TREASURER", "OFFICER"].includes(m.role));
  const regularMembers = sorted.filter((m) => m.role === "MEMBER");

  function RoleBadge({ role }: { role: string }) {
    const config = ROLE_CONFIG[role] || ROLE_CONFIG.MEMBER;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  function MemberCard({ member }: { member: Member }) {
    const isMe = member.user.id === session?.user?.id;
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            {member.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.user.image}
                alt={member.user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bryant-gray-200 text-sm font-semibold text-bryant-gray-600">
                {getInitials(member.user.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-bryant-gray-900 truncate">
                  {member.user.name}{isMe ? " (you)" : ""}
                </p>
                <RoleBadge role={member.role} />
              </div>
              {member.user.headline && (
                <p className="text-xs text-bryant-gray-500 truncate mt-0.5">
                  {member.user.headline}
                </p>
              )}
              <p className="text-xs text-bryant-gray-400 mt-0.5">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Role assignment dropdown — only for president, not on self */}
            {isPresident && !isMe && member.role !== "PRESIDENT" && (
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                disabled={updating === member.id}
                className="rounded-lg border border-bryant-gray-200 bg-white px-2 py-1 text-xs text-bryant-gray-700 focus:border-bryant-gold focus:outline-none focus:ring-1 focus:ring-bryant-gold"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Members</h1>
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
          <h1 className="text-2xl font-bold text-bryant-gray-900">Members</h1>
          <p className="text-sm text-bryant-gray-500">
            {members.length} member{members.length !== 1 ? "s" : ""} in this club
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* President hint */}
      {isPresident && (
        <div className="rounded-lg border border-bryant-gold/30 bg-bryant-gold/5 px-4 py-3 text-sm text-bryant-gray-700">
          As president, you can assign roles using the dropdown on each member card.
        </div>
      )}

      {members.length > 0 ? (
        <div className="space-y-6">
          {/* Leadership */}
          {leadership.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bryant-gray-400">
                Leadership
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leadership.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Members */}
          {regularMembers.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bryant-gray-400">
                Members
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {regularMembers.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <DemoBox
          title="No members yet"
          description="Club members will appear here as people join."
          icon={Users}
        />
      )}
    </div>
  );
}
