package com.mvecm.service;

import com.mvecm.dto.CheckoutRequest;
import com.mvecm.dto.OrderStatusUpdateRequest;
import com.mvecm.entity.*;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        AddressRepository addressRepository,
                        UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Order placeOrder(User user, CheckoutRequest req) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + user.getId()));

        List<CartItem> cartItems = cartItemRepository.findByUserIdOrderByCreatedAtDesc(managedUser.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Your cart is empty. Add products before checking out.");
        }

        // Validate stock and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Product '" + product.getName() + "' is out of stock or has insufficient quantity.");
            }
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            totalAmount = totalAmount.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        // Create order entity
        Order order = new Order();
        String orderNumber = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        order.setOrderNumber(orderNumber);
        order.setUser(managedUser);
        order.setTotalAmount(totalAmount);
        order.setStatus("PLACED");
        order.setPaymentMethod(req.getPaymentMethod());
        order.setPaymentStatus("COD".equalsIgnoreCase(req.getPaymentMethod()) ? "PENDING" : "COMPLETED");

        order.setShippingName(req.getShippingName());
        order.setShippingPhone(req.getShippingPhone());
        order.setShippingAddress(req.getShippingAddress());
        order.setShippingCity(req.getShippingCity());
        order.setShippingState(req.getShippingState());
        order.setShippingPostalCode(req.getShippingPostalCode());

        // Create order items & deduct product stock
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            BigDecimal price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            OrderItem orderItem = new OrderItem(order, product, product.getName(), price, item.getQuantity(), subtotal);
            order.addOrderItem(orderItem);

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Save address to user address book if requested
        if (req.isSaveAddress()) {
            Address address = new Address();
            address.setUser(user);
            address.setFullName(req.getShippingName());
            address.setPhoneNumber(req.getShippingPhone());
            address.setStreetAddress(req.getShippingAddress());
            address.setCity(req.getShippingCity());
            address.setState(req.getShippingState());
            address.setPostalCode(req.getShippingPostalCode());
            addressRepository.save(address);
        }

        // Clear cart
        cartItemRepository.deleteByUserId(user.getId());

        return savedOrder;
    }

    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Order getOrderDetails(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Unauthorized access to this order");
        }
        return order;
    }

    public Page<Order> getAllOrdersForAdmin(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatusUpdateRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        String newStatus = req.getStatus().toUpperCase();
        String currentStatus = order.getStatus();

        // If transitioning to CANCELLED, restore stock
        if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(currentStatus)) {
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        // If delivered, mark payment completed
        if ("DELIVERED".equals(newStatus)) {
            order.setPaymentStatus("COMPLETED");
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}
