package com.blog.controller;

import com.blog.dto.response.PageResponse;
import com.blog.dto.response.PostResponse;
import com.blog.dto.response.StatsResponse;
import com.blog.dto.response.UserAdminResponse;
import com.blog.entity.PostStatus;
import com.blog.service.AdminService;
import com.blog.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {
    
    private final AdminService adminService;
    private final PostService postService;
    
    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
    
    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserAdminResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        adminService.deleteUser(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/posts")
    @Operation(summary = "Get all posts (admin view)")
    public ResponseEntity<PageResponse<PostResponse>> getAllPosts(
            @RequestParam(required = false) PostStatus status,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(postService.getAllPosts(status, page));
    }
    
    @PutMapping("/posts/{id}/approve")
    @Operation(summary = "Approve a post")
    public ResponseEntity<PostResponse> approvePost(@PathVariable Long id) {
        return ResponseEntity.ok(postService.approvePost(id));
    }
    
    @PutMapping("/posts/{id}/reject")
    @Operation(summary = "Reject a post")
    public ResponseEntity<PostResponse> rejectPost(
            @PathVariable Long id,
            @RequestBody(required = false) String reason) {
        return ResponseEntity.ok(postService.rejectPost(id, reason));
    }
}
