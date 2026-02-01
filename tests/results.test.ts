import { describe, expect, it } from "vitest";
import { computeResults } from "@/lib/results";

const baseMovies = [
  { id: "1", title: "A", votes: 5, vetoes: 0, addedAt: "2024-01-01" },
  { id: "2", title: "B", votes: 3, vetoes: 1, addedAt: "2024-01-02" },
  { id: "3", title: "C", votes: 4, vetoes: 2, addedAt: "2024-01-03" }
];

describe("computeResults", () => {
  it("excludes vetoed movies in hard veto mode", () => {
    const result = computeResults(baseMovies, "HARD");
    expect(result.winner?.title).toBe("A");
    expect(result.ranked).toHaveLength(1);
    expect(result.ranked[0].id).toBe("1");
  });

  it("falls back to least vetoes then votes when all vetoed", () => {
    const movies = baseMovies.map((movie) => ({ ...movie, vetoes: 1 }));
    const result = computeResults(movies, "HARD");
    expect(result.ranked.map((movie) => movie.id)).toEqual(["1", "3", "2"]);
  });

  it("scores by votes minus veto penalty in soft veto mode", () => {
    const result = computeResults(baseMovies, "SOFT");
    expect(result.winner?.id).toBe("1");
    expect(result.rule).toBe("soft-veto");
  });
});
