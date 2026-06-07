
package com.career.skillanalyzer.service.auth;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class UsernamePolicy {

    private static final Set<String> RESERVED =
            new HashSet<>(List.of("admin","administrator","root","support","help","about","terms","privacy"));

    private final Map<String, Boolean> availabilityCache = new LinkedHashMap<>(128, 0.75f, true) {
        @Override protected boolean removeEldestEntry(Map.Entry<String, Boolean> eldest) { return size() > 256; }
    };

    public String normalize(String raw) {
        String s = raw.toLowerCase(Locale.ROOT).trim().replace(' ', '-');
        s = s.replaceAll("[^a-z0-9._-]", "");
        s = s.replaceAll("^\\.+|\\.+$", ""); // <-- correct: remove leading OR trailing dots
        return s;
    }

    public boolean isReserved(String uname) { return RESERVED.contains(uname); }

    public Optional<Boolean> getCached(String uname) { return Optional.ofNullable(availabilityCache.get(uname)); }
    public void putCache(String uname, boolean available) { availabilityCache.put(uname, available); }

    public boolean isValidPattern(String uname) {
        // length 3..30, start with letter/number, allowed [a-z0-9._-]
        return uname.matches("^[a-z0-9][a-z0-9._-]{2,29}$");
    }
}
