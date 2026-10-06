package com.mvecm.repository;

import com.mvecm.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);
    void deleteByEmail(String email);
}
