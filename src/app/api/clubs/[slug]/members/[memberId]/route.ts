import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClubBySlug, getClubMembership } from "@/lib/club";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; memberId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, memberId } = await params;

    const club = await getClubBySlug(slug);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Only the president can assign roles
    const myMembership = await getClubMembership(session.user.id, club.id);
    if (!myMembership || myMembership.role !== "PRESIDENT") {
      return NextResponse.json(
        { error: "Only the club president can assign roles" },
        { status: 403 },
      );
    }

    const { role } = await req.json();
    const validRoles = ["MEMBER", "OFFICER", "VP", "TREASURER", "PRESIDENT"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be MEMBER, OFFICER, VP, TREASURER, or PRESIDENT" },
        { status: 400 },
      );
    }

    // Can't change your own role
    const targetMembership = await prisma.clubMembership.findUnique({
      where: { id: memberId },
    });
    if (!targetMembership || targetMembership.clubId !== club.id) {
      return NextResponse.json(
        { error: "Member not found in this club" },
        { status: 404 },
      );
    }
    if (targetMembership.userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 },
      );
    }

    const updated = await prisma.clubMembership.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, image: true, headline: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Member PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
