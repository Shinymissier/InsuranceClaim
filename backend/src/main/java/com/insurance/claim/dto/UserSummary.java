package com.insurance.claim.dto;

public record UserSummary(Long id, String username, String fullName, String email, String role, boolean emailVerified, boolean enabled) {}
