package com.insurance.claim.controller;

import com.insurance.claim.dto.UserCreateRequest;
import com.insurance.claim.dto.UserSummary;
import com.insurance.claim.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.insurance.claim.model.UserAccount;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AuthService auth;
    public AdminController(AuthService auth) { this.auth = auth; }

    @GetMapping("/users")
    public ResponseEntity<?> users(@RequestHeader("Authorization") String authorization, @RequestParam String admin) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); if (!user.getUsername().equals(admin)) throw new IllegalArgumentException("Authenticated user does not match request"); return ResponseEntity.ok(auth.users(admin).stream().map(u -> new UserSummary(u.getId(), u.getUsername(), u.getFullName(), u.getEmail(), u.getRole().name(), u.isEmailVerified(), u.isEnabled())).toList()); }
        catch (Exception e) { return bad(e); }
    }

    @PostMapping("/users")
    public ResponseEntity<?> create(@RequestHeader("Authorization") String authorization, @RequestParam String admin, @RequestBody UserCreateRequest request) {
        try { UserAccount authenticated = auth.requireToken(bearer(authorization)); if (!authenticated.getUsername().equals(admin)) throw new IllegalArgumentException("Authenticated user does not match request");
            var created = auth.createUser(admin, request);
            return ResponseEntity.ok(Map.of("username", created.getUsername(), "email", created.getEmail(), "message", "Account created. OTP sent to the registered email."));
        } catch (Exception e) { return bad(e); }
    }

    @PostMapping("/users/{id}/enable")
    public ResponseEntity<?> enable(@RequestHeader("Authorization") String authorization, @RequestParam String admin, @PathVariable Long id) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); if (!user.getUsername().equals(admin)) throw new IllegalArgumentException("Authenticated user does not match request"); auth.setEnabled(admin, id, true); return ResponseEntity.ok(Map.of("message", "Account enabled")); }
        catch (Exception e) { return bad(e); }
    }

    @PostMapping("/users/{id}/disable")
    public ResponseEntity<?> disable(@RequestHeader("Authorization") String authorization, @RequestParam String admin, @PathVariable Long id) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); if (!user.getUsername().equals(admin)) throw new IllegalArgumentException("Authenticated user does not match request"); auth.setEnabled(admin, id, false); return ResponseEntity.ok(Map.of("message", "Account disabled")); }
        catch (Exception e) { return bad(e); }
    }

    private String bearer(String value) { return value != null && value.startsWith("Bearer ") ? value.substring(7) : value; }
    private ResponseEntity<?> bad(Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Operation failed" : e.getMessage())); }
}
