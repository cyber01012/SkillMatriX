package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    List<UserSession> findByUserId(String userId);
}