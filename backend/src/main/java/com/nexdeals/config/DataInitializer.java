package com.nexdeals.config;

import com.nexdeals.domain.Role;
import com.nexdeals.domain.User;
import com.nexdeals.repository.GameRepository;
import com.nexdeals.repository.RoleRepository;
import com.nexdeals.repository.UserRepository;
import com.nexdeals.service.GameService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final GameRepository gameRepository;
    private final GameService gameService;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository,
                           PasswordEncoder passwordEncoder, GameRepository gameRepository,
                           GameService gameService) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.gameRepository = gameRepository;
        this.gameService = gameService;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@nexdeals.com")) {
            Role adminRole = roleRepository.findByName("ROLE_ADMIN").orElseThrow();
            Role userRole = roleRepository.findByName("ROLE_USER").orElseThrow();
            User admin = User.builder()
                    .email("admin@nexdeals.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .displayName("Admin")
                    .country("CO")
                    .currency("COP")
                    .roles(Set.of(adminRole, userRole))
                    .build();
            userRepository.save(admin);
        }
        try {
            if (gameRepository.count() == 0) {
                gameService.syncFeatured("US");
                gameService.syncFeatured("CO");
            }
        } catch (Exception e) {
            System.err.println("Initial sync failed: " + e.getMessage());
        }
    }
}