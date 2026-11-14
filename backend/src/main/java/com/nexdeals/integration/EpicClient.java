package com.nexdeals.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.math.BigDecimal;
import java.util.*;

@Component
public class EpicClient implements StoreClient {
    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public EpicClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://store-site-backend-static.ak.epicgames.com").build();
    }

    @Override
    public String storeCode() { return "epic"; }

    @Override
    public List<Map<String, Object>> search(String query, int limit) {
        // Epic public search is not reliably available; return empty (honest).
        return List.of();
    }

    @Override
    public RemoteGame fetchGame(String externalId, String region) {
        // Epic catalog price details require authenticated/private endpoints; not implemented.
        return null;
    }

    @Override
    public List<RemoteGame> fetchFeatured(String region) {
        List<RemoteGame> out = new ArrayList<>();
        try {
            String json = webClient.get()
                    .uri("/freeGamesPromotions?locale=en-US&country=US&allowCountries=US")
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = mapper.readTree(json);
            JsonNode elements = root.path("data").path("Catalog").path("searchStore").path("elements");
            if (!elements.isArray()) return out;
            for (JsonNode el : elements) {
                String title = el.path("title").asText();
                String id = el.path("id").asText();
                // cover
                String cover = null;
                for (JsonNode img : el.path("keyImages")) {
                    if ("Thumbnail".equals(img.path("type").asText()) || "OfferImageWide".equals(img.path("type").asText())) {
                        cover = img.path("url").asText(); break;
                    }
                }
                if (cover == null && el.path("keyImages").isArray() && el.path("keyImages").size() > 0) {
                    cover = el.path("keyImages").get(0).path("url").asText();
                }
                // price
                JsonNode price = el.path("price").path("totalPrice");
                BigDecimal current = null, original = null;
                Integer discount = null;
                String currency = price.path("currencyCode").asText("USD");
                if (!price.isMissingNode()) {
                    int disc = price.path("discountPrice").asInt();
                    int orig = price.path("originalPrice").asInt();
                    current = new BigDecimal(disc).divide(new BigDecimal(100));
                    original = new BigDecimal(orig).divide(new BigDecimal(100));
                    if (orig > 0) discount = (int) Math.round((1 - (double) disc / orig) * 100);
                }
                // promotions: free?
                boolean freeNow = false;
                JsonNode promos = el.path("promotions").path("promotionalOffers");
                if (promos.isArray() && promos.size() > 0) {
                    // if discount makes it free
                    if (current != null && current.compareTo(BigDecimal.ZERO) == 0) freeNow = true;
                }
                String url = "https://store.epicgames.com/en-US/p/" + (el.path("productSlug").asText().isBlank() ? id : el.path("productSlug").asText());
                // Only include if there's a current promotion (free or discounted)
                JsonNode upcoming = el.path("promotions").path("upcomingPromotionalOffers");
                boolean hasPromo = (promos.isArray() && promos.size() > 0) || (upcoming.isArray() && upcoming.size() > 0);
                if (!hasPromo) continue;
                out.add(new RemoteGame(id, title, el.path("description").asText(null), cover, null, null, null, null,
                        current, original, discount, currency, true, url));
                if (out.size() >= 20) break;
            }
        } catch (Exception e) {
            // log
        }
        return out;
    }
}