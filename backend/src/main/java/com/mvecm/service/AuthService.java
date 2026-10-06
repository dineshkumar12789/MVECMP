package com.mvecm.service;

import com.mvecm.dto.AuthRequest;
import com.mvecm.dto.JwtResponse;
import com.mvecm.dto.RegisterRequest;
import com.mvecm.dto.ResendOtpRequest;
import com.mvecm.dto.VerifyOtpRequest;
import com.mvecm.entity.OtpToken;
import com.mvecm.entity.Role;
import com.mvecm.entity.User;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.UnauthorizedException;
import com.mvecm.repository.OtpTokenRepository;
import com.mvecm.repository.UserRepository;
import com.mvecm.security.CustomUserDetails;
import com.mvecm.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts:3}")
    private int maxAttempts;

    @Value("${app.otp.dev-mode:true}")
    private boolean devMode;

    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       OtpTokenRepository otpTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @Transactional
    public User register(RegisterRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User();
        user.setName(req.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(req.getRole() != null ? req.getRole() : Role.USER);
        user.setBlocked(false);
        user.setVerified(true);

        return userRepository.save(user);
    }

    @Transactional
    public Map<String, Object> initiateLogin(AuthRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (user.isBlocked()) {
            throw new UnauthorizedException("Account is blocked. Please contact support.");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        // Generate 6-digit OTP
        String otpCode = generateSixDigitOtp();
        OffsetDateTime expiry = OffsetDateTime.now().plusMinutes(otpExpiryMinutes);

        // Mark any previous unused OTPs as used
        otpTokenRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(normalizedEmail)
                .ifPresent(token -> {
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                });

        OtpToken otpToken = new OtpToken(normalizedEmail, otpCode, expiry);
        otpTokenRepository.save(otpToken);

        // Send OTP via email (or dev log)
        emailService.sendOtpEmail(normalizedEmail, otpCode);

        Map<String, Object> response = new HashMap<>();
        response.put("email", normalizedEmail);
        response.put("message", "A 6-digit OTP has been sent to your email. It expires in 5 minutes.");
        if (devMode) {
            response.put("devOtp", otpCode);
        }
        return response;
    }

    @Transactional
    public JwtResponse verifyOtp(VerifyOtpRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.isBlocked()) {
            throw new UnauthorizedException("Account is blocked. Please contact support.");
        }

        OtpToken token = otpTokenRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        // Check expiration
        if (OffsetDateTime.now().isAfter(token.getExpiryTime())) {
            token.setUsed(true);
            otpTokenRepository.save(token);
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // Check attempts
        if (token.getAttemptCount() >= maxAttempts) {
            token.setUsed(true);
            otpTokenRepository.save(token);
            throw new BadRequestException("Maximum OTP attempts exceeded. Please request a new code.");
        }

        // Verify code
        if (!token.getOtpCode().equals(req.getOtpCode().trim())) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            otpTokenRepository.save(token);
            int remaining = maxAttempts - token.getAttemptCount();
            throw new BadRequestException("Invalid OTP code. " + remaining + " attempts remaining.");
        }

        // Mark OTP as used
        token.setUsed(true);
        otpTokenRepository.save(token);

        // Generate JWT
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwt = jwtUtils.generateToken(userDetails);

        return new JwtResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional
    public Map<String, Object> resendOtp(ResendOtpRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("No account registered with this email"));

        if (user.isBlocked()) {
            throw new UnauthorizedException("Account is blocked. Please contact support.");
        }

        // Invalidate old tokens
        otpTokenRepository.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(normalizedEmail)
                .ifPresent(token -> {
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                });

        String otpCode = generateSixDigitOtp();
        OffsetDateTime expiry = OffsetDateTime.now().plusMinutes(otpExpiryMinutes);

        OtpToken otpToken = new OtpToken(normalizedEmail, otpCode, expiry);
        otpTokenRepository.save(otpToken);

        emailService.sendOtpEmail(normalizedEmail, otpCode);

        Map<String, Object> response = new HashMap<>();
        response.put("email", normalizedEmail);
        response.put("message", "A new OTP code has been dispatched.");
        if (devMode) {
            response.put("devOtp", otpCode);
        }
        return response;
    }

    private String generateSixDigitOtp() {
        int number = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(number);
    }
}
