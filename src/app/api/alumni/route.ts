import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");
    const search = searchParams.get("search");

    const where: Prisma.UserWhereInput = {
      role: "ALUMNI",
    };

    const andConditions: Prisma.UserWhereInput[] = [];

    if (sport) {
      andConditions.push({
        OR: [
          { bio: { contains: sport } },
          { headline: { contains: sport } },
        ],
      });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { headline: { contains: search } },
          { bio: { contains: search } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const alumni = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        bio: true,
        classYear: true,
        concentration: true,
        linkedinUrl: true,
        githubUrl: true,
        personalUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Alumni GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
