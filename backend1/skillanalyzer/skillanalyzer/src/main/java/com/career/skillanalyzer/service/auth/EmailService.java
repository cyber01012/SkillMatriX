
package com.career.skillanalyzer.service.auth;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendOtpEmail(String to, String otp, String purpose) {
        try {
            // Prepare template variables
            Context ctx = new Context();
            ctx.setVariable("otp", otp);
            ctx.setVariable("purpose", purpose); // e.g., LOGIN / PASSWORD_RESET
            ctx.setVariable("minutes", 15);

            // Render the HTML template
            String html = templateEngine.process("otp-email", ctx); // templates/otp-email.html

            // Build MIME email (HTML)
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");
            helper.setFrom("your-work-email@gmail.com");  // must match Gmail SMTP username
            helper.setTo(to);
            helper.setSubject("Your OTP Code (" + purpose + ")");
            helper.setText(html, true); // true = HTML

            mailSender.send(mime);
            log.info("[MAIL] HTML OTP sent -> to={} purpose={} otp={}", to, purpose, otp);
        } catch (Exception e) {
            log.error("[MAIL] HTML OTP send FAILED -> to={} purpose={} error={}", to, purpose, e.getMessage(), e);
            // Optionally rethrow
        }
    }
    public void sendWelcomeEmail(String to, String firstName) {
        try {
            Context ctx = new Context();
            ctx.setVariable("name", firstName != null ? firstName : "there");

            String html = templateEngine.process("welcome-email", ctx);

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, "UTF-8");

            helper.setFrom("your-work-email@gmail.com"); // same as SMTP user
            helper.setTo(to);
            helper.setSubject("Welcome to SkillMatrix 🎉");
            helper.setText(html, true);

            mailSender.send(mime);

            log.info("[MAIL] Welcome email sent -> {}", to);
        } catch (Exception e) {
            log.error("[MAIL] Welcome email FAILED -> {} error={}", to, e.getMessage(), e);
        }
    }

}


