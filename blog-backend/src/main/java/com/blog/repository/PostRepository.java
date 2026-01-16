package com.blog.repository;

import com.blog.entity.Post;
import com.blog.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.slug = :slug")
    Optional<Post> findBySlugWithDetails(@Param("slug") String slug);
    
    Optional<Post> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    // Public posts (PUBLISHED only)
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.status = :status ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.status = :status")
    Page<Post> findByStatusOrderByCreatedAtDesc(@Param("status") PostStatus status, Pageable pageable);
    
    // Admin: Get all posts with eager loading
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.status = :status ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.status = :status")
    Page<Post> findAllByStatusWithAuthorAndCategory(@Param("status") PostStatus status, Pageable pageable);
    
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p")
    Page<Post> findAllWithAuthorAndCategory(Pageable pageable);
    
    // Posts by author
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.author.id = :authorId ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.author.id = :authorId")
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(@Param("authorId") Long authorId, Pageable pageable);
    
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.author.id = :authorId AND p.status = :status ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.author.id = :authorId AND p.status = :status")
    Page<Post> findByAuthorIdAndStatusOrderByCreatedAtDesc(@Param("authorId") Long authorId, @Param("status") PostStatus status, Pageable pageable);
    
    // Posts by category (PUBLISHED only)
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.category.slug = :categorySlug AND p.status = :status ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.category.slug = :categorySlug AND p.status = :status")
    Page<Post> findByCategorySlugAndStatusOrderByCreatedAtDesc(@Param("categorySlug") String categorySlug, @Param("status") PostStatus status, Pageable pageable);
    
    // Posts by tag (PUBLISHED only)
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags t WHERE t.slug = :tagSlug AND p.status = :status ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p JOIN p.tags t WHERE t.slug = :tagSlug AND p.status = :status")
    Page<Post> findByTagSlugAndStatus(@Param("tagSlug") String tagSlug, @Param("status") PostStatus status, Pageable pageable);
    
    // Search posts (PUBLISHED only)
    @Query(value = "SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.author LEFT JOIN FETCH p.category LEFT JOIN FETCH p.tags WHERE p.status = :status AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))) ORDER BY p.createdAt DESC",
           countQuery = "SELECT COUNT(DISTINCT p) FROM Post p WHERE p.status = :status AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Post> searchByKeyword(@Param("keyword") String keyword, @Param("status") PostStatus status, Pageable pageable);
    
    // Count posts by category
    long countByCategoryId(Long categoryId);
}
