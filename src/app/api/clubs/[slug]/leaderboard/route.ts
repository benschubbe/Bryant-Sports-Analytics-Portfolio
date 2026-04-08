import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Get all members with their activity counts
    const memberships = await prisma.clubMembership.findMany({
      where: { clubId: club.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Count posts and projects per member in this club
    const leaderboard = await Promise.all(
      memberships.map(async (m) => {
        const [postCount, projectCount] = await Promise.all([
          prisma.post.count({
            where: { authorId: m.user.id, clubId: club.id },
          }),
          prisma.project.count({
            where: { authorId: m.user.id, clubId: club.id },
          }),
        ]);

        const engagementScore = postCount * 1 + projectCount * 3;

        return {
          userId: m.user.id,
          name: m.user.name,
          image: m.user.image,
          role: m.role,
          joinedAt: m.joinedAt,
          postCount,
          projectCount,
          engagementScore,
        };
      }),
    );

    // Sort by engagement score descending
    leaderboard.sort((a, b) => b.engagementScore - a.engagementScore);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
