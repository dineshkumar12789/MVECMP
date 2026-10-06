package com.mvecm.controller;

import com.mvecm.dto.*;
import com.mvecm.entity.User;
import com.mvecm.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        return new ResponseEntity<>(ApiResponse.success("User registered successfully. You may now log in.", user), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody AuthRequest req) {
        Map<String, Object> response = authService.initiateLogin(req);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email address", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        JwtResponse jwtResponse = authService.verifyOtp(req);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", jwtResponse));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        Map<String, Object> response = authService.resendOtp(req);
        return ResponseEntity.ok(ApiResponse.success("OTP resent successfully", response));
    }
}
