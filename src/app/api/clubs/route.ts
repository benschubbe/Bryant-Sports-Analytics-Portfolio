import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: Prisma.ClubWhereInput = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const clubs = await prisma.club.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { memberships: true, projects: true, posts: true, events: true },
        },
      },
    });

    return NextResponse.json(clubs);
  } catch (error) {
    console.error("Clubs GET error:", error);
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

    const { name, description, domain, color } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    // Auto-generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.club.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const club = await prisma.club.create({
      data: {
        name,
        slug,
        description: description || null,
        domain: domain || null,
        color: color || null,
        memberships: {
          create: {
            userId: session.user.id,
            role: "PRESIDENT",
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error("Clubs POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
