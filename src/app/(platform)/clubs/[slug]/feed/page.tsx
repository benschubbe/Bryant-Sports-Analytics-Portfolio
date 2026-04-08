"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

interface Post {
  id: string;
  content: string;
  author?: { name?: string | null };
  createdAt: string;
}

export default function ClubFeedPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [composeText, setComposeText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clubs/${slug}/posts`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch {
        // Failed to load
      } finally {
        setFetchLoading(false);
      }
    }
    loadData();
  }, [slug]);

  async function handleSubmit() {
    if (!composeText.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/clubs/${slug}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: composeText }),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts((prev) => [post, ...prev]);
        setComposeText("");
        setShowCompose(false);
      } else {
        const data = await res.json();
        if (res.status === 401) {
          setError("Please sign in to post.");
        } else if (res.status === 403) {
          setError("You must join this club before posting. Use the Join Club button on the dashboard.");
        } else {
          setError(data.error || "Failed to post. Please try again.");
        }
      }
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Feed</h1>
        </div>
        <div className="py-12 text-center text-bryant-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">Feed</h1>
          <p className="text-sm text-bryant-gray-500">
            Share updates, insights, and discussions with your club.
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCompose(!showCompose)}>
          <Send className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Compose Box */}
      {showCompose && (
        <Card className="border-bryant-gold/20 shadow-md">
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bryant-gold/10 text-sm font-bold text-bryant-gold">
                You
              </div>
              <div className="flex-1">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="Share an update with your club..."
              rows={3}
              className="block w-full rounded-xl border border-bryant-gray-200 px-3.5 py-2.5 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold/30 focus:ring-offset-0 transition-all duration-200 resize-none"
            />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setShowCompose(false); setComposeText(""); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!composeText.trim()}
                loading={loading}
                onClick={handleSubmit}
              >
                <Send className="h-3.5 w-3.5" />
                Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts list */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="transition-all duration-200 hover:shadow-md hover:border-bryant-gray-300">
              <CardContent className="py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-bryant-gold/20 to-bryant-gold/10 flex items-center justify-center ring-1 ring-bryant-gold/10">
                    <MessageSquare className="h-4 w-4 text-bryant-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bryant-gray-900">
                      {post.author?.name || "You"}
                    </p>
                    <p className="text-xs text-bryant-gray-500">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-bryant-gray-700 whitespace-pre-wrap">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <DemoBox
          title="No posts yet"
          description="Posts from club members will appear here. Share updates, insights, and discussions."
          icon={MessageSquare}
        />
      )}
    </div>
  );
}
