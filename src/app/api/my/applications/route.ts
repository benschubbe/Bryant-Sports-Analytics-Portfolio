import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id },
      include: {
        job: {
          include: {
            club: { select: { name: true, slug: true, color: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("My applications GET error:", error);
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

    const { jobTitle, company, url, clubSlug, notes } = await req.json();

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "jobTitle and company are required" },
        { status: 400 },
      );
    }

    // Find the club if clubSlug is provided
    let clubId: string | null = null;
    if (clubSlug) {
      const club = await prisma.club.findUnique({ where: { slug: clubSlug } });
      if (club) {
        clubId = club.id;
      }
    }

    // Create the job record and application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          title: jobTitle,
          company,
          description: notes || "",
          roleType: "OTHER",
          experienceLevel: "INTERN",
          url: url || null,
          postedById: session.user.id,
          clubId,
        },
      });

      const application = await tx.application.create({
        data: {
          userId: session.user.id,
          jobId: job.id,
          notes: notes || null,
          status: "INTERESTED",
        },
        include: {
          job: {
            include: {
              club: { select: { name: true, slug: true, color: true } },
            },
          },
        },
      });

      return application;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("My applications POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
