"use client";

import type { MovieState } from "@/lib/types";

type MovieCardProps = {
  movie: MovieState;
  canVote: boolean;
  canVeto: boolean;
  onVote: (movieId: string) => void;
  onVeto: (movieId: string) => void;
};

export function MovieCard({ movie, canVote, canVeto, onVote, onVeto }: MovieCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{movie.title}</h3>
        <p className="text-sm text-slate-600">
          {[movie.year, movie.service].filter(Boolean).join(" · ")}
        </p>
        {movie.url ? (
          <a
            className="text-sm text-blue-600 hover:underline"
            href={movie.url}
            target="_blank"
            rel="noreferrer"
          >
            More info
          </a>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>Votes: {movie.voteCount}</span>
        <span>Vetoes: {movie.vetoCount}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            movie.hasVoted
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
          disabled={!canVote}
          onClick={() => onVote(movie.id)}
        >
          {movie.hasVoted ? "Remove vote" : "Upvote"}
        </button>
        <button
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            movie.hasVetoed
              ? "bg-rose-600 text-white"
              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
          }`}
          disabled={!canVeto || movie.hasVetoed}
          onClick={() => onVeto(movie.id)}
        >
          {movie.hasVetoed ? "Vetoed" : "Veto"}
        </button>
      </div>
    </div>
  );
}
