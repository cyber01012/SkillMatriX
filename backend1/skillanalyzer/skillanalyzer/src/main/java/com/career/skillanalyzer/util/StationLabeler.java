
package com.career.skillanalyzer.util;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class StationLabeler {

    private final Map<String, String> lru = new LinkedHashMap<>(256, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
            return size() > 512; // LRU eviction
        }
    };

    public String label(String userId, String sessionId, String device) {
        String key = userId + ":" + (sessionId != null ? sessionId : device != null ? device : "unknown");
        return lru.computeIfAbsent(key, k -> "STATION " + String.format("%02d", Math.floorMod(k.hashCode(), 99) + 1));
    }
}
