package com.nexdeals.controller;

import com.nexdeals.domain.User;
import com.nexdeals.repository.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final StoreOfferRepository offerRepository;
    private final NotificationRepository notificationRepository;

    public AdminController(UserRepository userRepository, GameRepository gameRepository,
                          StoreOfferRepository offerRepository, NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.gameRepository = gameRepository;
        this.offerRepository = offerRepository;
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/users")
    public List<User> users() { return userRepository.findAll(); }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return Map.of(
            "users", userRepository.count(),
            "games", gameRepository.count(),
            "offers", offerRepository.count()
        );
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return Map.of("status", "deleted");
    }
}