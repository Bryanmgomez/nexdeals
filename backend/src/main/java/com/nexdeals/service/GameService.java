package com.nexdeals.service;

import com.nexdeals.domain.*;
import com.nexdeals.dto.GameDto;
import com.nexdeals.dto.OfferDto;
import com.nexdeals.dto.PricePointDto;
import com.nexdeals.integration.StoreClient;
import com.nexdeals.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameService {
    private final GameRepository gameRepository;
    private final StoreRepository storeRepository;
    private final StoreOfferRepository offerRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final AlertService alertService;
    private final List<StoreClient> storeClients;

    public GameService(GameRepository gameRepository, StoreRepository storeRepository,
                       StoreOfferRepository offerRepository, PriceHistoryRepository priceHistoryRepository,
                       AlertService alertService, List<StoreClient> storeClients) {
        this.gameRepository = gameRepository;
        this.storeRepository = storeRepository;
        this.offerRepository = offerRepository;
        this.priceHistoryRepository = priceHistoryRepository;
        this.alertService = alertService;
        this.storeClients = storeClients;
    }

    @Transactional(readOnly = true)
    public Page<GameDto> listGames(String q, String genre, String developer, Pageable pageable) {
        Page<Game> page = gameRepository.search(q, genre, developer, pageable);
        return page.map(this::toDto);
    }

    @Transactional(readOnly = true)
    public GameDto getGame(Long id) {
        Game game = gameRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Game not found"));
        return toDto(game);
    }

    @Transactional(readOnly = true)
    public List<OfferDto> comparePrices(Long gameId) {
        Game game = gameRepository.findById(gameId).orElseThrow(() -> new NoSuchElementException("Game not found"));
        List<Store> stores = storeRepository.findAll();
        List<StoreOffer> offers = offerRepository.findByGameId(gameId);
        Map<Long, StoreOffer> byStore = offers.stream().collect(Collectors.toMap(
                o -> o.getStore().getId(),
                o -> o,
                (a, b) -> (a.getCurrentPrice() != null && b.getCurrentPrice() != null && b.getCurrentPrice().compareTo(a.getCurrentPrice()) < 0) ? b : a));
        List<OfferDto> out = new ArrayList<>();
        for (Store s : stores) {
            StoreOffer o = byStore.get(s.getId());
            if (o == null) {
                out.add(OfferDto.builder().gameId(game.getId()).gameTitle(game.getTitle())
                        .storeCode(s.getCode()).storeName(s.getName()).available(false).build());
            } else {
                out.add(toOfferDto(o, game));
            }
        }
        return out;
    }

    @Transactional(readOnly = true)
    public List<PricePointDto> priceHistory(Long gameId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<com.nexdeals.domain.PriceHistory> list = priceHistoryRepository.findSince(gameId, since);
        List<PricePointDto> out = new ArrayList<>();
        for (com.nexdeals.domain.PriceHistory p : list) {
            out.add(PricePointDto.builder()
                    .recordedAt(p.getRecordedAt()).price(p.getPrice())
                    .originalPrice(p.getOriginalPrice()).discountPercent(p.getDiscountPercent())
                    .currency(p.getCurrency()).storeCode(p.getStore().getCode()).build());
        }
        return out;
    }

    @Transactional
    public void syncFeatured(String region) {
        for (StoreClient client : storeClients) {
            Store store = storeRepository.findByCode(client.storeCode()).orElse(null);
            if (store == null || !store.getEnabled()) continue;
            List<StoreClient.RemoteGame> featured = client.fetchFeatured(region);
            for (StoreClient.RemoteGame rg : featured) {
                upsert(client.storeCode(), store, rg, region);
            }
        }
    }

    @Transactional
    public List<GameDto> searchRemote(String query, String region) {
        List<GameDto> out = new ArrayList<>();
        // Steam search
        StoreClient steam = storeClients.stream().filter(c -> c.storeCode().equals("steam")).findFirst().orElse(null);
        if (steam != null) {
            Store store = storeRepository.findByCode("steam").orElse(null);
            List<Map<String, Object>> results = steam.search(query, 15);
            for (Map<String, Object> r : results) {
                String extId = String.valueOf(r.get("externalId"));
                StoreClient.RemoteGame rg = steam.fetchGame(extId, region);
                if (rg == null) {
                    rg = new StoreClient.RemoteGame(extId, (String) r.get("name"), null,
                            (String) r.get("coverUrl"), null, null, null, null,
                            null, null, null, "USD", null, "https://store.steampowered.com/app/" + extId);
                }
                if (store != null) {
                    Game game = upsert("steam", store, rg, region);
                    out.add(toDto(game));
                }
            }
        }
        return out;
    }

    private Game upsert(String storeCode, Store store, StoreClient.RemoteGame rg, String region) {
        String slug = slugify(rg.title()) + "-" + storeCode + "-" + rg.externalId();
        Game game = gameRepository.findAll().stream()
                .filter(g -> g.getSlug().equals(slug)).findFirst().orElse(null);
        if (game == null) {
            // try find by title
            game = gameRepository.search(rg.title(), null, null, org.springframework.data.domain.PageRequest.of(0, 1))
                    .stream().filter(g -> g.getTitle().equalsIgnoreCase(rg.title())).findFirst().orElse(null);
        }
        if (game == null) {
            game = Game.builder()
                    .title(rg.title())
                    .slug(slug)
                    .description(rg.description())
                    .coverUrl(rg.coverUrl())
                    .developer(rg.developer())
                    .publisher(rg.publisher())
                    .genres(rg.genres())
                    .releaseDate(parseDate(rg.releaseDate()))
                    .build();
            gameRepository.save(game);
        } else {
            // update fields if missing
            if (game.getCoverUrl() == null) game.setCoverUrl(rg.coverUrl());
            if (game.getDescription() == null) game.setDescription(rg.description());
            gameRepository.save(game);
        }
        // upsert offer
        String reg = region == null ? "US" : region.toUpperCase();
        StoreOffer offer = offerRepository.findByGameIdAndStoreIdAndRegion(game.getId(), store.getId(), reg).orElse(null);
        BigDecimal cur = rg.currentPrice();
        BigDecimal orig = rg.originalPrice();
        Integer disc = rg.discountPercent();
        Boolean avail = rg.available() == null ? (cur != null) : rg.available();
        String currency = rg.currency() == null ? "USD" : rg.currency();
        String url = rg.url();
        if (offer == null) {
            offer = StoreOffer.builder().game(game).store(store).storeGameId(rg.externalId())
                    .currentPrice(cur).originalPrice(orig).discountPercent(disc)
                    .currency(currency).available(avail).region(reg).url(url)
                    .lastCheckedAt(LocalDateTime.now()).build();
            offerRepository.save(offer);
        } else {
            offer.setCurrentPrice(cur);
            offer.setOriginalPrice(orig);
            offer.setDiscountPercent(disc);
            offer.setCurrency(currency);
            offer.setAvailable(avail);
            offer.setUrl(url);
            offer.setLastCheckedAt(LocalDateTime.now());
            offerRepository.save(offer);
        }
        alertService.checkPriceAlerts(game.getId(), offer);
        // record price history if price present
        if (cur != null) {
            PriceHistory ph = PriceHistory.builder().game(game).store(store)
                    .price(cur).originalPrice(orig).discountPercent(disc)
                    .currency(currency).recordedAt(LocalDateTime.now()).build();
            priceHistoryRepository.save(ph);
        }
        return game;
    }

    private GameDto toDto(Game g) {
        List<StoreOffer> offers = offerRepository.findByGameId(g.getId());
        BigDecimal bestPrice = null;
        BigDecimal bestOriginal = null;
        String bestStore = null;
        Integer bestDisc = null;
        for (StoreOffer o : offers) {
            if (o.getCurrentPrice() == null) continue;
            if (bestPrice == null || o.getCurrentPrice().compareTo(bestPrice) < 0) {
                bestPrice = o.getCurrentPrice();
                bestOriginal = o.getOriginalPrice();
                bestStore = o.getStore().getCode();
                bestDisc = o.getDiscountPercent();
            }
        }
        return GameDto.builder()
                .id(g.getId()).title(g.getTitle()).slug(g.getSlug()).description(g.getDescription())
                .coverUrl(g.getCoverUrl()).developer(g.getDeveloper()).publisher(g.getPublisher())
                .genres(g.getGenres()).releaseDate(g.getReleaseDate())
                .bestPrice(bestPrice).bestOriginalPrice(bestOriginal).bestPriceStore(bestStore).bestDiscount(bestDisc).build();
    }

    private OfferDto toOfferDto(StoreOffer o, Game game) {
        return OfferDto.builder()
                .id(o.getId()).gameId(game.getId()).gameTitle(game.getTitle())
                .storeCode(o.getStore().getCode()).storeName(o.getStore().getName())
                .currentPrice(o.getCurrentPrice()).originalPrice(o.getOriginalPrice())
                .discountPercent(o.getDiscountPercent()).currency(o.getCurrency())
                .available(o.getAvailable()).region(o.getRegion()).url(o.getUrl())
                .lastCheckedAt(o.getLastCheckedAt()).build();
    }

    private String slugify(String s) {
        if (s == null) return "game";
        return s.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }

    private java.time.LocalDate parseDate(String d) {
        if (d == null || d.isBlank()) return null;
        try { return java.time.LocalDate.parse(d, java.time.format.DateTimeFormatter.ofPattern("MMM d, yyyy", java.util.Locale.ENGLISH)); }
        catch (Exception e) { return null; }
    }
}