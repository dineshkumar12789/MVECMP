package com.mvecm.controller;

import com.mvecm.dto.ApiResponse;
import com.mvecm.entity.Vendor;
import com.mvecm.service.VendorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vendor>>> getVendors() {
        List<Vendor> vendors = vendorService.getAllVendors(true);
        return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vendor>> getVendorById(@PathVariable Long id) {
        Vendor vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor details", vendor));
    }
}
