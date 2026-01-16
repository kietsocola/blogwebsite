package com.blog.service;

import com.blog.dto.request.CategoryRequest;
import com.blog.dto.response.CategoryResponse;
import com.blog.entity.Category;
import com.blog.exception.ApiException;
import com.blog.repository.CategoryRepository;
import com.blog.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Category not found: " + slug));
        return CategoryResponse.fromEntity(category);
    }
    
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Check if name exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new ApiException.DuplicateResourceException("Category name already exists");
        }
        
        // Generate slug
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.toSlug(request.getName());
        }
        
        // Check if slug exists
        if (categoryRepository.existsBySlug(slug)) {
            throw new ApiException.DuplicateResourceException("Category slug already exists");
        }
        
        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .build();
        
        categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }
    
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Category not found"));
        
        // Check if name is being changed and already exists
        if (!category.getName().equals(request.getName()) && 
                categoryRepository.existsByName(request.getName())) {
            throw new ApiException.DuplicateResourceException("Category name already exists");
        }
        
        // Handle slug
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.toSlug(request.getName());
        }
        
        // Check if slug is being changed and already exists
        if (!category.getSlug().equals(slug) && categoryRepository.existsBySlug(slug)) {
            throw new ApiException.DuplicateResourceException("Category slug already exists");
        }
        
        category.setName(request.getName());
        category.setSlug(slug);
        
        categoryRepository.save(category);
        return CategoryResponse.fromEntity(category);
    }
    
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Category not found"));
        
        // Check if category has posts
        long postCount = postRepository.countByCategoryId(id);
        if (postCount > 0) {
            throw new ApiException.BadRequestException(
                    "Cannot delete category with " + postCount + " posts. Move or delete posts first.");
        }
        
        categoryRepository.delete(category);
    }
}
