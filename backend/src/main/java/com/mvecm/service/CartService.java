package com.mvecm.service;

import com.mvecm.dto.CartItemRequest;
import com.mvecm.entity.CartItem;
import com.mvecm.entity.Product;
import com.mvecm.entity.User;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.CartItemRepository;
import com.mvecm.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final com.mvecm.repository.UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       com.mvecm.repository.UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getCartSummary(User user) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        BigDecimal total = BigDecimal.ZERO;
        int totalItems = 0;

        for (CartItem item : items) {
            BigDecimal effectivePrice = item.getProduct().getDiscountPrice() != null
                    ? item.getProduct().getDiscountPrice()
                    : item.getProduct().getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemTotal);
            totalItems += item.getQuantity();
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("items", items);
        summary.put("totalAmount", total);
        summary.put("totalCount", totalItems);
        return summary;
    }

    @Transactional
    public CartItem addToCart(User user, CartItemRequest req) {
        User managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + user.getId()));

        Product product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + req.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Product is currently unavailable");
        }

        if (product.getStockQuantity() < req.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStockQuantity());
        }

        return cartItemRepository.findByUserIdAndProductId(managedUser.getId(), product.getId())
                .map(existingItem -> {
                    int newQty = existingItem.getQuantity() + req.getQuantity();
                    if (product.getStockQuantity() < newQty) {
                        throw new BadRequestException("Cannot add more. Available stock: " + product.getStockQuantity());
                    }
                    existingItem.setQuantity(newQty);
                    return cartItemRepository.save(existingItem);
                })
                .orElseGet(() -> {
                    CartItem newItem = new CartItem(managedUser, product, req.getQuantity());
                    return cartItemRepository.save(newItem);
                });
    }

    @Transactional
    public CartItem updateCartItemQuantity(User user, Long cartItemId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be at least 1. Use remove to delete item.");
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this cart item");
        }

        if (item.getProduct().getStockQuantity() < quantity) {
            throw new BadRequestException("Requested quantity exceeds available stock (" + item.getProduct().getStockQuantity() + ")");
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(User user, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this cart item");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUserId(user.getId());
    }
}
