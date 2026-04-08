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
    const roleType = searchParams.get("roleType");
    const experienceLevel = searchParams.get("experienceLevel");
    const remote = searchParams.get("remote");
    const search = searchParams.get("search");

    const where: Prisma.JobWhereInput = { clubId: club.id };

    if (roleType) where.roleType = roleType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (remote !== null && remote !== undefined) {
      where.remote = remote === "true";
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Club jobs GET error:", error);
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
        { error: "You must be a club member to post jobs" },
        { status: 403 },
      );
    }

    const {
      title,
      company,
      description,
      sport,
      roleType,
      location,
      experienceLevel,
      remote,
      url,
      bryantConnection,
      expiresAt,
    } = await req.json();

    if (!title || !company || !description || !roleType || !experienceLevel) {
      return NextResponse.json(
        {
          error:
            "title, company, description, roleType, and experienceLevel are required",
        },
        { status: 400 },
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        sport,
        roleType,
        location: location || null,
        experienceLevel,
        remote: remote ?? false,
        url: url || null,
        postedById: session.user.id,
        bryantConnection: bryantConnection ?? false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        clubId: club.id,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Club jobs POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
