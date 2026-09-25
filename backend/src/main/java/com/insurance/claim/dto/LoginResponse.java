package com.insurance.claim.dto;

public record LoginResponse(String username, String fullName, String role, String email, String token) {}
