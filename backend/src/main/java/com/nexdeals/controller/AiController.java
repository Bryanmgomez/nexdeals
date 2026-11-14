package com.nexdeals.controller;

import com.nexdeals.service.AiService;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;
    public AiController(AiService aiService) { this.aiService = aiService; }

    @PostMapping("/recommend")
    public Map<String, Object> recommend(@RequestBody Map<String, Object> body) {
        String query = body.getOrDefault("query", "").toString();
        BigDecimal budget = body.get("budget") == null ? null : new BigDecimal(body.get("budget").toString());
        String currency = body.getOrDefault("currency", "COP").toString();
        return aiService.recommend(query, budget, currency);
    }
}