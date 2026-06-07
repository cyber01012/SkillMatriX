package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.DTO.ChangePasswordDto;
import com.career.skillanalyzer.service.auth.PasswordService;
import com.career.skillanalyzer.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/password")
public class PasswordController {

    private final PasswordService passwordService;
    private final JwtUtil jwtUtil;  // ✅ add this

    // Constructor injection
    public PasswordController(PasswordService passwordService, JwtUtil jwtUtil) {
        this.passwordService = passwordService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(
            @RequestBody Map<String, String> req
    ) {
        boolean success = passwordService.forgotPassword(
                req.get("email"),
                req.get("otp"),
                req.get("newPassword")
        );

        if (!success) {
            return ResponseEntity.badRequest().body("Invalid OTP or user not found");
        }
        return ResponseEntity.ok("Password reset successful");
    }


    @PostMapping("/change-password")
    public ResponseEntity<String> changePasswordPostLogin(
            @RequestHeader("Authorization") String bearer,
            @RequestBody ChangePasswordDto req
    ) {
        String userId = jwtUtil.extractUserId(bearer.replace("Bearer ", ""));
        boolean success = passwordService.changePasswordLoggedIn(userId,
                req.getCurrentPassword(), req.getNewPassword(), req.getConfirmPassword());
        if (!success) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid current password or mismatch.");
        }
        return ResponseEntity.ok("Password changed successfully.");
    }
}
