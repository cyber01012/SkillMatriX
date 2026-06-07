
package com.career.skillanalyzer.service.auth;

import com.career.skillanalyzer.DTO.LoginRequest;
import com.career.skillanalyzer.DTO.SignupRequest;
import com.career.skillanalyzer.DTO.Tokens;
import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.repository.UserRepository;
import com.career.skillanalyzer.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final EmailService emailService;

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final UsernamePolicy usernamePolicy;

    public AuthService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            UsernamePolicy usernamePolicy,
            EmailService emailService
    ) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.usernamePolicy = usernamePolicy;
        this.emailService = emailService;
    }


    public String signup(SignupRequest r) {
        // Basic validations
        if (r.getEmail() == null || r.getEmail().isBlank()) return "Email is required";
        if (r.getPassword() == null || r.getPassword().isBlank()) return "Password is required";
        if (r.getUsername() == null || r.getUsername().isBlank()) return "Username is required";

        String uname = usernamePolicy.normalize(r.getUsername());
        if (!usernamePolicy.isValidPattern(uname)) return "Invalid username pattern";
        if (usernamePolicy.isReserved(uname))       return "Username is reserved";

        // Uniqueness checks
        if (userRepository.existsByEmail(r.getEmail()))   return "User already exists";
        if (userRepository.existsByUsername(uname))       return "Username already taken";

        // Create & save
        User u = new User();
        u.setEmail(r.getEmail());
        u.setPassword(encoder.encode(r.getPassword()));
        u.setUsername(uname);
        u.setFirstName(r.getFirstName());
        u.setLastName(r.getLastName());
        u.setGoogleUser(false);

        userRepository.save(u);
//        userRepository.save(u);

// ✅ SEND WELCOME EMAIL
        emailService.sendWelcomeEmail(
                u.getEmail(),
                u.getFirstName()
        );



        return "Signup successful";
    }


    public String authenticate(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Your email or password is incorrect"
                ));

        if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Your email or password is incorrect"
            );
        }

        return user.getId();
    }

//    public String authenticate(LoginRequest loginRequest) {
//        // 1) find user by email
//        User user = userRepository.findByEmail(loginRequest.getEmail())
//                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
//
//        // 2) verify password
//        if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
//            throw new RuntimeException("Invalid credentials");
//        }
//
//        // 3) return userId for controller to create session & tokens
//        return user.getId();
//    }

    public Tokens generateTokens(String userId, String sessionId) {
        String access  = jwtUtil.generateAccessToken(userId, sessionId);
        String refresh = jwtUtil.generateRefreshToken(userId, sessionId);
        return new Tokens(access, refresh);
    }

    public void changePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
    }

    public String processOAuthPostLogin(String email) {
        // create or fetch local user
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseGet(() -> {
                    User u = new User();
                    u.setEmail(email);
                    u.setPassword(encoder.encode("oauth_placeholder")); // not used for OAuth login
                    u.setGoogleUser(true);
                    userRepository.save(u);
                    return u.getId();
                });
    }
}
