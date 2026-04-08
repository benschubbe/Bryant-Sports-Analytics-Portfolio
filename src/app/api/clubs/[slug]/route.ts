import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClubBySlug, getClubMembership } from "@/lib/club";

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
        memberships: {
          take: 5,
          orderBy: { joinedAt: "asc" },
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error("Club GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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

    // Check that user is PRESIDENT or OFFICER
    const membership = await getClubMembership(session.user.id, club.id);

    if (
      !membership ||
      (membership.role !== "PRESIDENT" && membership.role !== "OFFICER")
    ) {
      return NextResponse.json(
        { error: "Only presidents and officers can update the club" },
        { status: 403 },
      );
    }

    const { name, description, domain, color, logoUrl, bannerUrl } =
      await req.json();

    const updated = await prisma.club.update({
      where: { slug },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(domain !== undefined && { domain }),
        ...(color !== undefined && { color }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Club PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
