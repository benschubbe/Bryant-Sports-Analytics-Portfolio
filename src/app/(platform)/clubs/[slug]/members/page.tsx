"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus, Crown, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function ClubMembersPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

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

  const presidents = members.filter((m) => m.role === "PRESIDENT");
  const officers = members.filter((m) => m.role === "OFFICER");
  const regularMembers = members.filter((m) => m.role === "MEMBER");

  function roleBadge(role: string) {
    if (role === "PRESIDENT") {
      return (
        <Badge variant="success">
          <Crown className="h-3 w-3 mr-1" />
          President
        </Badge>
      );
    }
    if (role === "OFFICER") {
      return (
        <Badge variant="warning">
          <Shield className="h-3 w-3 mr-1" />
          Officer
        </Badge>
      );
    }
    return <Badge variant="sport">Member</Badge>;
  }

  function MemberCard({ member }: { member: Member }) {
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
                  {member.user.name}
                </p>
                {roleBadge(member.role)}
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
          </div>
        </CardContent>
      </Card>
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

      {members.length > 0 ? (
        <div className="space-y-6">
          {/* Presidents */}
          {presidents.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bryant-gray-400">
                Leadership
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {presidents.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
                {officers.map((m) => (
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
