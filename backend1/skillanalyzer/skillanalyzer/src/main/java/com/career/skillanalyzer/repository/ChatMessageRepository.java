package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.entity.chat.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);

    // Find most recent messages to save tokens
    List<ChatMessage> findBySessionIdOrderByTimestampDesc(Long sessionId, Pageable pageable);
}
