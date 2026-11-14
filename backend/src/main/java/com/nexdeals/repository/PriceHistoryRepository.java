package com.nexdeals.repository;

import com.nexdeals.domain.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByGameIdAndStoreIdOrderByRecordedAtAsc(Long gameId, Long storeId);

    @Query("SELECT p FROM PriceHistory p WHERE p.game.id = :gameId AND p.recordedAt >= :since ORDER BY p.recordedAt ASC")
    List<PriceHistory> findSince(Long gameId, LocalDateTime since);

    @Query("SELECT MIN(p.price) FROM PriceHistory p WHERE p.game.id = :gameId")
    java.math.BigDecimal findMinPrice(Long gameId);

    @Query("SELECT MAX(p.price) FROM PriceHistory p WHERE p.game.id = :gameId")
    java.math.BigDecimal findMaxPrice(Long gameId);
}