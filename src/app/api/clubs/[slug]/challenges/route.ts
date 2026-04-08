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

    const challenges = await prisma.challenge.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error("Challenges GET error:", error);
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
    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const { title, description, datasetUrl, startDate, endDate } =
      await req.json();

    if (!title || !description || !startDate || !endDate) {
      return NextResponse.json(
        { error: "title, description, startDate, and endDate are required" },
        { status: 400 },
      );
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        datasetUrl: datasetUrl || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clubId: club.id,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error("Challenges POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
