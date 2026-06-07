
package com.career.skillanalyzer.Controller;

import com.career.skillanalyzer.DTO.LoginRequest;
import com.career.skillanalyzer.DTO.SignupRequest;
import com.career.skillanalyzer.DTO.Tokens;
import com.career.skillanalyzer.Model.ActivityLog;
import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.Model.UserSession;
import com.career.skillanalyzer.repository.UserRepository;
import com.career.skillanalyzer.security.RevocationStore;
import com.career.skillanalyzer.service.auth.UserService;
import com.career.skillanalyzer.service.activity.ActivityLogService;
import com.career.skillanalyzer.service.auth.AuthService;
import com.career.skillanalyzer.service.auth.OtpService;
import com.career.skillanalyzer.service.auth.UserService;
import com.career.skillanalyzer.service.auth.UsernamePolicy;
import com.career.skillanalyzer.util.JwtUtil;
import com.career.skillanalyzer.util.TokenStore;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private JwtUtil jwtUtil;
    private final AuthService authService;
    private final TokenStore tokenStore;
    private final UsernamePolicy usernamePolicy;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    private final RevocationStore revocationStore;



    private final OtpService otpService;

    public AuthController(AuthService authService,
                          TokenStore tokenStore,
                          UsernamePolicy usernamePolicy,
                          UserRepository userRepository,
                          ActivityLogService activityLogService,
                          OtpService otpService,
                          JwtUtil jwtUtil, RevocationStore revocationStore) {  // <-- add here
        this.authService = authService;
        this.tokenStore = tokenStore;
        this.usernamePolicy = usernamePolicy;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
        this.revocationStore = revocationStore;// <-- assign here
    }





    @PostMapping("/signup")
    public String signup(@RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    // NOTE: final path => /auth/check-username
    @GetMapping("/check-username")
    public ResponseEntity<Map<String, Object>> checkUsername(@RequestParam String username) {
        // normalize
        String uname = usernamePolicy.normalize(username);

        // LRU cache (policy object)
        Optional<Boolean> cached = usernamePolicy.getCached(uname);
        if (cached.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "username", uname,
                    "available", cached.get(),
                    "source", "cache"
            ));
        }

        // DB + reserved check
        boolean available = !userRepository.existsByUsername(uname) && !usernamePolicy.isReserved(uname);

        // cache result
        usernamePolicy.putCache(uname, available);

        return ResponseEntity.ok(Map.of(
                "username", uname,
                "available", available,
                "source", "db"
        ));
    }
    @Autowired
    private UserService userService; // if not already injected

    private String userIdEmail(String userId) {
        return userService.findById(userId)
                .map(user -> user.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody LoginRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {
try{
        String userId = authService.authenticate(request);

        String sessionId = java.util.UUID.randomUUID().toString();
        UserSession session = new UserSession(
                userId,
                sessionId,
                "",

                userAgent != null ? userAgent : ""
        );

        session.setLastActivity(LocalDateTime.now());

        tokenStore.addSession(sessionId, session);
        Tokens tokens = authService.generateTokens(userId, sessionId);

        // store access meta
        String accessJti = jwtUtil.extractJti(tokens.getAccessToken());
        long accessExpMs = jwtUtil.extractExpiry(tokens.getAccessToken()).getTime();
        tokenStore.setAccessMeta(sessionId, accessJti, accessExpMs);

        // refresh token cookie
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", tokens.getRefreshToken())
                .httpOnly(true)
                .secure(true) // prod
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(45 * 60)   // session cookie

                .build();

        // ✅ activity log BEFORE return
        activityLogService.log(
                userId,
                sessionId,
                ActivityLog.EventType.LOGIN_SUCCESS,
                ActivityLog.Status.SUCCESS,
                null,
                userAgent,
                userAgent,
                "Login successful"
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(Map.of(
                        "accessToken", tokens.getAccessToken(),
                        "sessionId", sessionId
                ));
    }
catch (
    ResponseStatusException ex) {
        return ResponseEntity.status(401)
                .body(Map.of("message", ex.getReason()));
    }
}

@PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {

        if (request.getCookies() == null) {
            return ResponseEntity.status(401).build();
        }

        String refreshToken = Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals("refresh_token"))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (refreshToken == null || jwtUtil.isTokenExpired(refreshToken)) {
            return ResponseEntity.status(401).build();
        }

        String userId = jwtUtil.extractUserId(refreshToken);
        String sessionId = jwtUtil.getSessionId(refreshToken);

        UserSession session = tokenStore.getSession(sessionId);
        if (session == null || !session.isActive()) {
            return ResponseEntity.status(401).build();
        }

        // 🔥 update last activity
        session.setLastActivity(java.time.LocalDateTime.now());

        // 🔁 rotate BOTH tokens
        String newAccess  = jwtUtil.generateAccessToken(userId, sessionId);
        String newRefresh = jwtUtil.generateRefreshToken(userId, sessionId);

        // update access meta
        tokenStore.setAccessMeta(
                sessionId,
                jwtUtil.extractJti(newAccess),
                jwtUtil.extractExpiry(newAccess).getTime()
        );

        // 🔁 new refresh cookie (sliding)
        ResponseCookie cookie = ResponseCookie.from("refresh_token", newRefresh)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(45 * 60) // sliding window: 45 mins
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("accessToken", newAccess));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(
            @RequestHeader("Session-Id") String sessionId,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {

        UserSession session = tokenStore.getSession(sessionId);

        if (session != null) {
            session.setActive(false);
            tokenStore.removeSession(sessionId);

            activityLogService.log(
                    session.getUserId(),
                    sessionId,
                    ActivityLog.EventType.LOGOUT_CURRENT,
                    ActivityLog.Status.SUCCESS,
                    null,
                    userAgent,
                    userAgent,
                    "Logged out"
            );
        }

        ResponseCookie clear = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .path("/auth/refresh")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clear.toString())
                .body(Map.of("message", "Logged out"));
    }

    @PostMapping("/logout-others")
    public ResponseEntity<Map<String, Object>> logoutOthers(
            @RequestHeader("Session-Id") String currentSessionId,
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String otp
    ) {
        String token = authHeader.replace("Bearer ", "");
        String userId = jwtUtil.extractUserId(token);

        // Get email
        String email = userService.findById(userId)
                .map(User::getEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify OTP
        boolean verified = otpService.verifyOtp(email, otp, "LOGOUT_OTHERS");
        if (!verified) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        // Logout other sessions

// ... inside logoutOthers(...)
        var sessions = tokenStore.getAllSessions(userId);
        for (UserSession session : sessions) {
            if (!session.getSessionId().equals(currentSessionId)) {

                // 1) Revoke this session's current access token (if we have meta)
                String sid = session.getSessionId();
                String jti = tokenStore.getAccessJti(sid);
                Long  exp = tokenStore.getAccessExp(sid);
                if (jti != null && exp != null) {
                    revocationStore.revoke(jti, exp);
                }

                // 2) Activity log (as you already do)
                activityLogService.log(
                        userId,
                        sid,
                        ActivityLog.EventType.LOGOUT_OTHERS,
                        ActivityLog.Status.SUCCESS,
                        null,
                        session.getDevice(),
                        session.getDevice(),
                        "Logged out from other device"
                );

                // 3) Mark inactive & remove from TokenStore
                session.setActive(false);
                tokenStore.removeSession(sid);
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Logged out from all other devices successfully",
                "currentSessionId", currentSessionId
        ));
    }



}
