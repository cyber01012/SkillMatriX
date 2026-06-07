
package com.career.skillanalyzer.DTO;

import java.util.List;
import java.util.Map;

public class RecommendBundleDTO {
    private String recId;
    private Map<String, List<String>> extractedSkills; // optional
    private List<JobResponseDTO> recommendedJobs;
    private List<JobResponseDTO> relatedJobs;
    private List<JobResponseDTO> otherJobs;

    public String getRecId() { return recId; }
    public void setRecId(String recId) { this.recId = recId; }

    public Map<String, List<String>> getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(Map<String, List<String>> extractedSkills) { this.extractedSkills = extractedSkills; }

    public List<JobResponseDTO> getRecommendedJobs() { return recommendedJobs; }
    public void setRecommendedJobs(List<JobResponseDTO> recommendedJobs) { this.recommendedJobs = recommendedJobs; }

    public List<JobResponseDTO> getRelatedJobs() { return relatedJobs; }
    public void setRelatedJobs(List<JobResponseDTO> relatedJobs) { this.relatedJobs = relatedJobs; }

    public List<JobResponseDTO> getOtherJobs() { return otherJobs; }
    public void setOtherJobs(List<JobResponseDTO> otherJobs) { this.otherJobs = otherJobs; }
}
