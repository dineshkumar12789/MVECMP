package com.mvecm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OrderStatusUpdateRequest {

    @NotBlank(message = "Order status is required")
    @Pattern(regexp = "^(PLACED|SHIPPED|DELIVERED|CANCELLED)$", message = "Status must be PLACED, SHIPPED, DELIVERED, or CANCELLED")
    private String status;

    public OrderStatusUpdateRequest() {}

    public OrderStatusUpdateRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
