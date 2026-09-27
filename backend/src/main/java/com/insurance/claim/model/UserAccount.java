package com.insurance.claim.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = false)
    private boolean enabled;

    private String otpHash;
    private java.time.LocalDateTime otpExpiry;
    private int otpAttempts;

    private String passwordResetOtpHash;
    private java.time.LocalDateTime passwordResetOtpExpiry;
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int passwordResetOtpAttempts;

    @Column(length = 80)
    private String authToken;

    public UserAccount() {}

    public UserAccount(String username, String password, String fullName, String email, Role role,
                       boolean emailVerified, boolean enabled) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.emailVerified = emailVerified;
        this.enabled = enabled;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getOtpHash() { return otpHash; }
    public void setOtpHash(String otpHash) { this.otpHash = otpHash; }
    public java.time.LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(java.time.LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }
    public int getOtpAttempts() { return otpAttempts; }
    public void setOtpAttempts(int otpAttempts) { this.otpAttempts = otpAttempts; }
    public String getPasswordResetOtpHash() { return passwordResetOtpHash; }
    public void setPasswordResetOtpHash(String passwordResetOtpHash) { this.passwordResetOtpHash = passwordResetOtpHash; }
    public java.time.LocalDateTime getPasswordResetOtpExpiry() { return passwordResetOtpExpiry; }
    public void setPasswordResetOtpExpiry(java.time.LocalDateTime passwordResetOtpExpiry) { this.passwordResetOtpExpiry = passwordResetOtpExpiry; }
    public int getPasswordResetOtpAttempts() { return passwordResetOtpAttempts; }
    public void setPasswordResetOtpAttempts(int passwordResetOtpAttempts) { this.passwordResetOtpAttempts = passwordResetOtpAttempts; }
    public String getAuthToken() { return authToken; }
    public void setAuthToken(String authToken) { this.authToken = authToken; }
}
