package com.blog.service;

import com.blog.dto.request.PostRequest;
import com.blog.dto.response.PageResponse;
import com.blog.dto.response.PostResponse;
import com.blog.entity.*;
import com.blog.exception.ApiException;
import com.blog.repository.CategoryRepository;
import com.blog.repository.PostRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagService tagService;
    
    private static final int DEFAULT_PAGE_SIZE = 10;
    
    // Public: Get published posts
    public PageResponse<PostResponse> getPublishedPosts(int page) {
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts = postRepository.findByStatusOrderByCreatedAtDesc(PostStatus.PUBLISHED, pageable);
        
        List<PostResponse> content = posts.getContent().stream()
                .map(PostResponse::fromEntity)
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Public: Get post by slug
    public PostResponse getPostBySlug(String slug) {
        Post post = postRepository.findBySlugWithDetails(slug)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Post not found: " + slug));
        return PostResponse.fromEntity(post, true);
    }
    
    // Public: Get posts by category
    public PageResponse<PostResponse> getPostsByCategory(String categorySlug, int page) {
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts = postRepository.findByCategorySlugAndStatusOrderByCreatedAtDesc(
                categorySlug, PostStatus.PUBLISHED, pageable);
        
        List<PostResponse> content = posts.getContent().stream()
                .map(PostResponse::fromEntity)
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Public: Get posts by tag
    public PageResponse<PostResponse> getPostsByTag(String tagSlug, int page) {
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts = postRepository.findByTagSlugAndStatus(tagSlug, PostStatus.PUBLISHED, pageable);
        
        List<PostResponse> content = posts.getContent().stream()
                .map(PostResponse::fromEntity)
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Public: Search posts
    public PageResponse<PostResponse> searchPosts(String keyword, int page) {
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts = postRepository.searchByKeyword(keyword, PostStatus.PUBLISHED, pageable);
        
        List<PostResponse> content = posts.getContent().stream()
                .map(PostResponse::fromEntity)
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Auth: Get user's posts
    public PageResponse<PostResponse> getMyPosts(String userEmail, PostStatus status, int page) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts;
        
        if (status != null) {
            posts = postRepository.findByAuthorIdAndStatusOrderByCreatedAtDesc(user.getId(), status, pageable);
        } else {
            posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        
        List<PostResponse> content = posts.getContent().stream()
                .map(post -> PostResponse.fromEntity(post, false))
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Admin: Get all posts
    public PageResponse<PostResponse> getAllPosts(PostStatus status, int page) {
        Pageable pageable = PageRequest.of(page, DEFAULT_PAGE_SIZE);
        Page<Post> posts;
        
        if (status != null) {
            posts = postRepository.findAllByStatusWithAuthorAndCategory(status, pageable);
        } else {
            posts = postRepository.findAllWithAuthorAndCategory(pageable);
        }
        
        List<PostResponse> content = posts.getContent().stream()
                .map(post -> PostResponse.fromEntity(post, false))
                .collect(Collectors.toList());
        
        return PageResponse.from(posts, content);
    }
    
    // Auth: Create post
    @Transactional
    public PostResponse createPost(PostRequest request, String userEmail) {
        User author = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("User not found"));
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Category not found"));
        
        // Generate slug
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.toSlug(request.getTitle());
        }
        
        // Check slug uniqueness
        if (postRepository.existsBySlug(slug)) {
            // Append timestamp to make it unique
            slug = slug + "-" + System.currentTimeMillis();
        }
        
        // Get or create tags
        Set<Tag> tags = tagService.getOrCreateTags(request.getTags());
        
        Post post = Post.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .featuredImage(request.getFeaturedImage())
                .status(request.getStatus() != null ? request.getStatus() : PostStatus.DRAFT)
                .author(author)
                .category(category)
                .build();
        
        // Add tags
        for (Tag tag : tags) {
            post.addTag(tag);
        }
        
        postRepository.save(post);
        return PostResponse.fromEntity(post, true);
    }
    
    // Auth: Update post
    @Transactional
    public PostResponse updatePost(Long id, PostRequest request, String userEmail, boolean isAdmin) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Post not found"));
        
        // Check authorization
        if (!isAdmin && !post.getAuthor().getEmail().equals(userEmail)) {
            throw new ApiException.ForbiddenException("You can only edit your own posts");
        }
        
        // Update category if changed
        if (!post.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException.ResourceNotFoundException("Category not found"));
            post.setCategory(category);
        }
        
        // Update slug if changed
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = SlugUtil.toSlug(request.getTitle());
        }
        
        if (!post.getSlug().equals(slug)) {
            if (postRepository.existsBySlug(slug)) {
                throw new ApiException.DuplicateResourceException("Slug already exists");
            }
            post.setSlug(slug);
        }
        
        // Update basic fields
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setFeaturedImage(request.getFeaturedImage());
        
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus());
        }
        
        // Update tags
        post.clearTags();
        Set<Tag> tags = tagService.getOrCreateTags(request.getTags());
        for (Tag tag : tags) {
            post.addTag(tag);
        }
        
        postRepository.save(post);
        return PostResponse.fromEntity(post, true);
    }
    
    // Auth: Delete post
    @Transactional
    public void deletePost(Long id, String userEmail, boolean isAdmin) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Post not found"));
        
        // Check authorization
        if (!isAdmin && !post.getAuthor().getEmail().equals(userEmail)) {
            throw new ApiException.ForbiddenException("You can only delete your own posts");
        }
        
        postRepository.delete(post);
    }
    
    // Admin: Approve post
    @Transactional
    public PostResponse approvePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Post not found"));
        
        post.setStatus(PostStatus.PUBLISHED);
        postRepository.save(post);
        
        return PostResponse.fromEntity(post, false);
    }
    
    // Admin: Reject post
    @Transactional
    public PostResponse rejectPost(Long id, String reason) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Post not found"));
        
        post.setStatus(PostStatus.DRAFT);
        // Note: Nếu muốn lưu reason, bạn cần thêm field rejectionReason vào entity Post
        postRepository.save(post);
        
        return PostResponse.fromEntity(post, false);
    }
}
