import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const skills = searchParams.get("skills");
    const concentration = searchParams.get("concentration");
    const classYear = searchParams.get("classYear");

    // If skills are specified, find projects that use those tools, then get distinct authors
    // Otherwise, search by concentration/classYear directly
    let userIds: string[] | null = null;

    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);

      // Find projects whose tools contain any of the specified skills
      const matchingProjects = await prisma.project.findMany({
        where: {
          visibility: "PUBLIC",
          OR: skillList.map((skill) => ({
            tools: { contains: skill, mode: "insensitive" as const },
          })),
        },
        select: { authorId: true },
      });

      userIds = [...new Set(matchingProjects.map((p) => p.authorId))];

      // If no matching projects found, return empty
      if (userIds.length === 0) {
        return NextResponse.json([]);
      }
    }

    // Build user query
    const where: Record<string, unknown> = {};

    if (userIds) {
      where.id = { in: userIds };
    }

    if (concentration) {
      where.concentration = { contains: concentration, mode: "insensitive" };
    }

    if (classYear) {
      where.classYear = classYear;
    }

    // If no filters at all, return empty to avoid returning all users
    if (!skills && !concentration && !classYear) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        headline: true,
        concentration: true,
        classYear: true,
        projects: {
          where: { visibility: "PUBLIC" },
          select: { tools: true },
        },
        memberships: {
          select: {
            club: {
              select: { name: true },
            },
          },
        },
      },
      take: 50,
    });

    // Aggregate tools and format response
    const results = users.map((user) => {
      const allTools = new Set<string>();
      for (const project of user.projects) {
        try {
          const parsed = JSON.parse(project.tools);
          if (Array.isArray(parsed)) {
            parsed.forEach((t: string) => allTools.add(t));
          }
        } catch {
          // tools field may not be valid JSON
        }
      }

      return {
        id: user.id,
        name: user.name,
        image: user.image,
        headline: user.headline,
        concentration: user.concentration,
        classYear: user.classYear,
        projectCount: user.projects.length,
        tools: [...allTools],
        clubs: user.memberships.map((m) => m.club.name),
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Employer search GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
