
// Existing
export type SkillGap = {
  strongSkills?: string[];
  weakSkills?: string[];
  missingSkills?: string[];
  matchPercentage?: number;
  improvementAdvice?: string;
};

export type BackendResponse = {
  cvSkills?: Record<string, string[]>;
  skillGap?: unknown;
  error?: string;

  
  // already returned by backend:
  analysisId?: number;
  targetRole?: string;
  pdfUrl?: string | null;
  createdAt?: string | null;

  // 🔹 NEW: warning pass-through
  requiresConfirmation?: boolean;
  message?: string;
  reuseAnalysisId?: number;
  similarity?: number; // 0..1
};

// Value may come as stringified JSON ("[...]") or as an array
export type StringOrArray = string | string[] | null | undefined;

export type AnalyzeResponseRaw = {
  analysisId: number;
  targetRole: string;
  extractedSkills: StringOrArray;
  matchedSkills: StringOrArray;
  missingSkills: StringOrArray;
  pdfUrl?: string | null;
  createdAt?: string | null;
  error?: string;

  // (optional if backend starts returning them later)
  strongSkills?: StringOrArray;
  weakSkills?: StringOrArray;
  improvementAdvice?: string;
  matchPercentage?: number;
};

// Fully normalized (UI-friendly)
export type AnalyzeResponse = {
  analysisId: number;
  targetRole: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  pdfUrl?: string | null;
  createdAt?: string | null;
};

