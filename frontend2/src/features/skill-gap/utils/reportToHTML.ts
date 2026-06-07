
// app/(skill-gap)/utils/reportToHTML.ts

/** Basic HTML escape to avoid breaking the layout */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Try to render advice if it's valid JSON (array or object) */
function tryJsonAdviceToHtml(raw: string): string | null {
  const t = (raw ?? "").trim();
  if (!t || (!t.startsWith("[") && !t.startsWith("{"))) return null;

  try {
    const parsed = JSON.parse(t);
    if (Array.isArray(parsed)) {
      // Array -> ordered list
      const items = parsed
        .map((x) => `<li>${escapeHtml(String(x))}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    } else if (parsed && typeof parsed === "object") {
      // Object -> unordered list of values
      const items = Object.values(parsed as Record<string, unknown>)
        .map((v) => `<li>${escapeHtml(String(v))}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
  } catch {
    // fall through to markdown-ish parser below
  }
  return null;
}

/**
 * Minimal Markdown-to-HTML for our use case:
 * - **bold** -> <strong>...</strong>
 * - Numbered list (lines starting with "1. ", "2. ", etc.) -> <ol><li>...</li></ol>
 * - Bulleted list (lines starting with "- " or "* ") -> <ul><li>...</li></ul>
 * - Blank lines break paragraphs
 */
function mdToHtml(raw: string): string {
  if (!raw) return "";

  // Decode any entities from upstream (e.g. &amp;)
  const text = raw;

  // Split into lines and classify
  const lines = text.split(/\r?\n/);

  const blocks: string[] = [];
  let i = 0;

  const boldify = (s: string) =>
    // replace **bold** -> <strong>bold</strong>, escape other HTML
    escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      // blank -> paragraph break
      blocks.push(""); // we will normalize later
      i++;
      continue;
    }

    // Collect numbered list block
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push(`<li>${boldify(content)}</li>`);
        i++;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // Collect bullet list block
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const content = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push(`<li>${boldify(content)}</li>`);
        i++;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Otherwise, treat as paragraph — also support inline bold
    blocks.push(`<p>${boldify(line)}</p>`);
    i++;
  }

  // Normalize extra blank markers: merge consecutive blank -> one <br/>
  const html = blocks
    .map((b) => (b === "" ? "<br/>" : b))
    .join("\n");

  return html;
}

export function reportToHTML({
  role,
  matchPercentage,
  improvementAdvice,
  strongSkills,
  weakSkills,
  missingSkills,
  userName,
}: {
  role: string;
  matchPercentage: number;
  improvementAdvice: string;
  strongSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  userName: string;
}) {
  // 1) Try JSON advice first
  const jsonAdviceHtml = tryJsonAdviceToHtml(improvementAdvice);

  // 2) Otherwise parse our minimal Markdown
  const adviceHtml = jsonAdviceHtml ?? mdToHtml(improvementAdvice);

  // Escape arrays -> HTML list items
  const strongHtml = strongSkills.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const weakHtml = weakSkills.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const missingHtml = missingSkills.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  // Basic clean, print-friendly HTML (no colors needed for PDF)
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Skill Gap Report</title>
<style>
  body { font-family: Arial, sans-serif; padding: 24px; line-height: 1.6; color: #222; }
  h1 { font-size: 26px; margin-bottom: 10px; }
  h2 { font-size: 20px; margin-top: 24px; margin-bottom: 8px; }
  p { margin: 0 0 8px 0; }
  ul, ol { margin: 0 0 10px 22px; padding: 0; }
  li { margin-bottom: 6px; }
  .section { margin-bottom: 26px; }
  strong { font-weight: 700; }
</style>
</head>
<body>

<h1>Skill Gap Report</h1>

<p><strong>Candidate:</strong> ${escapeHtml(userName)}</p>
<p><strong>Role:</strong> ${escapeHtml(role)}</p>
<p><strong>Match Percentage:</strong> ${Number.isFinite(matchPercentage) ? matchPercentage : 0}%</p>

<div class="section">
  <h2>Advice</h2>
  ${adviceHtml}
</div>

<div class="section">
  <h2>Strong Skills</h2>
  <ul>${strongHtml}</ul>
</div>

<div class="section">
  <h2>Weak Skills</h2>
  <ul>${weakHtml}</ul>
</div>

<div class="section">
  <h2>Missing Skills</h2>
  <ul>${missingHtml}</ul>
</div>

</body>
</html>
`;
}
