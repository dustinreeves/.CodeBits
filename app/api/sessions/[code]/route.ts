import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code.toUpperCase();
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("participantId");

  const session = await prisma.session.findUnique({
    where: { joinCode: code },
    include: {
      participants: true,
      movies: true,
      votes: true,
      vetoes: true
    }
  });

  if (!session) {
    return NextResponse.json({ message: "Session not found." }, { status: 404 });
  }

  const votesByMovie = new Map<string, number>();
  const vetoesByMovie = new Map<string, number>();
  const votesByParticipant = new Set<string>();
  const vetoesByParticipant = new Set<string>();
  const participantIsValid = participantId
    ? session.participants.some((participant) => participant.id === participantId)
    : false;

  session.votes.forEach((vote) => {
    votesByMovie.set(vote.movieId, (votesByMovie.get(vote.movieId) ?? 0) + 1);
    if (participantIsValid && vote.participantId === participantId) {
      votesByParticipant.add(vote.movieId);
    }
  });

  session.vetoes.forEach((veto) => {
    vetoesByMovie.set(veto.movieId, (vetoesByMovie.get(veto.movieId) ?? 0) + 1);
    if (participantIsValid && veto.participantId === participantId) {
      vetoesByParticipant.add(veto.movieId);
    }
  });

  const remainingVetoes = participantIsValid ? Math.max(0, 3 - vetoesByParticipant.size) : 3;
  const totalVotes = session.votes.length;
  const totalVetoes = session.vetoes.length;

  const movies = session.movies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    service: movie.service,
    url: movie.url,
    createdAt: movie.createdAt.toISOString(),
    voteCount: votesByMovie.get(movie.id) ?? 0,
    vetoCount: vetoesByMovie.get(movie.id) ?? 0,
    hasVoted: participantIsValid ? votesByParticipant.has(movie.id) : false,
    hasVetoed: participantIsValid ? vetoesByParticipant.has(movie.id) : false
  }));

  return NextResponse.json({
    id: session.id,
    name: session.name,
    joinCode: session.joinCode,
    status: session.status,
    vetoMode: session.vetoMode,
    participants: session.participants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      claimed: participant.claimed
    })),
    movies,
    remainingVetoes,
    participantId: participantIsValid ? participantId : null,
    totals: {
      votes: totalVotes,
      vetoes: totalVetoes
    }
  });
}
