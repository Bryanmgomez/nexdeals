package com.nexdeals.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PricePointDto {
    private LocalDateTime recordedAt;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private String currency;
    private String storeCode;
}