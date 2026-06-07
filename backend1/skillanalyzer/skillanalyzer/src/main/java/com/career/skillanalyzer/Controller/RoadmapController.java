package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.Model.roadmap.CareerNode;
import com.career.skillanalyzer.Model.roadmap.CareerRoadmap;
import com.career.skillanalyzer.service.roadmap.RoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.career.skillanalyzer.repository.RoadmapRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * RoadmapController provides the REST API endpoint for the sequential career
 * roadmap.
 */
@CrossOrigin
@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final RoadmapRepository roadmapRepository;

    public RoadmapController(RoadmapService roadmapService, RoadmapRepository roadmapRepository) {

        this.roadmapService = roadmapService;
        this.roadmapRepository = roadmapRepository;
    }

    /**
     * Generates a sequential career roadmap based on skill gap data.
     * Sequential path: Strong -> Weak -> Missing -> Target Role.
     */
    @PostMapping("/generate")

    public ResponseEntity<?> generateRoadmap(
            @AuthenticationPrincipal String userId,
            @RequestBody Map<String, Object> body
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }

        String role = (String) body.get("targetRole");
        @SuppressWarnings("unchecked")
        Map<String, Object> skillGap = (Map<String, Object>) body.get("skillGap");


        try {

// If you want to persist with USERNAME (to match existing data)
            // load user and get username:
            // User u = userRepository.findById(userId).orElseThrow(...);
            // String username = u.getUsername();

            // For now, keep using username if that’s your convention:
//            String username = (String) body.get("username"); // TEMP if FE still sends
            String owner = userId;    // ← use authenticated ID only
            if (owner == null || owner.isBlank()) {
                // fallback to real username
                // (inject UserRepository in this controller to do this properly)
                return ResponseEntity.badRequest().body(Map.of("error", "username missing; send or lookup from principal"));
            }

            CareerRoadmap roadmap = roadmapService.generateRoadmap(skillGap, role, owner);

            // Convert to List for JSON serialization while preserving Linked List sequence
            List<CareerNode> sequentialSteps = roadmap.toList();
            Map<String, Object> response = new HashMap<>();
            response.put("targetRole", role);
            response.put("roadmap", sequentialSteps);
            response.put("totalSteps", sequentialSteps.size());
            response.put("message", "Sequential roadmap generated successfully using custom Linked List.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error generating roadmap: " + e.getMessage()));
        }

//        return response;
    }


// Controller/RoadmapController.java  (add methods)


    @PostMapping("/generate-from-db-ui")
    public ResponseEntity<?> generateFromDbUi
            (
                    @AuthenticationPrincipal String userId,
                    @RequestBody Map<String, String> body
            ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        }

        String role = body.get("targetRole");

        try {
            String username = body.get("username"); // TEMP fallback
            if (username == null || username.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "username missing; send or lookup from principal"));
            }

            var roadmap = roadmapService.generateForUserRoleOrLatest(username, role);
            var steps = roadmap.toList();


            // ✅ Build response without nulls (Map.of throws if any value is null)
            Map<String, Object> resp = new HashMap<>();
            resp.put("username", username);
            if (role != null && !role.isBlank()) {
                resp.put("targetRole", role);
            }
            resp.put("roadmap", steps);
            resp.put("totalSteps", steps.size());
            resp.put("message", "Roadmap generated from DB (with fallback) and persisted.");

            return ResponseEntity.ok(resp);


        } catch (IllegalStateException ex) {
            if ("NO_SKILL_GAP_FOR_USER".equals(ex.getMessage())) {
                return ResponseEntity.status(404).body(Map.of(
                        "error", "No skill gap found for this user. Please upload a resume and generate Skill Gap first."
                ));
            }
            return ResponseEntity.status(500).body(Map.of("error", ex.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/latest")
    public ResponseEntity<?> latest(@RequestParam String username, @RequestParam String role) {
        var list = roadmapRepository.findTop1ByUserIdAndTargetRoleOrderByCreatedAtDesc(username, role);
        if (list.isEmpty()) {
            // fallback: any roadmap for this user
            var any = roadmapRepository.findTop1ByUserIdOrderByCreatedAtDesc(username);
            if (any.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of(
                        "error", "No roadmap found. Please generate Skill Gap and then click Generate Roadmap."
                ));
            }
            var rm = any.get(0);
            return ResponseEntity.ok(Map.of(
                    "id", rm.getId(),
                    "role", rm.getTargetRole(),
                    "createdAt", rm.getCreatedAt(),
                    "roadmap", rm.getNodes()     // ordered by @OrderBy(stepOrder ASC)
            ));
        }

        var rm = list.get(0);
        return ResponseEntity.ok(Map.of(
                "id", rm.getId(),
                "role", rm.getTargetRole(),
                "createdAt", rm.getCreatedAt(),
                "roadmap", rm.getNodes()
        ));
    }


//    @PostMapping("/generate-from-skillgap-id")
//    public Map<String, Object> generateFromSkillGapId(@RequestParam Long id) {
//        var response = new HashMap<String, Object>();
//        try {
//            var roadmap = roadmapService.generateFromSkillGapId(id);
//            var steps = roadmap.toList();
//            response.put("skillGapId", id);
//            response.put("roadmap", steps);
//            response.put("totalSteps", steps.size());
//            response.put("message", "Roadmap generated from SkillGap ID and persisted.");
//        } catch (Exception e) {
//            response.put("error", e.getMessage());
//        }
//        return response;
//    }

}
