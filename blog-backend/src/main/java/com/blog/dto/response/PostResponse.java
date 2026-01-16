package com.blog.dto.response;

import com.blog.entity.Post;
import com.blog.entity.PostStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String excerpt;
    private String featuredImage;
    private PostStatus status;
    private AuthorInfo author;
    private CategoryInfo category;
    private List<TagInfo> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private Long id;
        private String username;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private Long id;
        private String name;
        private String slug;
    }
    
    public static PostResponse fromEntity(Post post) {
        return fromEntity(post, false);
    }
    
    public static PostResponse fromEntity(Post post, boolean includeFullContent) {
        String content = post.getContent();
        String excerpt = content.length() > 200 ? content.substring(0, 200) + "..." : content;
        
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(includeFullContent ? content : null)
                .excerpt(excerpt)
                .featuredImage(post.getFeaturedImage())
                .status(post.getStatus())
                .author(AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .username(post.getAuthor().getUsername())
                        .build())
                .category(CategoryInfo.builder()
                        .id(post.getCategory().getId())
                        .name(post.getCategory().getName())
                        .slug(post.getCategory().getSlug())
                        .build())
                .tags(post.getTags().stream()
                        .map(tag -> TagInfo.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .slug(tag.getSlug())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
