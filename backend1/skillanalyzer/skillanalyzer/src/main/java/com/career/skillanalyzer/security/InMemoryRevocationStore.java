
package com.career.skillanalyzer.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryRevocationStore implements RevocationStore {
    // jti -> expEpochMs
    private final ConcurrentHashMap<String, Long> revoked = new ConcurrentHashMap<>();

    @Override
    public void revoke(String jti, long expiresAtEpochMs) {
        if (jti != null) {
            revoked.put(jti, expiresAtEpochMs);
        }
    }

    @Override
    public boolean isRevoked(String jti) {
        if (jti == null) return false;
        Long exp = revoked.get(jti);
        if (exp == null) return false;
        if (System.currentTimeMillis() > exp) {
            // expiry cross ho gai — clean up
            revoked.remove(jti);
            return false;
        }
        return true;
        // NOTE: Redis version me yeh map -> SETEX/TTL use karein.
    }
}
