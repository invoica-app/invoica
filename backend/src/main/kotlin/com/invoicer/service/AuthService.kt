package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.AuthProvider
import com.invoicer.entity.User
import com.invoicer.repository.UserRepository
import com.invoicer.security.JwtUtil
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil
) {

    fun loginWithOAuth(request: OAuthLoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseGet {
                // Create new user if not exists
                val newUser = User(
                    email = request.email,
                    name = request.name,
                    provider = request.provider,
                    providerId = request.providerId,
                    isGuest = false
                )
                userRepository.save(newUser)
            }

        // Update user info if changed
        if (user.name != request.name) {
            val updatedUser = user.copy(
                name = request.name,
                updatedAt = LocalDateTime.now()
            )
            userRepository.save(updatedUser)
        }

        val token = jwtUtil.generateToken(user.email, user.id, user.isGuest)

        return AuthResponse(
            token = token,
            user = user.toDto()
        )
    }

    fun loginAsGuest(): AuthResponse {
        // Generate unique guest email
        val guestEmail = "guest-${UUID.randomUUID()}@invoica.app"

        val guestUser = User(
            email = guestEmail,
            name = "Guest User",
            provider = AuthProvider.GUEST,
            isGuest = true
        )

        val savedUser = userRepository.save(guestUser)
        val token = jwtUtil.generateToken(savedUser.email, savedUser.id, isGuest = true)

        return AuthResponse(
            token = token,
            user = savedUser.toDto()
        )
    }

    fun getCurrentUser(email: String): UserDto {
        val user = userRepository.findByEmail(email)
            .orElseThrow { RuntimeException("User not found") }
        return user.toDto()
    }

    private fun User.toDto() = UserDto(
        id = id,
        email = email,
        name = name,
        provider = provider,
        isGuest = isGuest
    )
}
