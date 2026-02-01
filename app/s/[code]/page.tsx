"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MovieCard } from "@/components/MovieCard";
import { Toast } from "@/components/Toast";
import { StatusBanner } from "@/components/StatusBanner";
import type { SessionState } from "@/lib/types";

const POLL_INTERVAL = 2000;

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const code = typeof params.code === "string" ? params.code.toUpperCase() : "";
  const [session, setSession] = useState<SessionState | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const storageKey = useMemo(() => `movie-vote-${code}`, [code]);

  const loadSession = useCallback(
    async (currentParticipantId?: string | null) => {
      if (!code) return;
      const idToUse = currentParticipantId ?? participantId;
      const url = new URL(`/api/sessions/${code}`, window.location.origin);
      if (idToUse) {
        url.searchParams.set("participantId", idToUse);
      }
      const response = await fetch(url);
      if (!response.ok) {
        setToast("Session not found.");
        return;
      }
      const data = (await response.json()) as SessionState;
      setSession(data);
    },
    [code, participantId]
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setParticipantId(stored);
      loadSession(stored);
      return;
    }
    loadSession();
  }, [storageKey, loadSession]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadSession();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadSession]);

  const joinSession = async () => {
    setLoading(true);
    setToast(null);
    try {
      const response = await fetch("/api/sessions/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name: selectedName })
      });
      const data = await response.json();
      if (!response.ok) {
        setToast(data.message || "Unable to join.");
        return;
      }
      window.localStorage.setItem(storageKey, data.participantId);
      setParticipantId(data.participantId);
      await loadSession(data.participantId);
    } catch (error) {
      setToast("Unable to join session.");
    } finally {
      setLoading(false);
    }
  };

  const toggleVote = async (movieId: string) => {
    if (!participantId) {
      setToast("Join the session to vote.");
      return;
    }
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode: code, participantId, movieId })
    });
    if (!response.ok) {
      const data = await response.json();
      setToast(data.message || "Unable to update vote.");
      return;
    }
    await loadSession(participantId);
  };

  const castVeto = async (movieId: string) => {
    if (!participantId) {
      setToast("Join the session to veto.");
      return;
    }
    const response = await fetch("/api/veto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode: code, participantId, movieId })
    });
    const data = await response.json();
    if (!response.ok) {
      setToast(data.message || "Unable to veto.");
      return;
    }
    await loadSession(participantId);
  };

  const finalize = async () => {
    await fetch("/api/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode: code })
    });
    await loadSession();
    router.push(`/s/${code}/results`);
  };

  if (!session) {
    return <p className="text-sm text-slate-600">Loading session...</p>;
  }

  const unclaimedParticipants = session.participants.filter((participant) => !participant.claimed);
  const canInteract = session.status === "OPEN";

  return (
    <div className="flex flex-col gap-6">
      <Toast message={toast} onClear={() => setToast(null)} />
      <StatusBanner status={session.status} />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{session.name}</h1>
            <p className="text-sm text-slate-600">Join code: {session.joinCode}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
            {session.vetoMode === "HARD"
              ? "Hard vetoes enabled"
              : "Soft vetoes: each veto = -3"}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <span>Total votes: {session.totals.votes}</span>
          <span>Total vetoes: {session.totals.vetoes}</span>
          <span>You have {session.remainingVetoes} vetoes left</span>
        </div>
      </section>

      {!participantId ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Join this session</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pick your name to lock it in. Names are unique per session.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={selectedName}
              onChange={(event) => setSelectedName(event.target.value)}
            >
              <option value="">Select your name</option>
              {unclaimedParticipants.map((participant) => (
                <option key={participant.id} value={participant.name}>
                  {participant.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              onClick={joinSession}
              disabled={!selectedName || loading}
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {session.movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            canVote={canInteract}
            canVeto={canInteract && session.remainingVetoes > 0}
            onVote={toggleVote}
            onVeto={castVeto}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Host controls</h2>
        <p className="mt-2 text-sm text-slate-600">
          Finalizing locks votes and publishes the winner.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            disabled={!canInteract}
            onClick={finalize}
          >
            Finalize session
          </button>
          {session.status === "FINALIZED" ? (
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold"
              onClick={() => router.push(`/s/${code}/results`)}
            >
              View results
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Note: vetoes are permanent once cast.
        </p>
      </section>
    </div>
  );
}
