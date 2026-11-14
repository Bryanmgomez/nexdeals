package com.nexdeals.controller;

import com.nexdeals.domain.User;
import com.nexdeals.domain.Wishlist;
import com.nexdeals.domain.WishlistItem;
import com.nexdeals.repository.UserRepository;
import com.nexdeals.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlists")
public class WishlistController {
    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    public WishlistController(WishlistService wishlistService, UserRepository userRepository) {
        this.wishlistService = wishlistService;
        this.userRepository = userRepository;
    }

    private Long currentUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).map(User::getId).orElseThrow();
    }

    @GetMapping
    public List<Wishlist> list(Authentication auth) {
        return wishlistService.list(currentUserId(auth));
    }

    @PostMapping
    public Wishlist create(Authentication auth, @RequestBody Map<String, String> body) {
        return wishlistService.create(currentUserId(auth), body.getOrDefault("name", "My Wishlist"));
    }

    @PostMapping("/{id}/items")
    public WishlistItem addItem(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long gameId = Long.valueOf(body.get("gameId").toString());
        BigDecimal target = body.get("targetPrice") == null ? null : new BigDecimal(body.get("targetPrice").toString());
        Integer minDisc = body.get("minDiscountPercent") == null ? null : Integer.valueOf(body.get("minDiscountPercent").toString());
        return wishlistService.addItem(id, gameId, target, minDisc);
    }

    @DeleteMapping("/{id}/items/{gameId}")
    public ResponseEntity<?> removeItem(@PathVariable Long id, @PathVariable Long gameId) {
        wishlistService.removeItem(id, gameId);
        return ResponseEntity.ok(Map.of("status", "removed"));
    }

    @GetMapping("/{id}/items")
    public List<WishlistItem> items(@PathVariable Long id) {
        return wishlistService.items(id);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long itemId, @RequestBody Map<String, Object> body) {
        BigDecimal target = body.get("targetPrice") == null ? null : new BigDecimal(body.get("targetPrice").toString());
        Integer minDisc = body.get("minDiscountPercent") == null ? null : Integer.valueOf(body.get("minDiscountPercent").toString());
        Boolean alerts = body.get("alertsEnabled") == null ? null : Boolean.valueOf(body.get("alertsEnabled").toString());
        wishlistService.updateItem(itemId, target, minDisc, alerts);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }
}