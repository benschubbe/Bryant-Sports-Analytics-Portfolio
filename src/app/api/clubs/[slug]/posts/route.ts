import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClubBySlug, getClubMembership } from "@/lib/club";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const club = await getClubBySlug(slug);

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    const where: Prisma.PostWhereInput = { clubId: club.id };

    if (channelId) {
      where.channelId = channelId;
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, headline: true },
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
    console.error("Club posts GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const club = await getClubBySlug(slug);

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Check membership
    const membership = await getClubMembership(session.user.id, club.id);

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a club member to post" },
        { status: 403 },
      );
    }

    const { content, channelId } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        content,
        channelId: channelId || null,
        authorId: session.user.id,
        clubId: club.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Club posts POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
