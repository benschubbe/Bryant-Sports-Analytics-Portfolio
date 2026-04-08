"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, MessageSquare, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";
import { getInitials, timeAgo } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  author?: { name?: string | null; image?: string | null };
  createdAt: string;
  _count?: { comments: number; reactions: number };
}

export default function ClubFeedPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();

  const [composeText, setComposeText] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [error, setError] = useState("");

  const userName = session?.user?.name || "You";
  const userImage = session?.user?.image;
  const userInitials = getInitials(userName);

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

      {/* Compose Area */}
      {showCompose && (
        <Card className="border-2 border-bryant-gold/30 shadow-md">
          <CardContent className="space-y-3 py-5">
            <div className="flex items-start gap-3">
              {userImage ? (
                <img src={userImage} alt={userName} className="mt-0.5 h-10 w-10 rounded-full object-cover ring-2 ring-bryant-gold/30" />
              ) : (
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bryant-gold/15 text-sm font-bold text-bryant-gold ring-2 ring-bryant-gold/30">
                  {userInitials}
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="What are you working on?"
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

      {/* Posts List */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => {
            const authorName = post.author?.name || "Member";
            const authorImage = post.author?.image;
            const authorInitials = getInitials(authorName);
            const reactionCount = post._count?.reactions ?? 0;
            const commentCount = post._count?.comments ?? 0;

            return (
              <Card key={post.id} className="transition-all duration-200 hover:shadow-md hover:border-bryant-gray-300">
                <CardContent className="py-5">
                  {/* Author row */}
                  <div className="flex items-center gap-3 mb-3">
                    {authorImage ? (
                      <img src={authorImage} alt={authorName} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-bryant-gold/20 to-bryant-gold/10 text-xs font-bold text-bryant-gold ring-1 ring-bryant-gold/10">
                        {authorInitials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bryant-gray-900">
                        {authorName}
                      </p>
                      <p className="text-xs text-bryant-gray-400">
                        {timeAgo(new Date(post.createdAt))}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-bryant-gray-700 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>

                  {/* Engagement footer */}
                  {(reactionCount > 0 || commentCount > 0) && (
                    <div className="mt-3 flex items-center gap-4 border-t border-bryant-gray-100 pt-3">
                      {reactionCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-bryant-gray-400">
                          <Heart className="h-3.5 w-3.5 text-rose-400" />
                          {reactionCount}
                        </span>
                      )}
                      {commentCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-bryant-gray-400">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {commentCount} comment{commentCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-bryant-gray-200 py-16 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-bryant-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-bryant-gray-700 mb-2">
            Start the conversation
          </h3>
          <p className="text-sm text-bryant-gray-400 mb-6 max-w-sm mx-auto">
            Be the first to share an update, insight, or question with your club members.
          </p>
          <Button variant="primary" onClick={() => setShowCompose(true)}>
            <Send className="h-4 w-4" />
            Write First Post
          </Button>
        </div>
      )}
    </div>
  );
}
