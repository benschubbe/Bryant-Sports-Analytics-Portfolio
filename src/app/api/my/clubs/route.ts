import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.clubMembership.findMany({
      where: { userId: session.user.id },
      include: {
        club: {
          include: {
            _count: {
              select: { memberships: true, projects: true, posts: true, events: true },
            },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error("My clubs GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
