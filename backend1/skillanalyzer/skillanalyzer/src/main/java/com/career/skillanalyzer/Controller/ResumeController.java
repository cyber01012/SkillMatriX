
package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.Model.SkillGapAnalysis;
import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.repository.SkillGapAnalysisRepository;
import com.career.skillanalyzer.repository.UserRepository;
import com.career.skillanalyzer.service.skill.SkillGapService;
import com.career.skillanalyzer.service.skill.SimilarResumeFound;
//import com.career.skillanalyzer.util.FileStorageUtil;
import com.google.common.reflect.TypeToken;
import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.StringReader;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/resume")
public class ResumeController {

    private final SkillGapService skillGapService;
    private final SkillGapAnalysisRepository sgaRepo;
    private final Gson gson = new Gson();

    public ResumeController(SkillGapService skillGapService,
                            SkillGapAnalysisRepository sgaRepo) {
        this.skillGapService = skillGapService;
        this.sgaRepo = sgaRepo;
    }

    @Autowired
    private UserRepository userRepository;


    @PostMapping("/skill_gap")
    public ResponseEntity<?> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("role") String role,
            @RequestParam(value = "force", defaultValue = "false") boolean force,
            @RequestParam(value = "overwriteId", required = false) Long overwriteId,
            @AuthenticationPrincipal String userId   // 🔥 REAL USER
    )
    {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(401).body(
                    Map.of("error", "User not authenticated")
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            SkillGapAnalysis sga =
                    skillGapService.analyzeAndPersistFromFile(
                            file, role, user, force, overwriteId
                    );

            return ResponseEntity.ok(toUiPayload(sga));

        } catch (SimilarResumeFound warn) {
            return ResponseEntity.ok(Map.of(
                    "requiresConfirmation", true,
                    "reuseAnalysisId", warn.getReuseAnalysisId(),
                    "similarity", warn.getSimilarity(),
                    "message", "CV looks similar. Reuse previous report?"
            ));
        }
    }



    // Reuse choose kiya ho to directly DB -> UI
//    @GetMapping("/skill_gap/reuse/{id}")
//    public ResponseEntity<?> reuseExisting(@PathVariable Long id) {
//        SkillGapAnalysis sga = sgaRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Analysis not found"));
//        return ResponseEntity.ok(toUiPayload(sga));
//    }

//    @PostMapping("/skill_gap/{id}/pdf")
//    public ResponseEntity<?> uploadSkillGapPdf(
//            @PathVariable Long id,
//            @RequestParam("file") MultipartFile pdf,
//            @RequestParam(value = "username", required = false) String username,
//            @RequestParam(value = "role", required = false) String role
//    ) throws Exception {
//        SkillGapAnalysis sga = sgaRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Analysis not found"));
//
//        if (role == null || role.isBlank()) role = sga.getTargetRole();
//
//        var now = LocalDateTime.now();
//        Path dir = FileStorageUtil.resolveUserDir("skill-gap", username);
//        String fileName = FileStorageUtil.buildPdfFileName(username, role, now);
//        Path saved = FileStorageUtil.saveBytes(pdf.getBytes(), dir, fileName);
//
//        sga.setPdfPath(saved.toAbsolutePath().toString()); // same as your current way
//        sga.setPdfGeneratedAt(now);
//        sgaRepo.save(sga);
//
//        return ResponseEntity.ok(Map.of(
//                "pdfUrl", "/api/resume/skill_gap/" + id + "/pdf",
//                "fileName", saved.getFileName().toString()
//        ));
//    }



    @PostMapping("/skill_gap/{id}/pdf-path")
    public ResponseEntity<?> setPdfPath(@PathVariable Long id, @RequestBody Map<String,String> body) {
        String pdfPath = body.get("pdfPath");
        System.out.println("PDF PATH = " + pdfPath);

        if (pdfPath == null || pdfPath.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "pdfPath is required"));
        }

        int updated = sgaRepo.updatePdfPathById(id, pdfPath);
        if (updated == 0) return ResponseEntity.status(404).body(Map.of("error", "Analysis not found"));
        return ResponseEntity.ok(Map.of(
                "analysisId", id,
                "pdfPath", pdfPath,
                "pdfUrl", "/api/resume/skill_gap/" + id + "/pdf" // your existing GET
        ));
    }

//    @GetMapping("/skill_gap/{id}/pdf")
//    public ResponseEntity<?> getSkillGapPdf(@PathVariable Long id) throws Exception {
//        SkillGapAnalysis sga = sgaRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Analysis not found"));
//
//        if (sga.getPdfPath() == null) {
//            return ResponseEntity.status(404).body("PDF not generated yet");
//        }
//        Path path = Path.of(sga.getPdfPath());
//        byte[] bytes = Files.readAllBytes(path);
//
//        return ResponseEntity.ok()
//                .header("Content-Type", "application/pdf")
//                .header("Content-Disposition", "inline; filename=\"" + path.getFileName() + "\"")
//                .body(bytes);
//    }

    // NEW: listing by user (date-time + link)
//    @GetMapping("/skill_gap/list")
//    public ResponseEntity<?> listByUser(@RequestParam("username") String username) {
//        List<SkillGapAnalysis> items = sgaRepo.findByUsernameOrderByCreatedAtDesc(username);
//        List<Map<String,Object>> out = new ArrayList<>();
//        for (SkillGapAnalysis s : items) {
//            Map<String,Object> row = new LinkedHashMap<>();
//            row.put("analysisId", s.getId());
//            row.put("username", s.getUsername());
//            row.put("targetRole", s.getTargetRole());
//            row.put("createdAt", s.getCreatedAt());
//            row.put("pdfUrl", s.getPdfPath() != null ? "/api/resume/skill_gap/" + s.getId() + "/pdf" : null);
//            out.add(row);
//        }
//        return ResponseEntity.ok(out);
//    }

    private Map<String, Object> parseAiResponse(String aiJson) {
        if (aiJson == null || aiJson.isBlank()) return Map.of(
                "strongSkills", List.of(),
                "weakSkills", List.of(),
                "missingSkills", List.of(),
                "matchPercentage", 0,
                "improvementAdvice", ""
        );
        try {
            var reader = new JsonReader(new StringReader(aiJson));
            reader.setLenient(true); // <-- tolerate minor malformed JSON
            Type t = new TypeToken<Map<String, Object>>() {}.getType();
            Map<String, Object> parsed = gson.fromJson(reader, t);
            if (parsed == null) throw new RuntimeException("Parsed null");
            // sanity defaults if keys missing
            parsed.putIfAbsent("strongSkills", List.of());
            parsed.putIfAbsent("weakSkills", List.of());
            parsed.putIfAbsent("missingSkills", List.of());
            parsed.putIfAbsent("matchPercentage", 0);
            parsed.putIfAbsent("improvementAdvice", "");
            return parsed;
        } catch (Exception e) {
            // hard fallback so FE never breaks
            return Map.of(
                    "strongSkills", List.of(),
                    "weakSkills", List.of(),
                    "missingSkills", List.of(),
                    "matchPercentage", 0,
                    "improvementAdvice", ""
            );
        }
    }


    // ---- UI payload always from DB (no recompute) ----
    private Map<String, Object> toUiPayload(SkillGapAnalysis sga) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("analysisId", sga.getId());
        body.put("username", sga.getUsername());
        body.put("targetRole", sga.getTargetRole());
        body.put("createdAt", sga.getCreatedAt() != null ? sga.getCreatedAt().toString() : null);
        body.put("pdfUrl", sga.getPdfPath() != null ? "/api/resume/skill_gap/" + sga.getId() + "/pdf" : null);

        body.put("strongSkills", safeJsonArray(sga.getStrongSkills()));
        body.put("weakSkills",   safeJsonArray(sga.getWeakSkills()));
        body.put("missingSkills",safeJsonArray(sga.getMissingSkills()));
        body.put("matchPercentage", sga.getMatchPercentage() != null ? sga.getMatchPercentage() : 0.0);
        body.put("improvementAdvice", sga.getImprovementAdvice() != null ? sga.getImprovementAdvice() : "");
        return body;
    }

    private Object safeJsonArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return gson.fromJson(json, List.class); }
        catch (Exception e) { return List.of(); }
    }
}
