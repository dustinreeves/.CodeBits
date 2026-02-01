export type MovieTally = {
  id: string;
  title: string;
  votes: number;
  vetoes: number;
  addedAt: string | Date;
};

export type ResultSummary = {
  winner: MovieTally | null;
  ranked: MovieTally[];
  totalVotes: number;
  totalVetoes: number;
  rule: "hard-veto" | "soft-veto";
};

export function computeResults(
  movies: MovieTally[],
  vetoMode: "HARD" | "SOFT"
): ResultSummary {
  const totalVotes = movies.reduce((sum, movie) => sum + movie.votes, 0);
  const totalVetoes = movies.reduce((sum, movie) => sum + movie.vetoes, 0);

  const voteFirstRank = [...movies].sort((a, b) => {
    if (a.votes !== b.votes) {
      return b.votes - a.votes;
    }
    if (a.vetoes !== b.vetoes) {
      return a.vetoes - b.vetoes;
    }
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
  });

  const leastVetoRank = [...movies].sort((a, b) => {
    if (a.vetoes !== b.vetoes) {
      return a.vetoes - b.vetoes;
    }
    if (a.votes !== b.votes) {
      return b.votes - a.votes;
    }
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
  });

  if (vetoMode === "SOFT") {
    const scored = [...movies].sort((a, b) => {
      const scoreA = a.votes - a.vetoes * 3;
      const scoreB = b.votes - b.vetoes * 3;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
    });

    return {
      winner: scored[0] ?? null,
      ranked: scored,
      totalVotes,
      totalVetoes,
      rule: "soft-veto"
    };
  }

  const withoutVetoes = voteFirstRank.filter((movie) => movie.vetoes === 0);
  const ranked = withoutVetoes.length > 0 ? withoutVetoes : leastVetoRank;

  return {
    winner: ranked[0] ?? null,
    ranked,
    totalVotes,
    totalVetoes,
    rule: "hard-veto"
  };
}
