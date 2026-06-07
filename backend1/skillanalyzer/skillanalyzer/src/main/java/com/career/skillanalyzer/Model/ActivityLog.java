
package com.career.skillanalyzer.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "activity_log",
        indexes = {
                @Index(name = "idx_al_user", columnList = "userId"),
                @Index(name = "idx_al_session", columnList = "sessionId"),
                @Index(name = "idx_al_type", columnList = "eventType"),
                @Index(name = "idx_al_created", columnList = "createdAt")
        }
)
public class ActivityLog {

    public enum EventType {
        LOGIN_SUCCESS, LOGIN_FAILURE,
        LOGOUT_CURRENT, LOGOUT_OTHERS,
        OTP_SENT, OTP_VERIFY_SUCCESS, OTP_VERIFY_FAILURE,
        PASSWORD_CHANGE,
        SESSION_EXPIRED, OAUTH_LOGIN_SUCCESS
    }

    public enum Status {SUCCESS, FAILURE, FAILED, INFO}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 36, nullable = false)
    private String userId;

    @Column(length = 64)
    private String sessionId;

    @Enumerated(EnumType.STRING)
    @Column(length = 40, nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(length = 10, nullable = false)
    private Status status;

    @Column(length = 64)
    private String ip;

    @Column(length = 512)
    private String userAgent;

    @Column(length = 128)
    private String device;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(length = 2048)
    private String metadata; // JSON or plain text

    @Column
    private Integer riskScore;

    // getters/setters...

// in com.career.skillanalyzer.Model.ActivityLog

    public Long getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public EventType getEventType() {
        return eventType;
    }

    public void setEventType(EventType eventType) {
        this.eventType = eventType;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }
}
