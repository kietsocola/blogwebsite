package com.blog.service;

import com.blog.dto.response.TagResponse;
import com.blog.entity.Tag;
import com.blog.exception.ApiException;
import com.blog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {
    
    private final TagRepository tagRepository;
    
    public List<TagResponse> getAllTags() {
        return tagRepository.findAll().stream()
                .map(TagResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public TagResponse getTagBySlug(String slug) {
        Tag tag = tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("Tag not found: " + slug));
        return TagResponse.fromEntity(tag);
    }
    
    @Transactional
    public Set<Tag> getOrCreateTags(List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }
        
        Set<Tag> tags = new HashSet<>();
        
        for (String name : tagNames) {
            String trimmedName = name.trim();
            if (trimmedName.isEmpty()) continue;
            
            Tag tag = tagRepository.findByName(trimmedName)
                    .orElseGet(() -> {
                        Tag newTag = Tag.builder()
                                .name(trimmedName)
                                .slug(SlugUtil.toSlug(trimmedName))
                                .build();
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        
        return tags;
    }
}
