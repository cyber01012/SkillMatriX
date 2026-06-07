
package com.career.skillanalyzer.repository;

import com.career.skillanalyzer.Model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // Frontend list ke liye sirf yeh do categories
    List<ActivityLog> findTop100ByUserIdAndEventTypeInOrderByCreatedAtDesc(
            String userId, List<ActivityLog.EventType> types);

    // Generic views
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ActivityLog> findBySessionIdOrderByCreatedAtDesc(String sessionId);
}
