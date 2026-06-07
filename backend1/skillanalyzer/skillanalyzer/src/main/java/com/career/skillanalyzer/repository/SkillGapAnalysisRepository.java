
package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.SkillGapAnalysis;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SkillGapAnalysisRepository extends JpaRepository<SkillGapAnalysis, Long> {

    @Modifying
    @Transactional
    @Query(
            value = """
    UPDATE skill_gap_analysis
    SET pdf_path = :pdfPath,
        pdf_generated_at = NOW()
    WHERE id = :id
  """,
            nativeQuery = true
    )
    int updatePdfPathById(
            @Param("id") Long id,
            @Param("pdfPath") String pdfPath
    );


//    @Modifying
//    @Transactional
//    @Query("UPDATE skill_gap_analysis SET pdf_path = :pdfPath, pdf_generated_at = :t WHERE id = :id")
//    int updatePdfPathById(Long id, String pdfPath, LocalDateTime t);


    // Latest record for the user + role (case-insensitive)
    Optional<SkillGapAnalysis> findTopByUsernameAndTargetRoleIgnoreCaseOrderByCreatedAtDesc(
            String username, String targetRole);

    // Latest record for the user (any role)
    Optional<SkillGapAnalysis> findTopByUsernameOrderByCreatedAtDesc(String username);

    Optional<SkillGapAnalysis> findByResume_IdAndTargetRole(Long resumeId, String targetRole);

    Optional<SkillGapAnalysis> findBySemanticHashAndTargetRole(String semanticHash, String targetRole);

    // NEW: recent same-role analyses (similarity check)
    List<SkillGapAnalysis> findTop50ByTargetRoleOrderByCreatedAtDesc(String username,
                                                                     String targetRole);
    long countByUsername(String username);
    List<SkillGapAnalysis> findTop1ByUsernameOrderByCreatedAtDesc(String username);
    // NEW: listing by user
    List<SkillGapAnalysis> findByUsernameOrderByCreatedAtDesc(String username);

    // If you have createdAt in the entity (you do), this will fetch the latest
    Optional<SkillGapAnalysis> findTopByUsernameAndTargetRoleOrderByCreatedAtDesc(String username, String targetRole);

}
