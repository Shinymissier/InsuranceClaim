package com.insurance.claim.repository;

import com.insurance.claim.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByClaimantUsernameOrderByCreatedAtDesc(String claimantUsername);
    List<Claim> findAllByOrderByCreatedAtDesc();
}
