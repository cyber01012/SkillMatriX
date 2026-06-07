
package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.UserTopJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserTopJobRepository extends JpaRepository<UserTopJob, Long> {

    List<UserTopJob> findTop3ByUserIdOrderByCreatedAtDesc(String userId);

    void deleteAllByUserId(String userId);
}
