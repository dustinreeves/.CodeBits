import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeName } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const name = typeof body.name === "string" ? normalizeName(body.name) : "";
  const participantId = typeof body.participantId === "string" ? body.participantId : null;

  if (!code) {
    return NextResponse.json({ message: "Join code required." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { joinCode: code },
    include: { participants: true }
  });

  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  if (participantId) {
    const existing = session.participants.find((participant) => participant.id === participantId);
    if (!existing) {
      return NextResponse.json({ message: "Participant not found." }, { status: 404 });
    }
    return NextResponse.json({ participantId: existing.id, name: existing.name });
  }

  if (!name) {
    return NextResponse.json({ message: "Select your name to join." }, { status: 400 });
  }

  const match = session.participants.find(
    (participant) => participant.name.toLowerCase() === name.toLowerCase()
  );

  if (!match) {
    return NextResponse.json({ message: "Name not found in this session." }, { status: 404 });
  }

  if (match.claimed) {
    return NextResponse.json({ message: "That name is already in use." }, { status: 409 });
  }

  await prisma.participant.update({
    where: { id: match.id },
    data: { claimed: true, joinedAt: new Date() }
  });

  return NextResponse.json({ participantId: match.id, name: match.name });
}
