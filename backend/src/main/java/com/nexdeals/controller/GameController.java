package com.nexdeals.controller;

import com.nexdeals.dto.GameDto;
import com.nexdeals.dto.OfferDto;
import com.nexdeals.dto.PricePointDto;
import com.nexdeals.service.GameService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games")
public class GameController {
    private final GameService gameService;

    public GameController(GameService gameService) { this.gameService = gameService; }

    @GetMapping
    public Page<GameDto> list(@RequestParam(required = false) String q,
                              @RequestParam(required = false) String genre,
                              @RequestParam(required = false) String developer,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "20") int size) {
        return gameService.listGames(q, genre, developer, PageRequest.of(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        try { return ResponseEntity.ok(gameService.getGame(id)); }
        catch (Exception e) { return ResponseEntity.status(404).body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/{id}/offers")
    public List<OfferDto> offers(@PathVariable Long id) {
        return gameService.comparePrices(id);
    }

    @GetMapping("/{id}/history")
    public List<PricePointDto> history(@PathVariable Long id, @RequestParam(defaultValue = "30") int days) {
        return gameService.priceHistory(id, days);
    }

    @PostMapping("/sync")
    public ResponseEntity<?> sync(@RequestParam(defaultValue = "US") String region) {
        gameService.syncFeatured(region);
        return ResponseEntity.ok(Map.of("status", "synced"));
    }

    @GetMapping("/search-remote")
    public ResponseEntity<?> searchRemote(@RequestParam String q, @RequestParam(defaultValue = "US") String region) {
        return ResponseEntity.ok(gameService.searchRemote(q, region));
    }
}