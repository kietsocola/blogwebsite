package com.blog.service;

import com.blog.dto.request.LoginRequest;
import com.blog.dto.request.RegisterRequest;
import com.blog.dto.response.AuthResponse;
import com.blog.entity.User;
import com.blog.exception.ApiException;
import com.blog.repository.UserRepository;
import com.blog.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException.DuplicateResourceException("Email already exists");
        }
        
        // Check if username exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException.DuplicateResourceException("Username already exists");
        }
        
        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        
        userRepository.save(user);
        
        // Generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(user, token);
    }
    
    public AuthResponse login(LoginRequest request) {
        // Authenticate
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrUsername(),
                        request.getPassword()
                )
        );
        
        // Find user
        User user = userRepository.findByEmailOrUsername(
                        request.getEmailOrUsername(), 
                        request.getEmailOrUsername())
                .orElseThrow(() -> new ApiException.UnauthorizedException("Invalid credentials"));
        
        // Generate token
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        
        return buildAuthResponse(user, token);
    }
    
    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
