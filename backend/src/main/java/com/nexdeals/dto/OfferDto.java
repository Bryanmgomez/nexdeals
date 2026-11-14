package com.nexdeals.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OfferDto {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String storeCode;
    private String storeName;
    private BigDecimal currentPrice;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private String currency;
    private Boolean available;
    private String region;
    private String url;
    private LocalDateTime lastCheckedAt;
}