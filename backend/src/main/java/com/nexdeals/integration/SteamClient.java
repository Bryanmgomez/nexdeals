package com.nexdeals.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import java.math.BigDecimal;
import java.util.*;

@Component
public class SteamClient implements StoreClient {
    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public SteamClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://store.steampowered.com").build();
    }

    @Override
    public String storeCode() { return "steam"; }

    private String cc(String region) {
        if (region == null) return "us";
        String r = region.toLowerCase();
        if (r.equals("co")) return "co";
        if (r.equals("mx")) return "mx";
        if (r.equals("br")) return "br";
        return "us";
    }

    @Override
    public List<Map<String, Object>> search(String query, int limit) {
        List<Map<String, Object>> out = new ArrayList<>();
        try {
            String json = webClient.get()
                    .uri(u -> u.path("/api/storesearch/").queryParam("term", query)
                            .queryParam("l", "english").queryParam("cc", "us").build())
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = mapper.readTree(json);
            JsonNode items = root.path("items");
            if (items.isArray()) {
                int n = 0;
                for (JsonNode it : items) {
                    if (n++ >= limit) break;
                    Map<String, Object> m = new HashMap<>();
                    m.put("externalId", String.valueOf(it.path("id").asLong()));
                    m.put("name", it.path("name").asText());
                    m.put("coverUrl", it.path("tiny_image").asText());
                    out.add(m);
                }
            }
        } catch (Exception e) {
            // log
        }
        return out;
    }

    @Override
    public RemoteGame fetchGame(String externalId, String region) {
        try {
            String c = cc(region);
            String json = webClient.get()
                    .uri(u -> u.path("/api/appdetails").queryParam("appids", externalId)
                            .queryParam("cc", c).queryParam("l", "english").build())
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = mapper.readTree(json);
            JsonNode data = root.path(externalId).path("data");
            if (data.isMissingNode() || !root.path(externalId).path("success").asBoolean(false)) {
                return null;
            }
            String title = data.path("name").asText();
            String desc = data.path("short_description").asText();
            String cover = data.path("header_image").asText();
            String developer = data.path("developers").isArray() && data.path("developers").size() > 0
                    ? data.path("developers").get(0).asText() : null;
            String publisher = data.path("publishers").isArray() && data.path("publishers").size() > 0
                    ? data.path("publishers").get(0).asText() : null;
            String genres = "";
            if (data.path("genres").isArray()) {
                List<String> gs = new ArrayList<>();
                for (JsonNode g : data.path("genres")) gs.add(g.path("description").asText());
                genres = String.join(", ", gs);
            }
            String release = data.path("release_date").path("date").asText(null);

            BigDecimal current = null, original = null;
            Integer discount = null;
            String currency = "USD";
            boolean available = true;
            JsonNode po = data.path("price_overview");
            if (!po.isMissingNode()) {
                current = new BigDecimal(po.path("final").asInt()).divide(new BigDecimal(100));
                original = new BigDecimal(po.path("initial").asInt()).divide(new BigDecimal(100));
                discount = po.path("discount_percent").asInt();
                currency = po.path("currency").asText("USD");
            } else if (data.path("is_free").asBoolean(false)) {
                current = BigDecimal.ZERO;
                original = BigDecimal.ZERO;
                discount = 0;
                currency = "USD";
            } else {
                available = false;
            }
            String url = "https://store.steampowered.com/app/" + externalId;
            return new RemoteGame(externalId, title, desc, cover, developer, publisher, genres,
                    release, current, original, discount, currency, available, url);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<RemoteGame> fetchFeatured(String region) {
        List<RemoteGame> out = new ArrayList<>();
        try {
            String c = cc(region);
            String json = webClient.get()
                    .uri(u -> u.path("/api/featuredcategories").queryParam("cc", c).queryParam("l", "english").build())
                    .retrieve().bodyToMono(String.class).block();
            JsonNode root = mapper.readTree(json);
            String[] cats = {"specials", "top_sellers", "new_releases"};
            Set<String> seen = new HashSet<>();
            for (String cat : cats) {
                JsonNode items = root.path(cat).path("items");
                if (!items.isArray()) continue;
                for (JsonNode it : items) {
                    String id = String.valueOf(it.path("id").asLong());
                    if (!seen.add(id)) continue;
                    if (out.size() >= 40) break;
                    String title = it.path("name").asText();
                    String cover = it.path("large_capsule_image").asText();
                    if (cover == null || cover.isBlank()) cover = it.path("header_image").asText();
                    BigDecimal current = null, original = null;
                    Integer discount = null;
                    String currency = it.path("currency").asText("USD");
                    Integer finalCents = it.has("final_price") ? it.path("final_price").asInt() : null;
                    Integer origCents = it.has("original_price") ? it.path("original_price").asInt() : null;
                    if (finalCents != null) current = new BigDecimal(finalCents).divide(new BigDecimal(100));
                    if (origCents != null) original = new BigDecimal(origCents).divide(new BigDecimal(100));
                    if (it.has("discount_percent")) discount = it.path("discount_percent").asInt();
                    String url = "https://store.steampowered.com/app/" + id;
                    out.add(new RemoteGame(id, title, null, cover, null, null, null, null,
                            current, original, discount, currency, true, url));
                }
            }
        } catch (Exception e) {
            // log
        }
        return out;
    }
}