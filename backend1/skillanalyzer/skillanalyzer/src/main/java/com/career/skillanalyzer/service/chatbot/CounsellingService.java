package com.career.skillanalyzer.service.chatbot;

import com.career.skillanalyzer.repository.SkillGapAnalysisRepository;
import com.career.skillanalyzer.repository.UserRepository;
import com.google.gson.Gson;
import com.career.skillanalyzer.entity.chat.ChatMessage;
import com.career.skillanalyzer.entity.chat.ChatSession;
import com.career.skillanalyzer.repository.ChatMessageRepository;
import com.career.skillanalyzer.repository.ChatSessionRepository;
import com.career.skillanalyzer.service.chatbot.CounsellingAIService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

//import static jdk.tools.jlink.internal.Utils.parseList;

@Service
public class CounsellingService {

        private final ChatSessionRepository sessionRepository;
        private final ChatMessageRepository messageRepository;
        private final CounsellingAIService aiService;

    private final SkillGapAnalysisRepository sgaRepo;
    private final UserRepository userRepository;

    private final Gson gson = new Gson();

        public CounsellingService(
                        ChatSessionRepository sessionRepository,
                        ChatMessageRepository messageRepository,
                        CounsellingAIService aiService,
                        SkillGapAnalysisRepository sgaRepo,
                        UserRepository userRepository
        ) {
                this.sessionRepository = sessionRepository;
                this.messageRepository = messageRepository;
                this.aiService = aiService;
                this.sgaRepo = sgaRepo;
                this.userRepository = userRepository;

        }


    /**
     * Creates a session. If cvSkills/skillGap not provided by FE, auto-hydrate from latest SGA.
     */
    @Transactional
    public com.career.skillanalyzer.DTO.SessionResponse createOrHydrateSession(
            String userId,
            String targetRole,
            Double matchPercentage,
            Object cvSkillsFromClient,
            Map<String, Object> skillGapFromClient
    ) {
        // 1) Resolve username
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String username = user.getUsername();

        // 2) Fetch latest SGA (any role)
        var latestList = sgaRepo.findTop1ByUsernameOrderByCreatedAtDesc(username);
        var latest = latestList.isEmpty() ? null : latestList.get(0);

        // 3) If targetRole missing, derive from latest SGA
        if ((targetRole == null || targetRole.isBlank()) && latest != null) {
            targetRole = latest.getTargetRole();
        }
        if (targetRole == null) targetRole = "";

        // 4) Normalize skillGap: FE keys or SGA keys -> analyzer keys ("Missing","Weak")
        Map<String, Object> normalizedSkillGap =
                normalizeSkillGap(skillGapFromClient, latest);

        // 5) cvSkills: if not provided, derive simple list from strong+weak (optional)
        Object cvSkills = cvSkillsFromClient;
        if (!(cvSkills instanceof List) && latest != null) {
            List<String> strong = parseList(latest.getStrongSkills());
            List<String> weak = parseList(latest.getWeakSkills());
            List<String> combined = new java.util.ArrayList<>();
            if (strong != null) combined.addAll(strong);
            if (weak != null) combined.addAll(weak);
            cvSkills = combined;
        }
        if (cvSkills == null) cvSkills = java.util.List.of();

        // 6) Persist session
        ChatSession session = ChatSession.builder()
                .userId(userId)
                .targetRole(targetRole)
                .matchPercentage(matchPercentage != null ? matchPercentage : 0.0)
                .cvSkills(gson.toJson(cvSkills))
                .skillGap(gson.toJson(normalizedSkillGap))
                .build();


                // Check if we have skill data

        ChatSession saved = sessionRepository.save(session);

        boolean hasSkillData = checkHasSkillData(cvSkills, normalizedSkillGap);
        String message = hasSkillData
                ? "Session created with skill data"
                : "No skills detected. Please upload resume.";

        return com.career.skillanalyzer.DTO.SessionResponse.builder()
                .sessionId(saved.getId())
                .hasSkillData(hasSkillData)
                .message(message)
                .build();

    }

    /** Convert FE/SGA keys to analyzer keys */
    private Map<String, Object> normalizeSkillGap(Map<String, Object> fromClient, com.career.skillanalyzer.Model.SkillGapAnalysis sga) {
        // If FE sent something, try to normalize keys
        if (fromClient != null && !fromClient.isEmpty()) {
            return toAnalyzerShape(fromClient, null, null, null);
        }
        // Else fallback to SGA (if present)
        if (sga != null) {
            List<String> strong = parseList(sga.getStrongSkills());
            List<String> weak = parseList(sga.getWeakSkills());
            List<String> missing = parseList(sga.getMissingSkills());
            return toAnalyzerShape(null, strong, weak, missing);
        }
        // Else empty
        return Map.of("Missing", List.of(), "Weak", List.of());
    }


    /** Build analyzer-ready map with keys Missing/Weak, accepting multiple input shapes */
    @SuppressWarnings("unchecked")
    private Map<String, Object> toAnalyzerShape(Map<String, Object> client, List<String> strong, List<String> weak, List<String> missing) {
        List<String> outMissing = List.of();
        List<String> outWeak = List.of();

        if (client != null) {
            // try client variations
            Object m = firstNonNull(
                    client.get("Missing"),
                    client.get("missing"),
                    client.get("missingSkills")
            );
            Object w = firstNonNull(
                    client.get("Weak"),
                    client.get("weak"),
                    client.get("weakSkills")
            );
            outMissing = toList(m);
            outWeak = toList(w);
        } else {
            outMissing = safe(missing);
            outWeak = safe(weak);
        }

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("Missing", outMissing);
        map.put("Weak", outWeak);
        // (Optionally add Strong too if you expand analyzer later)
        return map;
    }


    private List<String> safe(List<String> in) {
        return (in == null) ? List.of() : in;
    }

    private Object firstNonNull(Object... vals) {
        for (Object v : vals) if (v != null) return v;
        return null;
    }

    private List<String> toList(Object v) {
        if (v == null) return List.of();
        if (v instanceof List<?> l) {
            List<String> out = new java.util.ArrayList<>();
            for (Object o : l) out.add(String.valueOf(o));
            return out;
        }
        return List.of();
    }

    private List<String> parseList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return gson.fromJson(json, List.class); }
        catch (Exception e) { return List.of(); }
    }



    private boolean checkHasSkillData(Object cvSkills, Map<String, Object> skillGap) {
        boolean hasCv = (cvSkills instanceof List) && !((List<?>) cvSkills).isEmpty();
        boolean hasGap = false;
        if (skillGap != null) {
            List<?> m = (List<?>) skillGap.get("Missing");
            List<?> w = (List<?>) skillGap.get("Weak");
            hasGap = (m != null && !m.isEmpty()) || (w != null && !w.isEmpty());
        }
        return hasCv || hasGap;
    }


    @Transactional
        public String processMessage(Long sessionId, String content) {
                ChatSession session = sessionRepository.findById(sessionId)
                                .orElseThrow(() -> new RuntimeException("Session not found with ID: " + sessionId));

                // 1. Persist User Message
                ChatMessage userMessage = ChatMessage.builder()
                                .session(session)
                                .role("user")
                                .content(content)
                                .build();
                messageRepository.save(userMessage);

                // 2. Fetch last 10 messages for a sliding window context (saves tokens)
                List<ChatMessage> history = messageRepository.findBySessionIdOrderByTimestampDesc(
                                sessionId, PageRequest.of(0, 10));
                Collections.reverse(history); // Put back in chronological order for the AI

                // 3. Generate AI Response
                String aiText = aiService.generateResponse(
                                session.getTargetRole(),
                                session.getCvSkills(),
                                session.getSkillGap(),
                                history);

                // 4. Persist Assistant Response
                ChatMessage assistantMessage = ChatMessage.builder()
                                .session(session)
                                .role("assistant")
                                .content(aiText)
                                .build();
                messageRepository.save(assistantMessage);

                return aiText;
        }

        public List<ChatMessage> getHistory(Long sessionId) {
                return messageRepository.findBySessionIdOrderByTimestampAsc(sessionId);
        }
}
