
package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.DTO.*;
import com.career.skillanalyzer.Model.Job;
import com.career.skillanalyzer.Mapper.JobMapper;
import com.career.skillanalyzer.service.cv.TextService;
import com.career.skillanalyzer.service.job.JobAggregatorService;
import com.career.skillanalyzer.service.job.JobRecommendationService;
import com.career.skillanalyzer.service.job.RecommendBundleCache;
import com.career.skillanalyzer.service.job.UserTopJobService;
import com.career.skillanalyzer.service.skill.SkillExtractionService;
import com.career.skillanalyzer.util.KMP;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final TextService resumeTextService;
    private final SkillExtractionService skillExtractionService;
    private final JobAggregatorService jobAggregatorService;
    private final JobRecommendationService jobRecommendationService;
    private final RecommendBundleCache bundleCache;
    private final UserTopJobService userTopJobService;


    public JobController(
            TextService resumeTextService,
            SkillExtractionService skillExtractionService,
            JobAggregatorService jobAggregatorService,
            JobRecommendationService jobRecommendationService,
            RecommendBundleCache bundleCache,
            UserTopJobService userTopJobService) {
        this.resumeTextService = resumeTextService;
        this.skillExtractionService = skillExtractionService;
        this.jobAggregatorService = jobAggregatorService;
        this.jobRecommendationService = jobRecommendationService;
        this.bundleCache = bundleCache;
        this.userTopJobService = userTopJobService;
    }

    // 1) File upload path (direct Jobs page)
    @PostMapping("/recommend")
    public RecommendBundleDTO recommendJobs(
            @AuthenticationPrincipal String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String resumeText;
            String filename = file.getOriginalFilename();
            if (filename != null && filename.endsWith(".pdf")) {
                resumeText = resumeTextService.extractText(file);
            } else if (filename != null && filename.endsWith(".docx")) {
                XWPFDocument doc = new XWPFDocument(file.getInputStream());
                resumeText = resumeTextService.extractText(doc);
            } else {
                throw new RuntimeException("Unsupported file type");
            }

            Map<String, List<String>> skillMap = skillExtractionService.extractSkills(resumeText);
            List<String> flatSkills = skillMap.values().stream().flatMap(List::stream).collect(Collectors.toList());

            List<JobResponseDTO> r = runPipeline(flatSkills);

            return persistAndWrap(userId, skillMap, r);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // 2) Skill-Gap → Jobs (no text/hash; just arrays)
    @PostMapping("/recommend/by-skills")
    public RecommendBundleDTO recommendBySkills(
            @AuthenticationPrincipal String userId,
            @RequestBody SkillBundleDTO skills) {
        List<String> flat = new ArrayList<>();
        if (skills.getStrong() != null) flat.addAll(skills.getStrong());
        if (skills.getWeak() != null) flat.addAll(skills.getWeak());
        if (skills.getMissing() != null) flat.addAll(skills.getMissing());

        // Optional: also return grouped map like FE expects for display
        Map<String, List<String>> map = new HashMap<>();
        map.put("strong", skills.getStrong() != null ? skills.getStrong() : List.of());
        map.put("weak", skills.getWeak() != null ? skills.getWeak() : List.of());
        map.put("missing", skills.getMissing() != null ? skills.getMissing() : List.of());

        List<JobResponseDTO> r = runPipeline(flat);
        return persistAndWrap(userId, map, r);
    }

    // 3) Server-side search/sort per section
    @GetMapping("/filter")
    public RecommendBundleDTO filter(
            @RequestParam("recId") String recId,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "sort", required = false, defaultValue = "scoreDesc") String sort
    ) {
        RecommendBundleCache.Bundle base = bundleCache.get(recId)
                .orElseThrow(() -> new RuntimeException("recId not found or expired"));

        List<JobResponseDTO> recommended = new ArrayList<>(base.recommended);
        List<JobResponseDTO> related = new ArrayList<>(base.related);
        List<JobResponseDTO> others = new ArrayList<>(base.others);

        if (q != null && !q.isBlank()) {
            recommended = recommended.stream().filter(j -> KMP.containsIgnoreCase(j.getJobTitle(), q)).collect(Collectors.toList());
            related    = related.stream().filter(j -> KMP.containsIgnoreCase(j.getJobTitle(), q)).collect(Collectors.toList());
            others     = others.stream().filter(j -> KMP.containsIgnoreCase(j.getJobTitle(), q)).collect(Collectors.toList());
        }

        Comparator<JobResponseDTO> cmp;
        switch (sort) {
            case "scoreAsc": cmp = Comparator.comparingInt(JobResponseDTO::getMatchScore); break;
            case "titleAsc": cmp = Comparator.comparing(j -> Optional.ofNullable(j.getJobTitle()).orElse("")); break;
            case "titleDesc": cmp = Comparator.comparing((JobResponseDTO j) -> Optional.ofNullable(j.getJobTitle()).orElse("")).reversed(); break;
            default: cmp = Comparator.comparingInt(JobResponseDTO::getMatchScore).reversed(); // scoreDesc
        }
        recommended.sort(cmp);
        related.sort(cmp);
        others.sort(cmp);

        RecommendBundleDTO dto = new RecommendBundleDTO();
        dto.setRecId(recId);
        dto.setRecommendedJobs(recommended);
        dto.setRelatedJobs(related);
        dto.setOtherJobs(others);
        dto.setExtractedSkills(Map.of()); // not needed in filter
        return dto;
    }

    // -------- Helpers --------
    private List<JobResponseDTO> runPipeline(List<String> flatSkills) {
        List<Job> jobs = jobAggregatorService.fetchAllJobs(flatSkills);
        PriorityQueue<Job> pq = jobRecommendationService.rankJobs(jobs, flatSkills);

        List<JobResponseDTO> out = new ArrayList<>();
        while (!pq.isEmpty()) out.add(JobMapper.toDTO(pq.poll()));
        return out;
    }


    private RecommendBundleDTO persistAndWrap(
            String userId,
            Map<String, List<String>> skills,
            List<JobResponseDTO> ranked
    )
    {
        List<JobResponseDTO> recommended = new ArrayList<>();
        List<JobResponseDTO> related = new ArrayList<>();
        List<JobResponseDTO> others = new ArrayList<>();

        int recommendedLimit = 5;
        int relatedLimit = 25;

        for (JobResponseDTO job : ranked) {
            if (recommended.size() < recommendedLimit) {
                job.setRecommendationType("RECOMMENDED");
                recommended.add(job);
            } else if (related.size() < relatedLimit && job.getMatchScore() > 0) {
                job.setRecommendationType("RELATED");
                related.add(job);
            } else {
                job.setRecommendationType("OTHER");
                others.add(job);
            }
        }

        RecommendBundleCache.Bundle bundle = new RecommendBundleCache.Bundle();
        bundle.recommended = recommended;
        bundle.related = related;
        bundle.others = others;

        String recId = bundleCache.put(bundle);

        if (userId != null && !userId.isBlank()) {
            userTopJobService.saveTop3(userId, recommended, recId);
        }

        RecommendBundleDTO dto = new RecommendBundleDTO();
        dto.setRecId(recId);
        dto.setExtractedSkills(skills);
        dto.setRecommendedJobs(recommended);
        dto.setRelatedJobs(related);
        dto.setOtherJobs(others);
        return dto;
    }
}

