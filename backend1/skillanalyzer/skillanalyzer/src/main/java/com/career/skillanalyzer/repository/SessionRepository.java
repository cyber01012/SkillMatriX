package com.career.skillanalyzer.repository;


import com.career.skillanalyzer.Model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface SessionRepository extends JpaRepository<UserSession, String> {
    @Modifying
    @Transactional
    @Query("""
    UPDATE UserSession s
    SET s.active = false
    WHERE s.userId = :userId
    AND s.id <> :currentSessionId
""")
    void logoutOtherSessions(
            @Param("userId") String userId,
            @Param("currentSessionId") String currentSessionId
    );}



