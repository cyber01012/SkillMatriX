
package com.career.skillanalyzer.util;

import com.career.skillanalyzer.Model.UserSession;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class TokenStore {

    // sessionId -> UserSession
    private final ConcurrentHashMap<String, UserSession> sessionById = new ConcurrentHashMap<>();

    // userId -> set of sessionIds
    private final ConcurrentHashMap<String, Set<String>> sessionsByUser = new ConcurrentHashMap<>();

    // sessionId -> current access token jti
    private final ConcurrentHashMap<String, String> accessJtiBySessionId = new ConcurrentHashMap<>();

    // sessionId -> current access token expiry (epoch ms)
    private final ConcurrentHashMap<String, Long> accessExpBySessionId = new ConcurrentHashMap<>();

    // ADD SESSION  (O(1))
    public void addSession(String sessionId, UserSession session) {
        sessionById.put(sessionId, session);
        sessionsByUser.computeIfAbsent(session.getUserId(), k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);
    }

    // Store access token meta (jti + exp) for this session
    public void setAccessMeta(String sessionId, String jti, long expEpochMs) {
        if (sessionId == null) return;
        if (jti != null) accessJtiBySessionId.put(sessionId, jti);
        accessExpBySessionId.put(sessionId, expEpochMs);
    }

    public String getAccessJti(String sessionId) {
        return accessJtiBySessionId.get(sessionId);
    }

    public Long getAccessExp(String sessionId) {
        return accessExpBySessionId.get(sessionId);
    }

    // GET SESSION (O(1))
    public UserSession getSession(String sessionId) {
        return sessionById.get(sessionId);
    }

    // LOGOUT THIS DEVICE (O(1))
    public void removeSession(String sessionId) {
        UserSession session = sessionById.remove(sessionId);
        // cleanup token meta
        accessJtiBySessionId.remove(sessionId);
        accessExpBySessionId.remove(sessionId);

        if (session != null) {
            Set<String> userSessions = sessionsByUser.get(session.getUserId());
            if (userSessions != null) {
                userSessions.remove(sessionId);
                if (userSessions.isEmpty()) {
                    sessionsByUser.remove(session.getUserId());
                }
            }
        }
    }

    // LOGOUT ALL OTHER DEVICES (O(k))
    public void removeOtherSessions(String userId, String currentSessionId) {
        Set<String> userSessions = sessionsByUser.get(userId);
        if (userSessions == null) return;

        for (String sid : new HashSet<>(userSessions)) { // avoid CME
            if (!sid.equals(currentSessionId)) {
                UserSession session = sessionById.get(sid);
                if (session != null) session.setActive(false); // mark inactive
                sessionById.remove(sid);
                // cleanup token meta
                accessJtiBySessionId.remove(sid);
                accessExpBySessionId.remove(sid);
                userSessions.remove(sid);
            }
        }
    }

    // GET ALL SESSIONS FOR A USER
    public Set<UserSession> getAllSessions(String userId) {
        Set<String> sessionIds = sessionsByUser.get(userId);
        if (sessionIds == null) return Set.of(); // empty set
        Set<UserSession> sessions = new HashSet<>();
        for (String sid : sessionIds) {
            UserSession session = sessionById.get(sid);
            if (session != null) sessions.add(session);
        }
        return sessions;
    }

    // LOGOUT ALL DEVICES (O(k))
    public void removeAllSessions(String userId) {
        Set<String> userSessions = sessionsByUser.remove(userId);
        if (userSessions != null) {
            for (String sid : userSessions) {
                sessionById.remove(sid);
                accessJtiBySessionId.remove(sid);
                accessExpBySessionId.remove(sid);
            }
        }
    }

    // CHECK IF SESSION IS ACTIVE
    public boolean isSessionActive(String sessionId) {
        UserSession session = sessionById.get(sessionId);
        return session != null && session.isActive();
    }
}
