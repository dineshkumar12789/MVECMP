package com.mvecm.service;

import com.mvecm.repository.OrderRepository;
import com.mvecm.repository.ProductRepository;
import com.mvecm.repository.UserRepository;
import com.mvecm.repository.VendorRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class AdminDashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public AdminDashboardService(ProductRepository productRepository,
                                 OrderRepository orderRepository,
                                 UserRepository userRepository,
                                 VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    public Map<String, Object> getOverviewStats() {
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        long totalUsers = userRepository.count();
        long totalVendors = vendorRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();

        long placedOrders = orderRepository.countByStatus("PLACED");
        long shippedOrders = orderRepository.countByStatus("SHIPPED");
        long deliveredOrders = orderRepository.countByStatus("DELIVERED");
        long cancelledOrders = orderRepository.countByStatus("CANCELLED");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalUsers", totalUsers);
        stats.put("totalVendors", totalVendors);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("PLACED", placedOrders);
        statusCounts.put("SHIPPED", shippedOrders);
        statusCounts.put("DELIVERED", deliveredOrders);
        statusCounts.put("CANCELLED", cancelledOrders);
        stats.put("ordersByStatus", statusCounts);

        stats.put("recentOrders", orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5)).getContent());

        return stats;
    }
}
