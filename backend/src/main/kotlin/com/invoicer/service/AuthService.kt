package com.invoicer.service

import com.invoicer.dto.*
import com.invoicer.entity.AuthProvider
import com.invoicer.entity.User
import com.invoicer.repository.UserRepository
import com.invoicer.security.JwtUtil
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.UUID

@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil
) {

    fun loginWithOAuth(request: OAuthLoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            .orElseGet {
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
            user.name = request.name
            user.updatedAt = LocalDateTime.now()
            userRepository.save(user)
        }

        val token = jwtUtil.generateToken(user.email, user.id, user.isGuest)

        return AuthResponse(
            token = token,
            user = user.toDto()
        )
    }

    fun loginAsGuest(): AuthResponse {
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

    @Transactional(readOnly = true)
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
