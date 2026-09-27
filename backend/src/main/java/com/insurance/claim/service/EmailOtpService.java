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

<<<<<<< HEAD
    /** True when SMTP is not configured — OTPs are printed to console instead. */
    private final boolean devMode;

=======
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
    public EmailOtpService(JavaMailSender mailSender, PasswordEncoder encoder,
                           @Value("${app.otp.expiry-minutes:5}") int expiryMinutes,
                           @Value("${spring.mail.username:}") String from) {
        this.mailSender = mailSender;
        this.encoder = encoder;
        this.expiryMinutes = expiryMinutes;
        this.from = from;
<<<<<<< HEAD
        this.devMode = from == null || from.isBlank();
        if (this.devMode) {
            System.out.println("[EmailOtpService] DEV MODE: SMTP not configured — OTPs will be printed to the console.");
        }
    }

    /** Returns the plain-text OTP (only non-null in dev mode, null when email was sent). */
    public String sendOtp(UserAccount user) {
=======
    }

    public void sendOtp(UserAccount user) {
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
        String otp = generateOtp();
        user.setOtpHash(encoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        user.setOtpAttempts(0);
<<<<<<< HEAD
        return send(user, "Insurance Claim Verification - Email Verification OTP",
                "Your verification OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not expect this email, contact your administrator.",
                otp);
    }

    /** Returns the plain-text OTP (only non-null in dev mode, null when email was sent). */
    public String sendPasswordResetOtp(UserAccount user) {
=======
        send(user, "Insurance Claim Verification - Email Verification OTP",
                "Your verification OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not expect this email, contact your administrator.");
    }

    public void sendPasswordResetOtp(UserAccount user) {
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
        String otp = generateOtp();
        user.setPasswordResetOtpHash(encoder.encode(otp));
        user.setPasswordResetOtpExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        user.setPasswordResetOtpAttempts(0);
<<<<<<< HEAD
        return send(user, "Insurance Claim Verification - Password Reset OTP",
                "Your password reset OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not request a password reset, you can safely ignore this email.",
                otp);
    }

    public boolean isDevMode() {
        return devMode;
=======
        send(user, "Insurance Claim Verification - Password Reset OTP",
                "Your password reset OTP is: " + otp +
                "\n\nThis OTP expires in " + expiryMinutes + " minutes.\n" +
                "If you did not request a password reset, you can safely ignore this email.");
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
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

<<<<<<< HEAD
    /**
     * Sends an email if SMTP is configured, otherwise logs the OTP to console.
     * @return the plain OTP string in dev mode, null when a real email was dispatched.
     */
    private String send(UserAccount user, String subject, String body, String otp) {
        if (devMode) {
            System.out.println("=================================================================");
            System.out.println("[EmailOtpService] DEV OTP (email not sent — SMTP not configured)");
            System.out.println("  Username : " + user.getUsername());
            System.out.println("  Email    : " + user.getEmail());
            System.out.println("  Subject  : " + subject);
            System.out.println("  OTP      : " + otp);
            System.out.println("=================================================================");
            return otp;
        }
=======
    private void send(UserAccount user, String subject, String body) {
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
        SimpleMailMessage message = new SimpleMailMessage();
        if (!from.isBlank()) message.setFrom(from);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText("Hello " + user.getFullName() + ",\n\n" + body);
        mailSender.send(message);
<<<<<<< HEAD
        return null;
    }
}

=======
    }
}
>>>>>>> 2e9d4774e4564c1303f0b69bc94ca06816c250b0
