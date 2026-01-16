package com.blog.service;

import com.blog.dto.response.StatsResponse;
import com.blog.dto.response.UserAdminResponse;
import com.blog.entity.User;
import com.blog.exception.ApiException;
import com.blog.repository.CategoryRepository;
import com.blog.repository.PostRepository;
import com.blog.repository.TagRepository;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    
    public StatsResponse getStats() {
        return StatsResponse.builder()
                .totalPosts(postRepository.count())
                .totalUsers(userRepository.count())
                .totalCategories(categoryRepository.count())
                .totalTags(tagRepository.count())
                .build();
    }
    
    public List<UserAdminResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserAdminResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteUser(Long id, String currentUserEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException.ResourceNotFoundException("User not found"));
        
        // Cannot delete self
        if (user.getEmail().equals(currentUserEmail)) {
            throw new ApiException.BadRequestException("Cannot delete your own account");
        }
        
        userRepository.delete(user);
    }
}
