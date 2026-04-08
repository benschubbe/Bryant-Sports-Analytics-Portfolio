import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Campus-wide activity feed aggregating recent activity from all active clubs
// Public endpoint — no auth required

interface FeedItem {
  clubId: string;
  clubName: string;
  clubSlug: string;
  clubDomain: string | null;
  clubColor: string | null;
  type: "post" | "project" | "event" | "member_joined";
  title: string;
  detail: string | null;
  author: { name: string; image: string | null } | null;
  createdAt: string;
}

export async function GET(req: NextRequest) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch all active clubs
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, domain: true, color: true },
    });

    if (clubs.length === 0) {
      return NextResponse.json([]);
    }

    const clubIds = clubs.map((c) => c.id);
    const clubMap = new Map(clubs.map((c) => [c.id, c]));

    // Fetch recent activity across all clubs in parallel
    const [posts, projects, events, memberships] = await Promise.all([
      prisma.post.findMany({
        where: { clubId: { in: clubIds }, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { name: true, image: true } },
        },
      }),
      prisma.project.findMany({
        where: { clubId: { in: clubIds }, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { name: true, image: true } },
        },
      }),
      prisma.event.findMany({
        where: { clubId: { in: clubIds }, startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 50,
      }),
      prisma.clubMembership.findMany({
        where: { clubId: { in: clubIds }, joinedAt: { gte: sevenDaysAgo } },
        orderBy: { joinedAt: "desc" },
        take: 50,
        include: {
          user: { select: { name: true, image: true } },
        },
      }),
    ]);

    const feed: FeedItem[] = [];

    for (const post of posts) {
      const club = clubMap.get(post.clubId!);
      if (!club) continue;
      feed.push({
        clubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        clubDomain: club.domain,
        clubColor: club.color,
        type: "post",
        title: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
        detail: null,
        author: post.author,
        createdAt: post.createdAt.toISOString(),
      });
    }

    for (const project of projects) {
      const club = clubMap.get(project.clubId!);
      if (!club) continue;
      feed.push({
        clubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        clubDomain: club.domain,
        clubColor: club.color,
        type: "project",
        title: project.title,
        detail: project.abstract || null,
        author: project.author,
        createdAt: project.createdAt.toISOString(),
      });
    }

    for (const event of events) {
      const club = clubMap.get(event.clubId!);
      if (!club) continue;
      feed.push({
        clubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        clubDomain: club.domain,
        clubColor: club.color,
        type: "event",
        title: event.title,
        detail: event.description || null,
        author: null,
        createdAt: event.createdAt.toISOString(),
      });
    }

    for (const membership of memberships) {
      const club = clubMap.get(membership.clubId);
      if (!club) continue;
      feed.push({
        clubId: club.id,
        clubName: club.name,
        clubSlug: club.slug,
        clubDomain: club.domain,
        clubColor: club.color,
        type: "member_joined",
        title: `${membership.user.name} joined ${club.name}`,
        detail: null,
        author: membership.user,
        createdAt: membership.joinedAt.toISOString(),
      });
    }

    // Sort by most recent and limit to 50
    feed.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(feed.slice(0, 50));
  } catch (error) {
    console.error("Feed GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
