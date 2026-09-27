package com.insurance.claim.repository;

import com.insurance.claim.model.ClaimEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimEventRepository extends JpaRepository<ClaimEvent, Long> {
    List<ClaimEvent> findByClaimIdOrderByEventTimeAsc(Long claimId);
}
