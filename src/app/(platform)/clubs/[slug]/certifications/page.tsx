"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Award, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Certification {
  id: string;
  name: string;
  provider: string;
  completedDate: string;
  verificationUrl?: string;
}

export default function ClubCertificationsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [form, setForm] = useState({
    name: "",
    provider: "",
    completedDate: "",
    verificationUrl: "",
  });

  function resetForm() {
    setForm({ name: "", provider: "", completedDate: "", verificationUrl: "" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.provider || !form.completedDate) return;
    const cert: Certification = {
      id: crypto.randomUUID(),
      ...form,
    };
    setCertifications((prev) => [cert, ...prev]);
    resetForm();
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Certifications</h1>
          <p className="text-sm text-bryant-gray-500">
            Track certification progress and achievements within your club.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Add Certification">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Certification Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Google Data Analytics"
          />
          <Input
            label="Provider"
            required
            value={form.provider}
            onChange={(e) => setForm({ ...form, provider: e.target.value })}
            placeholder="e.g. Google, Coursera, AWS"
          />
          <Input
            label="Completed Date"
            type="date"
            required
            value={form.completedDate}
            onChange={(e) => setForm({ ...form, completedDate: e.target.value })}
          />
          <Input
            label="Verification URL"
            type="url"
            value={form.verificationUrl}
            onChange={(e) => setForm({ ...form, verificationUrl: e.target.value })}
            placeholder="https://..."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Certification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Certifications list */}
      {certifications.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((cert) => (
            <Card key={cert.id}>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-bryant-gray-900">{cert.name}</h3>
                    <p className="text-sm text-bryant-gray-600">{cert.provider}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="success">
                        Completed {new Date(cert.completedDate).toLocaleDateString()}
                      </Badge>
                    </div>
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-bryant-gold hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Verify
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No certifications yet"
          description="Certification paths and member achievements will be tracked here."
          icon={Award}
        />
      )}
    </div>
  );
}
