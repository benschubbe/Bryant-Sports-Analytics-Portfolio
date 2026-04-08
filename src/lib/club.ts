import { prisma } from "@/lib/prisma";

export async function getClubBySlug(slug: string) {
  return prisma.club.findUnique({ where: { slug } });
}

export async function getClubMembership(userId: string, clubId: string) {
  return prisma.clubMembership.findUnique({
    where: { userId_clubId: { userId, clubId } },
  });
}

export async function isClubMember(userId: string, clubId: string) {
  const membership = await getClubMembership(userId, clubId);
  return !!membership;
}

export async function getClubRole(userId: string, clubId: string) {
  const membership = await getClubMembership(userId, clubId);
  return membership?.role || null;
}

export async function requireClubRole(userId: string, clubId: string, roles: string[]) {
  const role = await getClubRole(userId, clubId);
  if (!role || !roles.includes(role)) {
    throw new Error("Insufficient permissions");
  }
  return role;
}

export async function getUserClubs(userId: string) {
  return prisma.clubMembership.findMany({
    where: { userId },
    include: { club: true },
    orderBy: { joinedAt: "desc" },
  });
}
