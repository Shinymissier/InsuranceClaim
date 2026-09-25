package com.insurance.claim.repository;

import com.insurance.claim.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByAuthToken(String authToken);
    List<UserAccount> findAllByOrderByIdDesc();
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
