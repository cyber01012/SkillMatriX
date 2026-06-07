
package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findByResumeHash(String resumeHash);
}
