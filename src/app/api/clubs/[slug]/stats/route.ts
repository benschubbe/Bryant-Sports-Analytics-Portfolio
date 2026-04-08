import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClubBySlug } from "@/lib/club";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            memberships: true,
            projects: true,
            posts: true,
            events: true,
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Get recent activity (latest posts and projects)
    const recentPosts = await prisma.post.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const recentProjects = await prisma.project.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const recentActivity = [
      ...recentPosts.map((p) => ({
        type: "post" as const,
        id: p.id,
        content: p.content,
        author: p.author,
        createdAt: p.createdAt,
      })),
      ...recentProjects.map((p) => ({
        type: "project" as const,
        id: p.id,
        title: p.title,
        author: p.author,
        createdAt: p.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return NextResponse.json({
      memberCount: club._count.memberships,
      projectCount: club._count.projects,
      postCount: club._count.posts,
      eventCount: club._count.events,
      recentActivity,
    });
  } catch (error) {
    console.error("Club stats GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
