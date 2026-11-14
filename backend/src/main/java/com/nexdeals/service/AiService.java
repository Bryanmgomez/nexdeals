package com.nexdeals.service;

import com.nexdeals.domain.Game;
import com.nexdeals.domain.StoreOffer;
import com.nexdeals.repository.GameRepository;
import com.nexdeals.repository.StoreOfferRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {
    private final GameRepository gameRepository;
    private final StoreOfferRepository offerRepository;
    private final WebClient webClient;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String model;

    public AiService(GameRepository gameRepository, StoreOfferRepository offerRepository,
                     WebClient.Builder builder,
                     @Value("${nexdeals.ai.openai-api-key}") String apiKey,
                     @Value("${nexdeals.ai.openai-model}") String model) {
        this.gameRepository = gameRepository;
        this.offerRepository = offerRepository;
        this.webClient = builder.baseUrl("https://api.openai.com").build();
        this.apiKey = apiKey;
        this.model = model;
    }

    public Map<String, Object> recommend(String query, BigDecimal budget, String currency) {
        // gather candidate games with offers
        List<Game> games = gameRepository.findAll();
        List<Map<String, Object>> candidates = new ArrayList<>();
        for (Game g : games) {
            List<StoreOffer> offers = offerRepository.findByGameId(g.getId());
            for (StoreOffer o : offers) {
                if (o.getCurrentPrice() == null) continue;
                if (budget != null && o.getCurrentPrice().compareTo(budget) > 0) continue;
                Map<String, Object> c = new HashMap<>();
                c.put("gameId", g.getId());
                c.put("title", g.getTitle());
                c.put("genre", g.getGenres());
                c.put("developer", g.getDeveloper());
                c.put("store", o.getStore().getCode());
                c.put("price", o.getCurrentPrice());
                c.put("original", o.getOriginalPrice());
                c.put("discount", o.getDiscountPercent());
                c.put("currency", o.getCurrency());
                candidates.add(c);
            }
        }
        candidates.sort(Comparator.comparing(c -> (BigDecimal) c.get("price")));

        String answer;
        if (apiKey != null && !apiKey.isBlank()) {
            answer = callOpenAi(query, budget, currency, candidates);
        } else {
            answer = heuristicAnswer(query, budget, candidates);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("answer", answer);
        res.put("candidates", candidates.stream().limit(10).collect(Collectors.toList()));
        return res;
    }

    private String heuristicAnswer(String query, BigDecimal budget, List<Map<String, Object>> candidates) {
        if (candidates.isEmpty()) {
            return "No games found within your budget based on current real prices. Try syncing offers or adjusting budget.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("Based on real current prices, here are recommendations within your budget:\n");
        int n = Math.min(5, candidates.size());
        for (int i = 0; i < n; i++) {
            Map<String, Object> c = candidates.get(i);
            sb.append("- ").append(c.get("title")).append(" (").append(c.get("store")).append(") - ")
                    .append(c.get("price")).append(" ").append(c.get("currency"));
            if (c.get("discount") != null) sb.append(" (-").append(c.get("discount")).append("%)");
            sb.append("\n");
        }
        sb.append("\nNEX AI (offline mode) recommends comparing prices and waiting for deeper discounts if not urgent.");
        return sb.toString();
    }

    private String callOpenAi(String query, BigDecimal budget, String currency, List<Map<String, Object>> candidates) {
        try {
            String candJson = mapper.writeValueAsString(candidates.stream().limit(20).collect(Collectors.toList()));
            String prompt = "You are NEX AI, a gaming deals assistant. User query: " + query +
                    ". Budget: " + (budget == null ? "not specified" : budget + " " + currency) +
                    ". Here are real candidate games with current prices (JSON): " + candJson +
                    ". Recommend the best options, explain trade-offs, and advise whether to buy now or wait. " +
                    "Do not invent prices or discounts. Only use provided data.";
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "user", "content", prompt));
            body.put("messages", messages);
            String resp = webClient.post().uri("/v1/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body).retrieve().bodyToMono(String.class).block();
            JsonNode root = mapper.readTree(resp);
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            return heuristicAnswer(query, budget, candidates) + "\n(OpenAI call failed: " + e.getMessage() + ")";
        }
    }
}