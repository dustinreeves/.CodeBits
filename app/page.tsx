"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Join a movie night session</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter the 6-character join code from your host.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="ABC123"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            onClick={() => {
              if (!code.trim()) return;
              router.push(`/s/${code.trim()}`);
            }}
          >
            Join session
          </button>
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
        <h2 className="text-xl font-semibold">Host a session</h2>
        <p className="mt-2 text-sm text-slate-200">
          Create a new session, add movies, and share the join code.
        </p>
        <button
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          onClick={() => router.push("/create")}
        >
          Create session
        </button>
      </section>
    </div>
  );
}
