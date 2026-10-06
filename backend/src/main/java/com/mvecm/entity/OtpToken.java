package com.mvecm.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "otp_tokens")
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Column(name = "expiry_time", nullable = false)
    private OffsetDateTime expiryTime;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed = false;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    public OtpToken() {}

    public OtpToken(String email, String otpCode, OffsetDateTime expiryTime) {
        this.email = email;
        this.otpCode = otpCode;
        this.expiryTime = expiryTime;
        this.attemptCount = 0;
        this.isUsed = false;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public OffsetDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(OffsetDateTime expiryTime) { this.expiryTime = expiryTime; }

    public int getAttemptCount() { return attemptCount; }
    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }

    public boolean isUsed() { return isUsed; }
    public void setUsed(boolean used) { isUsed = used; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
