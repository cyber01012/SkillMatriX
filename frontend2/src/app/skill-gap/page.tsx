"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import FilePicker from "@/features/skill-gap/components/file-picker";
import RoleInput from "@/features/skill-gap/components/role-input";
import Report from "@/features/skill-gap/components/report";
import Card from "@/components/resume-builder/Card";
import Button from "@/components/resume-builder/Button";
import { analyzeSkillGap, reuseSkillGap } from "@/features/skill-gap/lib/api";
import type { BackendResponse } from "@/features/skill-gap/types/skill-gap";
import type { RecommendBundle } from "@/features/job-recommendation/types";
import { GlassProfileBadgeAuto, UnderHeaderGlassStripAuto } from "@/features/ProfileBadge";
import { Loader2, AlertCircle, ArrowLeft, AlertTriangle, RotateCcw, Play, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



// --- Add near top (below imports) ---
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";



function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("accessToken") ?? "";
  const token = raw.replace(/^"|"$/g, "").trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


// 🔹 Helper to keep "any" out of code
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try { return JSON.stringify(err); } catch { return "Unknown error"; }
}


// ✅ Small helpers
function parseJsonSafe<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch { return null; }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}


function getAnalysisId(res: BackendResponse | null): number | null {
  if (res && typeof res === "object" && "analysisId" in res) {
    const id = (res as BackendResponse).analysisId;
    return typeof id === "number" ? id : null;
  }
  return null;
}



function isRecommendBundle(x: unknown): x is RecommendBundle {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    Array.isArray(o["recommendedJobs"]) &&
    Array.isArray(o["relatedJobs"]) &&
    Array.isArray(o["otherJobs"])
  );
}


type SkillsPayload = { strong: string[]; weak: string[]; missing: string[] };

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function extractSkillsFromResult(res: BackendResponse | null): SkillsPayload {
  const r = (res ?? {}) as Record<string, unknown>;
  const strong = toStringArray(r["strongSkills"] ?? r["strong"]);
  const weak = toStringArray(r["weakSkills"] ?? r["weak"]);
  const missing = toStringArray(r["missingSkills"] ?? r["missing"]);
  return { strong, weak, missing };
}


type SkillGapApiError = {
  error?: string;
};

type SkillGapConfirmation = {
  requiresConfirmation: true;
  message?: string;
  reuseAnalysisId?: number;
  similarity?: number;
};

type SkillGapSuccess = BackendResponse & {
  requiresConfirmation?: false;
};

type SkillGapApiResponse =
  | SkillGapApiError
  | SkillGapConfirmation
  | SkillGapSuccess;

function isSkillGapError(x: unknown): x is SkillGapApiError {
  return isRecord(x) && typeof x["error"] === "string";
}

function isSkillGapConfirmation(x: unknown): x is SkillGapConfirmation {
  return (
    isRecord(x) &&
    x["requiresConfirmation"] === true
  );
}

function isSkillGapSuccess(x: unknown): x is SkillGapSuccess {
  return isRecord(x) && "analysisId" in x;
}


export default function SkillGapPage() {

  // Add near other states
  const [currentUser, setCurrentUser] = useState<{ firstName?: string; lastName?: string; username?: string } | null>(null);

  // Resolve display name similar to your ProfileCard
  function resolveName(u: { firstName?: string; lastName?: string; username?: string } | null) {
    if (!u) return '';
    const full = `${(u.firstName || '').trim()} ${(u.lastName || '').trim()}`.trim();
    return full || u.username || '';
  }

  // function getUsername(u?: { username?: string } | null) {
  //   return (u?.username || localStorage.getItem("username") || "").trim();
  // }


  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: { ...authHeader() },
        });
        if (!res.ok) throw new Error('Failed to load profile');
        const u = (await res.json()) as { firstName?: string; lastName?: string; username?: string };
        if (!cancelled) setCurrentUser(u || null);

        // STEP 2: Persist username so other pages can read it
        if (u?.username) {
          localStorage.setItem("username", u.username);
        }

      } catch (e) {
        // optional: console.warn('Profile fetch failed', e);
        setCurrentUser(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BackendResponse | null>(null);

  const [showGate, setShowGate] = useState(true);
  const [picking, setPicking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Warning modal state
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string>("");
  const [reuseId, setReuseId] = useState<number | null>(null);
  const [similarity, setSimilarity] = useState<number>(0);

  // SkillGapPage states ke saath yeh bhi add karein:
  const [jobsLoading, setJobsLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);


  // --- Staged loading messages (heavy English) ---
  const STAGES: { label: string; minMs: number }[] = [
    { label: "Extracting raw text from uploaded résumé…", minMs: 1600 },
    { label: "Normalizing entities & harmonizing skill tokens…", minMs: 1600 },
    { label: "Orchestrating AI inference across semantic layers…", minMs: 1600 },
    { label: "Synthesizing report artifacts & actionable insights…", minMs: 1800 },
    { label: "Finalizing layout & preparing export pipeline…", minMs: 1200 }, // last stage
  ];

  const [stageIndex, setStageIndex] = useState(0);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    // Reset stages when loading starts
    if (loading) {
      setStageIndex(0);

      // Sequentially walk through STAGES with fixed durations.
      // Keep the last stage visible until loading finishes.
      const runStages = async () => {
        for (let i = 0; i < STAGES.length - 1; i++) {
          await new Promise<void>((resolve) => {
            stageTimerRef.current = setTimeout(() => {
              setStageIndex((prev) => Math.min(prev + 1, STAGES.length - 1));
              resolve();
            }, STAGES[i].minMs);
          });
        }
        // Now we are at the final stage (index = STAGES.length - 1).
        // Do nothing here—stay on the last stage until `loading` flips false.
      };

      runStages().catch(() => void 0);
    }

    // Cleanup timers on unmount or when loading flips
    return () => {
      if (stageTimerRef.current) {
        clearTimeout(stageTimerRef.current);
        stageTimerRef.current = null;
      }
    };
  }, [loading]);

  // If you have auth, replace this with real username
  // const username = "Hafsa";

  // const username = "Hafsa";
  const username = resolveName(currentUser) || 'User';
  const loginUsername = (
    currentUser?.username ||
    localStorage.getItem("username") ||
    "").trim();

  const displayName =
    resolveName(currentUser) ||
    loginUsername ||
    "User";


  // const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
  const canSubmit = !!file && role.trim().length > 0;

  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const startFakeProgress = () => {
    setUploadProgress(10);
    progressTimer.current = setInterval(() => {
      setUploadProgress((p) => (p >= 85 ? 85 : p + Math.random() * 10));
    }, 400);
  };
  const stopFakeProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 800);
  };

  // Analyze (normal)


  const onGenerate = async () => {
    if (!file || !role) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setUploadProgress(0);
    startFakeProgress();

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("role", role);
      //     const uname = getUsername(currentUser);
      // fd.append("username", uname);

      fd.append("username", loginUsername); // 👈 IMPORTANT

      const res = await fetch(`${API_BASE}/api/resume/skill_gap`, {
        method: "POST",
        headers: authHeader(),
        body: fd,
        credentials: "omit",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      const text = await res.text();
      const parsed = parseJsonSafe<SkillGapApiResponse>(text);

      stopFakeProgress();

      if (!parsed) throw new Error("Invalid JSON returned from server.");

      if (!res.ok) {
        if (isSkillGapError(parsed)) throw new Error(parsed.error);
        throw new Error(`HTTP ${res.status}`);
      }

      if (isSkillGapConfirmation(parsed)) {
        setWarningMsg(parsed.message ?? "CV looks similar. Continue?");
        setReuseId(parsed.reuseAnalysisId ?? null);
        setSimilarity(parsed.similarity ?? 0);
        setWarningOpen(true);
        return;
      }

      if (isSkillGapSuccess(parsed)) {
        setResult(parsed);
        return;
      }

      throw new Error("Unexpected Skill Gap response shape.");
    } catch (err: unknown) {
      stopFakeProgress();
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };





  // Continue (force=true)


  const onContinue = async () => {
    if (!file || !role) return;
    setWarningOpen(false);
    setLoading(true);
    setError(null);
    startFakeProgress();

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("role", role);
      fd.append("username", loginUsername); // 👈 IMPORTANT
      //     const uname = getUsername(currentUser);
      // fd.append("username", uname);

      fd.append("force", "true");
      if (reuseId !== null) fd.append("overwriteId", String(reuseId));

      const res = await fetch(`${API_BASE}/api/resume/skill_gap`, {
        method: "POST",
        headers: authHeader(),
        body: fd,
        credentials: "omit",
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      const text = await res.text();
      const parsed = parseJsonSafe<SkillGapApiResponse>(text);

      stopFakeProgress();

      if (!parsed) throw new Error("Invalid JSON returned from server.");

      if (!res.ok) {
        if (isSkillGapError(parsed)) throw new Error(parsed.error);
        throw new Error(`HTTP ${res.status}`);
      }

      if (isSkillGapSuccess(parsed)) {
        setResult(parsed);
        return;
      }

      throw new Error("Unexpected Skill Gap response shape.");
    } catch (err: unknown) {
      stopFakeProgress();
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };



  // Reuse
  const onReuse = async () => {
    if (!reuseId) return;
    setWarningOpen(false);
    setLoading(true);
    setError(null);
    startFakeProgress();

    try {
      const data = await reuseSkillGap(reuseId);
      stopFakeProgress();
      setResult(data);
    } catch (err: unknown) {
      stopFakeProgress();
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // 🔸 Export PDF: download to user + upload to Spring to save pdfPath; then update UI


  // const onExportPdf = async () => {
  //   try {
  //     if (!result) return setError("No analysis available to export.");
  //     const id = getAnalysisId(result);
  //     if (!id) return setError("Missing analysisId in result.");

  //     const reportEl = document.getElementById("skill-gap-report-root");
  //     const html = reportEl?.outerHTML || document.documentElement.outerHTML;

  //     const fileName = `skill-gap-${role.replace(/\s+/g, "-")}-${new Date()
  //       .toISOString()
  //       .replace(/[:.]/g, "-")}.pdf`;

  //     // 1) Generate & save on Next server
  //     const exportRes = await fetch("/api/export", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ html, fileName }),
  //     });
  //     if (!exportRes.ok) throw new Error(await exportRes.text());
  //     const { publicUrl, savedPath } = await exportRes.json();

  //     // 2) User view/download (inline open)
  //     window.open(publicUrl, "_blank");

  //     // 3) Update DB path (Spring)
  //     const backend = process.env.NEXT_PUBLIC_BACKEND_URL!;
  //     const updRes = await fetch(`${backend}/api/resume/skill_gap/${id}/pdf-path`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ pdfPath: savedPath }), // << server filesystem path
  //     });
  //     const upd = await updRes.json();
  //     if (!updRes.ok || upd?.error) throw new Error(upd?.error || "Failed to set pdfPath");

  //     // 4) Update UI link
  //     setResult((prev) => (prev ? { ...prev, pdfUrl: upd.pdfUrl || prev.pdfUrl || null } : prev));
  //   } catch (err) {
  //     setError(getErrorMessage(err));
  //   }
  // };
  // ;



  type SkillGapResult = {
    strongSkills?: string[];
    weakSkills?: string[];
    missingSkills?: string[];

    // fallback keys (if present in some responses)
    strong?: string[];
    weak?: string[];
    missing?: string[];
  };


  const onSeeRecommendedJobs = () => {
    if (!result) return;
    const skills = extractSkillsFromResult(result);
    // Save for Jobs page to consume
    sessionStorage.setItem("sg-skills", JSON.stringify(skills));
    // Optional: clear any previous jobs bundle to force fresh load
    sessionStorage.removeItem("jobs-last-rec-id");
    sessionStorage.removeItem("jobs-last-bundle");
    // Navigate – Jobs page will read sg-skills and call backend
    window.location.href = `/job-recommendation?from=skill-gap`;
  };



  return (
    <main className="min-h-screen px-6 py-6 overflow-x-hidden" style={{ backgroundColor: "#a8e6cf" }}>
      {/* Top bar */}

      <div className="mb-12 flex items-center justify-between">

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-[#3D418A]/60 hover:text-[#3D418A] transition-colors font-black text-xs tracking-widest uppercase  group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* <UnderHeaderGlassStripAuto
    hint="You’re signed in"
    dense={false}      // chhota height chahiye to true
  /> */}


        <GlassProfileBadgeAuto
          align="right"
          showName={true}     // sirf photo chahiye to false
          tooltip="Signed in"
        />

      </div>


      <main className="max-w-6xl mx-auto px-5 pb-12">
        {/* Heading */}
        {!showGate && result && !loading && !error && (
          <div className="mb-6">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tight" style={{ color: "#3D418A" }}>
              SKILL GAP REPORT
              {/* {username ? ` — ${username}` : ''} */}
            </h1>
            <p className="mt-2 text-[#3D418A]/70 font-semibold">
              Compare your current skills with your desired role. Below is your personalized analysis and recommendations.
            </p>

            {/* 🔸 Export PDF button */}
            {/* <div className="mt-4">
              <Button
                onClick={onExportPdf}
                className="inline-flex items-center gap-2 bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white"
              >
                <Download size={16} />
                Export as PDF
              </Button>
            </div> */}
          </div>
        )}

        {/* Gate Overlay */}
        <AnimatePresence>
          {showGate && (
            <motion.div
              key="cv-gate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/10 backdrop-blur-md" />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                className="relative z-10 w-full max-w-lg"
              >
                <Card>
                  <div className="p-6 text-center">
                    <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#3D418A" }}>
                      Do you have a CV?
                    </h2>
                    <p className="text-[#3D418A]/70 mb-6 font-semibold">
                      We’ll analyze your resume against your target role and show gaps instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setShowGate(false)}
                        className="bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white transition-all"
                      >
                        Yes, see Skill Gap report
                      </Button>
                      <Link
                        href="/resume-builder"
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        <Button variant="secondary">No, make a CV</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning Modal */}
        <AnimatePresence>
          {warningOpen && (
            <motion.div
              key="warn-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setWarningOpen(false)} />
              <motion.div
                initial={{ y: 12, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -8, scale: 0.98, opacity: 0 }}
                className="relative z-10 w-full max-w-md"
              >
                <Card className="rounded-xl border-4 border-[#4B0082] bg-[#F7F1FF]">
                  <div className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-[#3D418A]" size={28} />
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: "#3D418A" }}>
                          Looks similar to a previous CV
                        </h3>
                        <p className="text-[#3D418A]/80 mt-1">
                          {warningMsg} {similarity ? `(~${Math.round(similarity * 100)}% match)` : null}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={onReuse}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-white border text-[#3D418A] hover:bg-purple-50"
                        variant="secondary"
                      >
                        <RotateCcw size={16} /> Reuse previous
                      </Button>
                      <Button
                        onClick={onContinue}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white"
                      >
                        <Play size={16} /> Continue anyway
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>

          {loading && !showGate && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-6"
            >
              {/* Spinner */}
              <Loader2 className="w-16 h-16 text-[#3D418A] animate-spin" />

              {/* Staged message */}
              <motion.p
                key={stageIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-[#3D418A] font-black tracking-[0.3em] uppercase text-[10px] text-center"
                style={{ letterSpacing: '0.3em' }}
              >
                {STAGES[stageIndex].label}
              </motion.p>

              {/* Progress bar (optional: keep your existing logic) */}
              {uploadProgress > 0 && (
                <div className="w-64 h-2 rounded-full bg-[#3D418A]/10 overflow-hidden">
                  <div
                    className="h-full bg-[#3D418A] transition-[width] duration-300"
                    style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
          )}


        </AnimatePresence>

        {/* Jobs loading (when CTA is clicked) */}
        <AnimatePresence>
          {jobsLoading && (
            <motion.div
              key="jobs-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-black/10 backdrop-blur-sm"
            >
              <Loader2 className="w-16 h-16 text-[#3D418A] animate-spin" />
              <p className="text-[#3D418A] font-black tracking-[0.3em] uppercase text-[10px]">
                Finding jobs…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {roadmapLoading && (
            <motion.div
              key="roadmap-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex flex-col items-center justify-center py-40 gap-6 bg-white/30 backdrop-blur-md"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-[#3D418A] animate-spin" />
                <div className="absolute inset-0 blur-xl bg-white/30 animate-pulse" />
              </div>

              <p className="text-[#3D418A] font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">
                Architecting Career Pathway...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {!showGate && !loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center gap-6"
          >
            <AlertCircle className="w-12 h-12 text-red-600" />
            <h3 className="text-2xl font-black" style={{ color: "#3D418A" }}>
              Something went wrong
            </h3>
            <p className="text-[#3D418A]/70 max-w-sm">{error}</p>
            <Button onClick={onGenerate}>Retry</Button>
          </motion.div>
        )}

        {/* Form */}
        {!showGate && !loading && !error && !result && (
          <motion.div key="form-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
            <Card className="rounded-4xl">
              <div className="mt-20 p-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: "#3D418A" }}>
                  Tell us about your target role and upload your resume
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold block mb-2" style={{ color: "#3D418A" }}>
                      Destination Role
                    </label>
                    <RoleInput value={role} onChange={setRole} />
                  </div>

                  <div>
                    <FilePicker
                      onFileSelected={(f) => setFile(f)}
                      onPickStart={() => { setPicking(true); }}
                      onPickEnd={() => { setTimeout(() => setPicking(false), 300); }}
                      className="min-h-180px flex flex-col justify-center h-60"
                    />
                    {picking && (
                      <div className="mt-3 w-full h-2 bg-[#2ED3A6]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2ED3A6] animate-[progress_1.2s_ease_infinite]" />
                      </div>
                    )}
                    <style jsx>{`
                      @keyframes progress {
                        0% { transform: translateX(-100%); width: 40%; }
                        50% { transform: translateX(20%); width: 60%; }
                        100% { transform: translateX(100%); width: 40%; }
                      }
                      .animate-[progress_1.2s_ease_infinite] {
                        animation: progress 1.2s ease-in-out infinite;
                      }
                    `}</style>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Button
                    disabled={!canSubmit}
                    onClick={onGenerate}
                    className={[
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white',
                      'transition-all duration-150 hover:shadow-md active:scale-[.99]',
                    ].join(' ')}
                  >
                    OK, Generate Report
                  </Button>

                  {!canSubmit && (
                    <span className="text-xs text-[#3D418A]/70">Select a file and enter role to continue</span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Report Screen */}
        {!showGate && !loading && !error && result && (
          <motion.div key="report-screen" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <div
              className="rounded-2xl p-5 sm:p-6 md:p-7 border"
              style={{ backgroundColor: "#F7F1FF", borderColor: "#4B0082", borderWidth: "5px" }}
            >
              {/* ⬇ Give Report a wrapper id so we can capture its HTML for PDF */}
              <div id="skill-gap-report-root">
                <Report data={result} role={role} userName={username} />
              </div>



              {/* CTA visible only when result exists (we're inside that conditional) */}
              <div className="mt-6 flex gap-3">


                <Button variant="secondary"

                  onClick={async () => {
                    try {

                      setJobsLoading(true);

                      // 1) SAME resume file user uploaded on Skill-Gap form
                      if (!file) {
                        setJobsLoading(false);
                        alert("Resume file not found. Please re-upload your resume to fetch jobs.");
                        return;
                      }

                      // 2) Send resume file to the SAME endpoint used by drag & drop
                      const fd = new FormData();
                      fd.append("file", file, file.name);

                      const res = await fetch("/api/job-recommendation", {
                        method: "POST",
                        headers: authHeader(),
                        body: fd,
                      });

                      const text = await res.text();
                      let parsed: unknown = null;
                      try {
                        parsed = JSON.parse(text);
                      } catch {
                        throw new Error("Invalid JSON response from server.");
                      }

                      if (!res.ok) {
                        // If server returns { error: "..." }
                        const errObj = parsed as { error?: unknown };
                        const msg =
                          errObj && typeof errObj.error === "string"
                            ? errObj.error
                            : `Failed with status ${res.status}`;
                        throw new Error(msg);
                      }

                      if (!isRecommendBundle(parsed)) {
                        throw new Error("Unexpected response shape from server.");
                      }

                      const bundle = parsed; // type narrowed to RecommendBundle

                      // 3) Persist for Jobs page (so it can render immediately)
                      sessionStorage.setItem("jobs-last-bundle", JSON.stringify(bundle));
                      if (bundle.recId) {
                        sessionStorage.setItem("jobs-last-rec-id", bundle.recId);
                      }

                      // 4) Navigate — from=skill-gap (no drag/drop, no blur); recId appended only if present
                      window.location.href = `/job-recommendation?from=skill-gap${bundle.recId ? `&recId=${encodeURIComponent(bundle.recId)}` : ""
                        }`;
                    } catch (e) {
                      const msg =
                        e instanceof Error ? e.message : typeof e === "string" ? e : "Could not fetch jobs.";
                      alert(msg as string);
                    }
                  }}

                  className="inline-flex items-center gap-2 bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white"
                >
                  See recommended jobs
                </Button>




                <Button variant="secondary"
                  onClick={async () => {
                    try {
                      setRoadmapLoading(true);
                      // Call your existing endpoint — send only username; role omitted (so backend picks latest)
                      const res = await fetch(`${API_BASE}/api/roadmap/generate-from-db-ui`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          ...authHeader(),
                        },
                        body: JSON.stringify({ username: loginUsername, role }) // role intentionally omitted
                      });

                      const text = await res.text();
                      const data = text ? JSON.parse(text) : null;

                      if (!res.ok) {
                        alert(data?.error || "Unable to generate roadmap. Please run Skill Gap first.");
                        return;
                      }

                      // Cache for instant display on /roadmap
                      sessionStorage.setItem("last-roadmap", JSON.stringify(data.roadmap || []));
                      sessionStorage.setItem("last-roadmap-role", data.role || role || ""); // may be ""
                      // Fix missing data.loginUsername since the backend payload likely only echoes the standard `username`
                      sessionStorage.setItem("last-roadmap-username", data.username || loginUsername);

                      // Navigate to Roadmap page (without role param; page will read from session)
                      window.location.href = `/roadmap`;
                    } catch (e: unknown) {
                      const msg = e instanceof Error ? e.message : "Failed to generate roadmap from DB.";
                      alert(msg);
                    } finally {
                      setRoadmapLoading(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-[#3D418A] hover:bg-[#2F336F] active:bg-[#292D66] text-white"
                >
                  Generate Roadmap
                </Button>




              </div>
            </div>
          </motion.div>
        )}

      </main>
    </main>
  );
}
