package com.mvecm.controller;

import com.mvecm.dto.ApiResponse;
import com.mvecm.dto.CartItemRequest;
import com.mvecm.entity.CartItem;
import com.mvecm.security.CustomUserDetails;
import com.mvecm.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Map<String, Object> cartSummary = cartService.getCartSummary(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shopping cart retrieved", cartSummary));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartItem>> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CartItemRequest req) {
        CartItem item = cartService.addToCart(userDetails.getUser(), req);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", item));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<CartItem>> updateQuantity(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @RequestParam int quantity) {
        CartItem item = cartService.updateCartItemQuantity(userDetails.getUser(), id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Cart item quantity updated", item));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        cartService.removeFromCart(userDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        cartService.clearCart(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Shopping cart cleared"));
    }
}
