import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        authorId: session.user.id,
        clubId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      include: {
        club: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("My projects GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
