import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getClubBySlug } from "@/lib/club";

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
    const membership = await prisma.clubMembership.findUnique({
      where: { userId_clubId: { userId: session.user.id, clubId: club.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "Not a member" }, { status: 404 });
    }
    if (membership.role === "PRESIDENT") {
      return NextResponse.json({ error: "Presidents cannot leave their club. Transfer ownership first." }, { status: 400 });
    }
    await prisma.clubMembership.delete({ where: { id: membership.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave club error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
