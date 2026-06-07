
/** Split long text into sentences (supports ., ?, !, Urdu "۔") */
export function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[\.!\?۔])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
