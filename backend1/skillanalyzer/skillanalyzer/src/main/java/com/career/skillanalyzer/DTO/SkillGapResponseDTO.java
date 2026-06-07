
package com.career.skillanalyzer.DTO;

public class SkillGapResponseDTO {
    public Long analysisId;
    public String targetRole;

    public Object extractedSkills;
    public Object matchedSkills;
    public Object missingSkills;

    public String pdfUrl;       // /api/skill-gap/{id}/pdf
    public String createdAt;

    public SkillGapResponseDTO() { }
}
