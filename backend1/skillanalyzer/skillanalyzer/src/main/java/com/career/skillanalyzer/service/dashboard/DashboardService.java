
package com.career.skillanalyzer.service.dashboard;

import com.career.skillanalyzer.DTO.DashboardSummaryResponse;
import com.career.skillanalyzer.entity.chat.ChatSession;
import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.repository.ChatSessionRepository;
import com.career.skillanalyzer.repository.RoadmapRepository;
import com.career.skillanalyzer.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.career.skillanalyzer.Model.UserTopJob;
import com.career.skillanalyzer.service.job.UserTopJobService;
import com.career.skillanalyzer.Model.SkillGapAnalysis;
import com.career.skillanalyzer.repository.SkillGapAnalysisRepository;



import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final RoadmapRepository roadmapRepository; // optional if not present
    private final UserTopJobService userTopJobService;
    private final SkillGapAnalysisRepository sgaRepo;

    public DashboardService(
            UserRepository userRepository,
            ChatSessionRepository chatSessionRepository,
            RoadmapRepository roadmapRepository, // use Optional to avoid bean errors
            UserTopJobService userTopJobService,
            SkillGapAnalysisRepository sgaRepo
    ) {
        this.userRepository = userRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.roadmapRepository = roadmapRepository;
        this.userTopJobService = userTopJobService;
        this.sgaRepo = sgaRepo;
    }

    public DashboardSummaryResponse getSummary(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<SkillGapAnalysis> analyses =
                sgaRepo.findTop1ByUsernameOrderByCreatedAtDesc(user.getUsername());

        String username = user.getUsername();

// Reports = number of SkillGapAnalysis
        long reports = sgaRepo.countByUsername(username);

// Roadmaps = RoadmapEntity saved with userId = username

        long roadmaps = roadmapRepository.countByUserId(userId);


        long resumes = 3;
        SkillGapAnalysis latestGap =
                analyses.isEmpty() ? null : analyses.get(0);


        // Latest sessions (for role + match %)
        List<ChatSession> latest = chatSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        ChatSession latestSession = latest.isEmpty() ? null : latest.get(0);

        String targetRole = latestGap != null ? latestGap.getTargetRole() : "";

        Integer matchPercentage = latestGap != null && latestGap.getMatchPercentage() != null
                ? latestGap.getMatchPercentage().intValue()
                : 0;

        int strong = latestGap != null ? countJsonArray(latestGap.getStrongSkills()) : 0;
        int weak = latestGap != null ? countJsonArray(latestGap.getWeakSkills()) : 0;
        int missing = latestGap != null ? countJsonArray(latestGap.getMissingSkills()) : 0;


        // === Stats mapping exactly for UI ===
//        long roadmaps = roadmapRepository
//                .map(r -> (long) r.countByUserId(userId))
//                .orElseGet(() -> chatSessionRepository.countByUserId(userId));
//
//        long reports = chatSessionRepository.countByUserId(userId); // or activity logs count if you prefer
//        long resumes = 0; // if you add Resume entity or activity type, map it here

        DashboardSummaryResponse.Stats stats = DashboardSummaryResponse.Stats.builder()
                .roadmaps(roadmaps)
                .reports(reports)
                .resumes(resumes)
                .build();

        DashboardSummaryResponse.Skills skills =
                DashboardSummaryResponse.Skills.builder()
                        .strong(strong)
                        .weak(weak)
                        .missing(missing)
                        .build();

        // === Jobs list (abhi empty; future me fill) ===

        // ✅ JOBS FROM DB
        List<UserTopJob> savedJobs = userTopJobService.getLatestTop3(userId);


        List<DashboardSummaryResponse.JobItem> jobs = savedJobs.stream()
                .map(j -> DashboardSummaryResponse.JobItem.builder()
                        .title(j.getTitle())
                        .company(j.getCompany())
                        .match(j.getMatchScore() != null ? j.getMatchScore() : 0)
                        .url(j.getUrl())
                        .build())
                .toList();

        String lastRecId = savedJobs.isEmpty() ? null : savedJobs.get(0).getRecId();

        return DashboardSummaryResponse.builder()
                .userName(nullSafe(user.getUsername()))
                .targetRole(targetRole)
                .stats(stats)
                .skills(skills)
                .jobs(jobs)               // ✅ filled now
                .matchPercentage(matchPercentage)
                .lastRecId(lastRecId)     // ✅ important
                .build();
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private int countJsonArray(String json) {
        if (json == null || json.isBlank()) return 0;
        try {
            return new com.google.gson.Gson().fromJson(json, List.class).size();
        } catch (Exception e) {
            return 0;
        }
    }

}





