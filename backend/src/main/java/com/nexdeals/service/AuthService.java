package com.nexdeals.service;

import com.nexdeals.domain.Role;
import com.nexdeals.domain.User;
import com.nexdeals.dto.AuthDtos;
import com.nexdeals.repository.RoleRepository;
import com.nexdeals.repository.UserRepository;
import com.nexdeals.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Set;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new IllegalStateException("Role not found"));
        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .displayName(req.getDisplayName() != null ? req.getDisplayName() : req.getEmail().split("@")[0])
                .country(req.getCountry() != null ? req.getCountry() : "CO")
                .currency(req.getCurrency() != null ? req.getCurrency() : "COP")
                .roles(Set.of(userRole))
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return AuthDtos.AuthResponse.builder()
                .token(token).userId(user.getId()).email(user.getEmail())
                .displayName(user.getDisplayName()).role("ROLE_USER").build();
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("ROLE_USER");
        String token = jwtService.generateToken(user.getEmail(), user.getId());
        return AuthDtos.AuthResponse.builder()
                .token(token).userId(user.getId()).email(user.getEmail())
                .displayName(user.getDisplayName()).role(role).build();
    }
}