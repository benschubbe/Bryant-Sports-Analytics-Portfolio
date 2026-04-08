import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all clubs the user is a member of
    const memberships = await prisma.clubMembership.findMany({
      where: { userId: session.user.id },
      select: { clubId: true },
    });

    const clubIds = memberships.map((m) => m.clubId);

    if (clubIds.length === 0) {
      return NextResponse.json([]);
    }

    const posts = await prisma.post.findMany({
      where: {
        clubId: { in: clubIds },
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, headline: true },
        },
        club: {
          select: { id: true, name: true, slug: true, color: true },
        },
        reactions: true,
        _count: {
          select: { comments: true },
        },
      },
    });

    // Aggregate reaction counts by type
    const postsWithReactionCounts = posts.map((post) => {
      const reactionCounts: Record<string, number> = {};
      for (const reaction of post.reactions) {
        reactionCounts[reaction.type] =
          (reactionCounts[reaction.type] || 0) + 1;
      }
      const { reactions: _reactions, ...rest } = post;
      return { ...rest, reactionCounts };
    });

    return NextResponse.json(postsWithReactionCounts);
  } catch (error) {
    console.error("My feed GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
