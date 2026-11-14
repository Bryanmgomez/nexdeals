package com.nexdeals.controller;

import com.nexdeals.domain.CommunityPost;
import com.nexdeals.domain.User;
import com.nexdeals.repository.UserRepository;
import com.nexdeals.service.CommunityService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
public class CommunityController {
    private final CommunityService communityService;
    private final UserRepository userRepository;

    public CommunityController(CommunityService communityService, UserRepository userRepository) {
        this.communityService = communityService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(org.springframework.security.core.Authentication auth) {
        if (auth == null) return null;
        return userRepository.findByEmail(auth.getName()).map(User::getId).orElse(null);
    }

    @GetMapping("/posts")
    public Page<CommunityPost> posts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        return communityService.list(page, size);
    }

    @PostMapping("/posts")
    public CommunityPost createPost(org.springframework.security.core.Authentication auth, @RequestBody Map<String, Object> body) {
        Long userId = currentUserId(auth);
        Long gameId = body.get("gameId") == null ? null : Long.valueOf(body.get("gameId").toString());
        Long storeId = body.get("storeId") == null ? null : Long.valueOf(body.get("storeId").toString());
        BigDecimal price = body.get("reportedPrice") == null ? null : new BigDecimal(body.get("reportedPrice").toString());
        String currency = body.get("reportedCurrency") == null ? null : body.get("reportedCurrency").toString();
        return communityService.createPost(userId, gameId, storeId, body.get("content").toString(), price, currency);
    }

    @PostMapping("/posts/{id}/comments")
    public com.nexdeals.domain.CommunityComment comment(org.springframework.security.core.Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        Long userId = currentUserId(auth);
        return communityService.addComment(id, userId, body.get("content"));
    }
}