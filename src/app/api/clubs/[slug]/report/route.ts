import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Weekly activity report generator for a club
// Uses smart templates based on domain and actual activity data

interface Highlight {
  type: string;
  title: string;
  detail: string;
}

function generateSummary(
  clubName: string,
  domain: string | null,
  stats: {
    newPosts: number;
    newProjects: number;
    newMembers: number;
    activeEvents: number;
    activeChallenges: number;
  },
): string {
  const parts: string[] = [];

  const totalActivity = stats.newPosts + stats.newProjects;
  if (totalActivity > 0) {
    parts.push(
      `${clubName} had an active week with ${totalActivity} new contribution${totalActivity !== 1 ? "s" : ""}.`,
    );
  } else {
    parts.push(
      `${clubName} had a quiet week — a great time to kick off new ${domain ? domain.toLowerCase() : "club"} initiatives.`,
    );
  }

  if (stats.newMembers > 0) {
    parts.push(
      `The community grew with ${stats.newMembers} new member${stats.newMembers !== 1 ? "s" : ""} joining this week.`,
    );
  }

  if (stats.activeEvents > 0) {
    parts.push(
      `${stats.activeEvents} upcoming event${stats.activeEvents !== 1 ? "s are" : " is"} on the calendar.`,
    );
  }

  return parts.join(" ");
}

function generateRecommendations(
  domain: string | null,
  stats: {
    newPosts: number;
    newProjects: number;
    newMembers: number;
    activeEvents: number;
    activeChallenges: number;
  },
): string[] {
  const recommendations: string[] = [];

  if (stats.activeEvents === 0) {
    recommendations.push(
      "Consider hosting a workshop or meetup this week to keep members engaged.",
    );
  }

  if (stats.newProjects === 0) {
    recommendations.push(
      "Encourage members to start a new project — even a small one can spark collaboration.",
    );
  }

  if (stats.newPosts === 0) {
    recommendations.push(
      "The feed has been quiet. Try posting a discussion prompt or sharing an interesting article.",
    );
  }

  if (stats.activeChallenges === 0) {
    recommendations.push(
      "Launch a weekly challenge to motivate members and build a competitive spirit.",
    );
  }

  if (stats.newMembers === 0) {
    recommendations.push(
      "Spread the word — share the club with classmates to grow the community.",
    );
  }

  // Domain-specific suggestions
  const domainSuggestions: Record<string, string[]> = {
    "Sports Analytics": [
      "Try analyzing data from a recent game and share your findings in the feed.",
      "Pair up members for a collaborative sports data visualization project.",
    ],
    "Computer Science": [
      "Host a code review session to help members learn from each other's work.",
      "Organize a hackathon or mini coding sprint for the club.",
    ],
    Finance: [
      "Run a mock portfolio competition using real-time market data.",
      "Invite a finance professional for a virtual Q&A session.",
    ],
    Marketing: [
      "Launch a social media audit challenge — have members analyze a brand's strategy.",
      "Create a collaborative case study on a trending marketing campaign.",
    ],
  };

  if (domain && domainSuggestions[domain]) {
    recommendations.push(domainSuggestions[domain][0]);
  }

  return recommendations.slice(0, 3);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const club = await prisma.club.findUnique({ where: { slug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Query last 7 days of activity in parallel
    const [recentPosts, recentProjects, newMemberships, upcomingEvents, activeChallenges] =
      await Promise.all([
        prisma.post.findMany({
          where: { clubId: club.id, createdAt: { gte: sevenDaysAgo } },
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, createdAt: true },
        }),
        prisma.project.findMany({
          where: { clubId: club.id, createdAt: { gte: sevenDaysAgo } },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, createdAt: true },
        }),
        prisma.clubMembership.findMany({
          where: { clubId: club.id, joinedAt: { gte: sevenDaysAgo } },
          orderBy: { joinedAt: "desc" },
          include: {
            user: { select: { name: true } },
          },
        }),
        prisma.event.findMany({
          where: { clubId: club.id, startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
          select: { id: true, title: true, startTime: true, type: true },
        }),
        prisma.challenge.findMany({
          where: { clubId: club.id, active: true, endDate: { gte: new Date() } },
          orderBy: { endDate: "asc" },
          select: { id: true, title: true, endDate: true },
        }),
      ]);

    const stats = {
      newPosts: recentPosts.length,
      newProjects: recentProjects.length,
      newMembers: newMemberships.length,
      activeEvents: upcomingEvents.length,
      activeChallenges: activeChallenges.length,
    };

    // Build highlights
    const highlights: Highlight[] = [];

    for (const project of recentProjects) {
      highlights.push({
        type: "project",
        title: project.title,
        detail: `New project published on ${project.createdAt.toLocaleDateString()}`,
      });
    }

    for (const post of recentPosts) {
      highlights.push({
        type: "post",
        title: post.content.slice(0, 80) + (post.content.length > 80 ? "..." : ""),
        detail: `Posted on ${post.createdAt.toLocaleDateString()}`,
      });
    }

    for (const membership of newMemberships) {
      highlights.push({
        type: "new_member",
        title: `Welcome ${membership.user.name}`,
        detail: `Joined on ${membership.joinedAt.toLocaleDateString()}`,
      });
    }

    for (const event of upcomingEvents) {
      highlights.push({
        type: "event",
        title: event.title,
        detail: `${event.type} on ${event.startTime.toLocaleDateString()}`,
      });
    }

    for (const challenge of activeChallenges) {
      highlights.push({
        type: "challenge",
        title: challenge.title,
        detail: `Active until ${challenge.endDate.toLocaleDateString()}`,
      });
    }

    const now = new Date();
    const weekOf = new Date(now);
    weekOf.setDate(weekOf.getDate() - weekOf.getDay()); // Start of current week (Sunday)

    const report = {
      clubName: club.name,
      clubDomain: club.domain,
      weekOf: weekOf.toISOString(),
      generatedAt: now.toISOString(),
      summary: generateSummary(club.name, club.domain, stats),
      highlights,
      stats,
      recommendations: generateRecommendations(club.domain, stats),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Club report GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
