package com.nexdeals.service;

import com.nexdeals.domain.*;
import com.nexdeals.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository itemRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;

    public WishlistService(WishlistRepository wishlistRepository, WishlistItemRepository itemRepository,
                           GameRepository gameRepository, UserRepository userRepository) {
        this.wishlistRepository = wishlistRepository;
        this.itemRepository = itemRepository;
        this.gameRepository = gameRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Wishlist create(Long userId, String name) {
        User user = userRepository.findById(userId).orElseThrow();
        Wishlist wl = Wishlist.builder().user(user).name(name).build();
        return wishlistRepository.save(wl);
    }

    @Transactional(readOnly = true)
    public List<Wishlist> list(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public WishlistItem addItem(Long wishlistId, Long gameId, java.math.BigDecimal targetPrice, Integer minDiscount) {
        Wishlist wl = wishlistRepository.findById(wishlistId).orElseThrow();
        Game game = gameRepository.findById(gameId).orElseThrow();
        WishlistItem existing = itemRepository.findByWishlistIdAndGameId(wishlistId, gameId).orElse(null);
        if (existing != null) return existing;
        WishlistItem item = WishlistItem.builder().wishlist(wl).game(game)
                .targetPrice(targetPrice).minDiscountPercent(minDiscount).build();
        return itemRepository.save(item);
    }

    @Transactional
    public void removeItem(Long wishlistId, Long gameId) {
        itemRepository.findByWishlistIdAndGameId(wishlistId, gameId)
                .ifPresent(itemRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<WishlistItem> items(Long wishlistId) {
        return itemRepository.findByWishlistId(wishlistId);
    }

    @Transactional
    public void updateItem(Long itemId, java.math.BigDecimal targetPrice, Integer minDiscount, Boolean alerts) {
        WishlistItem item = itemRepository.findById(itemId).orElseThrow();
        if (targetPrice != null) item.setTargetPrice(targetPrice);
        if (minDiscount != null) item.setMinDiscountPercent(minDiscount);
        if (alerts != null) item.setAlertsEnabled(alerts);
        itemRepository.save(item);
    }
}