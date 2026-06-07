
package com.career.skillanalyzer.service.auth;

import com.career.skillanalyzer.Model.User;
import com.career.skillanalyzer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean changePasswordLoggedIn(String userId, String currentPassword,
                                          String newPassword, String confirmPassword) {
        if (!newPassword.equals(confirmPassword)) return false;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }


    public boolean forgotPassword(String email, String otp, String newPassword) {
        boolean validOtp = otpService.verifyOtp(email, otp, "FORGOT_PASSWORD");
        if (!validOtp) return false;

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }

}