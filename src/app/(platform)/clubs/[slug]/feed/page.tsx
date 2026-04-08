"use client";

import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoBox } from "@/components/club/demo-box";

export default function ClubFeedPage() {
  const [composeText, setComposeText] = useState("");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-bryant-gray-900">Feed</h1>

      {/* Compose Box */}
      <Card>
        <CardContent className="space-y-3">
          <textarea
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="Share an update with your club..."
            rows={3}
            className="block w-full rounded-lg border border-bryant-gray-300 px-3 py-2 text-sm text-bryant-gray-900 placeholder:text-bryant-gray-400 focus:border-bryant-gold focus:outline-none focus:ring-2 focus:ring-bryant-gold focus:ring-offset-0 transition-colors resize-none"
          />
          <div className="flex justify-end">
            <Button variant="primary" size="sm" disabled={!composeText.trim()}>
              <Send className="h-3.5 w-3.5" />
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feed placeholder */}
      <DemoBox
        title="No posts yet"
        description="Posts from club members will appear here. Share updates, insights, and discussions."
        icon={MessageSquare}
      />
    </div>
  );
}
