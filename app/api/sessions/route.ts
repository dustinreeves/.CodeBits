import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateJoinCode, uniqueNames } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const vetoMode = body.vetoMode === "SOFT" ? "SOFT" : "HARD";
  const participantsInput = Array.isArray(body.participants) ? body.participants : [];
  const moviesInput = Array.isArray(body.movies) ? body.movies : [];

  if (!name) {
    return NextResponse.json({ message: "Session name is required." }, { status: 400 });
  }

  const participantNames = uniqueNames(participantsInput);
  if (participantNames.length < 2) {
    return NextResponse.json({ message: "Add at least two participants." }, { status: 400 });
  }

  const movieRows = moviesInput
    .map((movie: Record<string, string>) => ({
      title: typeof movie.title === "string" ? movie.title.trim() : "",
      year: typeof movie.year === "string" && movie.year.trim() ? Number(movie.year) : null,
      service: typeof movie.service === "string" ? movie.service.trim() : null,
      url: typeof movie.url === "string" ? movie.url.trim() : null
    }))
    .filter((movie) => movie.title);

  if (movieRows.length < 3) {
    return NextResponse.json({ message: "Add at least three movies." }, { status: 400 });
  }

  let joinCode = generateJoinCode();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existing = await prisma.session.findUnique({ where: { joinCode } });
    if (!existing) break;
    joinCode = generateJoinCode();
  }

  const session = await prisma.session.create({
    data: {
      name,
      joinCode,
      vetoMode,
      participants: {
        create: participantNames.map((participantName) => ({
          name: participantName
        }))
      },
      movies: {
        create: movieRows
      }
    }
  });

  return NextResponse.json({ id: session.id, joinCode: session.joinCode });
}
