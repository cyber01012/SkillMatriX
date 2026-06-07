
package com.career.skillanalyzer.service.activity;

import com.career.skillanalyzer.Model.ActivityLog;
import com.career.skillanalyzer.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ActivityLogService {

    private final ActivityLogRepository repo;

    private final Set<String> flaggedIps = new HashSet<>(List.of("10.0.0.13")); // example
    private final Map<String, ArrayDeque<ActivityLog>> recentByUser = new HashMap<>();
    private final Map<String, String> suspiciousCache = new LinkedHashMap<>(256, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String,String> e) { return size() > 256; }
    };

    public ActivityLogService(ActivityLogRepository repo) { this.repo = repo; }

    public ActivityLog log(String userId, String sessionId,
                           ActivityLog.EventType type, ActivityLog.Status status,
                           String ip, String userAgent, String device, String metadata) {

        ActivityLog al = new ActivityLog();
        al.setUserId(userId);
        al.setSessionId(sessionId);
        al.setEventType(type);
        al.setStatus(status);
        al.setIp(ip);
        al.setUserAgent(userAgent);
        al.setDevice(device);
        al.setMetadata(metadata);

        int risk = computeRisk(al);
        al.setRiskScore(risk);

        ActivityLog saved = repo.save(al);

        // Ring buffer: keep last 50 for user (ArrayDeque)
        ArrayDeque<ActivityLog> dq = recentByUser.computeIfAbsent(userId, k -> new ArrayDeque<>(50));
        if (dq.size() >= 50) dq.removeFirst();
        dq.addLast(saved);

        if (risk >= 60) suspiciousCache.put(userId, type + " risk=" + risk);

        return saved;
    }

    private int computeRisk(ActivityLog al) {
        int risk = 0;
        if (al.getStatus() == ActivityLog.Status.FAILURE) risk += 30;
        if (al.getEventType() == ActivityLog.EventType.LOGIN_FAILURE) risk += 20;
        if (al.getEventType() == ActivityLog.EventType.OTP_VERIFY_FAILURE) risk += 20;
        if (al.getIp() != null && flaggedIps.contains(al.getIp())) risk += 50;
        return Math.min(risk, 100);
    }

    public Optional<String> getLastSuspiciousSummary(String userId) {
        return Optional.ofNullable(suspiciousCache.get(userId));
    }
}
