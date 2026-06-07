// import { NextResponse } from "next/server";
// import { cookies } from "next/headers";

// /** ------------ Types ------------ */
// type AnalyzeBackendRaw = {
//   analysisId?: number;
//   targetRole?: string;
//   strongSkills?: unknown;
//   weakSkills?: unknown;
//   missingSkills?: unknown;
//   improvementAdvice?: string;
//   matchPercentage?: number;
//   pdfUrl?: string | null;
//   createdAt?: string | null;
//   error?: string;
//   requiresConfirmation?: boolean;
//   message?: string;
//   reuseAnalysisId?: number;
//   similarity?: number;
//   [k: string]: unknown;
// };

// type AdaptedSkillGap = {
//   strongSkills: string[];
//   weakSkills: string[];
//   missingSkills: string[];
//   matchPercentage: number;
//   improvementAdvice: string;
// };

// type AdaptedResponse =
//   | {
//       requiresConfirmation: true;
//       message: string;
//       reuseAnalysisId: number;
//       similarity: number;
//     }
//   | {
//       requiresConfirmation?: false;
//       skillGap: AdaptedSkillGap;
//       analysisId?: number;
//       targetRole?: string;
//       pdfUrl?: string | null;
//       createdAt?: string | null;
//     };

// /** ------------ Helpers ------------ */
// function isRecord(x: unknown): x is Record<string, unknown> {
//   return typeof x === "object" && x !== null;
// }

// function toArray(v: unknown): string[] {
//   if (Array.isArray(v)) return v.map(String);
//   if (typeof v === "string") {
//     const t = v.trim();
//     if (!t) return [];
//     try {
//       const parsed = JSON.parse(t);
//       return Array.isArray(parsed) ? parsed.map(String) : [];
//     } catch {
//       return t.includes(",")
//         ? t.split(",").map((s) => s.trim()).filter(Boolean)
//         : [t];
//     }
//   }
//   return [];
// }

// function computeMatchPercentage(matched: string[], missing: string[], fallback = 0) {
//   const denom = Math.max(1, matched.length + missing.length);
//   const pct = Math.round((matched.length / denom) * 100);
//   return Number.isFinite(pct) ? pct : fallback;
// }

// /** ------------ Helpers ------------ */
// async function getTokenFromCookies(): Promise<string | undefined> {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("session_id")?.value;
//   return token ? `Bearer ${token}` : undefined;
// }


// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();

//     const backend =
//       process.env.NEXT_PUBLIC_BACKEND_URL ||
//       process.env.NEXT_PUBLIC_API_BASE_URL;

//     if (!backend) {
//       return NextResponse.json(
//         { error: "Backend URL missing. Set NEXT_PUBLIC_BACKEND_URL in .env.local" },
//         { status: 500 }
//       );
//     }

//     // ✅ Await auth token
//     // const auth = await getTokenFromCookies();

//     // const res = await fetch(`${backend}/api/resume/skill_gap`, {
//     //   method: "POST",
//     //   body: formData,
//     //   headers: auth ? { Authorization: auth } : undefined,
//     // });

//     const text = await res.text();

//     let rawUnknown: unknown = {};
//     try {
//       rawUnknown = text ? JSON.parse(text) : {};
//     } catch {
//       rawUnknown = { raw: text };
//     }

//     if (!isRecord(rawUnknown)) {
//       return NextResponse.json(
//         { error: "Unexpected backend response shape", raw: rawUnknown },
//         { status: 502 }
//       );
//     }

//     const raw = rawUnknown as AnalyzeBackendRaw;

//     if (raw.requiresConfirmation) {
//       return NextResponse.json(
//         {
//           requiresConfirmation: true,
//           message: String(raw.message || "This CV looks very similar. Reuse previous or Continue?"),
//           reuseAnalysisId: Number(raw.reuseAnalysisId || 0),
//           similarity: Number(raw.similarity || 0),
//         },
//         { status: 200 }
//       );
//     }

//     if (raw.error) {
//       return NextResponse.json(
//         { error: String(raw.error) },
//         { status: res.status || 400 }
//       );
//     }

//     const strong = toArray(raw.strongSkills);
//     const weak = toArray(raw.weakSkills);
//     const missing = toArray(raw.missingSkills);

//     const matchPercentage =
//       typeof raw.matchPercentage === "number"
//         ? raw.matchPercentage
//         : computeMatchPercentage(strong, missing, 0);

//     const improvementAdvice =
//       typeof raw.improvementAdvice === "string" && raw.improvementAdvice.trim()
//         ? raw.improvementAdvice
//         : "Focus on the missing skills shown below.";

//     const adapted: AdaptedResponse = {
//       skillGap: {
//         strongSkills: strong,
//         weakSkills: weak,
//         missingSkills: missing,
//         matchPercentage,
//         improvementAdvice,
//       },
//       analysisId: raw.analysisId,
//       targetRole: raw.targetRole,
//       pdfUrl: raw.pdfUrl ?? null,
//       createdAt: raw.createdAt ?? null,
//     };

//     return NextResponse.json(adapted, { status: res.status || 200 });
//   } catch (e: unknown) {
//     const msg = e instanceof Error ? e.message : "Unknown error";
//     return NextResponse.json({ error: msg }, { status: 500 });
//   }
// }


// app/api/skill-gap/route.ts
import { NextResponse } from "next/server";

/* ---------- Types that UI expects (no any) ---------- */
type AdaptedSkillGap = {
  strongSkills: string[];
  weakSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  improvementAdvice: string;
};

type AdaptedResponse =
  | {
      requiresConfirmation: true;
      message: string;
      reuseAnalysisId: number;
      similarity: number;
    }
  | {
      requiresConfirmation?: false;
      skillGap: AdaptedSkillGap;
      analysisId?: number;
      targetRole?: string;
      pdfUrl?: string | null;
      createdAt?: string | null;
    };

type BackendOk = {
  analysisId?: number;
  username?: string;
  targetRole?: string;
  createdAt?: string | null;
  pdfUrl?: string | null;
  strongSkills?: unknown;
  weakSkills?: unknown;
  missingSkills?: unknown;
  matchPercentage?: number;
  improvementAdvice?: string;
  requiresConfirmation?: boolean;
  message?: string;
  reuseAnalysisId?: number;
  similarity?: number;
};

type BackendError = { error?: string };

/* ---------- Helpers ---------- */
function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return t.includes(",")
        ? t.split(",").map((s) => s.trim()).filter(Boolean)
        : [t];
    }
  }
  return [];
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

function adaptBackendToUi(x: unknown): AdaptedResponse {
  if (!isRecord(x)) {
    return {
      requiresConfirmation: false,
      skillGap: {
        strongSkills: [],
        weakSkills: [],
        missingSkills: [],
        matchPercentage: 0,
        improvementAdvice: "Focus on the missing skills shown below.",
      },
      analysisId: undefined,
      targetRole: undefined,
      pdfUrl: null,
      createdAt: null,
    };
  }

  // Similarity confirmation case
  if (x["requiresConfirmation"] === true) {
    return {
      requiresConfirmation: true,
      message: String(x["message"] ?? "This CV looks very similar. Reuse previous or Continue?"),
      reuseAnalysisId: Number(x["reuseAnalysisId"] ?? 0),
      similarity: Number(x["similarity"] ?? 0),
    };
  }

  // Normal success shape
  const strong = toStringArray(x["strongSkills"]);
  const weak = toStringArray(x["weakSkills"]);
  const missing = toStringArray(x["missingSkills"]);

  const mpRaw = x["matchPercentage"];
  const matchPercentage =
    typeof mpRaw === "number" ? mpRaw : Math.round((strong.length / Math.max(1, strong.length + missing.length)) * 100);

  const improvementAdvice =
    typeof x["improvementAdvice"] === "string" && x["improvementAdvice"].trim()
      ? (x["improvementAdvice"] as string)
      : "Focus on the missing skills shown below.";

  return {
    requiresConfirmation: false,
    skillGap: { strongSkills: strong, weakSkills: weak, missingSkills: missing, matchPercentage, improvementAdvice },
    analysisId: typeof x["analysisId"] === "number" ? (x["analysisId"] as number) : undefined,
    targetRole: typeof x["targetRole"] === "string" ? (x["targetRole"] as string) : undefined,
    pdfUrl: (x["pdfUrl"] ?? null) as string | null,
    createdAt: (x["createdAt"] ?? null) as string | null,
  };
}

/* ---------- POST: analyze resume ---------- */
export async function POST(req: Request) {
  try {
    // Get formData from client request
    const form = await req.formData();

    // Backend base URL
    const backend =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8080";

    // Forward Authorization header (must be sent by client)
    const auth = req.headers.get("authorization") ?? undefined;

    const res = await fetch(`${backend}/api/resume/skill_gap`, {
      method: "POST",
      body: form, // FormData is streamed; do not set Content-Type
      headers: auth ? { Authorization: auth } : undefined,
      // No need for credentials; we’re forwarding Bearer token
    });

    const text = await res.text();
    let parsed: BackendOk | BackendError | unknown;
    try {
      parsed = text ? (JSON.parse(text) as unknown) : {};
    } catch {
      parsed = { error: "Invalid JSON from backend", raw: text };
    }

    if (!res.ok) {
      const errMsg = isRecord(parsed) && typeof parsed["error"] === "string"
        ? (parsed["error"] as string)
        : `HTTP ${res.status}`;
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    const adapted = adaptBackendToUi(parsed);
    return NextResponse.json(adapted, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
