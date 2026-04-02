export type HighlightMatch = {
  index: number;
  length: number;
};

export function buildHighlightCandidates(
  primary: string,
  overrides?: string[],
): string[];

export function findHighlightMatch(
  text: string,
  candidates: string[],
): HighlightMatch | null;

export function hasHighlightMatch(
  text: string,
  candidates: string[],
): boolean;
