import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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

    const channels = await prisma.channel.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { posts: true } },
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Channels GET error:", error);
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
    const club = await prisma.club.findUnique({ where: { slug } });
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const membership = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: session.user.id, clubId: club.id } },
    });
    if (!membership || !["PRESIDENT", "OFFICER"].includes(membership.role)) {
      return NextResponse.json(
        { error: "Only presidents and officers can create channels" },
        { status: 403 },
      );
    }

    const { name, description, type } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 },
      );
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        description: description || null,
        type: type || "GENERAL",
        clubId: club.id,
      },
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error("Channels POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
