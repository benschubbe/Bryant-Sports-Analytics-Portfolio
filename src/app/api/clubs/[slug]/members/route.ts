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
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: Prisma.ClubMembershipWhereInput = { clubId: club.id };

    if (role) {
      where.role = role;
    }
    if (search) {
      where.user = {
        name: { contains: search },
      };
    }

    const members = await prisma.clubMembership.findMany({
      where,
      orderBy: { joinedAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
      },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Club members GET error:", error);
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

    // Check if already a member
    const existing = await getClubMembership(session.user.id, club.id);

    if (existing) {
      return NextResponse.json(
        { error: "Already a member of this club" },
        { status: 409 },
      );
    }

    const membership = await prisma.clubMembership.create({
      data: {
        userId: session.user.id,
        clubId: club.id,
        role: "MEMBER",
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        club: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Club members POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
