package com.nexdeals.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GameDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverUrl;
    private String developer;
    private String publisher;
    private String genres;
    private LocalDate releaseDate;
    private BigDecimal bestPrice;
    private BigDecimal bestOriginalPrice;
    private String bestPriceStore;
    private Integer bestDiscount;
}