package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.DTO.MessageRequest;
import com.career.skillanalyzer.entity.chat.ChatMessage;
import com.career.skillanalyzer.service.chatbot.CounsellingService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/chat")
public class CounsellingController {

    private final CounsellingService counsellingService;

    public CounsellingController(CounsellingService counsellingService) {
        this.counsellingService = counsellingService;
    }

    @PostMapping("/message")
    public String sendMessage(@RequestBody MessageRequest request) {
        return counsellingService.processMessage(request.getSessionId(), request.getContent());
    }

    @GetMapping("/history/{sessionId}")
    public List<ChatMessage> getHistory(@PathVariable Long sessionId) {
        return counsellingService.getHistory(sessionId);
    }

    // Fallback for manual session creation if needed

    @PostMapping("/session")
    public com.career.skillanalyzer.DTO.SessionResponse createSession(
            @AuthenticationPrincipal String userId,
            @RequestBody Map<String, Object> payload
    ) {
        if (userId == null || userId.isBlank()) {
            throw new RuntimeException("Unauthenticated");
        }

        String targetRole = (String) payload.getOrDefault("targetRole", "");
        Double matchPercentage = payload.get("matchPercentage") == null
                ? 0.0
                : Double.valueOf(String.valueOf(payload.get("matchPercentage")));

        Object cvSkills = payload.get("cvSkills");                   // can be List or null
        @SuppressWarnings("unchecked")
        Map<String, Object> skillGap = (Map<String, Object>) payload.get("skillGap");

        return counsellingService.createOrHydrateSession(
                userId, targetRole, matchPercentage, cvSkills, skillGap
        );
    }
}
