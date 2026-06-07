package com.career.skillanalyzer.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
@Entity
@Table(name = "user_session")
public class UserSession {

    @Id
    private String id;

    private boolean active;
    private LocalDateTime createdAt;
    private String device;
    private String ip;
    private String sessionId;
    private String sessionToken;
    private String userId;
    private LocalDateTime lastActivity;

    // ✅ No-arg constructor
    public UserSession() {}

    // Optional: All-args constructor
    // 4-arg constructor for creating a session quickly
    public UserSession(String userId, String sessionId, String sessionToken, String device) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.sessionToken = sessionToken;
        this.device = device;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now(); // NEW
    }


    // getters & setters
    public String getSessionId() { return sessionId; }
    public String getUserId() { return userId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getDevice() {
        return device;
    }
    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

}
