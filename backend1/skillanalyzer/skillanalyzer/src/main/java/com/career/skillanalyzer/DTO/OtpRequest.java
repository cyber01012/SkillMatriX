package com.career.skillanalyzer.DTO;

public class OtpRequest {
    private String email;
    private String otp;
    private String purpose;

    // getters & setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
}
