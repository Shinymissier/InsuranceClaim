package com.insurance.claim.controller;

import com.insurance.claim.dto.*;
import com.insurance.claim.model.UserAccount;
import com.insurance.claim.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try { return ResponseEntity.ok(auth.login(request.getUsername(), request.getPassword())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/register-claimant")
    public ResponseEntity<?> registerClaimant(@RequestBody UserCreateRequest request) {
        try {
            UserAccount created = auth.createClaimant(request);
            return ResponseEntity.ok(Map.of(
                    "username", created.getUsername(),
                    "email", created.getEmail(),
                    "message", "Claimant account created. OTP sent to the registered email."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Registration failed" : e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            auth.forgotPassword(request);
            return ResponseEntity.ok(Map.of("message", "If the email belongs to an active account, a password reset OTP has been sent."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Password reset request failed" : e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            auth.resetPassword(request);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please log in with your new password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Password reset failed" : e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader(value = "Authorization", required = false) String authorization,
                                            @RequestBody ChangePasswordRequest request) {
        try {
            auth.changePassword(bearer(authorization), request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please log in again with your new password."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Password change failed" : e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        auth.logout(bearer(authorization));
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
        try { auth.verifyOtp(request); return ResponseEntity.ok(Map.of("message", "Email verified. Account is now active.")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestParam String username) {
        try { auth.resendOtp(username); return ResponseEntity.ok(Map.of("message", "A new OTP was sent to the registered email.")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    }

    private String bearer(String value) {
        if (value == null) return "";
        return value.startsWith("Bearer ") ? value.substring(7) : value;
    }
}
