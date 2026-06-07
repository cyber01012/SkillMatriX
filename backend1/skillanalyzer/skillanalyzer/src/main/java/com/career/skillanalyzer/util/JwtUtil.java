
package com.career.skillanalyzer.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret; // 64+ bytes recommended for HS512
    @Value("${jwt.access-expiration-ms}")
    private long accessExpiration;
    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpiration;

    private SecretKey key() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateAccessToken(String userId, String sessionId) {
        return generateToken(userId, sessionId, accessExpiration, UUID.randomUUID().toString());
    }

    public String generateRefreshToken(String userId, String sessionId) {
        return generateToken(userId, sessionId, refreshExpiration, UUID.randomUUID().toString());
    }

    private String generateToken(String userId, String sessionId, long expirationMs, String jti) {
        long now = System.currentTimeMillis();
        Date issuedAt = new Date(now);
        Date expiresAt = new Date(now + expirationMs);
        return Jwts.builder()
                .setSubject(userId)
                .setId(jti) // <-- jti
                .claim("sessionId", sessionId)
                .setIssuedAt(issuedAt)
                .setExpiration(expiresAt)
                .signWith(key(), SignatureAlgorithm.HS512)
                .compact();
    }

    private Claims getAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUserId(String token) {
        return getAllClaims(token).getSubject();
    }

    public String getSessionId(String token) {
        return getAllClaims(token).get("sessionId", String.class);
    }

    public boolean isTokenExpired(String token) {
        return getAllClaims(token).getExpiration().before(new Date());
    }

    // Aliases used elsewhere in your code:
    public String extractUserId(String token) { return getUserId(token); }

    // NEW:
    public String extractJti(String token) { return getAllClaims(token).getId(); }
    public Date extractExpiry(String token) { return getAllClaims(token).getExpiration(); }
}
