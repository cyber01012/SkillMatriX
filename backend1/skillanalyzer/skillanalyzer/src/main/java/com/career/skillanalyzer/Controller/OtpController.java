package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.repository.UserRepository;
import com.career.skillanalyzer.service.auth.OtpService;
import com.career.skillanalyzer.service.auth.PasswordService;
import com.career.skillanalyzer.service.auth.SessionService;
import com.career.skillanalyzer.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final SessionService sessionService;
    private final PasswordService passwordService;
    private final UserRepository userRepository;
    public OtpController(OtpService otpService, SessionService sessionService, PasswordService passwordService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.otpService = otpService;
        this.passwordService = passwordService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.sessionService = sessionService;
    }


    // 1️⃣ Send OTP for Logout Others
    @PostMapping("/logout-others")
    public ResponseEntity<String> sendLogoutOthersOtp(
            @RequestHeader("Authorization") String bearer
    ) {
        String token = bearer.replace("Bearer ", "");
        String userId = jwtUtil.extractUserId(token);

        // FIX: convert userId to email
        String email = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getEmail();

        otpService.generateOtp(email, "LOGOUT_OTHERS");

        return ResponseEntity.ok("OTP sent for logout from other devices");
    }

    // 2️⃣ Resend OTP
    @PostMapping("/logout-others/resend")
    public ResponseEntity<String> resendLogoutOthersOtp(
            @RequestHeader("Authorization") String bearer
    ) {
        String token = bearer.replace("Bearer ", "");
        String userId = jwtUtil.extractUserId(token);

        // FIX: convert userId to email
        String email = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getEmail();

        otpService.generateOtp(email, "LOGOUT_OTHERS", true);
        return ResponseEntity.ok("OTP resent for logout from other devices.");
    }

    @PostMapping("/logout-others/verify")
    public ResponseEntity<String> verifyLogoutOthers(
            @RequestHeader("Authorization") String bearer,
            @RequestBody Map<String, String> req,
            @RequestHeader("Session-Id") String currentSessionId
    ) {
        String token = bearer.replace("Bearer ", "");
        String userId = jwtUtil.extractUserId(token);

        // Get email
        String email = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getEmail();

        boolean valid = otpService.verifyOtp(email, req.get("otp"), "LOGOUT_OTHERS");

        if (!valid) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        // Logout other sessions except current
        sessionService.logoutOtherDevices(userId, currentSessionId);

        return ResponseEntity.ok("Logged out from other devices");
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPasswordOtp(@RequestParam String email) {
        // Check if email exists in DB
        if (userRepository.existsByEmail(email)) {
            otpService.generateOtp(email, "FORGOT_PASSWORD");
            return ResponseEntity.ok("OTP sent for password reset.");
        } else {
            return ResponseEntity.badRequest().body("Email not registered");
        }
    }


    @PostMapping("/forgot-password/resend")
    public ResponseEntity<String> resendForgotPasswordOtp(@RequestParam String email) {
        otpService.generateOtp(email, "FORGOT_PASSWORD", true);
        return ResponseEntity.ok("OTP resent.");
    }



}
