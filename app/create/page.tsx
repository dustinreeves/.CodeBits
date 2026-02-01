"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toast } from "@/components/Toast";

const emptyMovie = { title: "", year: "", service: "", url: "" };

export default function CreateSessionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState<string[]>([""]);
  const [movies, setMovies] = useState([
    { ...emptyMovie },
    { ...emptyMovie },
    { ...emptyMovie }
  ]);
  const [vetoMode, setVetoMode] = useState<"HARD" | "SOFT">("HARD");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateParticipant = (index: number, value: string) => {
    setParticipants((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const updateMovie = (index: number, field: keyof typeof emptyMovie, value: string) => {
    setMovies((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addMovie = () => setMovies((prev) => [...prev, { ...emptyMovie }]);
  const addParticipant = () => setParticipants((prev) => [...prev, ""]);

  const submit = async () => {
    setLoading(true);
    setToast(null);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          participants,
          movies,
          vetoMode
        })
      });
      if (!response.ok) {
        const error = await response.json();
        setToast(error.message || "Failed to create session.");
        return;
      }
      const data = await response.json();
      router.push(`/s/${data.joinCode}`);
    } catch (error) {
      setToast("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Toast message={toast} onClear={() => setToast(null)} />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create a session</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add participants and a movie list. Everyone can vote with up to 3 vetoes.
        </p>
        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Session name
            <input
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Veto mode
            <select
              className="rounded-lg border border-slate-200 px-3 py-2"
              value={vetoMode}
              onChange={(event) => setVetoMode(event.target.value as "HARD" | "SOFT")}
            >
              <option value="HARD">Hard veto (any veto removes a movie)</option>
              <option value="SOFT">Soft veto (-3 points per veto)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Participants</h2>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm"
            type="button"
            onClick={addParticipant}
          >
            Add
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          {participants.map((participant, index) => (
            <input
              key={`participant-${index}`}
              className="rounded-lg border border-slate-200 px-3 py-2"
              placeholder={`Participant ${index + 1}`}
              value={participant}
              onChange={(event) => updateParticipant(index, event.target.value)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Movies</h2>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm"
            type="button"
            onClick={addMovie}
          >
            Add
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {movies.map((movie, index) => (
            <div key={`movie-${index}`} className="grid gap-2 rounded-lg border border-slate-100 p-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Title"
                  value={movie.title}
                  onChange={(event) => updateMovie(index, "title", event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Year (optional)"
                  value={movie.year}
                  onChange={(event) => updateMovie(index, "year", event.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Streaming service"
                  value={movie.service}
                  onChange={(event) => updateMovie(index, "service", event.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="URL"
                  value={movie.url}
                  onChange={(event) => updateMovie(index, "url", event.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        onClick={submit}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create session"}
      </button>
    </div>
  );
}
