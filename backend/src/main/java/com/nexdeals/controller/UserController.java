package com.nexdeals.controller;

import com.nexdeals.domain.User;
import com.nexdeals.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    public UserController(UserRepository userRepository) { this.userRepository = userRepository; }

    @GetMapping("/me")
    public User me(org.springframework.security.core.Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }

    @PutMapping("/me")
    public User update(org.springframework.security.core.Authentication auth, @RequestBody Map<String, Object> body) {
        User u = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (body.get("displayName") != null) u.setDisplayName(body.get("displayName").toString());
        if (body.get("country") != null) u.setCountry(body.get("country").toString());
        if (body.get("currency") != null) u.setCurrency(body.get("currency").toString());
        return userRepository.save(u);
    }
}