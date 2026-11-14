package com.nexdeals.dto;

import lombok.*;

public class AuthDtos {
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        private String email;
        private String password;
        private String displayName;
        private String country;
        private String currency;
    }
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        private String email;
        private String password;
    }
    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String displayName;
        private String role;
    }
}