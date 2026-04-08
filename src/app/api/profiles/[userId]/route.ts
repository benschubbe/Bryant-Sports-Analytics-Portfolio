import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        memberships: {
          include: {
            club: {
              select: {
                name: true,
                slug: true,
                domain: true,
                color: true,
              },
            },
          },
        },
        projects: {
          where: { visibility: "PUBLIC" },
          orderBy: { createdAt: "desc" },
          include: {
            club: {
              select: {
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            club: {
              select: {
                name: true,
                slug: true,
                color: true,
              },
            },
            _count: {
              select: { comments: true },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
