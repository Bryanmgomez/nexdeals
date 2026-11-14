package com.nexdeals.controller;

import com.nexdeals.domain.Notification;
import com.nexdeals.domain.User;
import com.nexdeals.repository.UserRepository;
import com.nexdeals.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(org.springframework.security.core.Authentication auth) {
        return userRepository.findByEmail(auth.getName()).map(User::getId).orElseThrow();
    }

    @GetMapping
    public List<Notification> list(org.springframework.security.core.Authentication auth) {
        return notificationService.list(currentUserId(auth));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unread(org.springframework.security.core.Authentication auth) {
        return Map.of("count", notificationService.unreadCount(currentUserId(auth)));
    }

    @PostMapping("/{id}/read")
    public Map<String, String> read(@PathVariable Long id) {
        notificationService.markRead(id);
        return Map.of("status", "ok");
    }
    @PostMapping("/read-all")
    public Map<String, String> readAll(org.springframework.security.core.Authentication auth) {
        notificationService.markAllRead(currentUserId(auth));
        return Map.of("status", "ok");
    }
}