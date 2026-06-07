
package com.career.skillanalyzer.service.skill;


import com.career.skillanalyzer.Model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.career.skillanalyzer.Model.Resume;
import com.career.skillanalyzer.Model.SkillGapAnalysis;
import com.career.skillanalyzer.repository.ResumeRepository;
import com.career.skillanalyzer.repository.SkillGapAnalysisRepository;
import com.career.skillanalyzer.service.ai.GeminiService;
import com.career.skillanalyzer.service.cv.TextService;
//import com.career.skillanalyzer.util.HashUtil;
import com.career.skillanalyzer.util.JsonCleaner;
//import com.career.skillanalyzer.util.SemanticHashUtil;
// 🔸 NEW
//import com.career.skillanalyzer.util.SimHashUtil;
// 🔸 NEW
import com.career.skillanalyzer.service.skill.SimilarResumeFound;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.lang.reflect.Type;
import java.time.LocalDateTime;
import java.util.*;

/**
 * SkillGapService:
 * - Exact reuse: same resume + role
 * - Semantic reuse: same meaning skills + role
 * - Similarity warning: if new CV ~80% similar to an existing analysis (same role)
 * - Else: AI call (Gemini) and persist
 * - PDF generation is NOT here (frontend via Puppeteer). PDF upload endpoint will update pdfPath separately.
 */
@Service
public class SkillGapService {

    private final GeminiService geminiService;
    private final TextService textService;
    private final SkillExtractionService skillExtractionService;
    private final ResumeRepository resumeRepo;
    private final SkillGapAnalysisRepository sgaRepo;
    private final Gson gson = new Gson();

    public SkillGapService(GeminiService geminiService,
                           TextService textService,
                           SkillExtractionService skillExtractionService,
                           ResumeRepository resumeRepo,
                           SkillGapAnalysisRepository sgaRepo) {
        this.geminiService = geminiService;
        this.textService = textService;
        this.skillExtractionService = skillExtractionService;
        this.resumeRepo = resumeRepo;
        this.sgaRepo = sgaRepo;
    }


    /**
     * Entry-point if Controller receives a file.
     * Extracts text + skills, then calls core logic.
     * NOTE: force=false by default (so that similarity warning can trigger).
     */
    public SkillGapAnalysis analyzeAndPersistFromFile(MultipartFile file,
                                                      String targetRole,
                                                      User user) {
        return analyzeAndPersistFromFile(file, targetRole, user, false, null);
    }

    // NEW overload with force
    public SkillGapAnalysis analyzeAndPersistFromFile(MultipartFile file,
                                                      String targetRole,
                                                      User user,
                                                      boolean force,
                                                      Long overwriteId) {
        if (user == null) {
            throw new RuntimeException("Unauthenticated user");
        }
        try {
            // 1) Extract resume text (in-memory only; NOT stored in DB)
            String resumeText = extractResumeText(file);

            // 2) Extract categorized skills
            Object extracted = skillExtractionService.extractSkills(resumeText);
            Map<String, List<String>> categorizedSkills = normalizeToMap(extracted);

            // 3) Delegate to core with force
            return analyzeAndPersistCore(
                    resumeText,
                    file.getOriginalFilename(),
                    targetRole,
                    categorizedSkills,
                    user.getUsername(),
                    force,
                    overwriteId // 🔸 pass force
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to process CV: " + e.getMessage(), e);
        }
    }


    /**
     * CORE: Reuse (exact/semantic), similarity warning, or run AI; then persist.
     * PROMPT is unchanged.
     */
    public SkillGapAnalysis analyzeAndPersistCore(String resumeText,
                                                  String fileName,
                                                  String targetRole,
                                                  Map<String, List<String>> categorizedSkills,
                                                  String username,
                                                  boolean force,
                                                  Long overwriteId) { // 🔸 NEW param
//        if (force && overwriteId != null) {
//            sgaRepo.deleteById(overwriteId);
//        }

        // 🔹 Flatten skills (for semantic hash)
//        List<String> allSkills = new ArrayList<>();
//        if (categorizedSkills != null) {
//            categorizedSkills.values().forEach(list -> {
//                if (list != null) allSkills.addAll(list);
//            });
//        }

        // 1) Compute resume hash + simhash64 (no text stored)
//        String normalized = (resumeText == null) ? "" : resumeText.trim();
//        String resumeHash = HashUtil.sha256(normalized);
//        String simhash64 = SimHashUtil.simhash64Hex(normalized); // 🔸 NEW

        // 2) Upsert Resume (store only hashes + filename)
//        Resume resume = resumeRepo.findByResumeHash(resumeHash)
//                .orElseGet(() -> {
//                    Resume r = new Resume();
//                    r.setResumeHash(resumeHash);
//                    r.setFileName(fileName);
//                    // 🔸 NEW
//                    r.setSimhash64(simhash64);
//                    return resumeRepo.save(r);
//                });

        // 🔸 NEW: backfill simhash if previously null
//        if (resume.getSimhash64() == null || resume.getSimhash64().isBlank()) {
//            resume.setSimhash64(simhash64);
//            resumeRepo.save(resume);
//        }

        // 3) Exact reuse: same resume + role
//        Optional<SkillGapAnalysis> exact =
//                sgaRepo.findByResume_IdAndTargetRole(resume.getId(), targetRole);
//        if (exact.isPresent()) {
//            return exact.get();
//        }

        // 3.5) 🔸 NEW: Similarity warning (>= 0.80) for same role analyses (only if not force)
//        if (!force) {
//            // requires repo method findTop50ByTargetRoleOrderByCreatedAtDesc (see note below)
//            List<SkillGapAnalysis> recent = sgaRepo.findTop50ByTargetRoleOrderByCreatedAtDesc(username, targetRole);
//            SkillGapAnalysis best = null;
//            double bestSim = 0.0;
//
//            for (SkillGapAnalysis sga : recent) {
//                Resume other = sga.getResume();
//                if (other == null || other.getSimhash64() == null) continue;
//                int hamming = SimHashUtil.hammingDistanceHex64(simhash64, other.getSimhash64());
//                double sim = SimHashUtil.similarityFromHamming(hamming);
//                if (sim > bestSim) { bestSim = sim; best = sga; }
//            }
//
//            if (!force && best != null && bestSim >= 0.80) {
////                 Controller should catch this and show warning to user
//                throw new SimilarResumeFound(best.getId(), bestSim);
//            }
//        }

        // 4) Semantic hash (skills + role) → semantic reuse
//        String semanticHash = SemanticHashUtil.generate(allSkills, targetRole);
//        Optional<SkillGapAnalysis> similar =
//                sgaRepo.findBySemanticHashAndTargetRole(semanticHash, targetRole);
//        if (similar.isPresent()) {
//            return similar.get();
//        }

        // 5) Run AI (STRICT JSON) — PROMPT UNCHANGED
        Map<String, Object> ai = generateSkillGap(targetRole, categorizedSkills);

        // 6) Prepare fields for persistence (same as your previous logic)
//        String extractedSkillsJson = gson.toJson(allSkills);

        List<String> strong = toStringList(ai.get("strongSkills"));
        List<String> weak = toStringList(ai.get("weakSkills"));
        List<String> missing = toStringList(ai.get("missingSkills"));


//        List<String> matched = new ArrayList<>();
//        if (strong != null) matched.addAll(strong);
//        if (weak != null) matched.addAll(weak);

//        String matchedSkillsJson = gson.toJson(matched);
        String strongSkillsJson = gson.toJson(strong);
        String weakSkillsJson = gson.toJson(weak);
        String missingSkillsJson = gson.toJson(missing);
        String advice = String.valueOf(ai.get("improvementAdvice"));
        double matchPercentage = Double.parseDouble(ai.get("matchPercentage").toString());

//        String match_percentage = gson.toJson(ai.get("matchPercentage"));

        String aiResponseJson = gson.toJson(ai);

        // 7) Persist new SkillGapAnalysis (unchanged fields, so UI can parse from aiResponse)
        SkillGapAnalysis sga = new SkillGapAnalysis();
//        sga.setResume(resume);
        sga.setTargetRole(targetRole);
//        sga.setSemanticHash(semanticHash);

//        sga.setExtractedSkills(extractedSkillsJson);
//        sga.setMatchedSkills(matchedSkillsJson);
        sga.setStrongSkills(strongSkillsJson);
        sga.setWeakSkills(weakSkillsJson);
        sga.setMissingSkills(missingSkillsJson);
        sga.setImprovementAdvice(advice);
        sga.setMatchPercentage((matchPercentage));
//        sga.setAiResponse(aiResponseJson);
        sga.setUsername(username);
//        sga.setUsername("Hafsa");

        sga.setPdfPath(null);
        sga.setPdfGeneratedAt(null);
        sga.setCreatedAt(LocalDateTime.now());

//        SkillGapAnalysis saved = sgaRepo.save(sga);

        // If you need the id here for logging or follow-up actions:
//         Long id = saved.getId();
//        log.info("New SkillGapAnalysis ID: {}", id);

//        return saved;

        return sgaRepo.save(sga);
    }

    /**
     * PROMPT UNCHANGED
     * Returns keys: strongSkills[], weakSkills[], missingSkills[], matchPercentage, improvementAdvice
     */
    public Map<String, Object> generateSkillGap(String targetRole,
                                                Map<String, List<String>> categorizedSkills) {

        // 🔹 Flatten skills (VERY IMPORTANT)
        List<String> allSkills = new ArrayList<>();
        if (categorizedSkills != null) {
            categorizedSkills.values().forEach(list -> {
                if (list != null) allSkills.addAll(list);
            });
        }

        // Safety: if no skills extracted
        if (allSkills.isEmpty()) {
            return Map.of(
                    "strongSkills", List.of(),
                    "weakSkills", List.of(),
                    "missingSkills", List.of(),
                    "matchPercentage", 0,
                    "improvementAdvice",
                    "No professional skills were detected in the CV. Please add relevant experience, education, or certifications."
            );
        }

        String prompt =
                "You are a STRICT skill gap analysis engine.\n\n" +
                        "Target Role: " + targetRole + "\n\n" +
                        "Candidate Skills (ONLY these skills exist):\n" +
                        allSkills + "\n\n" +
                        "Rules:\n" +
                        "- Do NOT invent or assume any skills\n" +
                        "- Only evaluate based on the provided skills\n" +
                        "- If a required skill is missing, list it under missingSkills\n" +
                        "- Weak skills = partially relevant or basic-level skills\n" +
                        "- Strong skills = clearly relevant and sufficient\n\n" +
                        "Return ONLY raw JSON with this exact structure:\n\n" +
                        "{\n" +
                        "  \"strongSkills\": [],\n" +
                        "  \"weakSkills\": [],\n" +
                        "  \"missingSkills\": [],\n" +
                        "  \"matchPercentage\": 0,\n" +
                        "  \"improvementAdvice\": \"\"\n" +
                        "}";

        String aiRaw = JsonCleaner.clean(geminiService.generate(prompt));

        Type responseType = new TypeToken<Map<String, Object>>() {
        }.getType();
        // ✅ WRAP JSON PARSING IN TRY/CATCH
        try {
            return gson.fromJson(aiRaw, responseType);
        } catch (Exception e) {
            System.err.println("Malformed JSON from Gemini AI, returning safe defaults:");
            System.err.println(aiRaw);
            // return safe default structure
            return Map.of(
                    "strongSkills", List.of(),
                    "weakSkills", List.of(),
                    "missingSkills", List.of(),
                    "matchPercentage", 0,
                    "improvementAdvice",
                    "Sorry, the AI returned invalid JSON. Please try again or check your resume."
            );
//            return gson.fromJson(aiRaw, responseType);
        }
    }


    // --------------------
    // helpers
    // --------------------

    private String extractResumeText(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        try {
            if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                return textService.extractText(file);   // handle any checked thrown by this
            } else if (filename != null && filename.toLowerCase().endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
                    return textService.extractText(doc);
                }
            }
        } catch (Exception e) {
            // Wrap & enrich
            throw new RuntimeException("Resume text extraction failed for file: " + filename + " (" + e.getClass().getSimpleName() + ")", e);
        }
        throw new RuntimeException("Unsupported file type: " + filename);
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> normalizeToMap(Object extracted) {
        if (extracted instanceof Map<?, ?> map) {
            Map<String, List<String>> out = new HashMap<>();
            for (Map.Entry<?, ?> e : map.entrySet()) {
                String key = String.valueOf(e.getKey());
                Object v = e.getValue();
                List<String> arr = new ArrayList<>();
                if (v instanceof List<?> list) {
                    for (Object o : list) arr.add(String.valueOf(o));
                } else if (v != null) {
                    arr.add(String.valueOf(v));
                }
                out.put(key, arr);
            }
            return out;
        }
        // if your SkillExtractionService ever returns List<String> directly
        if (extracted instanceof List<?> list) {
            return Map.of("skills", list.stream().map(String::valueOf).toList());
        }
        return Map.of("skills", List.of());
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object o) {
        if (o == null) return List.of();
        if (o instanceof List<?> list) {
            List<String> out = new ArrayList<>();
            for (Object it : list) out.add(String.valueOf(it));
            return out;
        }
        try {
            // If AI returned JSON string inside string (rare), try parse:
            return gson.fromJson(String.valueOf(o), List.class);
        } catch (Exception ignore) {
            return List.of();
        }
    }
}
