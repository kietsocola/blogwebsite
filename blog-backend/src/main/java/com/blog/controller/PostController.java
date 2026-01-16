package com.blog.controller;

import com.blog.dto.request.PostRequest;
import com.blog.dto.response.PageResponse;
import com.blog.dto.response.PostResponse;
import com.blog.entity.PostStatus;
import com.blog.entity.Role;
import com.blog.security.UserDetailsServiceImpl;
import com.blog.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post management endpoints")
public class PostController {
    
    private final PostService postService;
    private final UserDetailsServiceImpl userDetailsService;
    
    @GetMapping
    @Operation(summary = "Get all published posts (public)")
    public ResponseEntity<PageResponse<PostResponse>> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(postService.getPublishedPosts(page));
    }
    
    @GetMapping("/{slug}")
    @Operation(summary = "Get post by slug (public)")
    public ResponseEntity<PostResponse> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search posts (public)")
    public ResponseEntity<PageResponse<PostResponse>> searchPosts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(postService.searchPosts(q, page));
    }
    
    @GetMapping("/my")
    @Operation(summary = "Get current user's posts")
    public ResponseEntity<PageResponse<PostResponse>> getMyPosts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) PostStatus status,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(postService.getMyPosts(userDetails.getUsername(), status, page));
    }
    
    @PostMapping
    @Operation(summary = "Create a new post")
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PostRequest request) {
        PostResponse response = postService.createPost(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<PostResponse> updatePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        boolean isAdmin = isAdmin(userDetails);
        PostResponse response = postService.updatePost(id, request, userDetails.getUsername(), isAdmin);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a post")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        boolean isAdmin = isAdmin(userDetails);
        postService.deletePost(id, userDetails.getUsername(), isAdmin);
        return ResponseEntity.noContent().build();
    }
    
    private boolean isAdmin(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + Role.ADMIN.name()));
    }
}
