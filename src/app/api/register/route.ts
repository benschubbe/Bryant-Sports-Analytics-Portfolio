import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, classYear, concentration, imageUrl } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 },
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 },
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Require .edu email
    const domain = normalizedEmail.split("@")[1];
    if (!domain || !domain.endsWith(".edu")) {
      return NextResponse.json(
        { error: "Please use a valid .edu email address to register." },
        { status: 400 },
      );
    }

    // Check for existing account
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 },
      );
    }

    // Hash password and create the user
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        image: imageUrl || null,
        classYear: classYear || null,
        concentration: concentration || null,
        role: "STUDENT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        classYear: true,
        concentration: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        error:
          "Unable to create your account right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
