"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { computeResults } from "@/lib/results";
import type { SessionState } from "@/lib/types";
import { StatusBanner } from "@/components/StatusBanner";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";
  const [session, setSession] = useState<SessionState | null>(null);

  const storageKey = useMemo(() => `movie-vote-${code}`, [code]);

  useEffect(() => {
    const load = async () => {
      const participantId = window.localStorage.getItem(storageKey);
      const url = new URL(`/api/sessions/${code}`, window.location.origin);
      if (participantId) {
        url.searchParams.set("participantId", participantId);
      }
      const response = await fetch(url);
      if (!response.ok) return;
      const data = (await response.json()) as SessionState;
      setSession(data);
    };
    load();
  }, [code, storageKey]);

  if (!session) {
    return <p className="text-sm text-slate-600">Loading results...</p>;
  }

  const results = computeResults(
    session.movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      votes: movie.voteCount,
      vetoes: movie.vetoCount,
      addedAt: movie.createdAt
    })),
    session.vetoMode
  );

  return (
    <div className="flex flex-col gap-6">
      <StatusBanner status={session.status} />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Results for {session.name}</h1>
          <p className="text-sm text-slate-600">Rule: {results.rule}</p>
        </div>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">Winner</p>
          <h2 className="text-2xl font-semibold text-slate-900">
            {results.winner ? results.winner.title : "No winner"}
          </h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
          <span>Total votes cast: {results.totalVotes}</span>
          <span>Total vetoes used: {results.totalVetoes}</span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Full ranking</h2>
        <div className="mt-4 grid gap-3">
          {results.ranked.map((movie, index) => (
            <div
              key={movie.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="font-medium">
                  #{index + 1} {movie.title}
                </p>
                <p className="text-sm text-slate-600">
                  {movie.votes} votes · {movie.vetoes} vetoes
                </p>
              </div>
              <span className="text-sm text-slate-500">
                {results.rule === "soft-veto" ? "score" : "votes"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <button
        className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
        onClick={() => router.push(`/s/${code}`)}
      >
        Back to session
      </button>
    </div>
  );
}
