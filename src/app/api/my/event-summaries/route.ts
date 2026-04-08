import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Event summaries are stored as posts with content starting with the summary prefix
    const summaries = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        content: { startsWith: "\u{1F4CB} Event Summary:" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        club: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Event summaries GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, clubSlug, eventTitle, summary } = await req.json();

    if (!clubSlug || !eventTitle || !summary) {
      return NextResponse.json(
        { error: "clubSlug, eventTitle, and summary are required" },
        { status: 400 },
      );
    }

    const club = await prisma.club.findUnique({ where: { slug: clubSlug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Create a post in the club feed with the event summary prefix
    const post = await prisma.post.create({
      data: {
        content: `\u{1F4CB} Event Summary: ${eventTitle}\n\n${summary}`,
        authorId: session.user.id,
        clubId: club.id,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        club: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Event summaries POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
