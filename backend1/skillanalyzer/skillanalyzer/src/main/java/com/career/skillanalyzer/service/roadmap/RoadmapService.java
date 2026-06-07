
package com.career.skillanalyzer.service.roadmap;

import com.career.skillanalyzer.entity.roadmap.RoadmapEntity;
import com.career.skillanalyzer.entity.roadmap.RoadmapNodeEntity;
import com.career.skillanalyzer.Model.roadmap.CareerNode;
import com.career.skillanalyzer.Model.roadmap.CareerRoadmap;
import com.career.skillanalyzer.repository.RoadmapRepository;
import com.career.skillanalyzer.repository.SkillGapAnalysisRepository;
import com.career.skillanalyzer.Model.SkillGapAnalysis;
import com.career.skillanalyzer.service.ai.GeminiService;
import com.career.skillanalyzer.util.JsonCleaner;
import com.google.gson.*;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class RoadmapService {

    private final GeminiService geminiService;
    private final RoadmapRepository roadmapRepository;
    private final SkillGapAnalysisRepository skillGapRepo; // <-- NEW

    private final Gson gson = new Gson(); // for parsing JSON string lists

    public RoadmapService(
            @Qualifier("roadmapGemini") GeminiService geminiService,
            RoadmapRepository roadmapRepository,
            SkillGapAnalysisRepository skillGapRepo // <-- NEW
    ) {
        this.geminiService = geminiService;
        this.roadmapRepository = roadmapRepository;
        this.skillGapRepo = skillGapRepo; // <-- NEW
    }

    // -------------------------
    // PUBLIC: Generate from DB
    // -------------------------

    /**
     * Fetch latest SkillGapAnalysis for a username + role, then generate roadmap and persist.
     * Username can be your "hardcoded user" since auth not ready.
     */
    public CareerRoadmap generateFromLatestSkillGap(String username, String targetRole) {
        SkillGapAnalysis sg = skillGapRepo
                .findTopByUsernameAndTargetRoleOrderByCreatedAtDesc(username, targetRole)
                .orElseThrow(() -> new IllegalStateException(
                        "No SkillGapAnalysis found for username=" + username + ", targetRole=" + targetRole));

        Map<String, Object> skillGapMap = buildSkillGapMapFromEntity(sg);

        // Persist with username as userId in RoadmapEntity
        return generateRoadmap(skillGapMap, targetRole, username);
    }

    // -------------------------
    // EXISTING method (augmented with userId)
    // -------------------------
    @SuppressWarnings("unchecked")
    public CareerRoadmap generateRoadmap(
            Map<String, Object> body,
            String targetRole,
            String userId // <-- Added so we save RoadmapEntity.userId
    ) {

        CareerRoadmap roadmap = new CareerRoadmap();

        Map<String, Object> skillGap = body;

        if (skillGap == null)
            return roadmap;

        try {

            String prompt = String.format(
                    "Generate a career roadmap for role: %s.\n" +
                            "Strong skills: %s\n" +
                            "Weak skills: %s\n" +
                            "Missing skills: %s\n\n" +
                            "Output STRICTLY as a JSON ARRAY.\n" +
                            "Each item must have:\n" +
                            "- skillName (string)\n" +
                            "- status (STRONG, WEAK, MISSING, MILESTONE)\n" +
                            "- resources (array of 1-3 URLs for tutorials/documentation)\n" +
                            "- strategicAction (string: a concrete actionable step to improve or leverage this skill)\n\n" +
                            "Do NOT include guidance or extra fields.\n" +
                            "Order: Strong -> Weak -> Missing -> Target Role.\n" +
                            "Ensure the total number of steps does not exceed 20.\n\n",
                    targetRole,

                    skillGap.get("strongSkills"),
                    skillGap.get("weakSkills"),
                    skillGap.get("missingSkills"));

            String raw = geminiService.generate(prompt);

            String cleaned = JsonCleaner.clean(raw);

            JsonElement root = JsonParser.parseString(cleaned);

            if (!root.isJsonArray()) {
                throw new RuntimeException("Expected JSON array from AI");
            }

            JsonArray steps = root.getAsJsonArray();

            int limit = 20;
            for (int i = 0; i < steps.size() && i < limit; i++) {
                JsonObject o = steps.get(i).getAsJsonObject();

                String resources = null;
                if (o.has("resources") && o.get("resources").isJsonArray()) {
                    resources = StreamSupport.stream(o.getAsJsonArray("resources").spliterator(), false)
                            .map(JsonElement::getAsString)
                            .collect(Collectors.joining(" | "));
                }

                roadmap.addNode(
                        o.get("skillName").getAsString(),
                        o.get("status").getAsString(),
                        null, // guidance removed
                        resources,
                        o.get("strategicAction").getAsString());
            }

        } catch (Exception ex) {
            System.err.println("AI ROADMAP GENERATION FAILED: " + ex.getMessage());

            int totalSteps = 0;
            int maxSteps = 20;

            List<String> strong = (List<String>) skillGap.get("strongSkills");
            if (strong != null) {
                for (String s : strong) {
                    if (totalSteps >= maxSteps) break;
                    roadmap.addNode(s, "STRONG",
                            null,
                            "Google Search: " + s + " tutorials",
                            "Use " + s + " in projects or tasks relevant to " + targetRole);
                    totalSteps++;
                }
            }

            List<String> weak = (List<String>) skillGap.get("weakSkills");
            if (weak != null) {
                for (String s : weak) {
                    if (totalSteps >= maxSteps) break;
                    roadmap.addNode(s, "WEAK",
                            null,
                            "Google Search: " + s + " practice exercises",
                            "Practice " + s + " with small projects or exercises");
                    totalSteps++;
                }
            }

            List<String> missing = (List<String>) skillGap.get("missingSkills");
            if (missing != null) {
                for (String s : missing) {
                    if (totalSteps >= maxSteps) break;
                    roadmap.addNode(s, "MISSING",
                            null,
                            "Google Search: " + s + " beginner guide",
                            "Learn " + s + " using tutorials, documentation, or courses");
                    totalSteps++;
                }
            }

            if (totalSteps < maxSteps) {
                roadmap.addNode(
                        targetRole,
                        "MILESTONE",
                        null,
                        null,
                        "Apply confidently for the role");
            }
        }

        // SAVE with userId
        saveToDatabase(roadmap, targetRole, userId);

        return roadmap;
    }

    public void saveToDatabase(CareerRoadmap roadmap, String targetRole, String userId) {
        try {
            RoadmapEntity entity = new RoadmapEntity();
            entity.setTargetRole(targetRole);
            entity.setUserId(userId); // <-- set the user

            List<CareerNode> nodes = roadmap.toList();
            AtomicInteger order = new AtomicInteger(0);

            nodes.forEach(node -> {
                RoadmapNodeEntity nodeEntity = new RoadmapNodeEntity();
                nodeEntity.setSkillName(node.getSkillName());
                nodeEntity.setStatus(node.getStatus());
                nodeEntity.setGuidance(node.getGuidance());
                nodeEntity.setResources(node.getResources());
                nodeEntity.setStrategicAction(node.getStrategicAction());
                nodeEntity.setStepOrder(order.getAndIncrement());
                entity.addNode(nodeEntity);
            });

            roadmapRepository.save(entity);
            System.out.println("ROADMAP PERSISTED TO DATABASE FOR ROLE: " + targetRole + " (user=" + userId + ")");
        } catch (Exception ex) {
            System.err.println("DATABASE PERSISTENCE FAILED: " + ex.getMessage());
        }
    }

    // -------------------------
    // Helpers
    // -------------------------

    private Map<String, Object> buildSkillGapMapFromEntity(SkillGapAnalysis sg) {
        Map<String, Object> map = new HashMap<>();
        map.put("strongSkills", parseJsonStringArray(sg.getStrongSkills()));
        map.put("weakSkills", parseJsonStringArray(sg.getWeakSkills()));
        map.put("missingSkills", parseJsonStringArray(sg.getMissingSkills()));
        return map;
    }

    /**
     * Your SkillGapAnalysis stores JSON as String.
     * Expected shapes:
     *   - '["Java","Git"]'  OR
     *   - null / empty
     */
    private List<String> parseJsonStringArray(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            JsonElement root = JsonParser.parseString(json);
            if (!root.isJsonArray()) return List.of();
            JsonArray arr = root.getAsJsonArray();
            List<String> out = new ArrayList<>();
            for (JsonElement e : arr) {
                if (e.isJsonPrimitive() && e.getAsJsonPrimitive().isString()) {
                    out.add(e.getAsString());
                }
            }
            return out;
        } catch (Exception ex) {
            System.err.println("Failed to parse JSON array string: " + ex.getMessage());
            return List.of();
        }
    }

    public CareerRoadmap generateForUserRoleOrLatest(String username, String role) {
        String u = username == null ? "guest" : username.trim();
        String r = role == null ? "" : role.trim();

        // Try: latest for user + role
        var sgaOpt = skillGapRepo.findTopByUsernameAndTargetRoleIgnoreCaseOrderByCreatedAtDesc(u, r);

        // Fallback: latest for user (any role)
        var sga = sgaOpt.orElseGet(() ->
                skillGapRepo.findTopByUsernameOrderByCreatedAtDesc(u)
                        .orElseThrow(() -> new IllegalStateException("NO_SKILL_GAP_FOR_USER")));

        Map<String, Object> skillGap = new HashMap<>();
        skillGap.put("strongSkills", parseJsonStringArray(sga.getStrongSkills()));
        skillGap.put("weakSkills", parseJsonStringArray(sga.getWeakSkills()));
        skillGap.put("missingSkills", parseJsonStringArray(sga.getMissingSkills()));

        // Use the SGA's stored role to keep things consistent
        return generateRoadmap(skillGap, sga.getTargetRole(), u);
    }

}
