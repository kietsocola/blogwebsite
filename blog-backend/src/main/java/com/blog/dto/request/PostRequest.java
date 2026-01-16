package com.blog.dto.request;

import com.blog.entity.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class PostRequest {
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @NotBlank(message = "Content is required")
    @Size(min = 50, message = "Content must be at least 50 characters")
    private String content;
    
    private String slug; // Optional, auto-generated if not provided
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private List<String> tags; // Tag names, will be created if not exist
    
    private PostStatus status = PostStatus.DRAFT;
    
    @Size(max = 500, message = "Featured image URL must not exceed 500 characters")
    private String featuredImage;
}
