
package com.career.skillanalyzer.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    // 👇 Frontend expects exactly these property names
    private String userName;          // was 'username' before → now 'userName'
    private String targetRole;        // latest session's role (or blank)
    private Stats stats;              // { roadmaps, reports, resumes }
    private Skills skills;            // { strong, weak, missing }
    private List<JobItem> jobs;       // optional list (keep empty for now)
    private Integer matchPercentage;  // from latest session or default
    // ✅ NEW: allow FE to deep-link the bundle
    private String lastRecId;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Stats {
        private long roadmaps;
        private long reports;
        private long resumes;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Skills {
        private int strong;
        private int weak;
        private int missing;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class JobItem {
        private String title;
        private String company;
        private String location;
        private int match;
        private String url;
        private String geo;
    }
}
