
package com.career.skillanalyzer.security;

public interface RevocationStore {
    void revoke(String jti, long expiresAtEpochMs);
    boolean isRevoked(String jti);
}
