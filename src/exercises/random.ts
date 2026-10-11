// Seeded RNG so generators are deterministic in tests.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(xs: readonly T[], rng: () => number): T {
  return xs[Math.floor(rng() * xs.length)];
}

export function randInt(lo: number, hi: number, rng: () => number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

// Picks the item to ask about: forced (review), otherwise random but not the
// same as last time when there is a choice.
export function pickItem(items: string[], rng: () => number, opts?: { avoid?: string; force?: string }): string {
  if (opts?.force) return opts.force;
  const pool = items.length > 1 && opts?.avoid ? items.filter((i) => i !== opts.avoid) : items;
  return pick(pool, rng);
}
