import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate @bryant.edu domain (case insensitive)
    if (!email.toLowerCase().endsWith("@bryant.edu")) {
      return NextResponse.json(
        { error: "Only @bryant.edu email addresses are allowed" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Rate limit: no more than 3 unexpired codes per email in 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentCodes = await prisma.verificationCode.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: fifteenMinutesAgo },
        expiresAt: { gt: new Date() },
      },
    });

    if (recentCodes >= 3) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    // Generate a 6-digit numeric code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 15-minute expiration
    await prisma.verificationCode.create({
      data: {
        email: normalizedEmail,
        code,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // In production, this would send an email. For now, log and return the code.
    console.log(`[DEV] Verification code for ${normalizedEmail}: ${code}`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
      // DEV ONLY: In production, remove the code from the response and send via email
      code,
    });
  } catch (error) {
    console.error("Send verification code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
