package com.mvecm.controller;

import com.mvecm.dto.AddressRequest;
import com.mvecm.dto.ApiResponse;
import com.mvecm.dto.UserProfileUpdateRequest;
import com.mvecm.entity.Address;
import com.mvecm.entity.User;
import com.mvecm.security.CustomUserDetails;
import com.mvecm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Profile loaded", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateRequest req) {
        User updated = userService.updateProfile(userDetails.getUser(), req);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Address> addresses = userService.getUserAddresses(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Addresses loaded", addresses));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddressRequest req) {
        Address address = userService.addAddress(userDetails.getUser(), req);
        return new ResponseEntity<>(ApiResponse.success("Address saved", address), HttpStatus.CREATED);
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        userService.deleteAddress(userDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Address removed successfully"));
    }
}
