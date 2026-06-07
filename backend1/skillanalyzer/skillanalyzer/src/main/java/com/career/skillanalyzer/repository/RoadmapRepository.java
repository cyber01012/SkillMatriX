package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.entity.roadmap.RoadmapEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapRepository extends JpaRepository<RoadmapEntity, Long> {

    // Latest roadmap for user + role
    List<RoadmapEntity> findTop1ByUserIdAndTargetRoleOrderByCreatedAtDesc(String userId, String targetRole);


    // ✅ primitive long (kabhi null nahi aayega)
    long countByUserId(String userId);

    // ✅ optional: dual fallback helper
    long countByUserIdIn(List<String> userIds);


    // Latest roadmap for user (any role)
    List<RoadmapEntity> findTop1ByUserIdOrderByCreatedAtDesc(String userId);

}
