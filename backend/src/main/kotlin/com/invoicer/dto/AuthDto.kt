package com.invoicer.dto

import com.invoicer.entity.AuthProvider
import jakarta.validation.constraints.NotBlank

data class OAuthLoginRequest(
    @field:NotBlank(message = "ID token is required")
    val idToken: String,

    @field:NotBlank(message = "Provider is required")
    val provider: AuthProvider
)

data class GuestLoginRequest(
    val name: String = "Guest User"
)

data class AuthResponse(
    val token: String,
    val user: UserDto
)

data class UserDto(
    val id: Long,
    val email: String,
    val name: String,
    val provider: AuthProvider,
    val isGuest: Boolean,
    val isAdmin: Boolean = false
)
