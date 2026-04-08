import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const concentrationToClubDomains: Record<string, string[]> = {
  "data-science": ["Sports Analytics", "Computer Science"],
  finance: ["Finance", "Business"],
  marketing: ["Marketing", "Business"],
  management: ["Management", "Business"],
  "information-systems": ["Computer Science", "Cybersecurity"],
  economics: ["Finance", "Business"],
};

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Look up the user's concentration
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { concentration: true },
    });

    if (!user?.concentration) {
      return NextResponse.json({
        matched: [],
        alreadyMember: [],
        message: "No concentration set on your profile.",
      });
    }

    const domains = concentrationToClubDomains[user.concentration];
    if (!domains || domains.length === 0) {
      return NextResponse.json({
        matched: [],
        alreadyMember: [],
        message: "No club mappings found for your concentration.",
      });
    }

    // Find all active clubs whose domain matches
    const matchingClubs = await prisma.club.findMany({
      where: {
        isActive: true,
        domain: { in: domains },
      },
      select: { id: true, name: true, slug: true },
    });

    if (matchingClubs.length === 0) {
      return NextResponse.json({
        matched: [],
        alreadyMember: [],
        message: "No matching clubs found.",
      });
    }

    // Check existing memberships
    const existingMemberships = await prisma.clubMembership.findMany({
      where: {
        userId: session.user.id,
        clubId: { in: matchingClubs.map((c) => c.id) },
      },
      select: { clubId: true },
    });

    const existingClubIds = new Set(existingMemberships.map((m) => m.clubId));

    const matched: { clubName: string; clubSlug: string }[] = [];
    const alreadyMember: { clubName: string }[] = [];

    for (const club of matchingClubs) {
      if (existingClubIds.has(club.id)) {
        alreadyMember.push({ clubName: club.name });
      } else {
        await prisma.clubMembership.create({
          data: {
            userId: session.user.id,
            clubId: club.id,
            role: "MEMBER",
          },
        });
        matched.push({ clubName: club.name, clubSlug: club.slug });
      }
    }

    return NextResponse.json({ matched, alreadyMember });
  } catch (error) {
    console.error("Auto-match error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
