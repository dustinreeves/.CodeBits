import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body.sessionCode === "string" ? body.sessionCode.trim().toUpperCase() : "";

  if (!code) {
    return NextResponse.json({ message: "Missing session code." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { joinCode: code } });
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  if (session.status === "FINALIZED") {
    return NextResponse.json({ status: "already" });
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { status: "FINALIZED" }
  });

  return NextResponse.json({ status: "finalized" });
}
