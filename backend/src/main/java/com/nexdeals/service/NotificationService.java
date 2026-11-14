package com.nexdeals.service;

import com.nexdeals.domain.Notification;
import com.nexdeals.domain.User;
import com.nexdeals.repository.NotificationRepository;
import com.nexdeals.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public Notification create(Long userId, String type, String title, String message, Long gameId) {
        User user = userRepository.findById(userId).orElseThrow();
        Notification n = Notification.builder().user(user).type(type).title(title).message(message).build();
        if (gameId != null) {
            // set game lazily not needed for basic; skip
        }
        return notificationRepository.save(n);
    }

    public List<Notification> list(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> { n.setRead(true); notificationRepository.save(n); });
    }
    public void markAllRead(Long userId) {
        notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).forEach(n -> { if (!n.getRead()) { n.setRead(true); notificationRepository.save(n); } });
    }
}