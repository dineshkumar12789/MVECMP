package com.mvecm.service;

import com.mvecm.dto.ProductRequest;
import com.mvecm.entity.Category;
import com.mvecm.entity.Product;
import com.mvecm.entity.Vendor;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.CategoryRepository;
import com.mvecm.repository.ProductRepository;
import com.mvecm.repository.VendorRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final VendorRepository vendorRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          VendorRepository vendorRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.vendorRepository = vendorRepository;
    }

    public Page<Product> getProducts(Long categoryId,
                                    Long vendorId,
                                    BigDecimal minPrice,
                                    BigDecimal maxPrice,
                                    String keyword,
                                    boolean activeOnly,
                                    Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (activeOnly) {
                predicates.add(cb.isTrue(root.get("isActive")));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (vendorId != null) {
                predicates.add(cb.equal(root.get("vendor").get("id"), vendorId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable);
    }

    public List<Product> getFeaturedProducts() {
        return productRepository.findTop8ByIsActiveTrueOrderByRatingDesc();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
    }

    @Transactional
    public Product createProduct(ProductRequest req) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + req.getCategoryId()));

        Vendor vendor = vendorRepository.findById(req.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + req.getVendorId()));

        Product product = new Product();
        product.setName(req.getName().trim());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setDiscountPrice(req.getDiscountPrice());
        product.setStockQuantity(req.getStockQuantity());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);
        product.setVendor(vendor);
        product.setActive(req.getIsActive() != null ? req.getIsActive() : true);

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest req) {
        Product product = getProductById(id);

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + req.getCategoryId()));

        Vendor vendor = vendorRepository.findById(req.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + req.getVendorId()));

        product.setName(req.getName().trim());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setDiscountPrice(req.getDiscountPrice());
        product.setStockQuantity(req.getStockQuantity());
        product.setImageUrl(req.getImageUrl());
        product.setCategory(category);
        product.setVendor(vendor);
        if (req.getIsActive() != null) {
            product.setActive(req.getIsActive());
        }

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}
