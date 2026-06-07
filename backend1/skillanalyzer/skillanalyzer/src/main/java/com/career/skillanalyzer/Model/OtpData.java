package com.career.skillanalyzer.Model;

import java.time.LocalDateTime;

public class OtpData {
    private String otp;
    private String email;
    private int attempts;
    private LocalDateTime expiresAt;
    private String purpose;

    public OtpData(String otp, String email, LocalDateTime expiresAt, String purpose) {
        this.otp = otp;
        this.email = email;
        this.expiresAt = expiresAt;
        this.purpose = purpose;
        this.attempts = 0;
    }
    public class OtpEntry {
        private String otp;
        private String purpose; // LOGIN, PASSWORD_RESET, LOGOUT_OTHERS
        private long expiry; // optional
    }
    // getters & setters
    public String getOtp() { return otp; }
    public String getEmail() { return email; }
    public int getAttempts() { return attempts; }
    public void incrementAttempts() { this.attempts++; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public String getPurpose() { return purpose; }
}
