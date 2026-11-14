package com.nexdeals.service;

import com.nexdeals.domain.StoreOffer;
import com.nexdeals.domain.Wishlist;
import com.nexdeals.domain.WishlistItem;
import com.nexdeals.repository.PriceHistoryRepository;
import com.nexdeals.repository.WishlistItemRepository;
import com.nexdeals.repository.WishlistRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class AlertService {
    private final WishlistItemRepository itemRepository;
    private final WishlistRepository wishlistRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final NotificationService notificationService;

    public AlertService(WishlistItemRepository itemRepository, WishlistRepository wishlistRepository,
                        PriceHistoryRepository priceHistoryRepository, NotificationService notificationService) {
        this.itemRepository = itemRepository;
        this.wishlistRepository = wishlistRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.notificationService = notificationService;
    }

    public void checkPriceAlerts(Long gameId, StoreOffer offer) {
        if (offer == null || offer.getCurrentPrice() == null) return;
        List<WishlistItem> items = itemRepository.findByGameId(gameId);
        for (WishlistItem wi : items) {
            if (!Boolean.TRUE.equals(wi.getAlertsEnabled())) continue;
            Wishlist wl = wishlistRepository.findById(wi.getWishlist().getId()).orElse(null);
            if (wl == null) continue;
            Long userId = wl.getUser().getId();
            BigDecimal price = offer.getCurrentPrice();
            boolean triggered = false;
            String reason = "";
            if (wi.getTargetPrice() != null && price.compareTo(wi.getTargetPrice()) <= 0) {
                triggered = true; reason = "reached your target price";
            }
            if (wi.getMinDiscountPercent() != null && offer.getDiscountPercent() != null
                    && offer.getDiscountPercent() >= wi.getMinDiscountPercent()) {
                triggered = true; reason = "received a " + offer.getDiscountPercent() + "% discount";
            }
            if (price.compareTo(BigDecimal.ZERO) == 0) {
                triggered = true; reason = "is now free";
            }
            // historic low
            BigDecimal min = priceHistoryRepository.findMinPrice(gameId);
            if (min != null && price.compareTo(min) <= 0 && price.compareTo(BigDecimal.ZERO) > 0) {
                triggered = true; reason = "reached its historical minimum";
            }
            if (triggered) {
                notificationService.create(userId, "PRICE_ALERT",
                        "Price alert", "A game in your wishlist " + reason + ".", gameId);
            }
        }
    }
}