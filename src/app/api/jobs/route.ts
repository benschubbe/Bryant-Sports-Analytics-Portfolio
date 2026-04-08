import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roleType = searchParams.get("roleType");
    const sport = searchParams.get("sport");
    const experienceLevel = searchParams.get("experienceLevel");
    const remote = searchParams.get("remote");
    const search = searchParams.get("search");

    const where: Prisma.JobWhereInput = {};

    if (roleType) where.roleType = roleType;
    if (sport) where.sport = { contains: sport };
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
    console.error("Jobs GET error:", error);
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

    if (session.user.role !== "ALUMNI" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only alumni and admins can post job listings" },
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
        { error: "title, company, description, roleType, and experienceLevel are required" },
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
        location,
        experienceLevel,
        remote: remote ?? false,
        url,
        postedById: session.user.id,
        bryantConnection: bryantConnection ?? false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("Jobs POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
