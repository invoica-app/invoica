package com.invoicer.dto

import com.invoicer.entity.AuthProvider

data class OAuthLoginRequest(
    val email: String,
    val name: String,
    val provider: AuthProvider,
    val providerId: String
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
