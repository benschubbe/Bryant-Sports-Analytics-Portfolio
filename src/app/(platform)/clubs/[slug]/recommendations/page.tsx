"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  RefreshCw,
  Sparkles,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Briefcase,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoBox } from "@/components/club/demo-box";

interface Recommendation {
  id: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  tools: string[];
  estimatedTime: string;
  outcomes: string[];
  employerValue: string;
  interviewTips: string[];
}

const difficultyVariant: Record<string, "success" | "warning" | "error"> = {
  Beginner: "success",
  Intermediate: "warning",
  Advanced: "error",
};

function RecommendationCard({
  rec,
  slug,
}: {
  rec: Recommendation;
  slug: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardContent className="py-5">
        {/* Title + difficulty badge */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-bryant-black">
            {rec.title}
          </h3>
          <Badge
            variant={difficultyVariant[rec.difficulty] || "default"}
            className="shrink-0"
          >
            {rec.difficulty}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-bryant-gray-500 leading-relaxed">
          {rec.description}
        </p>

        {/* Tools row */}
        {rec.tools && rec.tools.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rec.tools.map((tool) => (
              <Badge key={tool} variant="tool">
                {tool}
              </Badge>
            ))}
          </div>
        )}

        {/* Estimated time */}
        {rec.estimatedTime && (
          <div className="mt-3 flex items-center gap-1 text-xs text-bryant-gray-400">
            <Clock className="h-3 w-3" />
            {rec.estimatedTime}
          </div>
        )}

        {/* Career Insights toggle */}
        {(rec.outcomes?.length > 0 ||
          rec.employerValue ||
          rec.interviewTips?.length > 0) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1.5 text-sm font-medium text-bryant-navy hover:text-bryant-navy/80 transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Career Insights
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Expandable career insights section */}
        {expanded && (
          <div className="mt-4 space-y-5 border-t border-bryant-gray-100 pt-4">
            {/* What You'll Build */}
            {rec.outcomes && rec.outcomes.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Target className="h-4 w-4 text-bryant-green" />
                  <h4 className="text-sm font-semibold text-bryant-gray-800">
                    What You&apos;ll Build
                  </h4>
                </div>
                <ul className="space-y-1.5 ml-5.5">
                  {rec.outcomes.map((outcome, i) => (
                    <li
                      key={i}
                      className="text-sm text-bryant-gray-600 leading-relaxed list-disc ml-1"
                    >
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why Employers Care */}
            {rec.employerValue && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Briefcase className="h-4 w-4 text-bryant-navy" />
                  <h4 className="text-sm font-semibold text-bryant-gray-800">
                    Why Employers Care
                  </h4>
                </div>
                <p className="text-sm text-bryant-gray-600 leading-relaxed ml-1">
                  {rec.employerValue}
                </p>
              </div>
            )}

            {/* Interview Tips */}
            {rec.interviewTips && rec.interviewTips.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-bryant-gray-800">
                    Interview Tips
                  </h4>
                </div>
                <ul className="space-y-2 ml-1">
                  {rec.interviewTips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-bryant-gray-600 leading-relaxed"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Start Project button */}
        <div className="mt-4">
          <Link href={`/clubs/${slug}/projects`}>
            <Button size="sm">Start Project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecommendationsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clubs/${slug}/recommendations`);
      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-bryant-gray-900">
            Recommended Projects
          </h1>
          <p className="text-sm text-bryant-gray-500">
            AI-curated project ideas for your club — with career insights to
            help you stand out
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchRecommendations}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-5">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-2/3 rounded bg-bryant-gray-200" />
                    <div className="h-5 w-20 rounded-full bg-bryant-gray-200" />
                  </div>
                  <div className="h-4 w-full rounded bg-bryant-gray-200" />
                  <div className="h-4 w-full rounded bg-bryant-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-bryant-gray-200" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-bryant-gray-200" />
                    <div className="h-5 w-16 rounded-full bg-bryant-gray-200" />
                    <div className="h-5 w-16 rounded-full bg-bryant-gray-200" />
                  </div>
                  <div className="h-3 w-24 rounded bg-bryant-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-error" />
            <h3 className="text-sm font-semibold text-bryant-gray-700">
              Failed to load recommendations
            </h3>
            <p className="mt-1 text-sm text-bryant-gray-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={fetchRecommendations}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : recommendations.length === 0 ? (
        <DemoBox
          title="No recommendations yet"
          description="AI-generated project recommendations will appear here based on your club's domain and activity."
          icon={Sparkles}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}
