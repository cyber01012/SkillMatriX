package com.career.skillanalyzer.service.auth;

import com.career.skillanalyzer.util.OtpCache;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final OtpCache otpCache;
    private final EmailService emailService;

    // Resend & blocking maps
    private final ConcurrentHashMap<String, Integer> otpResendCount = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> blockedUntil = new ConcurrentHashMap<>();

    private static final int MAX_RESEND = 3;
    private static final long BLOCK_DURATION = TimeUnit.MINUTES.toMillis(15);

    public OtpService(OtpCache otpCache, EmailService emailService) {
        this.otpCache = otpCache;
        this.emailService = emailService;
    }

    public String generateOtp(String email, String purpose) {
        return generateOtp(email, purpose, false);
    }

    public String generateOtp(String email, String purpose, boolean isResend) {
        String key = email + ":" + purpose;

        // Check block
        Long blockedTime = blockedUntil.get(key);
        if (blockedTime != null && System.currentTimeMillis() < blockedTime) {
            throw new RuntimeException("Too many OTP requests. Try after some time.");
        }

        // Resend count
        int count = otpResendCount.getOrDefault(key, 0);
        if (isResend) {
            if (count >= MAX_RESEND) {
                blockedUntil.put(key, System.currentTimeMillis() + BLOCK_DURATION);
                otpResendCount.remove(key);
                throw new RuntimeException("Maximum OTP resend attempts reached. Try later.");
            }
            otpResendCount.put(key, count + 1);
        } else {
            otpResendCount.put(key, 1); // first send
        }

        // Generate OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpCache.storeOtp(key, otp);

        // Send email
        emailService.sendOtpEmail(email, otp, purpose);
        System.out.println("OTP [" + purpose + "] for " + email + ": " + otp); // for debugging

        return otp;
    }

    public boolean verifyOtp(String email, String otp, String purpose) {
        String key = email + ":" + purpose;
        String cachedOtp = otpCache.getOtp(key);

        if (cachedOtp == null) return false;

        boolean valid = cachedOtp.equals(otp);
        if (valid) {
            otpCache.removeOtp(key);
            otpResendCount.remove(key);
            blockedUntil.remove(key);
        }
        return valid;
    }
}
