package com.nexdeals.controller;

import com.nexdeals.domain.Store;
import com.nexdeals.repository.StoreRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class StoreController {
    private final StoreRepository storeRepository;
    public StoreController(StoreRepository storeRepository) { this.storeRepository = storeRepository; }
    @GetMapping
    public List<Store> list() { return storeRepository.findAll(); }
}