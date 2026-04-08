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
    const upcoming = searchParams.get("upcoming");

    const where: Prisma.EventWhereInput = { clubId: club.id };

    if (upcoming === "true") {
      where.startTime = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        _count: {
          select: { rsvps: true },
        },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Club events GET error:", error);
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

    // Check that user is PRESIDENT or OFFICER
    const membership = await getClubMembership(session.user.id, club.id);

    if (
      !membership ||
      (membership.role !== "PRESIDENT" && membership.role !== "OFFICER")
    ) {
      return NextResponse.json(
        { error: "Only presidents and officers can create events" },
        { status: 403 },
      );
    }

    const { title, description, type, location, startTime, endTime } =
      await req.json();

    if (!title || !type || !startTime || !endTime) {
      return NextResponse.json(
        { error: "title, type, startTime, and endTime are required" },
        { status: 400 },
      );
    }

    const event = await prisma.event.create({
      data: {
        title,
        description: description || null,
        type,
        location: location || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clubId: club.id,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Club events POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
