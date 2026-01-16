package com.blog.repository;

import com.blog.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    
    Optional<Tag> findBySlug(String slug);
    
    Optional<Tag> findByName(String name);
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
}
