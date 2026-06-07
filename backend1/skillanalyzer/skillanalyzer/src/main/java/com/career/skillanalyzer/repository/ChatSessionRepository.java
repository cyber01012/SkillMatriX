package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.entity.chat.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findByUserId(String userId);

    // For sessions list used in DashboardService
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserId(String userId);
}
