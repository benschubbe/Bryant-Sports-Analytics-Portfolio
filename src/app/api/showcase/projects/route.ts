import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const domain = searchParams.get("domain");
    const tools = searchParams.get("tools");

    const where: Prisma.ProjectWhereInput = {
      visibility: "PUBLIC",
    };

    const andConditions: Prisma.ProjectWhereInput[] = [];

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { tools: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    if (domain) {
      andConditions.push({
        OR: [
          { domain: { contains: domain, mode: "insensitive" } },
          { club: { domain: { contains: domain, mode: "insensitive" } } },
        ],
      });
    }

    if (tools) {
      andConditions.push({
        tools: { contains: tools, mode: "insensitive" },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
        club: {
          select: {
            name: true,
            slug: true,
            color: true,
            domain: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Showcase projects GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
