"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MessageCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials } from "@/lib/utils";

interface Review {
  id: string;
  title: string;
  feedback: string;
  authorName: string;
  createdAt: string;
}

export default function ClubReviewsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    const review: Review = {
      id: crypto.randomUUID(),
      title: title.trim() || "General Feedback",
      feedback: feedback.trim(),
      authorName: "You",
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [review, ...prev]);
    setTitle("");
    setFeedback("");
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Reviews & Feedback</h1>
          <p className="text-sm text-bryant-gray-500">
            Share feedback on projects, events, or club activities.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Write Feedback
        </Button>
      </div>

      {/* Modal Form */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setTitle(""); setFeedback(""); }} title="Write Feedback">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Feedback on NBA Draft Project"
          />
          <Textarea
            label="Your Feedback"
            required
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts, suggestions, or constructive feedback..."
            rows={6}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); setTitle(""); setFeedback(""); }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={!feedback.trim()}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bryant-gray-200 text-xs font-semibold text-bryant-gray-600">
                    {getInitials(review.authorName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-bryant-gray-900">{review.authorName}</span>
                      <span className="text-xs text-bryant-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title !== "General Feedback" && (
                      <p className="mt-0.5 text-sm font-medium text-bryant-gray-700">{review.title}</p>
                    )}
                    <p className="mt-2 text-sm text-bryant-gray-600 whitespace-pre-wrap">{review.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No feedback yet"
          description="Share your thoughts on club projects, events, or activities. Open feedback helps everyone improve."
          icon={MessageCircle}
        />
      )}
    </div>
  );
}
