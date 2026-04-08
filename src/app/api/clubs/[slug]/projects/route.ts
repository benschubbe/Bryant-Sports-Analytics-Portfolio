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
    const sort = searchParams.get("sort") || "newest";

    const where: Prisma.ProjectWhereInput = { clubId: club.id };

    if (search) {
      where.title = { contains: search };
    }

    let orderBy: Prisma.ProjectOrderByWithRelationInput = {
      createdAt: "desc",
    };
    if (sort === "views") {
      orderBy = { views: "desc" };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
      },
    });

    // Sort by average rating in JS if requested (no computed column)
    if (sort === "rating") {
      const projectsWithRating = await Promise.all(
        projects.map(async (p) => {
          const reviews = await prisma.review.findMany({
            where: { projectId: p.id },
          });
          const avg =
            reviews.length > 0
              ? reviews.reduce(
                  (sum, r) =>
                    sum +
                    (r.methodologyScore +
                      r.visualizationScore +
                      r.writingScore +
                      r.codeQualityScore +
                      r.rigorScore) /
                      5,
                  0,
                ) / reviews.length
              : 0;
          return { ...p, avgRating: avg };
        }),
      );
      projectsWithRating.sort((a, b) => b.avgRating - a.avgRating);
      return NextResponse.json(projectsWithRating);
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Club projects GET error:", error);
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

    // Check membership
    const membership = await getClubMembership(session.user.id, club.id);

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a club member to create projects" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      abstract,
      content,
      methodology,
      sport,
      technique,
      tools,
      domain,
      visibility,
      githubUrl,
      tableauUrl,
      videoUrl,
      openForReview,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    // Auto-generate slug from title
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Ensure uniqueness
    let projectSlug = baseSlug;
    let counter = 1;
    while (await prisma.project.findUnique({ where: { slug: projectSlug } })) {
      projectSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const project = await prisma.project.create({
      data: {
        title,
        slug: projectSlug,
        abstract,
        content,
        methodology,
        sport: JSON.stringify(sport || []),
        technique: JSON.stringify(technique || []),
        tools: JSON.stringify(tools || []),
        domain: JSON.stringify(domain || []),
        visibility: visibility || "PUBLIC",
        githubUrl,
        tableauUrl,
        videoUrl,
        openForReview: openForReview ?? false,
        authorId: session.user.id,
        clubId: club.id,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Club projects POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
