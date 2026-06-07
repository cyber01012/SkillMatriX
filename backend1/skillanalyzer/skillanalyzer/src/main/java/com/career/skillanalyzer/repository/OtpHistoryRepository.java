package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.OtpHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OtpHistoryRepository extends JpaRepository<OtpHistory, Long> {
    List<OtpHistory> findTop150ByEmailOrderByCreatedAtDesc(String email);
}