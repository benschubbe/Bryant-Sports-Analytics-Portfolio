import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Email verification is not yet implemented" },
    { status: 501 },
  );
}
