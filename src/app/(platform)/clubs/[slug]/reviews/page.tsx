"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Star, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";

interface Review {
  id: string;
  projectId: string;
  methodologyScore: number;
  visualizationScore: number;
  writingScore: number;
  codeQualityScore: number;
  rigorScore: number;
  feedback: string;
  createdAt: string;
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-bryant-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
              n <= value
                ? "bg-bryant-gold text-white"
                : "bg-bryant-gray-100 text-bryant-gray-500 hover:bg-bryant-gray-200"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ClubReviewsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({
    projectId: "",
    methodologyScore: 3,
    visualizationScore: 3,
    writingScore: 3,
    codeQualityScore: 3,
    rigorScore: 3,
    feedback: "",
  });

  function resetForm() {
    setForm({
      projectId: "",
      methodologyScore: 3,
      visualizationScore: 3,
      writingScore: 3,
      codeQualityScore: 3,
      rigorScore: 3,
      feedback: "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.projectId || !form.feedback) return;
    const review: Review = {
      id: crypto.randomUUID(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]);
    resetForm();
    setShowForm(false);
  }

  function avgScore(r: Review): string {
    return (
      (r.methodologyScore + r.visualizationScore + r.writingScore + r.codeQualityScore + r.rigorScore) / 5
    ).toFixed(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Peer Reviews</h1>
          <p className="text-sm text-bryant-gray-500">
            Give and receive feedback on projects and work within your club.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Write Review
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title="Write Review">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Project ID"
            required
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            placeholder="Enter project ID"
          />
          <div className="space-y-3">
            <p className="text-sm font-medium text-bryant-gray-700">Scores (1-5)</p>
            <ScoreInput label="Methodology" value={form.methodologyScore} onChange={(v) => setForm({ ...form, methodologyScore: v })} />
            <ScoreInput label="Visualization" value={form.visualizationScore} onChange={(v) => setForm({ ...form, visualizationScore: v })} />
            <ScoreInput label="Writing" value={form.writingScore} onChange={(v) => setForm({ ...form, writingScore: v })} />
            <ScoreInput label="Code Quality" value={form.codeQualityScore} onChange={(v) => setForm({ ...form, codeQualityScore: v })} />
            <ScoreInput label="Rigor" value={form.rigorScore} onChange={(v) => setForm({ ...form, rigorScore: v })} />
          </div>
          <Textarea
            label="Feedback"
            required
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            placeholder="Provide detailed feedback..."
            rows={4}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-bryant-gray-900">Project: {review.projectId}</p>
                    <p className="text-xs text-bryant-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="domain">
                    <Star className="h-3 w-3 mr-1" />
                    {avgScore(review)} avg
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="default">Method: {review.methodologyScore}</Badge>
                  <Badge variant="default">Viz: {review.visualizationScore}</Badge>
                  <Badge variant="default">Writing: {review.writingScore}</Badge>
                  <Badge variant="default">Code: {review.codeQualityScore}</Badge>
                  <Badge variant="default">Rigor: {review.rigorScore}</Badge>
                </div>
                <p className="text-sm text-bryant-gray-600">{review.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No reviews yet"
          description="Peer review requests and completed reviews will be listed here."
          icon={Star}
        />
      )}
    </div>
  );
}
