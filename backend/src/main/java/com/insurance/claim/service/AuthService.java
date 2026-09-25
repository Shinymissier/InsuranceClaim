package com.insurance.claim.service;

import com.insurance.claim.dto.LoginResponse;
import com.insurance.claim.dto.ChangePasswordRequest;
import com.insurance.claim.dto.ForgotPasswordRequest;
import com.insurance.claim.dto.ResetPasswordRequest;
import com.insurance.claim.dto.OtpRequest;
import com.insurance.claim.dto.UserCreateRequest;
import com.insurance.claim.model.Role;
import com.insurance.claim.model.UserAccount;
import com.insurance.claim.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {
    private final UserAccountRepository users;
    private final PasswordEncoder encoder;
    private final EmailOtpService otpService;

    public AuthService(UserAccountRepository users, PasswordEncoder encoder, EmailOtpService otpService) {
        this.users = users;
        this.encoder = encoder;
        this.otpService = otpService;
    }

    public LoginResponse login(String username, String password) {
        UserAccount user = users.findByUsername(username == null ? "" : username.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        if (!encoder.matches(password == null ? "" : password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid username or password");
        }
        if (!user.isEmailVerified()) throw new IllegalArgumentException("Email is not verified. Complete OTP verification first.");
        if (!user.isEnabled()) throw new IllegalArgumentException("This account is inactive. Contact the administrator.");
        user.setAuthToken(UUID.randomUUID().toString());
        users.save(user);
        return new LoginResponse(user.getUsername(), user.getFullName(), user.getRole().name(), user.getEmail(), user.getAuthToken());
    }

    public UserAccount requireToken(String token) {
        if (token == null || token.isBlank()) throw new IllegalArgumentException("Authentication token is required");
        UserAccount user = users.findByAuthToken(token).orElseThrow(() -> new IllegalArgumentException("Invalid authentication token"));
        if (!user.isEnabled() || !user.isEmailVerified()) throw new IllegalArgumentException("Account is not active or email is not verified");
        return user;
    }

    public UserAccount requireUser(String username) {
        UserAccount user = users.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Unknown user: " + username));
        if (!user.isEnabled() || !user.isEmailVerified()) throw new IllegalArgumentException("Account is not active or email is not verified");
        return user;
    }

    public UserAccount requireAdmin(String username) {
        UserAccount user = requireUser(username);
        if (user.getRole() != Role.ADMIN) throw new IllegalArgumentException("Administrator permission required");
        return user;
    }

    @Transactional
    public UserAccount createClaimant(UserCreateRequest request) {
        if (request == null) throw new IllegalArgumentException("Registration details are required");
        validateNewUser(request);
        if (users.existsByUsername(request.getUsername().trim())) throw new IllegalArgumentException("Username already exists");
        if (users.existsByEmail(request.getEmail().trim())) throw new IllegalArgumentException("Email already exists");

        UserAccount user = new UserAccount(request.getUsername().trim(), encoder.encode(request.getPassword()),
                request.getFullName().trim(), request.getEmail().trim(), Role.CLAIMANT, false, false);
        UserAccount saved = users.save(user);
        otpService.sendOtp(saved);
        return saved;
    }

    @Transactional
    public UserAccount createUser(String adminUsername, UserCreateRequest request) {
        requireAdmin(adminUsername);
        if (request.getFullName() == null || request.getFullName().isBlank()) throw new IllegalArgumentException("Full name is required");
        if (request.getEmail() == null || !request.getEmail().contains("@")) throw new IllegalArgumentException("Valid email is required");
        if (request.getUsername() == null || request.getUsername().isBlank()) throw new IllegalArgumentException("Username is required");
        if (request.getPassword() == null || request.getPassword().length() < 6) throw new IllegalArgumentException("Password must contain at least 6 characters");
        if (request.getRole() == null) throw new IllegalArgumentException("Staff role is required");
        if (request.getRole() == Role.CLAIMANT || request.getRole() == Role.ADMIN) throw new IllegalArgumentException("Only staff roles can be created here");
        if (users.existsByUsername(request.getUsername().trim())) throw new IllegalArgumentException("Username already exists");
        if (users.existsByEmail(request.getEmail().trim())) throw new IllegalArgumentException("Email already exists");

        UserAccount user = new UserAccount(request.getUsername().trim(), encoder.encode(request.getPassword()),
                request.getFullName().trim(), request.getEmail().trim(), request.getRole(), false, false);
        UserAccount saved = users.save(user);
        otpService.sendOtp(saved);
        return saved;
    }

    private void validateNewUser(UserCreateRequest request) {
        if (request.getFullName() == null || request.getFullName().isBlank()) throw new IllegalArgumentException("Full name is required");
        if (request.getEmail() == null || !request.getEmail().contains("@")) throw new IllegalArgumentException("Valid email is required");
        if (request.getUsername() == null || request.getUsername().isBlank()) throw new IllegalArgumentException("Username is required");
        if (request.getPassword() == null || request.getPassword().length() < 6) throw new IllegalArgumentException("Password must contain at least 6 characters");
    }

    @Transactional
    public void verifyOtp(OtpRequest request) {
        UserAccount user = users.findByUsername(request.getUsername() == null ? "" : request.getUsername().trim())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (user.isEmailVerified()) return;
        if (!otpService.verify(user, request.getOtp())) {
            users.save(user);
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        user.setEmailVerified(true);
        user.setEnabled(true);
        user.setOtpHash(null);
        user.setOtpExpiry(null);
        user.setOtpAttempts(0);
        users.save(user);
    }

    @Transactional
    public void resendOtp(String username) {
        UserAccount user = users.findByUsername(username == null ? "" : username.trim())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (user.isEmailVerified()) throw new IllegalArgumentException("Email is already verified");
        otpService.sendOtp(user);
        users.save(user);
    }


    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        String email = request.getEmail().trim();
        users.findByEmail(email).ifPresent(user -> {
            if (user.isEmailVerified() && user.isEnabled()) {
                otpService.sendPasswordResetOtp(user);
                users.save(user);
            }
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null) throw new IllegalArgumentException("Password reset details are required");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new IllegalArgumentException("Email is required");
        if (request.getOtp() == null || !request.getOtp().matches("\\d{6}")) throw new IllegalArgumentException("Enter a valid 6-digit OTP");
        validatePassword(request.getNewPassword());

        UserAccount user = users.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset request"));
        if (!user.isEmailVerified() || !user.isEnabled()) throw new IllegalArgumentException("Account is not active");
        if (!otpService.verifyPasswordResetOtp(user, request.getOtp())) {
            users.save(user);
            throw new IllegalArgumentException("Invalid or expired password reset OTP");
        }

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setPasswordResetOtpHash(null);
        user.setPasswordResetOtpExpiry(null);
        user.setPasswordResetOtpAttempts(0);
        user.setAuthToken(null);
        users.save(user);
    }

    @Transactional
    public void changePassword(String token, ChangePasswordRequest request) {
        UserAccount user = requireToken(token);
        if (request == null) throw new IllegalArgumentException("Password change details are required");
        if (!encoder.matches(request.getCurrentPassword() == null ? "" : request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        validatePassword(request.getNewPassword());
        if (encoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from the current password");
        }
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setAuthToken(null);
        users.save(user);
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("Password must contain at least 6 characters");
        }
    }

    @Transactional
    public void logout(String token) {
        if (token == null || token.isBlank()) return;
        users.findByAuthToken(token).ifPresent(user -> { user.setAuthToken(null); users.save(user); });
    }

    public void setEnabled(String adminUsername, Long id, boolean enabled) {
        requireAdmin(adminUsername);
        UserAccount user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (user.getRole() == Role.ADMIN && !enabled) throw new IllegalArgumentException("Admin accounts cannot be disabled from this screen");
        user.setEnabled(enabled && user.isEmailVerified());
        users.save(user);
    }

    public List<UserAccount> users(String adminUsername) {
        requireAdmin(adminUsername);
        return users.findAllByOrderByIdDesc();
    }
}
