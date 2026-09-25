package com.insurance.claim.service;

import com.insurance.claim.dto.ActionRequest;
import com.insurance.claim.model.*;
import com.insurance.claim.repository.ClaimEventRepository;
import com.insurance.claim.repository.ClaimRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ClaimService {
    private final ClaimRepository claims;
    private final ClaimEventRepository events;
    private final AuthService auth;
    private final FileStorageService files;
    private final RealtimeEventService realtime;

    public ClaimService(ClaimRepository claims, ClaimEventRepository events, AuthService auth,
                        FileStorageService files, RealtimeEventService realtime) {
        this.claims = claims; this.events = events; this.auth = auth; this.files = files; this.realtime = realtime;
    }

    @Transactional
    public Claim submit(String username, String policyNumber, BigDecimal amount, String description, MultipartFile document) throws IOException {
        UserAccount claimant = auth.requireUser(username);
        if (claimant.getRole() != Role.CLAIMANT) throw new IllegalArgumentException("Only a claimant can submit a claim");
        if (policyNumber == null || policyNumber.isBlank()) throw new IllegalArgumentException("Policy number is required");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Amount must be greater than zero");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("Description is required");
        if (document == null || document.isEmpty()) throw new IllegalArgumentException("Supporting document is required");

        Claim claim = new Claim();
        claim.setClaimantUsername(username); claim.setClaimantName(claimant.getFullName());
        claim.setPolicyNumber(policyNumber.trim()); claim.setAmount(amount); claim.setDescription(description.trim());
        claim.setDocumentOriginalName(document.getOriginalFilename()); claim.setDocumentStoredName(files.store(document));
        claim.setStatus(ClaimStatus.SUBMITTED); claim.setLastUpdatedBy(username);
        Claim saved = claims.save(claim);
        events.save(new ClaimEvent(saved.getId(), "CLAIM_SUBMITTED", saved.getStatus().name(), username, "Claim submitted with supporting document"));
        publish(saved); return saved;
    }

    public List<Claim> mine(String username) { return claims.findByClaimantUsernameOrderByCreatedAtDesc(username); }
    public List<Claim> all() { return claims.findAllByOrderByCreatedAtDesc(); }
    public List<ClaimEvent> history(Long claimId) { return events.findByClaimIdOrderByEventTimeAsc(claimId); }
    public Claim get(Long id) { return claims.findById(id).orElseThrow(() -> new IllegalArgumentException("Claim not found")); }

    @Transactional
    public Claim verify(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername); requireRole(actor, Role.CLAIM_OFFICER, Role.ADMIN);
        Claim claim = get(id); requireStatus(claim, ClaimStatus.SUBMITTED);
        if (claim.getDocumentStoredName() == null || claim.getDocumentStoredName().isBlank())
            throw new IllegalStateException("Cannot verify this claim because the supporting document is missing. Use Reject only when the claim should actually be rejected.");
        if (claim.getAmount().compareTo(new BigDecimal("500000")) > 0)
            return update(claim, ClaimStatus.FRAUD_REVIEW, "FRAUD_REVIEW", actorUsername, note(req, "High-value claim sent for fraud review"));
        return update(claim, ClaimStatus.VERIFIED, "CLAIM_VERIFIED", actorUsername, note(req, "Policy and documents verified"));
    }

    @Transactional
    public Claim clearFraud(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername); requireRole(actor, Role.CLAIM_OFFICER, Role.ADMIN);
        Claim claim = get(id); requireStatus(claim, ClaimStatus.FRAUD_REVIEW);
        return update(claim, ClaimStatus.VERIFIED, "FRAUD_REVIEW_CLEARED", actorUsername, note(req, "Fraud review cleared; claim returned to verification workflow"));
    }

    @Transactional
    public Claim survey(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername); requireRole(actor, Role.SURVEYOR, Role.ADMIN);
        Claim claim = get(id); requireStatus(claim, ClaimStatus.VERIFIED);
        return update(claim, ClaimStatus.SURVEY_COMPLETED, "SURVEY_COMPLETED", actorUsername, note(req, "Survey/inspection completed"));
    }

    @Transactional
    public Claim approve(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername); requireRole(actor, Role.CLAIM_OFFICER, Role.ADMIN);
        Claim claim = get(id); requireStatus(claim, ClaimStatus.SURVEY_COMPLETED);
        return update(claim, ClaimStatus.APPROVED, "CLAIM_APPROVED", actorUsername, note(req, "Claim approved"));
    }

    @Transactional
    public Claim reject(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername); requireRole(actor, Role.CLAIM_OFFICER, Role.ADMIN);
        Claim claim = get(id);
        if (claim.getStatus() == ClaimStatus.SETTLED || claim.getStatus() == ClaimStatus.REJECTED) throw new IllegalStateException("This claim can no longer be rejected");
        return update(claim, ClaimStatus.REJECTED, "CLAIM_REJECTED", actorUsername, note(req, "Claim rejected"));
    }

    @Transactional
    public Claim settle(Long id, ActionRequest req, String actorUsername) {
        UserAccount actor = auth.requireUser(actorUsername);
        requireRole(actor, Role.FINANCE_OFFICER, Role.ADMIN);

        Claim claim = get(id);
        requireStatus(claim, ClaimStatus.APPROVED);

        if (req == null) {
            throw new IllegalArgumentException("Payment settlement details are required");
        }

        String paymentMethod = req.getPaymentMethod() == null
                ? ""
                : req.getPaymentMethod().trim();
        String transactionReference = req.getTransactionReference() == null
                ? ""
                : req.getTransactionReference().trim();

        if (paymentMethod.isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        if (!List.of("BANK_TRANSFER", "UPI", "CHEQUE").contains(paymentMethod)) {
            throw new IllegalArgumentException("Invalid payment method");
        }

        if (transactionReference.isBlank()) {
            throw new IllegalArgumentException("Transaction/reference number is required");
        }

        BigDecimal settlementAmount = req.getAmount();
        if (settlementAmount == null || settlementAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Settlement amount must be greater than zero");
        }

        if (settlementAmount.compareTo(claim.getAmount()) > 0) {
            throw new IllegalArgumentException("Settlement amount cannot exceed the approved claim amount of ₹" + claim.getAmount());
        }

        claim.setPaymentMethod(paymentMethod);
        claim.setTransactionReference(transactionReference);
        claim.setSettlementAmount(settlementAmount);
        claim.setSettlementDate(java.time.LocalDateTime.now());

        String paymentNote = "Payment settlement completed via "
                + paymentMethod.replace('_', ' ')
                + ". Amount: ₹" + settlementAmount
                + ". Reference: " + transactionReference;

        return update(claim, ClaimStatus.SETTLED, "CLAIM_SETTLED", actorUsername, note(req, paymentNote));
    }

    private Claim update(Claim claim, ClaimStatus status, String action, String actor, String note) {
        claim.setStatus(status); claim.setLastUpdatedBy(actor); Claim saved = claims.save(claim);
        events.save(new ClaimEvent(saved.getId(), action, status.name(), actor, note)); publish(saved); return saved;
    }
    private void publish(Claim claim) { realtime.notifyUser(claim.getClaimantUsername(), claim); realtime.notifyStaff(claim); }
    private void requireRole(UserAccount user, Role... allowed) { for (Role role : allowed) if (user.getRole() == role) return; throw new IllegalArgumentException("Your role is not allowed to perform this action"); }
    private void requireStatus(Claim claim, ClaimStatus expected) { if (claim.getStatus() != expected) throw new IllegalStateException("Expected status " + expected + " but current status is " + claim.getStatus()); }
    private String note(ActionRequest req, String fallback) { return req.getNote() == null || req.getNote().isBlank() ? fallback : req.getNote(); }
}
