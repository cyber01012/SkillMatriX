
package com.career.skillanalyzer.service.job;

import com.career.skillanalyzer.DTO.JobResponseDTO;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RecommendBundleCache {

    public static class Bundle {
        public List<JobResponseDTO> recommended = new ArrayList<>();
        public List<JobResponseDTO> related = new ArrayList<>();
        public List<JobResponseDTO> others = new ArrayList<>();
        public Instant expiresAt;
    }

    private final Map<String, Bundle> store = new ConcurrentHashMap<>();
    private static final Duration TTL = Duration.ofMinutes(30); // ← TTL here

    public String put(Bundle bundle) {
        String id = UUID.randomUUID().toString();
        bundle.expiresAt = Instant.now().plus(TTL);
        store.put(id, bundle);
        return id;
    }

    public Optional<Bundle> get(String id) {
        Bundle b = store.get(id);
        if (b == null) return Optional.empty();
        if (b.expiresAt.isBefore(Instant.now())) {
            store.remove(id);
            return Optional.empty();
        }
        return Optional.of(b);
    }

    // Clean up every 5 minutes
    @Scheduled(fixedRate = 300_000L)
    public void evictExpired() {
        Instant now = Instant.now();
        store.entrySet().removeIf(e -> e.getValue().expiresAt.isBefore(now));
    }
}
