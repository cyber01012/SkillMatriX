package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.service.ai.GeminiService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;

        System.out.println("🔥 AiController Loaded!");

    }

    // -------- 1) ENHANCE (polish user's own summary) --------
    @PostMapping("/enhance-summary")
    public ResponseEntity<Map<String, String>> enhanceSummary(
            @Valid @RequestBody EnhanceRequest body) {

        String prompt =
                "You are a resume assistant. Rewrite the following resume summary in clean, " +
                        "concise, professional English while preserving the original meaning and facts. " +
                        "Do NOT invent experience, dates, or responsibilities. Improve clarity and tone. " +
                        "Return only the polished summary without any extra commentary.\n\n" +
                        "Original Summary:\n" + body.summary();

        String generated = geminiService.generate(prompt);
        return ResponseEntity.ok(Map.of("summary", generated));
    }

    // -------- 2) GENERATE (from user notes) --------
    @PostMapping("/generate-summary")
    public ResponseEntity<Map<String, String>> generateFromNotes(
            @Valid @RequestBody NotesRequest body) {

        String prompt =
                "You are a resume assistant. Based on the user's notes, write a polished, " +
                        "concise resume summary (3-5 lines). Keep it truthful to the notes and do " +
                        "NOT invent details. Focus on role, years of experience (if provided), core " +
                        "skills, impact, and strengths. Tone should be professional and confident. " +
                        "Return only the summary.\n\n" +
                        "User Notes:\n" + body.notes();

        String generated = geminiService.generate(prompt);
        return ResponseEntity.ok(Map.of("summary", generated));
    }

    // --- Request DTOs (compact Java 17 records) ---
    public record EnhanceRequest(
            @NotBlank(message = "summary is required") String summary
    ) {}

    public record NotesRequest(
            @NotBlank(message = "notes is required") String notes
    ) {}
}