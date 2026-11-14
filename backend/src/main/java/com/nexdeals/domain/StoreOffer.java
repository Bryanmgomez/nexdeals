package com.nexdeals.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_offers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreOffer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;
    @Column(name = "store_game_id", length = 100)
    private String storeGameId;
    @Column(name = "current_price", precision = 18, scale = 2)
    private BigDecimal currentPrice;
    @Column(name = "original_price", precision = 18, scale = 2)
    private BigDecimal originalPrice;
    @Column(name = "discount_percent")
    private Integer discountPercent;
    @Column(length = 10)
    @Builder.Default
    private String currency = "USD";
    @Builder.Default
    private Boolean available = true;
    @Builder.Default
    private String region = "US";
    @Column(length = 1000)
    private String url;
    @Column(name = "last_checked_at")
    private LocalDateTime lastCheckedAt;
}