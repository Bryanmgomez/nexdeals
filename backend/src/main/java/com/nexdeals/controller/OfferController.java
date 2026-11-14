package com.nexdeals.controller;

import com.nexdeals.domain.StoreOffer;
import com.nexdeals.dto.OfferDto;
import com.nexdeals.repository.StoreOfferRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/offers")
public class OfferController {
    private final StoreOfferRepository offerRepository;
    public OfferController(StoreOfferRepository offerRepository) { this.offerRepository = offerRepository; }

    @GetMapping("/top-discounts")
    public List<OfferDto> topDiscounts() {
        return offerRepository.findTopDiscounts().stream().limit(30).map(o ->
            OfferDto.builder().id(o.getId()).gameId(o.getGame().getId()).gameTitle(o.getGame().getTitle())
                .storeCode(o.getStore().getCode()).storeName(o.getStore().getName())
                .currentPrice(o.getCurrentPrice()).originalPrice(o.getOriginalPrice())
                .discountPercent(o.getDiscountPercent()).currency(o.getCurrency())
                .available(o.getAvailable()).region(o.getRegion()).url(o.getUrl())
                .lastCheckedAt(o.getLastCheckedAt()).build()
        ).collect(Collectors.toList());
    }

    @GetMapping("/free")
    public List<OfferDto> free() {
        return offerRepository.findTopDiscounts().stream()
                .filter(o -> o.getCurrentPrice() != null && o.getCurrentPrice().compareTo(java.math.BigDecimal.ZERO) == 0)
                .map(o -> OfferDto.builder().id(o.getId()).gameId(o.getGame().getId()).gameTitle(o.getGame().getTitle())
                        .storeCode(o.getStore().getCode()).storeName(o.getStore().getName())
                        .currentPrice(o.getCurrentPrice()).originalPrice(o.getOriginalPrice())
                        .discountPercent(o.getDiscountPercent()).currency(o.getCurrency())
                        .available(o.getAvailable()).region(o.getRegion()).url(o.getUrl())
                        .lastCheckedAt(o.getLastCheckedAt()).build())
                .collect(Collectors.toList());
    }
}