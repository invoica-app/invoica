package com.invoicer.controller

import com.invoicer.dto.*
import com.invoicer.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService
) {

    @PostMapping("/oauth/login")
    fun oauthLogin(@Valid @RequestBody request: OAuthLoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.loginWithOAuth(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/guest/login")
    fun guestLogin(): ResponseEntity<AuthResponse> {
        val response = authService.loginAsGuest()
        return ResponseEntity.ok(response)
    }

    @GetMapping("/me")
    fun getCurrentUser(authentication: Authentication): ResponseEntity<UserDto> {
        val email = authentication.name
        val user = authService.getCurrentUser(email)
        return ResponseEntity.ok(user)
    }
}
