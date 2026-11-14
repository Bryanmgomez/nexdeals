package com.nexdeals.integration;

import com.nexdeals.domain.Game;
import com.nexdeals.domain.StoreOffer;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface StoreClient {
    String storeCode();
    /** Search remote store and return list of game stubs (title, externalId, coverUrl). */
    List<Map<String, Object>> search(String query, int limit);
    /** Fetch details/price for a given external id; returns game + offer data. */
    RemoteGame fetchGame(String externalId, String region);
    /** Fetch featured/top deals. */
    List<RemoteGame> fetchFeatured(String region);

    record RemoteGame(
            String externalId,
            String title,
            String description,
            String coverUrl,
            String developer,
            String publisher,
            String genres,
            String releaseDate,
            BigDecimal currentPrice,
            BigDecimal originalPrice,
            Integer discountPercent,
            String currency,
            Boolean available,
            String url
    ) {}
}