package com.insurance.claim.service;

import com.insurance.claim.model.UserAccount;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class EmailOtpService {
    private final JavaMailSender mailSender;
    private final PasswordEncoder encoder;
    private final SecureRandom random = new SecureRandom();
    private final int expiryMinutes;
    private final String from;

    public EmailOtpService(JavaMailSender mailSender, PasswordEncoder encoder,
                           @Value("${app.otp.expiry-minutes:5}") int expiryMinutes,
                           @Value("${spring.mail.username:}") String from) {
        this.mailSender = mailSender;
        this.encoder = encoder;
        this.expiryMinutes = expiryMinutes;
        this.from = from;
    }

    public void sendOtp(UserAccount user) {
        String otp = generateOtp();
        user.setOtpHash(encoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        user.setOtpAttempts(0);
        send(user, "Insurance Claim Verification - Email Verification OTP",
                "Your verification OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not expect this email, contact your administrator.");
    }

    public void sendPasswordResetOtp(UserAccount user) {
        String otp = generateOtp();
        user.setPasswordResetOtpHash(encoder.encode(otp));
        user.setPasswordResetOtpExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        user.setPasswordResetOtpAttempts(0);
        send(user, "Insurance Claim Verification - Password Reset OTP",
                "Your password reset OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not request a password reset, you can safely ignore this email.");
    }

    public boolean verify(UserAccount user, String otp) {
        if (user.getOtpHash() == null || user.getOtpExpiry() == null) return false;
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) return false;
        if (user.getOtpAttempts() >= 5) return false;
        user.setOtpAttempts(user.getOtpAttempts() + 1);
        return encoder.matches(otp == null ? "" : otp.trim(), user.getOtpHash());
    }

    public boolean verifyPasswordResetOtp(UserAccount user, String otp) {
        if (user.getPasswordResetOtpHash() == null || user.getPasswordResetOtpExpiry() == null) return false;
        if (LocalDateTime.now().isAfter(user.getPasswordResetOtpExpiry())) return false;
        if (user.getPasswordResetOtpAttempts() >= 5) return false;
        user.setPasswordResetOtpAttempts(user.getPasswordResetOtpAttempts() + 1);
        return encoder.matches(otp == null ? "" : otp.trim(), user.getPasswordResetOtpHash());
    }

    private String generateOtp() {
        return String.format("%06d", random.nextInt(1_000_000));
    }

    private void send(UserAccount user, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (!from.isBlank()) message.setFrom(from);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText("Hello " + user.getFullName() + ",\n\n" + body);
        mailSender.send(message);
    }
}
