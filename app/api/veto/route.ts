import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const code = typeof body.sessionCode === "string" ? body.sessionCode.trim().toUpperCase() : "";
  const participantId = typeof body.participantId === "string" ? body.participantId : "";
  const movieId = typeof body.movieId === "string" ? body.movieId : "";

  if (!code || !participantId || !movieId) {
    return NextResponse.json({ message: "Missing veto data." }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { joinCode: code },
    include: { participants: true, movies: true }
  });
  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }
  if (session.status !== "OPEN") {
    return NextResponse.json({ message: "Session is finalized." }, { status: 403 });
  }

  const participantMatch = session.participants.some((participant) => participant.id === participantId);
  if (!participantMatch) {
    return NextResponse.json({ message: "Participant not found." }, { status: 404 });
  }

  const movieMatch = session.movies.some((movie) => movie.id === movieId);
  if (!movieMatch) {
    return NextResponse.json({ message: "Movie not found." }, { status: 404 });
  }

  const existing = await prisma.veto.findUnique({
    where: {
      participantId_movieId: {
        participantId,
        movieId
      }
    }
  });

  if (existing) {
    return NextResponse.json({ status: "already" });
  }

  const vetoCount = await prisma.veto.count({
    where: { participantId }
  });

  if (vetoCount >= 3) {
    return NextResponse.json({ message: "No vetoes remaining." }, { status: 403 });
  }

  await prisma.veto.create({
    data: {
      sessionId: session.id,
      participantId,
      movieId
    }
  });

  return NextResponse.json({ status: "added" });
}
