package com.career.skillanalyzer.Controller;


import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.repository.UserRepository;
import com.career.skillanalyzer.service.auth.UsernamePolicy;
import com.career.skillanalyzer.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserProfileController {



        private final UserRepository userRepository;
        private final JwtUtil jwtUtil;
        private final UsernamePolicy usernamePolicy; // <-- add

        public UserProfileController(UserRepository userRepository, JwtUtil jwtUtil, UsernamePolicy usernamePolicy) {
            this.userRepository = userRepository;
            this.jwtUtil = jwtUtil;
            this.usernamePolicy = usernamePolicy; // <-- wire
        }



    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String bearer) {
        final String userId = jwtUtil.extractUserId(bearer.replace("Bearer ", ""));
        final User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> body = new java.util.LinkedHashMap<>();
        body.put("id", u.getId());
        body.put("firstName", u.getFirstName());
        body.put("lastName", u.getLastName());
        body.put("username", u.getUsername());
        body.put("email", u.getEmail());

        body.put("profileImage", u.getProfilePhotoUrl()); // same name as front-end expects

        return ResponseEntity.ok(body);
    }




    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String bearer,
            @RequestBody Map<String, String> req) {

        String userId = jwtUtil.extractUserId(bearer.replace("Bearer ", "")); // implement if not already
        User u = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        String firstName = req.get("firstName");
        String lastName  = req.get("lastName");
        String username  = req.get("username");

        if (firstName != null) u.setFirstName(firstName);
        if (lastName  != null) u.setLastName(lastName);

        if (username != null && !username.isBlank()) {
            // normalize + validate + unique
            String uname = usernamePolicy.normalize(username);
            if (!usernamePolicy.isValidPattern(uname)) return ResponseEntity.badRequest().body("Invalid username pattern");
            if (userRepository.existsByUsername(uname) && !uname.equals(u.getUsername())) {
                return ResponseEntity.badRequest().body("Username already taken");
            }
            u.setUsername(uname);
        }

        u.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    @PostMapping(value = "/profile-photo", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadPhoto(
            @RequestHeader("Authorization") String bearer,
            @RequestParam("file") MultipartFile file) throws Exception {

        String userId = jwtUtil.extractUserId(bearer.replace("Bearer ", ""));
        User u = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        // Validate file type/size
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");
        if (file.getSize() > 5 * 1024 * 1024) return ResponseEntity.badRequest().body("Max 5MB allowed");
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png"))) {
            return ResponseEntity.badRequest().body("Only JPG/PNG allowed");
        }

        // Save to local /uploads (ensure folder exists)
        Path uploadsDir = Paths.get(System.getProperty("user.dir"), "uploads");
        System.out.println("Uploads path: " + uploadsDir.toAbsolutePath());
        Files.createDirectories(uploadsDir);

        String ext = contentType.equals("image/png") ? ".png" : ".jpg";
        String filename = "user_" + userId + "_" + System.currentTimeMillis() + ext;
        Path target = uploadsDir.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

// Update DB with path
        u.setProfilePhotoUrl("/uploads/" + filename);
        u.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(u);

        return ResponseEntity.ok(Map.of(
                "message", "Photo uploaded",
                "profilePhotoUrl", u.getProfilePhotoUrl()
        ));
    }

    @DeleteMapping("/profile-photo")
    public ResponseEntity<?> deletePhoto(@RequestHeader("Authorization") String bearer) throws Exception {
        String userId = jwtUtil.extractUserId(bearer.replace("Bearer ", ""));
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String url = u.getProfilePhotoUrl(); // e.g. /uploads/user_123_....jpg
        if (url != null) {
            Path uploadsDir = Paths.get(System.getProperty("user.dir"), "uploads");
            Path target = uploadsDir.resolve(Paths.get(url).getFileName().toString());
            Files.deleteIfExists(target);
            u.setProfilePhotoUrl(null);
            u.setUpdatedAt(java.time.LocalDateTime.now());
            userRepository.save(u);
        }
        return ResponseEntity.ok(Map.of("message", "Profile photo deleted"));
    }


}
