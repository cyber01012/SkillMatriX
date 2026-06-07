
/**
 * Generic pagination by heights with guard margins to avoid hidden lines.
 * Not used directly now (ResumePreview does rect-based pagination),
 * but ready if you want to paginate arrays of heights elsewhere.
 */
export function paginateHeights(
  heights: number[],
  capPx: number,
  options?: { overflowGuardPx?: number; lastLineThresholdPx?: number }
) {
  const guard = options?.overflowGuardPx ?? 8;
  const threshold = options?.lastLineThresholdPx ?? 10;
  const cap = Math.max(0, capPx - guard);

  const pages: number[][] = [];
  let curr: number[] = [];
  let currH = 0;

  heights.forEach((h, idx) => {
    const tooTall = h > cap;
    if (tooTall && curr.length > 0) {
      pages.push(curr);
      curr = [idx];
      currH = h;
      return;
    }

    if (currH + h > cap && curr.length > 0) {
      pages.push(curr);
      curr = [idx];
      currH = h;
    } else {
      curr.push(idx);
      currH += h;
    }

    const leftover = capPx - currH;
    if (leftover > 0 && leftover < threshold && curr.length > 1) {
      const last = curr.pop()!;
      pages.push(curr);
      curr = [last];
      currH = h;
    }
  });

  if (curr.length) pages.push(curr);
  return pages;
}
