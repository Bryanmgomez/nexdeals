package com.nexdeals.repository;

import com.nexdeals.domain.StoreOffer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StoreOfferRepository extends JpaRepository<StoreOffer, Long> {
    List<StoreOffer> findByGameId(Long gameId);
    Optional<StoreOffer> findByGameIdAndStoreIdAndRegion(Long gameId, Long storeId, String region);

    @Query("SELECT o FROM StoreOffer o WHERE o.available = true AND o.currentPrice IS NOT NULL ORDER BY o.discountPercent DESC")
    List<StoreOffer> findTopDiscounts();

    @Query("SELECT o FROM StoreOffer o WHERE o.available = true AND o.currentPrice IS NOT NULL AND o.discountPercent >= :minDiscount ORDER BY o.discountPercent DESC")
    List<StoreOffer> findDiscountsAbove(int minDiscount);
}