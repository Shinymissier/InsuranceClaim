package com.insurance.claim.controller;

import com.insurance.claim.dto.ActionRequest;
import com.insurance.claim.model.Claim;
import com.insurance.claim.model.Role;
import com.insurance.claim.model.UserAccount;
import com.insurance.claim.service.AuthService;
import com.insurance.claim.service.ClaimService;
import com.insurance.claim.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimService service; private final FileStorageService files; private final AuthService auth;
    public ClaimController(ClaimService service, FileStorageService files, AuthService auth) { this.service = service; this.files = files; this.auth = auth; }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submit(@RequestHeader("Authorization") String authorization, @RequestParam String username,
                                    @RequestParam String policyNumber, @RequestParam BigDecimal amount,
                                    @RequestParam String description, @RequestParam MultipartFile document) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); if (!user.getUsername().equals(username)) throw new IllegalArgumentException("Authenticated user does not match request"); return ResponseEntity.ok(service.submit(user.getUsername(), policyNumber, amount, description, document)); }
        catch (Exception e) { return bad(e); }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> mine(@RequestHeader("Authorization") String authorization) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); return ResponseEntity.ok(service.mine(user.getUsername())); }
        catch (Exception e) { return bad(e); }
    }

    @GetMapping
    public ResponseEntity<?> all(@RequestHeader("Authorization") String authorization) {
        try { UserAccount user = auth.requireToken(bearer(authorization)); if (user.getRole() == Role.CLAIMANT) throw new IllegalArgumentException("Staff permission required"); return ResponseEntity.ok(service.all()); }
        catch (Exception e) { return bad(e); }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> history(@RequestHeader("Authorization") String authorization, @PathVariable Long id) {
        try { auth.requireToken(bearer(authorization)); return ResponseEntity.ok(service.history(id)); }
        catch (Exception e) { return bad(e); }
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<?> document(@RequestHeader("Authorization") String authorization, @PathVariable Long id) {
        try { auth.requireToken(bearer(authorization)); Claim claim = service.get(id); if (claim.getDocumentStoredName() == null) return ResponseEntity.notFound().build(); Path path = files.resolve(claim.getDocumentStoredName()); Resource resource = new UrlResource(path.toUri()); if (!resource.exists()) return ResponseEntity.notFound().build(); return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + claim.getDocumentOriginalName() + "\"").contentType(MediaType.APPLICATION_OCTET_STREAM).body(resource); }
        catch (Exception e) { return bad(e); }
    }

    @PostMapping("/{id}/verify") public ResponseEntity<?> verify(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.verify(id,r,u));}
    @PostMapping("/{id}/fraud-clear") public ResponseEntity<?> fraudClear(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.clearFraud(id,r,u));}
    @PostMapping("/{id}/survey") public ResponseEntity<?> survey(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.survey(id,r,u));}
    @PostMapping("/{id}/approve") public ResponseEntity<?> approve(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.approve(id,r,u));}
    @PostMapping("/{id}/reject") public ResponseEntity<?> reject(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.reject(id,r,u));}
    @PostMapping("/{id}/settle") public ResponseEntity<?> settle(@RequestHeader("Authorization") String a,@PathVariable Long id,@RequestBody ActionRequest r){return action(a,id,r,(u)->service.settle(id,r,u));}

    private interface ClaimAction { Claim run(String username); }
    private ResponseEntity<?> action(String authorization, Long id, ActionRequest req, ClaimAction action) { try { String user = auth.requireToken(bearer(authorization)).getUsername(); return ResponseEntity.ok(action.run(user)); } catch(Exception e){ return bad(e); } }
    private String bearer(String value) { return value != null && value.startsWith("Bearer ") ? value.substring(7) : value; }
    private ResponseEntity<?> bad(Exception e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage() == null ? "Operation failed" : e.getMessage())); }
}
