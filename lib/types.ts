export type MovieState = {
  id: string;
  title: string;
  year?: number | null;
  service?: string | null;
  url?: string | null;
  createdAt: string;
  voteCount: number;
  vetoCount: number;
  hasVoted: boolean;
  hasVetoed: boolean;
};

export type SessionState = {
  id: string;
  name: string;
  joinCode: string;
  status: "OPEN" | "FINALIZED";
  vetoMode: "HARD" | "SOFT";
  movies: MovieState[];
  participants: { id: string; name: string; claimed: boolean }[];
  remainingVetoes: number;
  participantId: string | null;
  totals: {
    votes: number;
    vetoes: number;
  };
};
