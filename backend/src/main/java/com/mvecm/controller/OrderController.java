package com.mvecm.controller;

import com.mvecm.dto.ApiResponse;
import com.mvecm.dto.CheckoutRequest;
import com.mvecm.entity.Order;
import com.mvecm.security.CustomUserDetails;
import com.mvecm.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Order>> checkout(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CheckoutRequest req) {
        Order order = orderService.placeOrder(userDetails.getUser(), req);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully!", order), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Order>>> getMyOrders(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Order> orders = orderService.getUserOrders(userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Orders retrieved successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Order>> getOrderDetails(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        Order order = orderService.getOrderDetails(userDetails.getUser(), id);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved", order));
    }
}
