package com.blog.controller;

import com.blog.dto.response.PageResponse;
import com.blog.dto.response.PostResponse;
import com.blog.dto.response.TagResponse;
import com.blog.service.PostService;
import com.blog.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tags", description = "Tag endpoints")
public class TagController {
    
    private final TagService tagService;
    private final PostService postService;
    
    @GetMapping
    @Operation(summary = "Get all tags (public)")
    public ResponseEntity<List<TagResponse>> getAllTags() {
        return ResponseEntity.ok(tagService.getAllTags());
    }
    
    @GetMapping("/{slug}/posts")
    @Operation(summary = "Get posts by tag (public)")
    public ResponseEntity<PageResponse<PostResponse>> getPostsByTag(
            @PathVariable String slug,
            @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(postService.getPostsByTag(slug, page));
    }
}
