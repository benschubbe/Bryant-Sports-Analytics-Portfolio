"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Member {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleOptions = [
  { value: "MEMBER", label: "Member" },
  { value: "OFFICER", label: "Officer" },
];

export default function ClubMembersPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [form, setForm] = useState({ email: "", role: "MEMBER" });

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

  function resetForm() {
    setForm({ email: "", role: "MEMBER" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) return;
    const member: Member = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [member, ...prev]);
    resetForm();
    setShowForm(false);
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
            Manage club members and their roles.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Invite Member">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="member@bryant.edu"
          />
          <Select
            label="Role"
            options={roleOptions}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* Members list */}
      {members.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-bryant-gray-200 flex items-center justify-center">
                    <Users className="h-5 w-5 text-bryant-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-bryant-gray-900 truncate">{member.email}</p>
                      <Badge variant={member.role === "OFFICER" ? "domain" : "default"}>
                        {member.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-bryant-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      Invited {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No members yet"
          description="Club members and their roles will be listed here."
          icon={Users}
        />
      )}
    </div>
  );
}
