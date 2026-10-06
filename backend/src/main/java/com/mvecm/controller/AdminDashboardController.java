package com.mvecm.controller;

import com.mvecm.dto.*;
import com.mvecm.entity.*;
import com.mvecm.service.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final VendorService vendorService;
    private final OrderService orderService;
    private final UserService userService;

    public AdminDashboardController(AdminDashboardService dashboardService,
                                    ProductService productService,
                                    CategoryService categoryService,
                                    VendorService vendorService,
                                    OrderService orderService,
                                    UserService userService) {
        this.dashboardService = dashboardService;
        this.productService = productService;
        this.categoryService = categoryService;
        this.vendorService = vendorService;
        this.orderService = orderService;
        this.userService = userService;
    }

    // 1. Overview metrics
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview() {
        Map<String, Object> stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success("Overview stats loaded", stats));
    }

    // 2. Product Management (CRUD)
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<Product>>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productService.getProducts(categoryId, vendorId, minPrice, maxPrice, keyword, false, pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin product list", products));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(@Valid @RequestBody ProductRequest req) {
        Product created = productService.createProduct(req);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        Product updated = productService.updateProduct(id, req);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully"));
    }

    // 3. Category Management (CRUD)
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories list", categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryRequest req) {
        Category category = categoryService.createCategory(req);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", category), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        Category category = categoryService.updateCategory(id, req);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
    }

    // 4. Vendor Management (CRUD)
    @GetMapping("/vendors")
    public ResponseEntity<ApiResponse<List<Vendor>>> getAllVendors() {
        List<Vendor> vendors = vendorService.getAllVendors(false);
        return ResponseEntity.ok(ApiResponse.success("Vendors list", vendors));
    }

    @PostMapping("/vendors")
    public ResponseEntity<ApiResponse<Vendor>> createVendor(@Valid @RequestBody VendorRequest req) {
        Vendor vendor = vendorService.createVendor(req);
        return new ResponseEntity<>(ApiResponse.success("Vendor created successfully", vendor), HttpStatus.CREATED);
    }

    @PutMapping("/vendors/{id}")
    public ResponseEntity<ApiResponse<Vendor>> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorRequest req) {
        Vendor vendor = vendorService.updateVendor(id, req);
        return ResponseEntity.ok(ApiResponse.success("Vendor updated successfully", vendor));
    }

    @DeleteMapping("/vendors/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully"));
    }

    // 5. Order Management
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<Order>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderService.getAllOrdersForAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success("Admin order list", orders));
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<Order>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest req) {
        Order updated = orderService.updateOrderStatus(id, req);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", updated));
    }

    // 6. User Management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users list", users));
    }

    @PutMapping("/users/{id}/toggle-block")
    public ResponseEntity<ApiResponse<User>> toggleBlockUser(@PathVariable Long id) {
        User user = userService.toggleBlockUser(id);
        String action = user.isBlocked() ? "blocked" : "unblocked";
        return ResponseEntity.ok(ApiResponse.success("User " + action + " successfully", user));
    }
}
