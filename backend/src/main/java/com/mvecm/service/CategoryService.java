package com.mvecm.service;

import com.mvecm.dto.CategoryRequest;
import com.mvecm.entity.Category;
import com.mvecm.exception.BadRequestException;
import com.mvecm.exception.ResourceNotFoundException;
import com.mvecm.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    @Transactional
    public Category createCategory(CategoryRequest req) {
        if (categoryRepository.existsByName(req.getName().trim())) {
            throw new BadRequestException("Category with this name already exists");
        }
        Category category = new Category();
        category.setName(req.getName().trim());
        category.setDescription(req.getDescription());
        category.setIconUrl(req.getIconUrl());
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequest req) {
        Category category = getCategoryById(id);
        String trimmedName = req.getName().trim();
        if (!category.getName().equalsIgnoreCase(trimmedName) && categoryRepository.existsByName(trimmedName)) {
            throw new BadRequestException("Category name is already in use");
        }
        category.setName(trimmedName);
        category.setDescription(req.getDescription());
        category.setIconUrl(req.getIconUrl());
        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
}
