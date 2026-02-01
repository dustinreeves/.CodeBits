export function generateJoinCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((value) => chars[value % chars.length])
    .join("");
}

export function normalizeName(name: string): string {
  return name.trim();
}

export function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const clean = normalizeName(name);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}
