
package com.career.skillanalyzer.Model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "skill_gap_analysis",
        uniqueConstraints = @UniqueConstraint(columnNames = {"resume_id", "target_role"})
)
public class SkillGapAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(name = "target_role", nullable = false)
    private String targetRole;

    // (Legacy) optional, DB small rakhna ho to ab in par write band kar dein:
    @Column(columnDefinition = "json")
    private String extractedSkills;   // legacy
    @Column(columnDefinition = "json")
    private String matchedSkills;     // legacy
    @Column(columnDefinition = "json")
    private String aiResponse;        // legacy

    // ✅ NEW: Store exactly what screen needs (small JSON arrays + small text)
    @Column(columnDefinition = "json")
    private String strongSkills;

    @Column(columnDefinition = "json")
    private String weakSkills;

    @Column(columnDefinition = "json")
    private String missingSkills;

    private Double matchPercentage;

    @Lob
    private String improvementAdvice;

    private String semanticHash;

    // (Optional but recommended) listing/user ownership
    private String username;

    private String pdfPath;
    private LocalDateTime pdfGeneratedAt;

    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters
    public Long getId() { return id; }
    public Resume getResume() { return resume; }
    public void setResume(Resume resume) { this.resume = resume; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getExtractedSkills() { return extractedSkills; }
    public void setExtractedSkills(String extractedSkills) { this.extractedSkills = extractedSkills; }
    public String getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(String matchedSkills) { this.matchedSkills = matchedSkills; }
    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public String getStrongSkills() { return strongSkills; }
    public void setStrongSkills(String strongSkills) { this.strongSkills = strongSkills; }
    public String getWeakSkills() { return weakSkills; }
    public void setWeakSkills(String weakSkills) { this.weakSkills = weakSkills; }
    public String getMissingSkills() { return missingSkills; }
    public void setMissingSkills(String missingSkills) { this.missingSkills = missingSkills; }
    public Double getMatchPercentage() { return matchPercentage; }
    public void setMatchPercentage(Double matchPercentage) { this.matchPercentage = matchPercentage; }
    public String getImprovementAdvice() { return improvementAdvice; }
    public void setImprovementAdvice(String improvementAdvice) { this.improvementAdvice = improvementAdvice; }

    public String getSemanticHash() { return semanticHash; }
    public void setSemanticHash(String semanticHash) { this.semanticHash = semanticHash; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPdfPath() { return pdfPath; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public LocalDateTime getPdfGeneratedAt() { return pdfGeneratedAt; }
    public void setPdfGeneratedAt(LocalDateTime pdfGeneratedAt) { this.pdfGeneratedAt = pdfGeneratedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
